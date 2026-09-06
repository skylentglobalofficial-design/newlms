-- CreateEnum
CREATE TYPE "UserEnrollmentStatus" AS ENUM ('active', 'completed', 'withdrawn');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('not_started', 'in_progress', 'submitted');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('locked', 'eligible', 'issued');

-- CreateTable
CREATE TABLE "UserEnrollment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID,
    "programId" UUID,
    "status" "UserEnrollmentStatus" NOT NULL DEFAULT 'active',
    "lastAccessedNodeId" UUID,
    "certificateStatus" "CertificateStatus" NOT NULL DEFAULT 'locked',
    "certificateEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "score" INTEGER,
    "totalQuestions" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentProgress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'not_started',
    "responseText" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserEnrollment_userId_idx" ON "UserEnrollment"("userId");

-- CreateIndex
CREATE INDEX "UserEnrollment_courseId_idx" ON "UserEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "UserEnrollment_programId_idx" ON "UserEnrollment"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEnrollment_userId_courseId_key" ON "UserEnrollment"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEnrollment_userId_programId_key" ON "UserEnrollment"("userId", "programId");

-- CreateIndex
CREATE INDEX "LessonProgress_enrollmentId_idx" ON "LessonProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "LessonProgress_nodeId_idx" ON "LessonProgress"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_enrollmentId_nodeId_key" ON "LessonProgress"("enrollmentId", "nodeId");

-- CreateIndex
CREATE INDEX "QuizQuestion_nodeId_sortOrder_idx" ON "QuizQuestion"("nodeId", "sortOrder");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_nodeId_idx" ON "QuizAttempt"("userId", "nodeId");

-- CreateIndex
CREATE INDEX "QuizAttempt_enrollmentId_idx" ON "QuizAttempt"("enrollmentId");

-- CreateIndex
CREATE INDEX "AssignmentProgress_userId_idx" ON "AssignmentProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentProgress_enrollmentId_nodeId_key" ON "AssignmentProgress"("enrollmentId", "nodeId");

-- AddForeignKey
ALTER TABLE "UserEnrollment" ADD CONSTRAINT "UserEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEnrollment" ADD CONSTRAINT "UserEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEnrollment" ADD CONSTRAINT "UserEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEnrollment" ADD CONSTRAINT "UserEnrollment_lastAccessedNodeId_fkey" FOREIGN KEY ("lastAccessedNodeId") REFERENCES "CurriculumNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "UserEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "UserEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentProgress" ADD CONSTRAINT "AssignmentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentProgress" ADD CONSTRAINT "AssignmentProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "UserEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentProgress" ADD CONSTRAINT "AssignmentProgress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
