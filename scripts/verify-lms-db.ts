import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const counts = {
    enrollments: await prisma.userEnrollment.count(),
    lessonProgress: await prisma.lessonProgress.count(),
    quizQuestions: await prisma.quizQuestion.count(),
    quizAttempts: await prisma.quizAttempt.count(),
    assignments: await prisma.assignmentProgress.count(),
  }
  console.log("LMS table counts:", counts)

  const migration = await prisma.$queryRaw<Array<{ migration_name: string }>>`
    SELECT migration_name FROM _prisma_migrations
    WHERE migration_name LIKE '%phase5%'
    ORDER BY finished_at DESC
    LIMIT 1
  `
  console.log("Phase 5 migration:", migration[0]?.migration_name ?? "not found")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
