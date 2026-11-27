import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js";
import { requireRoles } from "../lib/roles.js";
import { employerIdsForUser } from "../lib/career/employer-access.js";

export const capabilityRouter = Router();

const scopes = ["profile", "skills", "projects", "learning"] as const;
const consentSchema = z.object({
  employerId: z.string().uuid(),
  action: z.enum(["grant", "revoke"]),
  scopes: z.array(z.enum(scopes)).max(scopes.length).optional(),
}).superRefine((value, ctx) => {
  if (value.action === "grant" && (!value.scopes || value.scopes.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["scopes"], message: "Select at least one sharing scope." });
  }
});

capabilityRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth!.user.id;
  try {
    const [profile, enrollments, projects, consents] = await Promise.all([
      prisma.careerProfile.findUnique({
        where: { userId },
        include: { skills: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.userEnrollment.findMany({
        where: { userId },
        include: { course: { select: { slug: true, title: true } }, program: { select: { slug: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.learnerProject.findMany({
        where: { userId },
        select: { id: true, title: true, courseSlug: true, status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.capabilityConsent.findMany({
        where: { learnerUserId: userId },
        include: { employer: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      }),
    ]);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      data: {
        profile: profile ? { headline: profile.headline, summary: profile.summary, location: profile.location } : null,
        skills: (profile?.skills ?? []).map((skill) => ({
          id: skill.id, name: skill.name, category: skill.category, proficiency: skill.proficiency,
          evidenceStatus: "self_declared",
        })),
        learning: enrollments.map((entry) => ({
          course: entry.course ? { slug: entry.course.slug, title: entry.course.title } : null,
          program: entry.program ? { slug: entry.program.slug, name: entry.program.name } : null,
          status: entry.status,
          certificateStatus: entry.certificateStatus,
        })),
        projects,
        sharing: consents.map((consent) => ({
          employer: consent.employer, scopes: consent.scopes,
          grantedAt: consent.grantedAt, revokedAt: consent.revokedAt,
          active: consent.revokedAt === null,
        })),
      },
    });
  } catch (error) {
    console.error("Capability profile read failed:", error instanceof Error ? error.name : "unknown");
    res.status(503).json({ error: "Capability profile is temporarily unavailable.", code: "unavailable" });
  }
});

capabilityRouter.post("/consent", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = consentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid consent request.", details: parsed.error.flatten().fieldErrors });
  const userId = req.auth!.user.id;
  try {
    const employer = await prisma.employer.findUnique({ where: { id: parsed.data.employerId }, select: { id: true } });
    if (!employer) return res.status(404).json({ error: "Employer not found." });
    const result = await prisma.$transaction(async (tx) => {
      const consent = await tx.capabilityConsent.upsert({
        where: { learnerUserId_employerId: { learnerUserId: userId, employerId: employer.id } },
        update: parsed.data.action === "grant"
          ? { scopes: [...new Set(parsed.data.scopes ?? [])], grantedAt: new Date(), revokedAt: null }
          : { revokedAt: new Date() },
        create: {
          learnerUserId: userId, employerId: employer.id,
          scopes: parsed.data.action === "grant" ? [...new Set(parsed.data.scopes ?? [])] : [],
          ...(parsed.data.action === "revoke" ? { revokedAt: new Date() } : {}),
        },
      });
      await tx.capabilityConsentEvent.create({
        data: {
          consentId: consent.id, actorUserId: userId,
          action: parsed.data.action,
          scopes: parsed.data.action === "grant" ? consent.scopes : [],
        },
      });
      return consent;
    });
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: { employerId: result.employerId, scopes: result.scopes, grantedAt: result.grantedAt, revokedAt: result.revokedAt, active: result.revokedAt === null } });
  } catch (error) {
    console.error("Capability consent update failed:", error instanceof Error ? error.name : "unknown");
    res.status(503).json({ error: "Consent service is temporarily unavailable.", code: "unavailable" });
  }
});

capabilityRouter.get("/employer/learners/:learnerId", requireAuth, requireRoles("recruiter", "superadmin"), async (req: AuthenticatedRequest, res) => {
  const learnerId = z.string().uuid().safeParse(req.params.learnerId);
  if (!learnerId.success) return res.status(400).json({ error: "Invalid learner id." });
  try {
    const employerIds = await employerIdsForUser(req.auth!.user.id);
    if (employerIds.length === 0) return res.status(403).json({ error: "No employer membership is linked to this account." });
    const consent = await prisma.capabilityConsent.findFirst({
      where: { learnerUserId: learnerId.data, employerId: { in: employerIds }, revokedAt: null },
      include: {
        learner: {
          select: {
            id: true, careerProfile: { include: { skills: { orderBy: { sortOrder: "asc" } } } },
            learnerProjects: { select: { id: true, title: true, courseSlug: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" } },
            enrollments: { include: { course: { select: { slug: true, title: true } }, program: { select: { slug: true, name: true } } }, orderBy: { updatedAt: "desc" } },
          },
        },
      },
    });
    if (!consent) return res.status(404).json({ error: "No active learner consent for your employer." });
    const allowed = new Set(consent.scopes);
    const learner = consent.learner;
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: {
      learnerId: learner.id,
      ...(allowed.has("profile") ? { profile: learner.careerProfile ? { headline: learner.careerProfile.headline, summary: learner.careerProfile.summary, location: learner.careerProfile.location } : null } : {}),
      ...(allowed.has("skills") ? { skills: (learner.careerProfile?.skills ?? []).map((skill) => ({ name: skill.name, category: skill.category, proficiency: skill.proficiency, evidenceStatus: "self_declared" })) } : {}),
      ...(allowed.has("projects") ? { projects: learner.learnerProjects } : {}),
      ...(allowed.has("learning") ? { learning: learner.enrollments.map((entry) => ({ course: entry.course, program: entry.program, status: entry.status, certificateStatus: entry.certificateStatus })) } : {}),
    }});
  } catch (error) {
    console.error("Employer capability lookup failed:", error instanceof Error ? error.name : "unknown");
    res.status(503).json({ error: "Employer capability lookup is temporarily unavailable.", code: "unavailable" });
  }
});
