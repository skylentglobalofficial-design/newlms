import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import express from 'express'

import {
  authCredentialsRateLimit,
  createCorsMiddleware,
  jsonBodyParser,
} from './lib/security-middleware.js'
import catalogRouter from './routes/catalog.js'
import healthRouter from './routes/health.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { lmsRouter } from './routes/lms.js'
import { facultyRouter } from './routes/faculty.js'
import { organisationRouter } from './routes/organisation.js'
import { careerRouter } from './routes/career/index.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(createCorsMiddleware())
app.use(jsonBodyParser())
app.use('/api/v1/auth/login', authCredentialsRateLimit)
app.use('/api/v1/auth/signup', authCredentialsRateLimit)
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/catalog', catalogRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/lms', lmsRouter)
app.use('/api/v1/faculty', facultyRouter)
app.use('/api/v1/organisation', organisationRouter)
app.use('/api/v1/career', careerRouter)
app.use('/api/v1/admin', adminRouter)

if (process.env.NODE_ENV === 'production') {
  const clientDist = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist')

  app.use(express.static(clientDist))

  app.get(/^(?!\/api\/).*/, (request, response, next) => {
    const indexPath = resolve(clientDist, 'index.html')
    if (!existsSync(indexPath)) {
      next()
      return
    }
    response.sendFile(indexPath, (error) => {
      if (error) next(error)
    })
  })
}

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    error.type === 'entity.too.large'
  ) {
    response.status(413).json({ error: 'Request body too large' })
    return
  }
  console.error(error)
  if (response.headersSent) {
    next(error)
    return
  }
  response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

export default app
