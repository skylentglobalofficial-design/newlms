import { Router } from 'express'

import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', (_request, response) => {
  response.json({ status: 'ok' })
})

router.get('/db', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    response.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    const name = error instanceof Error ? error.name : 'UnknownError'
    const classification = name.startsWith('Prisma') ? 'prisma_error' : 'database_error'
    console.error('Database health check failed:', { classification, name })
    response.status(503).json({ status: 'error', database: classification })
  }
})

export default router