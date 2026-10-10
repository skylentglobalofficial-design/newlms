-- Records acceptance of the Terms & Conditions and Privacy Policy.
-- Additive only: one new table, no change to existing tables or rows.
-- To undo: DROP TABLE "PolicyAcceptance";
CREATE TABLE "PolicyAcceptance" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "enquiryId" UUID,
    "context" TEXT NOT NULL,
    "reference" TEXT,
    "policyVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyAcceptance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PolicyAcceptance_userId_context_idx" ON "PolicyAcceptance"("userId", "context");
CREATE INDEX "PolicyAcceptance_enquiryId_idx" ON "PolicyAcceptance"("enquiryId");
ALTER TABLE "PolicyAcceptance" ADD CONSTRAINT "PolicyAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PolicyAcceptance" ADD CONSTRAINT "PolicyAcceptance_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "SkylentEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
