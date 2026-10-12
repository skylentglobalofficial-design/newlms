-- Additive employer membership and an explicit learner-share flag.
-- Existing JobApplication rows stay private (sharedWithEmployer defaults to false).
-- To undo: ALTER TABLE "JobApplication" DROP COLUMN "sharedWithEmployer"; DROP TABLE "EmployerMembership";
CREATE TABLE "EmployerMembership" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployerMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmployerMembership_userId_employerId_key" ON "EmployerMembership"("userId", "employerId");
CREATE INDEX "EmployerMembership_employerId_idx" ON "EmployerMembership"("employerId");
ALTER TABLE "EmployerMembership" ADD CONSTRAINT "EmployerMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployerMembership" ADD CONSTRAINT "EmployerMembership_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD COLUMN "sharedWithEmployer" BOOLEAN NOT NULL DEFAULT false;
