-- Additive Elixir ledger, operator-attested payments, learning resources, and admin audit.
-- Existing tables and rows are not updated. Reward rules are inserted disabled with amount 0.
-- There is no down migration. Rollback is a restore of a backup taken before this migration.

CREATE TYPE "ElixirTransactionType" AS ENUM ('purchase_reward', 'learning_reward', 'resource_spend', 'admin_adjustment', 'reversal');
CREATE TYPE "ElixirActivity" AS ENUM ('lesson_complete', 'quiz_complete', 'quiz_score', 'assignment_complete', 'case_study_complete');
CREATE TYPE "LearningResourceKind" AS ENUM ('notes', 'case_study');
CREATE TYPE "VerifiedPaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'refunded');

CREATE TABLE "ElixirAccount" (
    "userId" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ElixirAccount_pkey" PRIMARY KEY ("userId")
);
ALTER TABLE "ElixirAccount" ADD CONSTRAINT "ElixirAccount_balance_nonnegative" CHECK ("balance" >= 0);

CREATE TABLE "ElixirTransaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "ElixirTransactionType" NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "activity" "ElixirActivity",
    "note" TEXT,
    "actorId" UUID,
    "reversalOfId" UUID,
    "unrecovered" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElixirTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ElixirTransaction_idempotencyKey_key" ON "ElixirTransaction"("idempotencyKey");
CREATE INDEX "ElixirTransaction_userId_createdAt_idx" ON "ElixirTransaction"("userId", "createdAt");
CREATE INDEX "ElixirTransaction_sourceType_sourceId_idx" ON "ElixirTransaction"("sourceType", "sourceId");

CREATE TABLE "ElixirRewardRule" (
    "id" UUID NOT NULL,
    "activity" "ElixirActivity" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "quizScorePercent" INTEGER,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID,
    CONSTRAINT "ElixirRewardRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ElixirRewardRule_activity_key" ON "ElixirRewardRule"("activity");
ALTER TABLE "ElixirRewardRule" ADD CONSTRAINT "ElixirRewardRule_amount_nonnegative" CHECK ("amount" >= 0);
ALTER TABLE "ElixirRewardRule" ADD CONSTRAINT "ElixirRewardRule_score_percent" CHECK ("quizScorePercent" IS NULL OR ("quizScorePercent" >= 0 AND "quizScorePercent" <= 100));

CREATE TABLE "VerifiedPayment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "externalRef" TEXT NOT NULL,
    "eligibleNetRupees" INTEGER NOT NULL,
    "status" "VerifiedPaymentStatus" NOT NULL,
    "elixirAwarded" INTEGER NOT NULL DEFAULT 0,
    "recordedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerifiedPayment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VerifiedPayment_externalRef_key" ON "VerifiedPayment"("externalRef");
CREATE INDEX "VerifiedPayment_userId_status_idx" ON "VerifiedPayment"("userId", "status");
ALTER TABLE "VerifiedPayment" ADD CONSTRAINT "VerifiedPayment_rupees_nonnegative" CHECK ("eligibleNetRupees" >= 0);

CREATE TABLE "LearningResource" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "LearningResourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "elixirPrice" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "courseSlug" TEXT,
    "lessonKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LearningResource_slug_key" ON "LearningResource"("slug");
CREATE INDEX "LearningResource_published_kind_idx" ON "LearningResource"("published", "kind");
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_price_nonnegative" CHECK ("elixirPrice" >= 0);

CREATE TABLE "LearningResourceEntitlement" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningResourceEntitlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LearningResourceEntitlement_transactionId_key" ON "LearningResourceEntitlement"("transactionId");
CREATE UNIQUE INDEX "LearningResourceEntitlement_userId_resourceId_key" ON "LearningResourceEntitlement"("userId", "resourceId");
CREATE INDEX "LearningResourceEntitlement_userId_idx" ON "LearningResourceEntitlement"("userId");

CREATE TABLE "AdminAuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX "AdminAuditLog_actorId_idx" ON "AdminAuditLog"("actorId");

ALTER TABLE "ElixirAccount" ADD CONSTRAINT "ElixirAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElixirTransaction" ADD CONSTRAINT "ElixirTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElixirTransaction" ADD CONSTRAINT "ElixirTransaction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ElixirTransaction" ADD CONSTRAINT "ElixirTransaction_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "ElixirTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VerifiedPayment" ADD CONSTRAINT "VerifiedPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningResourceEntitlement" ADD CONSTRAINT "LearningResourceEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningResourceEntitlement" ADD CONSTRAINT "LearningResourceEntitlement_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ElixirRewardRule" ("id", "activity", "amount", "enabled", "cooldownSeconds", "updatedAt")
VALUES
  (gen_random_uuid(), 'lesson_complete', 0, false, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'quiz_complete', 0, false, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'quiz_score', 0, false, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'assignment_complete', 0, false, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'case_study_complete', 0, false, 0, CURRENT_TIMESTAMP);
