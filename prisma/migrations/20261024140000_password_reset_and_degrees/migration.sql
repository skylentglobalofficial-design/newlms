-- Password Reset Tokens
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Degree Delivery Mode and Level Enums
CREATE TYPE "DegreeDeliveryMode" AS ENUM ('ONLINE', 'CAMPUS');
CREATE TYPE "DegreeLevel" AS ENUM ('UNDERGRADUATE', 'POSTGRADUATE');
CREATE TYPE "DegreeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMING_SOON', 'ARCHIVED');

-- Institution Model
CREATE TABLE "Institution" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "awardingBody" TEXT,
    "city" TEXT,
    "country" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- Degree Model
CREATE TABLE "Degree" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institutionId" UUID,
    "deliveryMode" "DegreeDeliveryMode" NOT NULL,
    "level" "DegreeLevel" NOT NULL,
    "discipline" TEXT NOT NULL,
    "status" "DegreeStatus" NOT NULL DEFAULT 'DRAFT',
    "duration" TEXT,
    "description" TEXT,
    "eligibility" TEXT,
    "curriculum" JSONB,
    "skills" TEXT[],
    "careerRoles" TEXT[],
    "tuitionFee" TEXT,
    "intake" TEXT,
    "sample" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Degree_slug_key" ON "Degree"("slug");
CREATE INDEX "Degree_institutionId_idx" ON "Degree"("institutionId");
CREATE INDEX "Degree_deliveryMode_idx" ON "Degree"("deliveryMode");
CREATE INDEX "Degree_level_idx" ON "Degree"("level");
CREATE INDEX "Degree_status_idx" ON "Degree"("status");

ALTER TABLE "Degree" ADD CONSTRAINT "Degree_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
