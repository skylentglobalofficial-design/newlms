import "dotenv/config"
import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaClient } from "@prisma/client"
import { normalizeMuxPlaybackId } from "../src/lib/media/mux-playback.js"

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..")
loadEnv({ path: resolve(repoRoot, ".env"), override: true })
loadEnv({ path: resolve(repoRoot, ".env.local"), override: true })

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

type CookieJar = Map<string, string>

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function describeId(value: string | null | undefined) {
  if (!value) return { present: false }
  const normalized = normalizeMuxPlaybackId(value)
  return {
    present: true,
    length: value.length,
    valid: normalized != null,
    looksLikePlaceholder: /^mux[-_]/i.test(value) || /seed[-_]?verification/i.test(value),
    prefix4: value.slice(0, 4),
    suffix4: value.slice(-4),
    normalizedMatchesRaw: normalized === value.trim(),
  }
}

async function main() {
  const prisma = new PrismaClient()
  const node = await prisma.curriculumNode.findFirst({
    where: { sourceId: "l1", module: { course: { slug: "data-analytics" } } },
    select: { sourceId: true, title: true, muxPlaybackId: true },
  })

  const envRaw = process.env.MUX_DEMO_PLAYBACK_ID ?? null
  const envNormalized = normalizeMuxPlaybackId(envRaw)

  console.log("=== DATABASE (data-analytics / l1) ===")
  console.log(
    JSON.stringify(
      {
        lessonKey: node?.sourceId ?? null,
        lessonTitle: node?.title ?? null,
        muxPlaybackId: node?.muxPlaybackId ?? null,
      },
      null,
      2,
    ),
  )

  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: {
      displayName: "Mux Diagnose",
      email: `mux-diagnose-${Date.now()}@example.com`,
      password: "test-password-123",
    },
  })
  if (signup.response.status !== 201) throw new Error(`signup failed: ${signup.response.status}`)
  await request(jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: "data-analytics" },
  })

  const media = await request(jar, "/lms/courses/data-analytics/lessons/l1/media")
  console.log("=== API /lms/courses/data-analytics/lessons/l1/media ===")
  console.log(JSON.stringify(media.data, null, 2))

  console.log("=== ENV MUX_DEMO_PLAYBACK_ID (safe summary) ===")
  console.log(
    JSON.stringify(
      {
        configured: envRaw != null && envRaw.trim().length > 0,
        envSummary: describeId(envRaw),
        normalizedConfigured: envNormalized != null,
        dbMatchesNormalizedEnv: (node?.muxPlaybackId ?? null) === envNormalized,
        apiProvider: media.data?.data?.media?.provider ?? null,
        apiPlaybackId: media.data?.data?.media?.playbackId ?? null,
        apiMatchesNormalizedEnv: media.data?.data?.media?.playbackId === envNormalized,
      },
      null,
      2,
    ),
  )

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
