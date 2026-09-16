import { Router } from "express"
import { prisma } from "../lib/prisma.js"

const router = Router()

router.get("/", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    response.json({ status: "ok", db: "ok" })
  } catch (error) {
    console.error("Health check database failure:", error instanceof Error ? error.message : error)
    response.status(503).json({ status: "error", db: "error" })
  }
})

export default router
