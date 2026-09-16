-- CreateTable
CREATE TABLE "LabWork" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "labSlug" TEXT NOT NULL,
    "dataset" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lessonKey" TEXT,
    "input" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabWork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabWork_userId_labSlug_createdAt_idx" ON "LabWork"("userId", "labSlug", "createdAt");

-- CreateIndex
CREATE INDEX "LabWork_userId_createdAt_idx" ON "LabWork"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "LabWork" ADD CONSTRAINT "LabWork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
