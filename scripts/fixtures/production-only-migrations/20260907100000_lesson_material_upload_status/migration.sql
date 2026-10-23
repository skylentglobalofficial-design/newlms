-- CreateEnum
CREATE TYPE "LessonMaterialUploadStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "LessonMaterial" ADD COLUMN "uploadStatus" "LessonMaterialUploadStatus" NOT NULL DEFAULT 'PENDING';
