-- Career OS backend foundation — profile, jobs, applications, interviews, support

-- Profile enums
CREATE TYPE "CareerWorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE');
CREATE TYPE "CareerProfileVisibility" AS ENUM ('PRIVATE', 'NETWORK', 'PUBLIC');
CREATE TYPE "CareerEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'OTHER');
CREATE TYPE "CareerLinkType" AS ENUM ('LINKEDIN', 'GITHUB', 'PORTFOLIO', 'OTHER');
CREATE TYPE "CareerSkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
CREATE TYPE "ResumeVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- Job board enums
CREATE TYPE "EmployerVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'UNVERIFIED');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'EXPIRED');

-- Application enums
CREATE TYPE "JobApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- Interview enums
CREATE TYPE "InterviewRoundType" AS ENUM ('TECHNICAL', 'HR', 'MANAGERIAL', 'OTHER');
CREATE TYPE "InterviewRoundStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'PENDING');
CREATE TYPE "InterviewQuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- Support enums
CREATE TYPE "CareerSupportRequestType" AS ENUM ('RESUME_REVIEW', 'INTERVIEW_PREP', 'JOB_SEARCH', 'GENERAL');
CREATE TYPE "CareerSupportRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "CareerSupportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "CareerSupportTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Profile tables
CREATE TABLE "CareerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "preferredRole" TEXT,
    "preferredWorkMode" "CareerWorkMode",
    "profileVisibility" "CareerProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerEducation" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currentlyStudying" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerEducation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerExperience" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "employmentType" "CareerEmploymentType",
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerExperience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerSkill" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "proficiency" "CareerSkillProficiency",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerProject" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "technologies" TEXT[],
    "projectUrl" TEXT,
    "repositoryUrl" TEXT,
    "outcome" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerLink" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "type" "CareerLinkType" NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerResumeVersion" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fileName" TEXT,
    "mimeType" TEXT,
    "byteSize" INTEGER,
    "storageProvider" TEXT,
    "storageKey" TEXT,
    "notes" TEXT,
    "status" "ResumeVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerResumeVersion_pkey" PRIMARY KEY ("id")
);

-- Job board tables
CREATE TABLE "Employer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoRef" TEXT,
    "location" TEXT,
    "verificationStatus" "EmployerVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "employerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employmentType" "CareerEmploymentType",
    "workMode" "CareerWorkMode",
    "location" TEXT,
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "skills" TEXT[],
    "category" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "applicationUrl" TEXT,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- Application tracker
CREATE TABLE "JobApplication" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID,
    "employerId" UUID,
    "roleTitle" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3),
    "nextActionAt" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationEvent" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- Interview preparation
CREATE TABLE "InterviewRound" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID,
    "type" "InterviewRoundType" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "status" "InterviewRoundStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewRound_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewQuestion" (
    "id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "difficulty" "InterviewQuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "roleTag" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewPractice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "questionId" UUID,
    "interviewRoundId" UUID,
    "answer" TEXT,
    "score" INTEGER,
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewPractice_pkey" PRIMARY KEY ("id")
);

-- Career support
CREATE TABLE "CareerSupportRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "CareerSupportRequestType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CareerSupportRequestStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CareerSupportPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerSupportRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerSupportTask" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CareerSupportTaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerSupportTask_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "CareerProfile_userId_key" ON "CareerProfile"("userId");
CREATE INDEX "CareerProfile_userId_idx" ON "CareerProfile"("userId");
CREATE INDEX "CareerEducation_profileId_sortOrder_idx" ON "CareerEducation"("profileId", "sortOrder");
CREATE INDEX "CareerExperience_profileId_sortOrder_idx" ON "CareerExperience"("profileId", "sortOrder");
CREATE UNIQUE INDEX "CareerSkill_profileId_name_key" ON "CareerSkill"("profileId", "name");
CREATE INDEX "CareerSkill_profileId_sortOrder_idx" ON "CareerSkill"("profileId", "sortOrder");
CREATE INDEX "CareerProject_profileId_sortOrder_idx" ON "CareerProject"("profileId", "sortOrder");
CREATE INDEX "CareerLink_profileId_sortOrder_idx" ON "CareerLink"("profileId", "sortOrder");
CREATE INDEX "CareerResumeVersion_profileId_isPrimary_idx" ON "CareerResumeVersion"("profileId", "isPrimary");
CREATE INDEX "CareerResumeVersion_profileId_status_idx" ON "CareerResumeVersion"("profileId", "status");
CREATE UNIQUE INDEX "Employer_slug_key" ON "Employer"("slug");
CREATE INDEX "Employer_verificationStatus_idx" ON "Employer"("verificationStatus");
CREATE INDEX "Employer_location_idx" ON "Employer"("location");
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_category_idx" ON "Job"("category");
CREATE INDEX "Job_workMode_idx" ON "Job"("workMode");
CREATE INDEX "Job_location_idx" ON "Job"("location");
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");
CREATE INDEX "SavedJob_userId_idx" ON "SavedJob"("userId");
CREATE INDEX "SavedJob_jobId_idx" ON "SavedJob"("jobId");
CREATE INDEX "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");
CREATE INDEX "JobApplication_employerId_idx" ON "JobApplication"("employerId");
CREATE INDEX "ApplicationEvent_applicationId_occurredAt_idx" ON "ApplicationEvent"("applicationId", "occurredAt");
CREATE INDEX "InterviewRound_userId_status_idx" ON "InterviewRound"("userId", "status");
CREATE INDEX "InterviewRound_applicationId_idx" ON "InterviewRound"("applicationId");
CREATE INDEX "InterviewQuestion_category_active_idx" ON "InterviewQuestion"("category", "active");
CREATE INDEX "InterviewQuestion_difficulty_idx" ON "InterviewQuestion"("difficulty");
CREATE INDEX "InterviewQuestion_roleTag_idx" ON "InterviewQuestion"("roleTag");
CREATE INDEX "InterviewPractice_userId_practicedAt_idx" ON "InterviewPractice"("userId", "practicedAt");
CREATE INDEX "InterviewPractice_questionId_idx" ON "InterviewPractice"("questionId");
CREATE INDEX "InterviewPractice_interviewRoundId_idx" ON "InterviewPractice"("interviewRoundId");
CREATE INDEX "CareerSupportRequest_userId_status_idx" ON "CareerSupportRequest"("userId", "status");
CREATE INDEX "CareerSupportRequest_priority_idx" ON "CareerSupportRequest"("priority");
CREATE INDEX "CareerSupportTask_requestId_status_idx" ON "CareerSupportTask"("requestId", "status");

-- Foreign keys
ALTER TABLE "CareerProfile" ADD CONSTRAINT "CareerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerEducation" ADD CONSTRAINT "CareerEducation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerExperience" ADD CONSTRAINT "CareerExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerSkill" ADD CONSTRAINT "CareerSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerProject" ADD CONSTRAINT "CareerProject_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerLink" ADD CONSTRAINT "CareerLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerResumeVersion" ADD CONSTRAINT "CareerResumeVersion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewRound" ADD CONSTRAINT "InterviewRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewRound" ADD CONSTRAINT "InterviewRound_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewPractice" ADD CONSTRAINT "InterviewPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewPractice" ADD CONSTRAINT "InterviewPractice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewPractice" ADD CONSTRAINT "InterviewPractice_interviewRoundId_fkey" FOREIGN KEY ("interviewRoundId") REFERENCES "InterviewRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CareerSupportRequest" ADD CONSTRAINT "CareerSupportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerSupportTask" ADD CONSTRAINT "CareerSupportTask_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CareerSupportRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
