-- AlterTable
ALTER TABLE "AssignmentAttachment" ADD COLUMN "sha256" TEXT;

-- CreateIndex
CREATE INDEX "AssignmentAttachment_storageKey_idx" ON "AssignmentAttachment"("storageKey");

-- AlterTable
ALTER TABLE "CareerProject" ADD COLUMN "sourceKind" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "sourceRef" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "sourceCourseSlug" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "sourceLessonKey" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "sourceEnrollmentId" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "artifactFileName" TEXT;
ALTER TABLE "CareerProject" ADD COLUMN "sourceCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CareerProject_sourceRef_key" ON "CareerProject"("sourceRef");

-- CreateTable
CREATE TABLE "CourseCertificate" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "learnerName" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCertificate_publicId_key" ON "CourseCertificate"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCertificate_enrollmentId_key" ON "CourseCertificate"("enrollmentId");

-- CreateIndex
CREATE INDEX "CourseCertificate_userId_idx" ON "CourseCertificate"("userId");

-- CreateIndex
CREATE INDEX "CourseCertificate_courseId_idx" ON "CourseCertificate"("courseId");

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "UserEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ProgramInterest" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramInterest_programId_email_key" ON "ProgramInterest"("programId", "email");

-- CreateIndex
CREATE INDEX "ProgramInterest_email_idx" ON "ProgramInterest"("email");

-- AddForeignKey
ALTER TABLE "ProgramInterest" ADD CONSTRAINT "ProgramInterest_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInterest" ADD CONSTRAINT "ProgramInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "topic" TEXT,
    "message" TEXT NOT NULL,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
