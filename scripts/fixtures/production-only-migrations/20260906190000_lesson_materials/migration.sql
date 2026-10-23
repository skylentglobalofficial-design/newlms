-- CreateTable
CREATE TABLE "LessonMaterial" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonMaterial_nodeId_published_idx" ON "LessonMaterial"("nodeId", "published");

-- CreateIndex
CREATE INDEX "LessonMaterial_uploadedById_idx" ON "LessonMaterial"("uploadedById");

-- AddForeignKey
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
