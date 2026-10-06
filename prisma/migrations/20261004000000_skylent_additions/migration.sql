-- Skylent additions: certificates + public enquiries
CREATE TABLE "SkylentCertificate" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "learnerName" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SkylentCertificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SkylentCertificate_code_key" ON "SkylentCertificate"("code");
CREATE INDEX "SkylentCertificate_code_idx" ON "SkylentCertificate"("code");
CREATE UNIQUE INDEX "SkylentCertificate_userId_courseId_key" ON "SkylentCertificate"("userId", "courseId");

CREATE TABLE "SkylentEnquiry" (
    "id" UUID NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'enquiry',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "programSlug" TEXT,
    "preferredDate" TIMESTAMP(3),
    "preferredSlot" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkylentEnquiry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SkylentEnquiry_status_createdAt_idx" ON "SkylentEnquiry"("status", "createdAt");
