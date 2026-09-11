import { Router } from 'express'
import { z } from 'zod'

import {
  attachAuth,
  normalizeEmail,
  requireCsrf,
  type AuthenticatedRequest,
} from '../lib/auth.js'
import { prisma } from '../lib/prisma.js'
import { catalogWriteRateLimit } from '../lib/security-middleware.js'

const router = Router()

const interestSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(120).optional(),
})

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(4000),
})

const curriculumInclude = {
  curriculum: {
    orderBy: { order: 'asc' as const },
    include: {
      nodes: { orderBy: { order: 'asc' as const } },
    },
  },
}

const programCourseInclude = {
  programCourses: {
    orderBy: { sortOrder: 'asc' as const },
    include: { course: { select: { slug: true } } },
  },
}

function countLearnableNodes(
  curriculum: Array<{ nodes: Array<{ nodeType: string }> }>,
): number {
  return curriculum.reduce(
    (sum, module) => sum + module.nodes.filter((node) => node.nodeType !== 'TOPIC').length,
    0,
  )
}

function withProgramFacts<T extends { programCourses: Array<{ course: { slug: string } }> }>(
  program: T,
) {
  const { programCourses, ...rest } = program
  return {
    ...rest,
    linkedCourseSlugs: programCourses.map((link) => link.course.slug),
  }
}

router.get('/courses', async (_request, response, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { title: 'asc' },
      include: curriculumInclude,
    })

    response.json({
      data: courses.map((course) => ({
        slug: course.slug,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        mode: course.mode,
        price: course.price,
        originalPrice: course.originalPrice,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        projectCount: course.curriculum.reduce(
          (sum, module) => sum + module.nodes.filter((node) => node.nodeType === 'ASSIGNMENT').length,
          0,
        ),
      })),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/programs', async (_request, response, next) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { name: 'asc' },
      include: { pricing: true, ...programCourseInclude },
    })
    response.json({ data: programs.map(withProgramFacts) })
  } catch (error) {
    next(error)
  }
})

router.get('/programs/:slug', async (request, response, next) => {
  try {
    const program = await prisma.program.findUnique({
      where: { slug: request.params.slug },
      include: { ...curriculumInclude, pricing: true, ...programCourseInclude },
    })
    if (!program) {
      response.status(404).json({ error: 'Program not found' })
      return
    }
    response.json({ data: withProgramFacts(program) })
  } catch (error) {
    next(error)
  }
})

router.get('/courses/:slug', async (request, response, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: request.params.slug },
      include: curriculumInclude,
    })
    if (!course) {
      response.status(404).json({ error: 'Course not found' })
      return
    }
    response.json({
      data: {
        ...course,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        projectCount: course.curriculum.reduce(
          (sum, module) => sum + module.nodes.filter((node) => node.nodeType === 'ASSIGNMENT').length,
          0,
        ),
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post(
  '/programs/:slug/interest',
  catalogWriteRateLimit,
  requireCsrf,
  async (request, response, next) => {
    try {
      const slug = Array.isArray(request.params.slug) ? request.params.slug[0] : request.params.slug
      const program = await prisma.program.findUnique({ where: { slug } })
      if (!program) {
        response.status(404).json({ error: 'Program not found' })
        return
      }
      if (program.enrollmentStatus === 'OPEN') {
        response.status(400).json({ error: 'This program is open for enrollment' })
        return
      }

      const parsed = interestSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Validation failed' })
        return
      }

      const auth = await attachAuth(request as AuthenticatedRequest)
      const email = normalizeEmail(parsed.data.email)
      const existing = await prisma.programInterest.findUnique({
        where: { programId_email: { programId: program.id, email } },
      })
      if (existing) {
        response.json({ data: { registered: true, alreadyRegistered: true } })
        return
      }

      await prisma.programInterest.create({
        data: {
          programId: program.id,
          email,
          name: parsed.data.name ?? auth?.user.displayName ?? null,
          userId: auth?.user.id ?? null,
        },
      })
      response.status(201).json({ data: { registered: true, alreadyRegistered: false } })
    } catch (error) {
      next(error)
    }
  },
)

router.post('/contact', catalogWriteRateLimit, requireCsrf, async (request, response, next) => {
  try {
    const parsed = contactSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: 'Validation failed' })
      return
    }
    const auth = await attachAuth(request as AuthenticatedRequest)
    const created = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: normalizeEmail(parsed.data.email),
        phone: parsed.data.phone || null,
        topic: parsed.data.topic || null,
        message: parsed.data.message,
        userId: auth?.user.id ?? null,
      },
    })
    response.status(201).json({ data: { id: created.id } })
  } catch (error) {
    next(error)
  }
})

export default router
