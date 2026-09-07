import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import bcrypt from "bcrypt"
import { createPrismaClient } from "../server/src/lib/prisma.js"

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..")
loadEnv({ path: resolve(repoRoot, ".env"), override: true })

const { isObjectStorageConfigured } = await import("../server/src/lib/object-storage.js")

const prisma = createPrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"
const BCRYPT_ROUNDS = 12
const DEMO_MENTOR_EMAIL = "mentor@demo.skylent.dev"
const DEMO_LEARNER_EMAIL = "learner@demo.skylent.dev"
const COURSE_SLUG = "data-analytics"
const LESSON_KEY = "l2"

type CookieJar = Map<string, string>

function getDemoPassword(): string {
  const raw = process.env.DEMO_USER_PASSWORD
  if (raw == null) return "DemoSkylent2026!"
  const normalized = raw.replace(/\uFEFF/g, "").replace(/\r/g, "").trim()
  return normalized || "DemoSkylent2026!"
}

function databaseFingerprint(): string {
  const url = process.env.DATABASE_URL
  if (!url) return "missing"
  try {
    const parsed = new URL(url.replace(/^postgresql:/, "http:"))
    return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`
  } catch {
    return "unparseable"
  }
}

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
  options: { method?: string; body?: unknown; csrf?: boolean; csrfToken?: string } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) {
    headers["X-CSRF-Token"] = options.csrfToken ?? jar.get("csrf") ?? ""
  }

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

async function ensureDemoAccountReady(email: string) {
  if (!email.endsWith("@demo.skylent.dev")) {
    throw new Error("Demo account preparation is limited to @demo.skylent.dev addresses")
  }

  const password = getDemoPassword()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(
      `Demo account ${email} is missing in ${databaseFingerprint()}. Run: npm run db:seed`,
    )
  }

  // Mirror prisma/seed.ts seedDemoUser upsert: always refresh the password hash.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  })

  const verified = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } })
  if (!verified?.passwordHash || !(await bcrypt.compare(password, verified.passwordHash))) {
    throw new Error(
      `Demo password sync failed for ${email} in ${databaseFingerprint()}. Run: npm run db:seed`,
    )
  }
}

async function loginDemo(jar: CookieJar, email: string) {
  await ensureDemoAccountReady(email)

  const csrfBootstrap = await request(jar, "/auth/csrf")
  if (!csrfBootstrap.response.ok) {
    throw new Error(`CSRF bootstrap failed for ${email}`)
  }

  const csrfToken =
    typeof csrfBootstrap.data?.csrfToken === "string"
      ? csrfBootstrap.data.csrfToken
      : jar.get("csrf") ?? ""

  const login = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    csrfToken,
    body: { email, password: getDemoPassword() },
  })
  if (!login.response.ok) {
    throw new Error(
      `Login failed for ${email}: ${JSON.stringify(login.data)} `
      + `(database=${databaseFingerprint()}, `
      + `demoPasswordSource=${process.env.DEMO_USER_PASSWORD ? "DEMO_USER_PASSWORD" : "default"}, `
      + `demoPasswordLength=${getDemoPassword().length}, api=${API_BASE})`,
    )
  }
}

async function main() {
  if (!isObjectStorageConfigured()) {
    console.log(JSON.stringify({
      status: "NOT_RUN",
      reason: "Live R2 verification unavailable because credentials are not configured.",
    }, null, 2))
    await prisma.$disconnect()
    return
  }

  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n", "utf8")
  const mentorJar: CookieJar = new Map()
  const learnerJar: CookieJar = new Map()

  await loginDemo(mentorJar, DEMO_MENTOR_EMAIL)
  await loginDemo(learnerJar, DEMO_LEARNER_EMAIL)

  const create = await request(mentorJar, `/faculty/courses/${COURSE_SLUG}/lessons/${LESSON_KEY}/materials`, {
    method: "POST",
    csrf: true,
    body: {
      fileName: "r2-roundtrip.pdf",
      mimeType: "application/pdf",
      byteSize: pdfBytes.byteLength,
    },
  })
  if (create.response.status !== 201) {
    throw new Error(`Create material failed: ${JSON.stringify(create.data)}`)
  }

  const materialId = create.data.data.material.id as string
  const put = await fetch(create.data.data.uploadUrl as string, {
    method: "PUT",
    headers: create.data.data.uploadHeaders as Record<string, string>,
    body: pdfBytes,
  })
  if (!put.ok) {
    throw new Error(`R2 PUT failed: ${put.status}`)
  }

  const complete = await request(
    mentorJar,
    `/faculty/courses/${COURSE_SLUG}/lessons/${LESSON_KEY}/materials/${materialId}/complete-upload`,
    { method: "POST", csrf: true, body: {} },
  )
  if (!complete.response.ok) {
    throw new Error(`Complete upload failed: ${JSON.stringify(complete.data)}`)
  }

  const publish = await request(
    mentorJar,
    `/faculty/courses/${COURSE_SLUG}/lessons/${LESSON_KEY}/materials/${materialId}/publish`,
    { method: "POST", csrf: true, body: {} },
  )
  if (!publish.response.ok) {
    throw new Error(`Publish failed: ${JSON.stringify(publish.data)}`)
  }

  const materials = await request(learnerJar, `/lms/courses/${COURSE_SLUG}/lessons/${LESSON_KEY}/materials`)
  if (!materials.response.ok) {
    throw new Error(`Learner materials failed: ${JSON.stringify(materials.data)}`)
  }

  const item = materials.data.data.find((entry: { fileName?: string }) => entry.fileName === "r2-roundtrip.pdf")
  if (!item?.downloadUrl) {
    throw new Error("Learner did not receive a download URL for the published material")
  }

  const download = await fetch(item.downloadUrl as string)
  if (!download.ok) {
    throw new Error(`Presigned GET failed: ${download.status}`)
  }

  const downloaded = Buffer.from(await download.arrayBuffer())
  if (!downloaded.equals(pdfBytes)) {
    throw new Error("Downloaded bytes do not match uploaded PDF")
  }

  console.log(JSON.stringify({
    status: "PASS",
    materialId,
    uploadedBytes: pdfBytes.byteLength,
    downloadedBytes: downloaded.byteLength,
  }, null, 2))

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(JSON.stringify({ status: "FAIL", error: error instanceof Error ? error.message : String(error) }, null, 2))
  await prisma.$disconnect()
  process.exit(1)
})
