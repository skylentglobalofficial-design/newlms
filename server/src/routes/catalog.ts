import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../lib/prisma.js'
import { overlayPublicCourse, overlayPublicProgramme, PUBLIC_COURSE_COPY } from '../lib/public-catalogue-copy.js'

const router = Router()

const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const publicNodeSelect = {
  sourceId: true,
  order: true,
  title: true,
  nodeType: true,
  duration: true,
} as const

const curriculumInclude = {
  curriculum: {
    orderBy: { order: 'asc' as const },
    include: {
      nodes: {
        orderBy: { order: 'asc' as const },
        select: publicNodeSelect,
      },
    },
  },
}

/**
 * Linked-course module rows only. The public programme response uses the row
 * count, never the lesson nodes, so those nodes are not loaded.
 */
const programCourseInclude = {
  programCourses: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      course: {
        select: {
          slug: true,
          curriculum: {
            select: { id: true },
          },
        },
      },
    },
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

function withProgramFacts<
  T extends {
    slug: string
    desc: string
    format: string
    moduleCount: number
    curriculum?: Array<{ nodes?: Array<{ nodeType: string }> }>
    programCourses: Array<{
      course: {
        slug: string
        curriculum: Array<{ id: string }>
      }
    }>
  },
>(program: T) {
  const { programCourses, curriculum, ...rest } = program
  void curriculum
  const moduleCountFromCourses = programCourses.reduce(
    (sum, link) => sum + link.course.curriculum.length,
    0,
  )
  // Brochure curriculum on the programme row is not a taught module count.
  // A programme with no linked course reports zero. Authored programmes then
  // take the authored course's module count in overlayPublicProgramme.
  return overlayPublicProgramme({
    ...rest,
    linkedCourseSlugs: programCourses.map((link) => link.course.slug),
    moduleCount: moduleCountFromCourses,
  })
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
        mode: PUBLIC_COURSE_COPY[course.slug]?.mode ?? course.mode,
        price: course.price,
        originalPrice: course.originalPrice,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        projectCount: course.projectCount,
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
  const parsed = slugParamSchema.safeParse(request.params)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid slug' })
    return
  }

  try {
    await ensureProgramCourseLinks()
    const program = await prisma.program.findUnique({
      where: { slug: parsed.data.slug },
      // The programme's own curriculum is brochure material. withProgramFacts
      // discards it, so the detail query does not load it.
      include: { pricing: true, ...programCourseInclude },
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
  const parsed = slugParamSchema.safeParse(request.params)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid slug' })
    return
  }

  try {
    const course = await prisma.course.findUnique({
      where: { slug: parsed.data.slug },
      include: curriculumInclude,
    })
    if (!course) {
      response.status(404).json({ error: 'Course not found' })
      return
    }
    const published = overlayPublicCourse({
      slug: course.slug,
      desc: course.desc,
      longDesc: course.longDesc,
      outcomes: course.outcomes,
      forWhom: course.forWhom,
      mode: course.mode,
    })
    response.json({
      data: {
        slug: course.slug,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        mode: published.mode,
        price: course.price,
        originalPrice: course.originalPrice,
        desc: published.desc,
        longDesc: published.longDesc,
        outcomes: published.outcomes,
        forWhom: published.forWhom,
        projectCount: course.projectCount,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        curriculum: course.curriculum.map((module) => ({
          sourceId: module.sourceId,
          order: module.order,
          title: module.title,
          nodes: module.nodes.map((node) => ({
            sourceId: node.sourceId,
            order: node.order,
            title: node.title,
            nodeType: node.nodeType,
            duration: node.duration,
          })),
        })),
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
