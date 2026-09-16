-- AlterTable
ALTER TABLE "CareerProject" ADD COLUMN "sourceLearnerProjectId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "CareerProject_sourceLearnerProjectId_key" ON "CareerProject"("sourceLearnerProjectId");

-- AddForeignKey
ALTER TABLE "CareerProject" ADD CONSTRAINT "CareerProject_sourceLearnerProjectId_fkey" FOREIGN KEY ("sourceLearnerProjectId") REFERENCES "LearnerProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
