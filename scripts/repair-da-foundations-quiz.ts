/**
 * Non-destructive catalog repair.
 *
 * Replaces quizQuestion rows for one Data Analytics Foundations node
 * (sourceId l3) with the current DA_QUIZZES.l3 bank.
 *
 * Does not delete curriculum nodes, modules, enrollments, lesson progress,
 * quiz attempts, or any other course's quiz bank.
 */
import { prisma } from "../server/src/lib/prisma"
import { DA_QUIZZES } from "../src/content/data-analytics/quizzes.ts"

const TARGET_NODE_ID = "c811e3be-238e-4658-ab64-6095cb0b43b5"

const bank = DA_QUIZZES.l3
if (!bank || bank.questions.length !== 5) {
  throw new Error("DA_QUIZZES.l3 must contain exactly five questions")
}

const authored = bank.questions.map((entry, index) => ({
  sortOrder: index,
  question: entry.prompt,
  options: entry.options,
  correctIndex: entry.correctIndex,
}))

function sameQuestion(
  row: { sortOrder: number; question: string; options: unknown; correctIndex: number },
  expected: (typeof authored)[number],
) {
  return (
    row.sortOrder === expected.sortOrder &&
    row.question === expected.question &&
    row.correctIndex === expected.correctIndex &&
    JSON.stringify(row.options) === JSON.stringify(expected.options)
  )
}

async function counts() {
  const [enrollments, lessonProgress, quizAttempts, quizQuestions, nodes] = await Promise.all([
    prisma.userEnrollment.count(),
    prisma.lessonProgress.count(),
    prisma.quizAttempt.count(),
    prisma.quizQuestion.count(),
    prisma.curriculumNode.count(),
  ])
  return { enrollments, lessonProgress, quizAttempts, quizQuestions, nodes }
}

async function main() {
  const node = await prisma.curriculumNode.findUnique({
    where: { id: TARGET_NODE_ID },
    select: {
      id: true,
      sourceId: true,
      title: true,
      nodeType: true,
      module: { select: { title: true, course: { select: { slug: true } } } },
    },
  })

  if (!node) {
    throw new Error(`Foundations node ${TARGET_NODE_ID} was not found`)
  }
  if (node.sourceId !== "l3" || node.nodeType !== "QUIZ") {
    throw new Error(`Refusing repair: node ${node.id} is ${node.nodeType} ${node.sourceId}`)
  }
  if (node.module.course?.slug !== "data-analytics") {
    throw new Error(`Refusing repair: node ${node.id} is not on data-analytics`)
  }

  const before = await counts()
  const existing = await prisma.quizQuestion.findMany({
    where: { nodeId: node.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true, question: true, options: true, correctIndex: true },
  })

  const alreadyAuthoritative =
    existing.length === authored.length && existing.every((row, index) => sameQuestion(row, authored[index]))

  if (alreadyAuthoritative) {
    console.log(`Node ${node.id} already has the five DA_QUIZZES.l3 questions. No rows written.`)
  } else {
    await prisma.$transaction(async (tx) => {
      const removed = await tx.quizQuestion.deleteMany({ where: { nodeId: node.id } })
      await tx.quizQuestion.createMany({
        data: authored.map((entry) => ({
          nodeId: node.id,
          sortOrder: entry.sortOrder,
          question: entry.question,
          options: entry.options,
          correctIndex: entry.correctIndex,
        })),
      })
      console.log(`Replaced ${removed.count} quizQuestion rows on node ${node.id}`)
    })
  }

  const stored = await prisma.quizQuestion.findMany({
    where: { nodeId: node.id },
    orderBy: { sortOrder: "asc" },
    select: { sortOrder: true, question: true, options: true, correctIndex: true },
  })
  if (stored.length !== 5 || !stored.every((row, index) => sameQuestion(row, authored[index]))) {
    throw new Error("Repair verification failed: stored questions do not match DA_QUIZZES.l3")
  }

  const after = await counts()
  const preserved =
    before.enrollments === after.enrollments &&
    before.lessonProgress === after.lessonProgress &&
    before.quizAttempts === after.quizAttempts &&
    before.nodes === after.nodes &&
    after.quizQuestions === before.quizQuestions - existing.length + stored.length

  if (!preserved) {
    throw new Error(`Unexpected catalog counts before=${JSON.stringify(before)} after=${JSON.stringify(after)}`)
  }

  console.log(
    JSON.stringify(
      {
        nodeId: node.id,
        sourceId: node.sourceId,
        title: node.title,
        module: node.module.title,
        courseSlug: node.module.course?.slug,
        questionCount: stored.length,
        questions: stored.map((row) => row.question),
        catalogCounts: { before, after },
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
