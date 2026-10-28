-- Additive college tenancy. No rows are inserted. Existing users gain no college access.
-- COLLEGE_ADMIN is not used in this file. The application creates the role row later.

ALTER TYPE "RoleName" ADD VALUE 'COLLEGE_ADMIN';

CREATE TABLE "College" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

CREATE TABLE "CollegeMembership" (
    "id" UUID NOT NULL,
    "collegeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollegeMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollegeMembership_collegeId_userId_key" ON "CollegeMembership"("collegeId", "userId");
CREATE INDEX "CollegeMembership_userId_idx" ON "CollegeMembership"("userId");
ALTER TABLE "CollegeMembership" ADD CONSTRAINT "CollegeMembership_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollegeMembership" ADD CONSTRAINT "CollegeMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
