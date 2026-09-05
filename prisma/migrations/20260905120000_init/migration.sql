-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER', 'ORGANISATION_ADMIN');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('SCHOOLING', 'UNDERGRADUATE', 'POSTGRADUATE', 'EXAM_PREP', 'WEBINAR', 'CERTIFICATE', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('OPEN', 'WAITLIST', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "CurriculumNodeType" AS ENUM ('VIDEO', 'NOTES', 'QUIZ', 'ASSIGNMENT', 'TOPIC');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "secretHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationMembership" (
    "id" UUID NOT NULL,
    "organisationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganisationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "moduleCount" INTEGER NOT NULL,
    "projectCount" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "cert" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "upcomingBatch" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "level" TEXT NOT NULL,
    "whoIsItFor" TEXT[],
    "whatYouWillLearn" TEXT[],
    "learningExperience" TEXT[],
    "careerSupport" BOOLEAN,
    "enrollmentStatus" "EnrollmentStatus",
    "examPattern" TEXT,
    "examSections" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "features" TEXT[],
    "highlight" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "lessonCount" INTEGER NOT NULL,
    "projectCount" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviews" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "desc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "outcomes" TEXT[],
    "forWhom" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumModule" (
    "id" UUID NOT NULL,
    "sourceId" TEXT,
    "order" INTEGER NOT NULL,
    "number" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "topics" TEXT[],
    "programId" UUID,
    "courseId" UUID,

    CONSTRAINT "CurriculumModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumNode" (
    "id" UUID NOT NULL,
    "sourceId" TEXT,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "nodeType" "CurriculumNodeType" NOT NULL,
    "duration" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "moduleId" UUID NOT NULL,

    CONSTRAINT "CurriculumNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_secretHash_key" ON "Session"("secretHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");

-- CreateIndex
CREATE INDEX "OrganisationMembership_userId_idx" ON "OrganisationMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMembership_organisationId_userId_key" ON "OrganisationMembership"("organisationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_programType_idx" ON "Program"("programType");

-- CreateIndex
CREATE INDEX "Program_enrollmentStatus_idx" ON "Program"("enrollmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "PricingTier_programId_name_key" ON "PricingTier"("programId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE INDEX "CurriculumModule_courseId_order_idx" ON "CurriculumModule"("courseId", "order");

-- CreateIndex
CREATE INDEX "CurriculumModule_programId_order_idx" ON "CurriculumModule"("programId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumModule_courseId_sourceId_key" ON "CurriculumModule"("courseId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumModule_programId_number_key" ON "CurriculumModule"("programId", "number");

-- CreateIndex
CREATE INDEX "CurriculumNode_moduleId_order_idx" ON "CurriculumNode"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumNode_moduleId_sourceId_key" ON "CurriculumNode"("moduleId", "sourceId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumModule" ADD CONSTRAINT "CurriculumModule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumModule" ADD CONSTRAINT "CurriculumModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumNode" ADD CONSTRAINT "CurriculumNode_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CurriculumModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

