import express from 'express'

import catalogRouter from './routes/catalog.js'
import healthRouter from './routes/health.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(express.json())
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/catalog', catalogRouter)
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

export default app