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

router.get('/programs', async (_request, response, next) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { name: 'asc' },
      include: { pricing: true },
    })
    response.json({ data: programs })
  } catch (error) {
    next(error)
  }
})

router.get('/programs/:slug', async (request, response, next) => {
  try {
    const program = await prisma.program.findUnique({
      where: { slug: request.params.slug },
      include: { ...curriculumInclude, pricing: true },
    })
    if (!program) {
      response.status(404).json({ error: 'Program not found' })
      return
    }
    response.json({ data: program })
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
    response.json({ data: course })
  } catch (error) {
    next(error)
  }
})

export default router