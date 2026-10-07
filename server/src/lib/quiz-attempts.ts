import { prisma } from "./prisma.js"

/** Scored attempts allowed per learner per quiz in a rolling window. */
export const QUIZ_ATTEMPT_LIMIT = 5
export const QUIZ_ATTEMPT_WINDOW_MS = 15 * 60 * 1000

export class QuizAttemptThrottled extends Error {
  readonly retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super("Quiz attempt limit reached")
    this.name = "QuizAttemptThrottled"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

type ScorableQuestion = {
  id: string
  options: unknown
  correctIndex: number
}

export function optionCount(options: unknown): number {
  return Array.isArray(options) ? options.length : 0
}

/** True when every answer is an in-range option index. Does not reveal which index is correct. */
export function answersInOptionRange(answers: number[], questions: Array<{ options: unknown }>): boolean {
  if (answers.length !== questions.length) return false
  return answers.every((answer, index) => {
    const count = optionCount(questions[index]?.options)
    return Number.isInteger(answer) && answer >= 0 && count > 0 && answer < count
  })
}

export function scoreAnswers(answers: number[], questions: ScorableQuestion[]): number {
  return questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctIndex ? 1 : 0)
  }, 0)
}

/**
 * Grade and store one attempt under a transaction-scoped Postgres advisory lock.
 * The lock serialises the rolling window for this learner and quiz so two
 * concurrent submits cannot both pass the limit.
 */
export async function recordScoredQuizAttempt(input: {
  userId: string
  enrollmentId: string
  nodeId: string
  answers: number[]
  questions: ScorableQuestion[]
}) {
  const lockKey = `skylent-quiz:${input.userId}:${input.nodeId}`
  const score = scoreAnswers(input.answers, input.questions)
  const passed = score === input.questions.length
  const now = new Date()
  const windowStart = new Date(now.getTime() - QUIZ_ATTEMPT_WINDOW_MS)

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))::text AS locked`

    const recent = await tx.quizAttempt.findMany({
      where: {
        userId: input.userId,
        nodeId: input.nodeId,
        submittedAt: { gte: windowStart },
      },
      orderBy: { submittedAt: "asc" },
      select: { submittedAt: true },
    })

    if (recent.length >= QUIZ_ATTEMPT_LIMIT) {
      const oldest = recent[0]?.submittedAt.getTime() ?? now.getTime()
      const retryAt = oldest + QUIZ_ATTEMPT_WINDOW_MS
      const retryAfterSeconds = Math.max(1, Math.ceil((retryAt - now.getTime()) / 1000))
      throw new QuizAttemptThrottled(retryAfterSeconds)
    }

    const priorAttempts = await tx.quizAttempt.count({
      where: { enrollmentId: input.enrollmentId, nodeId: input.nodeId },
    })

    const attempt = await tx.quizAttempt.create({
      data: {
        userId: input.userId,
        enrollmentId: input.enrollmentId,
        nodeId: input.nodeId,
        attemptNumber: priorAttempts + 1,
        score,
        totalQuestions: input.questions.length,
        passed,
        answers: input.answers,
        submittedAt: now,
      },
    })

    if (passed) {
      await tx.lessonProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: input.enrollmentId, nodeId: input.nodeId },
        },
        create: {
          enrollmentId: input.enrollmentId,
          nodeId: input.nodeId,
          startedAt: now,
          lastAccessedAt: now,
          completedAt: now,
        },
        update: {
          lastAccessedAt: now,
          completedAt: now,
        },
      })
      await tx.userEnrollment.update({
        where: { id: input.enrollmentId },
        data: { lastAccessedNodeId: input.nodeId },
      })
    } else {
      await tx.lessonProgress.upsert({
        where: {
          enrollmentId_nodeId: { enrollmentId: input.enrollmentId, nodeId: input.nodeId },
        },
        create: {
          enrollmentId: input.enrollmentId,
          nodeId: input.nodeId,
          startedAt: now,
          lastAccessedAt: now,
        },
        update: { lastAccessedAt: now },
      })
    }

    return { attempt, score, passed, totalQuestions: input.questions.length }
  })
}
