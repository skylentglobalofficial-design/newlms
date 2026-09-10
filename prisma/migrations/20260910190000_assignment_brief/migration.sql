-- CreateTable
CREATE TABLE "AssignmentBrief" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "kicker" TEXT,
    "content" JSONB NOT NULL,
    "datasetName" TEXT,
    "datasetFileName" TEXT,
    "datasetMimeType" TEXT,
    "datasetRelativePath" TEXT,
    "datasetDisclaimer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentBrief_nodeId_key" ON "AssignmentBrief"("nodeId");

-- AddForeignKey
ALTER TABLE "AssignmentBrief" ADD CONSTRAINT "AssignmentBrief_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
