import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { isObjectStorageConfigured } from "../server/src/lib/object-storage.js"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "DemoSkylent2026!"
const COURSE_SLUG = "data-analytics"
const LESSON_KEY = "l2"

type CookieJar = Map<string, string>

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

  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

async function loginDemo(jar: CookieJar, email: string) {
  await request(jar, "/auth/csrf")
  const login = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: DEMO_PASSWORD },
  })
  if (!login.response.ok) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(login.data)}`)
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

  await loginDemo(mentorJar, "mentor@demo.skylent.dev")
  await loginDemo(learnerJar, "learner@demo.skylent.dev")

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
