-- Quiz enhancements: explanations and attempt limits
ALTER TABLE "QuizQuestion" ADD COLUMN "explanation" TEXT;
ALTER TABLE "CurriculumNode" ADD COLUMN "maxAttempts" INTEGER;
ALTER TABLE "CurriculumNode" ADD COLUMN "passingScore" INTEGER;

-- Assignment grading workflow
ALTER TABLE "AssignmentProgress" ADD COLUMN "grade" INTEGER;
ALTER TABLE "AssignmentProgress" ADD COLUMN "feedback" TEXT;
ALTER TABLE "AssignmentProgress" ADD COLUMN "gradedById" UUID;
ALTER TABLE "AssignmentProgress" ADD COLUMN "gradedAt" TIMESTAMP(3);
ALTER TYPE "AssignmentStatus" ADD VALUE 'graded';

-- Events and Webinars
CREATE TYPE "EventType" AS ENUM ('WEBINAR', 'WORKSHOP', 'LIVE_SESSION', 'INFO_SESSION', 'OTHER');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "EventRegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'WEBINAR',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "hostName" TEXT,
    "hostId" UUID,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "capacity" INTEGER,
    "meetingUrl" TEXT,
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "programSlug" TEXT,
    "courseSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventRegistration" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "EventRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE INDEX "Event_status_startTime_idx" ON "Event"("status", "startTime");
CREATE INDEX "Event_programSlug_idx" ON "Event"("programSlug");
CREATE INDEX "Event_courseSlug_idx" ON "Event"("courseSlug");
CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");
CREATE INDEX "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");
CREATE INDEX "AssignmentProgress_nodeId_status_idx" ON "AssignmentProgress"("nodeId", "status");

ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
