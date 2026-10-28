-- Additive: platform-admin role, draft courses, Career OS lock, Career Rise enrolment,
-- faculty course assignment, and lesson materials.
-- Existing course rows stay PUBLISHED and authoredInApp = false, so the public catalogue
-- and the authored-course enrolment allowlist keep their current meaning.
-- No CareerOsAccess or CareerRiseEnrolment rows are inserted.
-- There is no down migration. Rollback is a restore of a backup taken before this migration.
-- PLATFORM_ADMIN is not used in this migration. PostgreSQL can add the enum value here
-- and the application creates the role row later.

ALTER TYPE "RoleName" ADD VALUE 'PLATFORM_ADMIN';

CREATE TYPE "CoursePublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Course" ADD COLUMN "publicationStatus" "CoursePublicationStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Course" ADD COLUMN "authoredInApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "coverStorageKey" TEXT;
ALTER TABLE "Course" ADD COLUMN "coverContentType" TEXT;
ALTER TABLE "Course" ADD COLUMN "coverFileName" TEXT;

ALTER TABLE "CurriculumNode" ADD COLUMN "summary" TEXT;
ALTER TABLE "CurriculumNode" ADD COLUMN "referenceUrl" TEXT;

CREATE TABLE "CareerOsAccess" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    CONSTRAINT "CareerOsAccess_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CareerOsAccess_userId_key" ON "CareerOsAccess"("userId");
ALTER TABLE "CareerOsAccess" ADD CONSTRAINT "CareerOsAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CareerRiseEnrolment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "courseId" UUID,
    "programId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerRiseEnrolment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CareerRiseEnrolment_userId_scopeKey_key" ON "CareerRiseEnrolment"("userId", "scopeKey");
CREATE INDEX "CareerRiseEnrolment_userId_idx" ON "CareerRiseEnrolment"("userId");
CREATE INDEX "CareerRiseEnrolment_courseId_idx" ON "CareerRiseEnrolment"("courseId");
CREATE INDEX "CareerRiseEnrolment_programId_idx" ON "CareerRiseEnrolment"("programId");
ALTER TABLE "CareerRiseEnrolment" ADD CONSTRAINT "CareerRiseEnrolment_scope_check" CHECK (
    ("courseId" IS NOT NULL AND "programId" IS NULL AND "scopeKey" = ('course:' || "courseId"::text))
    OR
    ("programId" IS NOT NULL AND "courseId" IS NULL AND "scopeKey" = ('program:' || "programId"::text))
);
ALTER TABLE "CareerRiseEnrolment" ADD CONSTRAINT "CareerRiseEnrolment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerRiseEnrolment" ADD CONSTRAINT "CareerRiseEnrolment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerRiseEnrolment" ADD CONSTRAINT "CareerRiseEnrolment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FacultyCourseAssignment" (
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FacultyCourseAssignment_pkey" PRIMARY KEY ("userId", "courseId")
);
CREATE INDEX "FacultyCourseAssignment_courseId_idx" ON "FacultyCourseAssignment"("courseId");
ALTER TABLE "FacultyCourseAssignment" ADD CONSTRAINT "FacultyCourseAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FacultyCourseAssignment" ADD CONSTRAINT "FacultyCourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LessonMaterial" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    CONSTRAINT "LessonMaterial_pkey" PRIMARY KEY ("id")
);
-- createdAt added below to keep the column list aligned with Prisma's default timestamp.
ALTER TABLE "LessonMaterial" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "LessonMaterial_nodeId_idx" ON "LessonMaterial"("nodeId");
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
