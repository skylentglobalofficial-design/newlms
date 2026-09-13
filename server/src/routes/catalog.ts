import { Router } from 'express'

import { prisma } from '../lib/prisma.js'

const router = Router()

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
    include: {
      course: {
        select: {
          slug: true,
          curriculum: {
            orderBy: { order: 'asc' as const },
            include: { nodes: { select: { nodeType: true } } },
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
    moduleCount: number
    curriculum?: Array<{ nodes?: Array<{ nodeType: string }> }>
    programCourses: Array<{
      course: {
        slug: string
        curriculum: Array<{ nodes: Array<{ nodeType: string }> }>
      }
    }>
  },
>(program: T) {
  const { programCourses, curriculum, ...rest } = program
  const moduleCountFromCourses = programCourses.reduce(
    (sum, link) => sum + link.course.curriculum.length,
    0,
  )
  const moduleCountFromProgram = curriculum?.length ?? 0
  return {
    ...rest,
    linkedCourseSlugs: programCourses.map((link) => link.course.slug),
    moduleCount: moduleCountFromCourses || moduleCountFromProgram,
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
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
