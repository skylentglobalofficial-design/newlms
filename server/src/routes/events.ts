import { Router } from "express"
import { z } from "zod"
import { EventStatus, EventType, EventRegistrationStatus } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  attachAuth,
  requireAuth,
  requireCsrf,
  type AuthenticatedRequest,
} from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { awardWorkshopRegistrationCashback, DEFAULT_WORKSHOP_FEE_RUPEES, workshopCoinCashbackForRupees } from "../lib/elixir.js"
import { isDatabaseUnavailableError, isMissingSchemaError, readSchemaCapabilities } from "../lib/schema-capabilities.js"

export const eventsRouter = Router()

export function workshopRewardMetadata(feeRupees = DEFAULT_WORKSHOP_FEE_RUPEES) {
  return {
    feeRupees,
    elixirCashback: workshopCoinCashbackForRupees(feeRupees),
    cashbackPercent: 100,
    redeemableFor: "Case studies & guided workspaces",
  }
}


const EVENTS_UNAVAILABLE = { error: "Events are not available yet.", code: "unavailable" as const }

function sendEventsFailure(res: import("express").Response, error: unknown, fallback: string) {
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    return res.status(503).json(EVENTS_UNAVAILABLE)
  }
  console.error(fallback, error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: fallback })
}

eventsRouter.use(async (_req, res, next) => {
  try {
    const caps = await readSchemaCapabilities()
    if (!caps.events) {
      res.status(503).json(EVENTS_UNAVAILABLE)
      return
    }
    next()
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      res.status(503).json(EVENTS_UNAVAILABLE)
      return
    }
    next(error)
  }
})

const slugSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const eventCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  eventType: z.nativeEnum(EventType).optional(),
  hostName: z.string().max(200).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().max(50).optional(),
  capacity: z.number().int().min(1).optional(),
  meetingUrl: z.string().url().max(500).optional(),
  location: z.string().max(500).optional(),
  isOnline: z.boolean().optional(),
  programSlug: z.string().max(120).optional(),
  courseSlug: z.string().max(120).optional(),
})

const eventUpdateSchema = eventCreateSchema.partial().omit({ slug: true })

const listSchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  upcoming: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

eventsRouter.get("/", async (req, res) => {
  const parsed = listSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" })
  }

  const { status, upcoming, limit = 20, offset = 0 } = parsed.data
  const now = new Date()

  const where: Record<string, unknown> = {}
  if (status) {
    where.status = status
  } else {
    where.status = EventStatus.PUBLISHED
  }
  if (upcoming === "true") {
    where.startTime = { gte: now }
  } else if (upcoming === "false") {
    where.endTime = { lt: now }
  }

  try {
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startTime: "asc" },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
        },
      }),
      prisma.event.count({ where }),
    ])

    res.json({
      data: events.map((event) => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        status: event.status,
        hostName: event.hostName,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        timezone: event.timezone,
        capacity: event.capacity,
        isOnline: event.isOnline,
        location: event.location,
        programSlug: event.programSlug,
        courseSlug: event.courseSlug,
        registrationCount: event._count.registrations,
        spotsRemaining: event.capacity ? Math.max(0, event.capacity - event._count.registrations) : null,
        elixirReward: workshopRewardMetadata(),
      })),
      meta: { total, limit, offset },
    })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to list events")
  }
})

eventsRouter.get("/:slug", async (req, res) => {
  const parsed = slugSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const auth = await attachAuth(req as AuthenticatedRequest)

    const event = await prisma.event.findUnique({
      where: { slug: parsed.data.slug },
      include: {
        _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      },
    })

    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    if (event.status !== EventStatus.PUBLISHED && !auth) {
      return res.status(404).json({ error: "Event not found" })
    }

    let userRegistration = null
    if (auth) {
      const registration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: auth.user.id } },
      })
      if (registration) {
        userRegistration = {
          status: registration.status,
          registeredAt: registration.registeredAt.toISOString(),
        }
      }
    }

    res.json({
      data: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        status: event.status,
        hostName: event.hostName,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        timezone: event.timezone,
        capacity: event.capacity,
        meetingUrl: userRegistration?.status === "REGISTERED" ? event.meetingUrl : null,
        isOnline: event.isOnline,
        location: event.location,
        programSlug: event.programSlug,
        courseSlug: event.courseSlug,
        registrationCount: event._count.registrations,
        spotsRemaining: event.capacity ? Math.max(0, event.capacity - event._count.registrations) : null,
        elixirReward: workshopRewardMetadata(),
        userRegistration,
      },
    })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to get event")
  }
})

eventsRouter.post(
  "/:slug/register",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const parsed = slugSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid slug" })
    }

    try {
      const event = await prisma.event.findUnique({
        where: { slug: parsed.data.slug },
        include: {
          _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
        },
      })

      if (!event || event.status !== EventStatus.PUBLISHED) {
        return res.status(404).json({ error: "Event not found or not open for registration" })
      }

      if (event.startTime < new Date()) {
        return res.status(400).json({ error: "Event has already started" })
      }

      if (event.capacity && event._count.registrations >= event.capacity) {
        return res.status(400).json({ error: "Event is at full capacity" })
      }

      const existing = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: req.auth!.user.id } },
      })

      if (existing) {
        if (existing.status === EventRegistrationStatus.REGISTERED) {
          return res.status(409).json({ error: "Already registered for this event" })
        }
        const updated = await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: EventRegistrationStatus.REGISTERED,
            registeredAt: new Date(),
            cancelledAt: null,
          },
        })
        return res.json({
          data: {
            status: updated.status,
            registeredAt: updated.registeredAt.toISOString(),
          },
        })
      }

      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          userId: req.auth!.user.id,
          status: EventRegistrationStatus.REGISTERED,
        },
      })

      const cashback = await awardWorkshopRegistrationCashback({
        userId: req.auth!.user.id,
        eventId: event.id,
        eventSlug: event.slug,
        eventTitle: event.title,
      })

      res.status(201).json({
        data: {
          status: registration.status,
          registeredAt: registration.registeredAt.toISOString(),
          elixirReward: workshopRewardMetadata(),
          elixirAwarded: cashback.amount,
        },
      })
    } catch (error) {
      sendEventsFailure(res, error, "Failed to register")
    }
  },
)

eventsRouter.post(
  "/:slug/cancel",
  requireAuth,
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const parsed = slugSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid slug" })
    }

    try {
      const event = await prisma.event.findUnique({
        where: { slug: parsed.data.slug },
      })

      if (!event) {
        return res.status(404).json({ error: "Event not found" })
      }

      const registration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: req.auth!.user.id } },
      })

      if (!registration || registration.status !== EventRegistrationStatus.REGISTERED) {
        return res.status(404).json({ error: "No active registration found" })
      }

      if (event.startTime < new Date()) {
        return res.status(400).json({ error: "Cannot cancel after event has started" })
      }

      const updated = await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: {
          status: EventRegistrationStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      })

      res.json({
        data: {
          status: updated.status,
          cancelledAt: updated.cancelledAt?.toISOString(),
        },
      })
    } catch (error) {
      sendEventsFailure(res, error, "Failed to cancel registration")
    }
  },
)

eventsRouter.get("/my/registrations", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.auth!.user.id },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            startTime: true,
            endTime: true,
            timezone: true,
            isOnline: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: { event: { startTime: "asc" } },
    })

    res.json({
      data: registrations.map((reg) => ({
        eventId: reg.eventId,
        status: reg.status,
        registeredAt: reg.registeredAt.toISOString(),
        event: {
          slug: reg.event.slug,
          title: reg.event.title,
          startTime: reg.event.startTime.toISOString(),
          endTime: reg.event.endTime.toISOString(),
          timezone: reg.event.timezone,
          isOnline: reg.event.isOnline,
          location: reg.event.location,
          status: reg.event.status,
        },
      })),
    })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to list registrations")
  }
})

const adminGuards = [requireAuth, requireRoles("superadmin", "faculty")] as const

eventsRouter.post("/", ...adminGuards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = eventCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const { startTime, endTime, ...rest } = parsed.data
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) {
    return res.status(400).json({ error: "End time must be after start time" })
  }

  try {
    const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return res.status(409).json({ error: "An event with this slug already exists" })
    }

    const event = await prisma.event.create({
      data: {
        ...rest,
        startTime: start,
        endTime: end,
        hostId: req.auth!.user.id,
        status: EventStatus.DRAFT,
      },
    })

    res.status(201).json({
      data: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        status: event.status,
      },
    })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to create event")
  }
})

eventsRouter.patch("/:slug", ...adminGuards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const slugParsed = slugSchema.safeParse(req.params)
  const bodyParsed = eventUpdateSchema.safeParse(req.body)
  if (!slugParsed.success || !bodyParsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: bodyParsed.success ? undefined : bodyParsed.error.flatten().fieldErrors,
    })
  }

  try {
    const event = await prisma.event.findUnique({ where: { slug: slugParsed.data.slug } })
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const { startTime, endTime, ...rest } = bodyParsed.data
    const data: Record<string, unknown> = { ...rest }

    if (startTime) data.startTime = new Date(startTime)
    if (endTime) data.endTime = new Date(endTime)

    const updated = await prisma.event.update({
      where: { id: event.id },
      data,
    })

    res.json({
      data: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        status: updated.status,
      },
    })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to update event")
  }
})

eventsRouter.post("/:slug/publish", ...adminGuards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = slugSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const event = await prisma.event.findUnique({ where: { slug: parsed.data.slug } })
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    if (event.status === EventStatus.PUBLISHED) {
      return res.status(400).json({ error: "Event is already published" })
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: { status: EventStatus.PUBLISHED },
    })

    res.json({ data: { slug: updated.slug, status: updated.status } })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to publish event")
  }
})

eventsRouter.post("/:slug/cancel", ...adminGuards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = slugSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid slug" })
  }

  try {
    const event = await prisma.event.findUnique({ where: { slug: parsed.data.slug } })
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: { status: EventStatus.CANCELLED },
    })

    res.json({ data: { slug: updated.slug, status: updated.status } })
  } catch (error) {
    sendEventsFailure(res, error, "Failed to cancel event")
  }
})
