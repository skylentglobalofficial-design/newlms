import express from 'express'

import catalogRouter from './routes/catalog.js'
import healthRouter from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { lmsRouter } from './routes/lms.js'
import { facultyRouter } from './routes/faculty.js'
import { organisationRouter } from './routes/organisation.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(express.json())
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/catalog', catalogRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/lms', lmsRouter)
app.use('/api/v1/faculty', facultyRouter)
app.use('/api/v1/organisation', organisationRouter)
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

export default app
