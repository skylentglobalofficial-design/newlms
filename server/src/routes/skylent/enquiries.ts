import { Router } from "express"
import rateLimit from "express-rate-limit"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../../lib/auth.js"
import { readConsent, recordPolicyAcceptance } from "../../lib/policy.js"

export const skylentEnquiriesRouter = Router()

const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many enquiries. Try again later." })
  },
})

const schema = z.object({
  kind: z.enum(["enquiry", "counselling", "degree"]).default("enquiry"),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional(),
  programSlug: z.string().max(120).optional(),
  preferredDate: z.string().datetime().optional(),
  preferredSlot: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

/** Public: anyone can send an enquiry or book a counselling call. */
skylentEnquiriesRouter.post("/", limit, async (req, res) => {
  const body = schema.safeParse(req.body ?? {})
  if (!body.success) return void res.status(400).json({ error: "Please check your details." })
  const consent = readConsent(req.body)
  if (!consent.ok) return void res.status(consent.status).json(consent.body)
  const { preferredDate, ...rest } = body.data
  // The enquiry and the record of what was accepted are written together or not at all.
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.skylentEnquiry.create({ data: { ...rest, preferredDate: preferredDate ? new Date(preferredDate) : null } })
    await recordPolicyAcceptance(tx, { context: "enquiry", policyVersion: consent.policyVersion, enquiryId: created.id })
    return created
  })
  res.status(201).json({ data: { id: row.id } })
})

/** Admin only: list enquiries. */
skylentEnquiriesRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.auth!.roles.some((r) => r.name === "ADMIN")) return void res.status(403).json({ error: "Admins only" })
  const rows = await prisma.skylentEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 })
  res.json({ data: rows })
})
