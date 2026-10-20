-- CreateEnum
CREATE TYPE "PracticeWorkspaceStatus" AS ENUM ('not_configured', 'needs_review', 'pending_infrastructure', 'ready', 'published');

-- CreateTable
CREATE TABLE "PracticeWorkspace" (
    "id" UUID NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "programmeSlug" TEXT,
    "syllabus" JSONB NOT NULL,
    "manifest" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "status" "PracticeWorkspaceStatus" NOT NULL,
    "adapterId" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeWorkspaceRevision" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" "PracticeWorkspaceStatus" NOT NULL,
    "manifest" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeWorkspaceRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeWorkspaceResponse" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lessonId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeWorkspaceResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeWorkspace_courseSlug_key" ON "PracticeWorkspace"("courseSlug");

-- CreateIndex
CREATE INDEX "PracticeWorkspace_status_idx" ON "PracticeWorkspace"("status");

-- CreateIndex
CREATE INDEX "PracticeWorkspaceRevision_workspaceId_createdAt_idx" ON "PracticeWorkspaceRevision"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeWorkspaceRevision_workspaceId_revision_key" ON "PracticeWorkspaceRevision"("workspaceId", "revision");

-- CreateIndex
CREATE INDEX "PracticeWorkspaceResponse_userId_idx" ON "PracticeWorkspaceResponse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeWorkspaceResponse_workspaceId_userId_lessonId_key" ON "PracticeWorkspaceResponse"("workspaceId", "userId", "lessonId");

-- AddForeignKey
ALTER TABLE "PracticeWorkspace" ADD CONSTRAINT "PracticeWorkspace_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWorkspaceRevision" ADD CONSTRAINT "PracticeWorkspaceRevision_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PracticeWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWorkspaceResponse" ADD CONSTRAINT "PracticeWorkspaceResponse_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "PracticeWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWorkspaceResponse" ADD CONSTRAINT "PracticeWorkspaceResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
