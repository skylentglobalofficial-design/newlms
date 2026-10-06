import { Router } from "express"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { parseCookies, hashSessionToken, SESSION_COOKIE } from "../../lib/auth.js"
import { REVA_IDENTITY_REPLY, REVA_IDENTITY_RULE, isIdentityQuestion } from "../../lib/reva-identity.js"

/**
 * Site-wide Reva. Scope is decided here, never by the browser:
 * visitor = public site + catalogue only; signed-in = also their own enrolments.
 * Uses the same SKYLENT_AI_* env vars as the lesson tutor.
 */
export const revaRouter = Router()

const limit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "127.0.0.1"),
})

const body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(12),
})

const SITE = `SKYLENT connects skill programmes, university degree pathways and Career OS.
Pages: / home, /programs, /education, /career-os, /path (Find My Path), /verify, /about, /contact, /learn/sign-in.
Human support: phone 6370044001, email support@skylent.live.
Fees and discounts are not published — send people to /contact. Never invent partners, fees, placements or numbers.`

const SYSTEM = `You are Reva, SKYLENT's own AI assistant. Professional English only, concise and sharp.
${REVA_IDENTITY_RULE}
Only answer about SKYLENT using the CONTEXT. To open a page, append [[go:/path]].
If abused, calmly ask to keep it respectful and redirect.`

async function signedInUser(req: Parameters<typeof parseCookies>[0]) {
  const token = parseCookies(req)[SESSION_COOKIE]
  if (!token) return null
  const session = await prisma.session.findFirst({ where: { secretHash: hashSessionToken(token), expiresAt: { gt: new Date() } } })
  return session ? prisma.user.findUnique({ where: { id: session.userId } }) : null
}

revaRouter.post("/chat", limit, async (req, res) => {
  const parsed = body.safeParse(req.body ?? {})
  if (!parsed.success) return void res.status(400).json({ error: "Invalid request" })
  const last = parsed.data.messages.at(-1)!.content
  if (isIdentityQuestion(last)) return void res.json({ data: { answer: REVA_IDENTITY_REPLY } })

  const apiKey = process.env.SKYLENT_AI_API_KEY?.trim()
  if (!apiKey) return void res.status(503).json({ error: "Reva isn't available yet." })

  const courses = await prisma.course.findMany({ select: { slug: true, title: true }, take: 80 })
  let context = `${SITE}\nCourses: ${courses.map((c) => `${c.title} (/programs/${c.slug})`).join("; ")}`
  const user = await signedInUser(req).catch(() => null)
  if (user) {
    const mine = await prisma.userEnrollment.findMany({ where: { userId: user.id }, include: { course: { select: { title: true } } } })
    context += `\nSigned-in learner: ${user.displayName ?? "student"}. Enrolled in: ${mine.map((e) => e.course?.title).filter(Boolean).join(", ") || "nothing yet"}.`
  }

  const base = (process.env.SKYLENT_AI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "")
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.SKYLENT_AI_MODEL?.trim() || "gpt-4o-mini",
      messages: [{ role: "system", content: `${SYSTEM}\n\nCONTEXT:\n${context}` }, ...parsed.data.messages],
    }),
  }).catch(() => null)
  if (!r?.ok) return void res.status(502).json({ error: "Reva couldn't answer right now. Try again." })
  const json = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> }
  res.json({ data: { answer: json.choices?.[0]?.message?.content ?? "" } })
})
