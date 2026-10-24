import { Router } from "express"
import { z } from "zod"
import { DegreeDeliveryMode, DegreeLevel, DegreeStatus, RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  requireAuth,
  requireCsrf,
  type AuthenticatedRequest,
} from "../lib/auth.js"

export const degreesRouter = Router()

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

const degreeFilterSchema = paginationSchema.extend({
  level: z.nativeEnum(DegreeLevel).optional(),
  deliveryMode: z.nativeEnum(DegreeDeliveryMode).optional(),
  discipline: z.string().max(100).optional(),
  status: z.nativeEnum(DegreeStatus).optional(),
  institutionSlug: z.string().max(120).optional(),
  sample: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
})

const institutionFilterSchema = paginationSchema.extend({
  verified: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  country: z.string().max(100).optional(),
})

const institutionCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(255),
  awardingBody: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  logoUrl: z.string().url().max(2000).optional(),
  websiteUrl: z.string().url().max(2000).optional(),
  description: z.string().max(5000).optional(),
  verified: z.boolean().default(false),
})

const institutionUpdateSchema = institutionCreateSchema.partial().omit({ slug: true })

const degreeCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(255),
  institutionSlug: z.string().max(120).optional(),
  deliveryMode: z.nativeEnum(DegreeDeliveryMode),
  level: z.nativeEnum(DegreeLevel),
  discipline: z.string().min(1).max(100),
  status: z.nativeEnum(DegreeStatus).default(DegreeStatus.DRAFT),
  duration: z.string().max(100).optional(),
  description: z.string().max(10000).optional(),
  eligibility: z.string().max(5000).optional(),
  curriculum: z.unknown().optional(),
  skills: z.array(z.string().max(100)).max(50).default([]),
  careerRoles: z.array(z.string().max(100)).max(50).default([]),
  tuitionFee: z.string().max(100).optional(),
  intake: z.string().max(100).optional(),
  sample: z.boolean().default(true),
})

const degreeUpdateSchema = degreeCreateSchema.partial().omit({ slug: true })

function requireRole(...roles: RoleName[]) {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    const auth = req.auth
    if (!auth) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const userRoles = auth.roles.map((r) => r.name)
    const hasRole = roles.some((role) => userRoles.includes(role))
    if (!hasRole) {
      return res.status(403).json({ error: "Forbidden" })
    }
    next()
  }
}

// Public endpoints

degreesRouter.get("/", async (req, res, next) => {
  try {
    const parsed = degreeFilterSchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() })
    }

    const { limit, offset, level, deliveryMode, discipline, status, institutionSlug, sample } = parsed.data

    const where: any = {}
    
    if (level) where.level = level
    if (deliveryMode) where.deliveryMode = deliveryMode
    if (discipline) where.discipline = { contains: discipline, mode: "insensitive" }
    if (status) {
      where.status = status
    } else {
      where.status = DegreeStatus.PUBLISHED
    }
    if (institutionSlug) {
      where.institution = { slug: institutionSlug }
    }
    if (sample !== undefined) where.sample = sample

    const [degrees, total] = await Promise.all([
      prisma.degree.findMany({
        where,
        include: {
          institution: {
            select: { slug: true, name: true, verified: true, logoUrl: true },
          },
        },
        orderBy: { title: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.degree.count({ where }),
    ])

    res.json({
      data: degrees.map((d) => ({
        slug: d.slug,
        title: d.title,
        level: d.level,
        deliveryMode: d.deliveryMode,
        discipline: d.discipline,
        status: d.status,
        duration: d.duration,
        tuitionFee: d.tuitionFee,
        intake: d.intake,
        skills: d.skills,
        careerRoles: d.careerRoles,
        sample: d.sample,
        institution: d.institution
          ? {
              slug: d.institution.slug,
              name: d.institution.name,
              verified: d.institution.verified,
              logoUrl: d.institution.logoUrl,
            }
          : null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + degrees.length < total,
      },
    })
  } catch (error) {
    next(error)
  }
})

degreesRouter.get("/disciplines", async (_req, res, next) => {
  try {
    const disciplines = await prisma.degree.groupBy({
      by: ["discipline"],
      where: { status: DegreeStatus.PUBLISHED },
      _count: { discipline: true },
      orderBy: { discipline: "asc" },
    })

    res.json({
      data: disciplines.map((d) => ({
        name: d.discipline,
        count: d._count.discipline,
      })),
    })
  } catch (error) {
    next(error)
  }
})

degreesRouter.get("/:slug", async (req, res, next) => {
  try {
    const parsed = slugSchema.safeParse(req.params.slug)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid slug" })
    }

    const degree = await prisma.degree.findUnique({
      where: { slug: parsed.data },
      include: {
        institution: true,
      },
    })

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" })
    }

    if (degree.status !== DegreeStatus.PUBLISHED) {
      return res.status(404).json({ error: "Degree not found" })
    }

    res.json({
      data: {
        slug: degree.slug,
        title: degree.title,
        level: degree.level,
        deliveryMode: degree.deliveryMode,
        discipline: degree.discipline,
        status: degree.status,
        duration: degree.duration,
        description: degree.description,
        eligibility: degree.eligibility,
        curriculum: degree.curriculum,
        skills: degree.skills,
        careerRoles: degree.careerRoles,
        tuitionFee: degree.tuitionFee,
        intake: degree.intake,
        sample: degree.sample,
        institution: degree.institution
          ? {
              slug: degree.institution.slug,
              name: degree.institution.name,
              awardingBody: degree.institution.awardingBody,
              city: degree.institution.city,
              country: degree.institution.country,
              logoUrl: degree.institution.logoUrl,
              websiteUrl: degree.institution.websiteUrl,
              description: degree.institution.description,
              verified: degree.institution.verified,
            }
          : null,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Institutions endpoints

degreesRouter.get("/institutions", async (req, res, next) => {
  try {
    const parsed = institutionFilterSchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() })
    }

    const { limit, offset, verified, country } = parsed.data

    const where: any = {}
    if (verified !== undefined) where.verified = verified
    if (country) where.country = { contains: country, mode: "insensitive" }

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        include: {
          _count: { select: { degrees: { where: { status: DegreeStatus.PUBLISHED } } } },
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.institution.count({ where }),
    ])

    res.json({
      data: institutions.map((i) => ({
        slug: i.slug,
        name: i.name,
        awardingBody: i.awardingBody,
        city: i.city,
        country: i.country,
        logoUrl: i.logoUrl,
        verified: i.verified,
        degreeCount: i._count.degrees,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + institutions.length < total,
      },
    })
  } catch (error) {
    next(error)
  }
})

degreesRouter.get("/institutions/:slug", async (req, res, next) => {
  try {
    const parsed = slugSchema.safeParse(req.params.slug)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid slug" })
    }

    const institution = await prisma.institution.findUnique({
      where: { slug: parsed.data },
      include: {
        degrees: {
          where: { status: DegreeStatus.PUBLISHED },
          select: {
            slug: true,
            title: true,
            level: true,
            deliveryMode: true,
            discipline: true,
            duration: true,
          },
          orderBy: { title: "asc" },
        },
      },
    })

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" })
    }

    res.json({
      data: {
        slug: institution.slug,
        name: institution.name,
        awardingBody: institution.awardingBody,
        city: institution.city,
        country: institution.country,
        logoUrl: institution.logoUrl,
        websiteUrl: institution.websiteUrl,
        description: institution.description,
        verified: institution.verified,
        degrees: institution.degrees,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Admin endpoints

degreesRouter.post(
  "/admin/institutions",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const parsed = institutionCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() })
      }

      const existing = await prisma.institution.findUnique({
        where: { slug: parsed.data.slug },
      })
      if (existing) {
        return res.status(409).json({ error: "Institution with this slug already exists" })
      }

      const institution = await prisma.institution.create({
        data: parsed.data,
      })

      res.status(201).json({ data: institution })
    } catch (error) {
      next(error)
    }
  }
)

degreesRouter.patch(
  "/admin/institutions/:slug",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const slugParsed = slugSchema.safeParse(req.params.slug)
      if (!slugParsed.success) {
        return res.status(400).json({ error: "Invalid slug" })
      }

      const parsed = institutionUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() })
      }

      const institution = await prisma.institution.update({
        where: { slug: slugParsed.data },
        data: parsed.data,
      })

      res.json({ data: institution })
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Institution not found" })
      }
      next(error)
    }
  }
)

degreesRouter.delete(
  "/admin/institutions/:slug",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const parsed = slugSchema.safeParse(req.params.slug)
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid slug" })
      }

      const degreeCount = await prisma.degree.count({
        where: { institution: { slug: parsed.data } },
      })
      if (degreeCount > 0) {
        return res.status(409).json({
          error: "Cannot delete institution with associated degrees",
          degreeCount,
        })
      }

      await prisma.institution.delete({
        where: { slug: parsed.data },
      })

      res.json({ success: true })
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Institution not found" })
      }
      next(error)
    }
  }
)

// Admin degree endpoints

degreesRouter.get(
  "/admin/all",
  requireAuth,
  requireRole(RoleName.ADMIN),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const parsed = degreeFilterSchema.safeParse(req.query)
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() })
      }

      const { limit, offset, level, deliveryMode, discipline, status, institutionSlug, sample } = parsed.data

      const where: any = {}
      if (level) where.level = level
      if (deliveryMode) where.deliveryMode = deliveryMode
      if (discipline) where.discipline = { contains: discipline, mode: "insensitive" }
      if (status) where.status = status
      if (institutionSlug) where.institution = { slug: institutionSlug }
      if (sample !== undefined) where.sample = sample

      const [degrees, total] = await Promise.all([
        prisma.degree.findMany({
          where,
          include: { institution: { select: { slug: true, name: true, verified: true } } },
          orderBy: [{ status: "asc" }, { title: "asc" }],
          take: limit,
          skip: offset,
        }),
        prisma.degree.count({ where }),
      ])

      res.json({
        data: degrees,
        pagination: { total, limit, offset, hasMore: offset + degrees.length < total },
      })
    } catch (error) {
      next(error)
    }
  }
)

degreesRouter.post(
  "/admin",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const parsed = degreeCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() })
      }

      const existing = await prisma.degree.findUnique({
        where: { slug: parsed.data.slug },
      })
      if (existing) {
        return res.status(409).json({ error: "Degree with this slug already exists" })
      }

      const { institutionSlug, ...degreeData } = parsed.data

      let institutionId: string | null = null
      if (institutionSlug) {
        const institution = await prisma.institution.findUnique({
          where: { slug: institutionSlug },
          select: { id: true },
        })
        if (!institution) {
          return res.status(400).json({ error: "Institution not found" })
        }
        institutionId = institution.id
      }

      const degree = await prisma.degree.create({
        data: {
          slug: degreeData.slug,
          title: degreeData.title,
          deliveryMode: degreeData.deliveryMode,
          level: degreeData.level,
          discipline: degreeData.discipline,
          status: degreeData.status,
          duration: degreeData.duration,
          description: degreeData.description,
          eligibility: degreeData.eligibility,
          curriculum: degreeData.curriculum as any,
          skills: degreeData.skills,
          careerRoles: degreeData.careerRoles,
          tuitionFee: degreeData.tuitionFee,
          intake: degreeData.intake,
          sample: degreeData.sample,
          ...(institutionId ? { institution: { connect: { id: institutionId } } } : {}),
        },
        include: { institution: { select: { slug: true, name: true } } },
      })

      res.status(201).json({ data: degree })
    } catch (error) {
      next(error)
    }
  }
)

degreesRouter.patch(
  "/admin/:slug",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const slugParsed = slugSchema.safeParse(req.params.slug)
      if (!slugParsed.success) {
        return res.status(400).json({ error: "Invalid slug" })
      }

      const parsed = degreeUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() })
      }

      const { institutionSlug, ...degreeData } = parsed.data
      let updateData: any = { ...degreeData }

      if (institutionSlug !== undefined) {
        if (institutionSlug === null || institutionSlug === "") {
          updateData.institutionId = null
        } else {
          const institution = await prisma.institution.findUnique({
            where: { slug: institutionSlug },
            select: { id: true },
          })
          if (!institution) {
            return res.status(400).json({ error: "Institution not found" })
          }
          updateData.institutionId = institution.id
        }
      }

      const degree = await prisma.degree.update({
        where: { slug: slugParsed.data },
        data: updateData,
        include: { institution: { select: { slug: true, name: true } } },
      })

      res.json({ data: degree })
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Degree not found" })
      }
      next(error)
    }
  }
)

degreesRouter.delete(
  "/admin/:slug",
  requireAuth,
  requireRole(RoleName.ADMIN),
  requireCsrf,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const parsed = slugSchema.safeParse(req.params.slug)
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid slug" })
      }

      await prisma.degree.delete({
        where: { slug: parsed.data },
      })

      res.json({ success: true })
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Degree not found" })
      }
      next(error)
    }
  }
)

// Empty state helper endpoint
degreesRouter.get("/setup-status", async (_req, res, next) => {
  try {
    const [degreeCount, institutionCount, publishedDegreeCount] = await Promise.all([
      prisma.degree.count(),
      prisma.institution.count(),
      prisma.degree.count({ where: { status: DegreeStatus.PUBLISHED } }),
    ])

    const isEmpty = degreeCount === 0 && institutionCount === 0

    res.json({
      isEmpty,
      stats: {
        totalDegrees: degreeCount,
        publishedDegrees: publishedDegreeCount,
        draftDegrees: degreeCount - publishedDegreeCount,
        institutions: institutionCount,
      },
      nextSteps: isEmpty
        ? [
            "1. Create at least one Institution via POST /api/v1/degrees/admin/institutions",
            "2. Create Degree programmes via POST /api/v1/degrees/admin",
            "3. Set status to PUBLISHED when ready to show publicly",
            "Or seed sample data using the admin panel or seed script",
          ]
        : null,
    })
  } catch (error) {
    next(error)
  }
})

export default degreesRouter
