import { Router } from "express"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { elixirReady, listElixirTransactions, reconcileElixir, spendOnResource } from "../lib/elixir.js"
import { prisma } from "../lib/prisma.js"

export const elixirRouter = Router()

const unavailable = { error: "Elixir is not available until the database update is applied.", code: "unavailable" as const }

elixirRouter.use(async (_req, res, next) => {
  try {
    if (await elixirReady()) {
      next()
      return
    }
  } catch (error) {
    console.error("Elixir availability check failed:", error instanceof Error ? error.name : "unknown")
  }
  res.status(503).json(unavailable)
})

import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"

function sendElixirRouteError(res: import("express").Response, error: unknown, fallback: string) {
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    return res.status(503).json(unavailable)
  }
  console.error(fallback, error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: fallback })
}

elixirRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const [reconciliation, transactions, entitlements] = await Promise.all([
      reconcileElixir(userId),
      listElixirTransactions(userId),
      prisma.learningResourceEntitlement.findMany({
        where: { userId },
        select: { resource: { select: { slug: true, title: true, kind: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ])
    res.json({
      data: {
        ...reconciliation,
        transactions: transactions.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
        entitlements: entitlements.map((row) => row.resource),
      },
    })
  } catch (error) {
    sendElixirRouteError(res, error, "Failed to load Elixir balance")
  }
})

elixirRouter.get("/resources", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const [resources, owned] = await Promise.all([
      prisma.learningResource.findMany({
        where: { published: true },
        orderBy: { title: "asc" },
        select: { slug: true, kind: true, title: true, summary: true, elixirPrice: true, courseSlug: true, lessonKey: true },
      }),
      prisma.learningResourceEntitlement.findMany({
        where: { userId },
        select: { resource: { select: { slug: true } } },
      }),
    ])
    const ownedSlugs = new Set(owned.map((row) => row.resource.slug))
    res.json({
      data: resources.map((resource) => ({ ...resource, owned: ownedSlugs.has(resource.slug) })),
    })
  } catch (error) {
    sendElixirRouteError(res, error, "Failed to load learning resources")
  }
})

elixirRouter.post("/resources/:slug/purchase", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const slug = typeof req.params.slug === "string" ? req.params.slug : ""
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ error: "Invalid resource" })
  }
  try {
    const result = await spendOnResource(req.auth!.user.id, slug)
    if (result.error === "not_found") return res.status(404).json({ error: "That resource is not available" })
    if (result.error === "owned") return res.status(409).json({ error: "You already have this resource" })
    if (result.error === "insufficient") return res.status(402).json({ error: "Not enough Elixir" })
    res.status(201).json({ data: { balance: result.balance, price: result.price, title: result.title } })
  } catch (error) {
    sendElixirRouteError(res, error, "The Elixir purchase could not be completed")
  }
})
