-- Practice content foundation: lesson-scoped choose activity with teaching feedback

CREATE TYPE "PracticeInteractionType" AS ENUM ('choose');

CREATE TABLE "LessonPractice" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "interactionType" "PracticeInteractionType" NOT NULL DEFAULT 'choose',
    "context" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "preferredOptionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPractice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonPracticeOption" (
    "id" UUID NOT NULL,
    "practiceId" UUID NOT NULL,
    "optionKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "teachingFeedback" TEXT NOT NULL,

    CONSTRAINT "LessonPracticeOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonPractice_nodeId_key" ON "LessonPractice"("nodeId");

CREATE INDEX "LessonPracticeOption_practiceId_sortOrder_idx" ON "LessonPracticeOption"("practiceId", "sortOrder");

CREATE UNIQUE INDEX "LessonPracticeOption_practiceId_optionKey_key" ON "LessonPracticeOption"("practiceId", "optionKey");

ALTER TABLE "LessonPractice" ADD CONSTRAINT "LessonPractice_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonPracticeOption" ADD CONSTRAINT "LessonPracticeOption_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "LessonPractice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
