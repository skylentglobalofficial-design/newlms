import { Router } from "express"
import { z } from "zod"
import {
  CareerSupportPriority,
  CareerSupportRequestStatus,
  CareerSupportRequestType,
} from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { assertOwnedSupportRequest } from "../../lib/career/profile.js"
import { serializeSupportRequest } from "../../lib/career/serializers.js"
import { validationError } from "../../lib/career/shared.js"

export const supportRouter = Router()

const uuidSchema = z.string().uuid()

const createSchema = z.object({
  type: z.nativeEnum(CareerSupportRequestType),
  subject: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(8000),
  priority: z.nativeEnum(CareerSupportPriority).optional(),
})

const patchSchema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(8000).optional(),
  status: z.nativeEnum(CareerSupportRequestStatus).optional(),
  priority: z.nativeEnum(CareerSupportPriority).optional(),
})

supportRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const requests = await prisma.careerSupportRequest.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { createdAt: "desc" },
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    })
    res.json({ data: requests.map(serializeSupportRequest) })
  } catch (error) {
    console.error("Failed to list support requests:", error)
    res.status(500).json({ error: "Failed to list support requests" })
  }
})

supportRouter.post("/", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  try {
    const request = await prisma.careerSupportRequest.create({
      data: {
        userId: req.auth!.user.id,
        type: parsed.data.type,
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: parsed.data.priority ?? CareerSupportPriority.MEDIUM,
      },
      include: { tasks: true },
    })
    res.status(201).json({ data: serializeSupportRequest(request) })
  } catch (error) {
    console.error("Failed to create support request:", error)
    res.status(500).json({ error: "Failed to create support request" })
  }
})

supportRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid support request id" })

  const owned = await assertOwnedSupportRequest(req.auth!.user.id, idParsed.data)
  if (!owned) return res.status(404).json({ error: "Support request not found" })

  try {
    const request = await prisma.careerSupportRequest.findUnique({
      where: { id: owned.id },
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    })
    res.json({ data: serializeSupportRequest(request!) })
  } catch (error) {
    res.status(500).json({ error: "Failed to load support request" })
  }
})

supportRouter.patch("/:id", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const idParsed = uuidSchema.safeParse(req.params.id)
  if (!idParsed.success) return res.status(400).json({ error: "Invalid support request id" })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)

  const owned = await assertOwnedSupportRequest(req.auth!.user.id, idParsed.data)
  if (!owned) return res.status(404).json({ error: "Support request not found" })

  try {
    const updated = await prisma.careerSupportRequest.update({
      where: { id: owned.id },
      data: {
        subject: parsed.data.subject,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
      },
      include: { tasks: { orderBy: { createdAt: "asc" } } },
    })
    res.json({ data: serializeSupportRequest(updated) })
  } catch (error) {
    res.status(500).json({ error: "Failed to update support request" })
  }
})
