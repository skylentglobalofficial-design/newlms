import { Router } from 'express'

import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    response.json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    response.status(503).json({ status: 'unhealthy' })
  }
})

export default router