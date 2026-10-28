-- Align LessonMaterial with the production-only table from 20260906190000.
-- Existing columns are left unchanged. No rows are rewritten.

ALTER TABLE "LessonMaterial" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LessonMaterial" ADD COLUMN IF NOT EXISTS "uploadedById" UUID;
ALTER TABLE "LessonMaterial" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonMaterial_uploadedById_fkey') THEN
    ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_uploadedById_fkey"
      FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
