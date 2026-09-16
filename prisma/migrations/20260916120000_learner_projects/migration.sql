-- CreateTable
CREATE TABLE "LearnerProject" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "projectType" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "reflection" JSONB NOT NULL,
    "savedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProject_userId_projectType_key" ON "LearnerProject"("userId", "projectType");

-- CreateIndex
CREATE INDEX "LearnerProject_userId_updatedAt_idx" ON "LearnerProject"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "LearnerProject" ADD CONSTRAINT "LearnerProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
