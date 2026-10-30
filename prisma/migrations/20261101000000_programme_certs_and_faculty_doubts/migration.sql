-- Phase 3B: Programme Master Certificates + Faculty TA 20-Minute Doubt Tickets

-- CreateTable
CREATE TABLE "ProgrammeCertificate" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "programSlug" TEXT NOT NULL,
    "learnerName" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "evidenceSummary" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProgrammeCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyDoubtTicket" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "learnerName" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "lessonKey" TEXT NOT NULL,
    "lessonTitle" TEXT,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "slaMinutes" INTEGER NOT NULL DEFAULT 20,
    "resolvedById" UUID,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "FacultyDoubtTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeCertificate_code_key" ON "ProgrammeCertificate"("code");

-- CreateIndex
CREATE INDEX "ProgrammeCertificate_code_idx" ON "ProgrammeCertificate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeCertificate_userId_programSlug_key" ON "ProgrammeCertificate"("userId", "programSlug");

-- CreateIndex
CREATE INDEX "FacultyDoubtTicket_courseSlug_status_idx" ON "FacultyDoubtTicket"("courseSlug", "status");

-- CreateIndex
CREATE INDEX "FacultyDoubtTicket_userId_idx" ON "FacultyDoubtTicket"("userId");
