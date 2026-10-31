-- CreateTable
CREATE TABLE IF NOT EXISTS "ProgrammeCertificate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "programSlug" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "learnerName" TEXT NOT NULL,
    "evidenceSummary" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "ProgrammeCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProgrammeCertificate_code_key" ON "ProgrammeCertificate"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgrammeCertificate_userId_programSlug_key" ON "ProgrammeCertificate"("userId", "programSlug");

-- CreateTable
CREATE TABLE IF NOT EXISTS "FacultyDoubtTicket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "learnerName" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "lessonKey" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "slaMinutes" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" UUID,
    "resolutionNote" TEXT,
    CONSTRAINT "FacultyDoubtTicket_pkey" PRIMARY KEY ("id")
);
