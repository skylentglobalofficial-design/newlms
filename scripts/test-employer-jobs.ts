import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.js"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"
const PASSWORD = "test-password-123"

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

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function setRoleDirectly(userId: string, roleName: RoleName) {
  const role = await ensureRole(roleName)
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId, roleId: { not: role.id } } })
    await tx.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    })
  })
}

async function signup(email: string, displayName: string) {
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const result = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName, email, password: PASSWORD },
  })
  assert(result.response.status === 201, `Signup failed for ${email}: ${JSON.stringify(result.data)}`)
  return { userId: result.data.user.id as string, email }
}

async function login(email: string) {
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const result = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: PASSWORD },
  })
  assert(result.response.ok, `Login failed for ${email}: ${result.response.status} ${JSON.stringify(result.data)}`)
  return jar
}

async function main() {
  const stamp = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`
  const title = `Employer ownership ${stamp}`
  const student = await signup(`employer-student-${stamp}@example.com`, "Employer Student")
  const recruiterA = await signup(`employer-a-${stamp}@example.com`, "Recruiter Alpha")
  const recruiterB = await signup(`employer-b-${stamp}@example.com`, "Recruiter Beta")
  const admin = await signup(`employer-admin-${stamp}@example.com`, "Employer Admin")
  await setRoleDirectly(recruiterA.userId, RoleName.RECRUITER)
  await setRoleDirectly(recruiterB.userId, RoleName.RECRUITER)
  await setRoleDirectly(admin.userId, RoleName.ADMIN)

  const studentJar = await login(student.email)
  const jarA = await login(recruiterA.email)
  const jarB = await login(recruiterB.email)
  const adminJar = await login(admin.email)

  const employerIds: string[] = []
  let jobId: string | null = null

  try {
    console.log("1. Student cannot use employer job routes")
    const studentList = await request(studentJar, "/career/employer/jobs")
    assert(studentList.response.status === 403, `Student list should be 403, got ${studentList.response.status}`)

    console.log("2. Recruiter without a membership sees an empty unlinked board and cannot create")
    const unlinked = await request(jarA, "/career/employer/jobs")
    assert(unlinked.response.ok, `Unlinked list failed: ${unlinked.response.status}`)
    assert(unlinked.data.meta.linked === false, "Unlinked recruiter should report linked false")
    assert(Array.isArray(unlinked.data.data) && unlinked.data.data.length === 0, "Unlinked recruiter should see no jobs")
    const blockedCreate = await request(jarA, "/career/employer/jobs", {
      method: "POST",
      csrf: true,
      body: { title, description: "Should not be created" },
    })
    assert(blockedCreate.response.status === 403, `Unlinked create should be 403, got ${blockedCreate.response.status}`)

    console.log("3. Superadmin creates employers and links only recruiter accounts")
    const employerA = await request(adminJar, "/admin/employers", {
      method: "POST",
      csrf: true,
      body: { name: `Alpha ${stamp}`, slug: `alpha-${stamp}`, location: "Remote" },
    })
    assert(employerA.response.status === 201, `Employer create failed: ${JSON.stringify(employerA.data)}`)
    employerIds.push(employerA.data.data.id)
    const employerB = await request(adminJar, "/admin/employers", {
      method: "POST",
      csrf: true,
      body: { name: `Beta ${stamp}`, slug: `beta-${stamp}` },
    })
    assert(employerB.response.status === 201, "Second employer create failed")
    employerIds.push(employerB.data.data.id)

    const studentMember = await request(adminJar, `/admin/employers/${employerA.data.data.id}/members`, {
      method: "POST",
      csrf: true,
      body: { userId: student.userId },
    })
    assert(studentMember.response.status === 400, `Student link should be 400, got ${studentMember.response.status}`)

    const memberA = await request(adminJar, `/admin/employers/${employerA.data.data.id}/members`, {
      method: "POST",
      csrf: true,
      body: { userId: recruiterA.userId },
    })
    assert(memberA.response.status === 201, `Recruiter link failed: ${JSON.stringify(memberA.data)}`)
    const memberB = await request(adminJar, `/admin/employers/${employerB.data.data.id}/members`, {
      method: "POST",
      csrf: true,
      body: { userId: recruiterB.userId },
    })
    assert(memberB.response.status === 201, "Second recruiter link failed")

    const studentAdmin = await request(studentJar, "/admin/employers")
    assert(studentAdmin.response.status === 403, "Student must not list employers")

    console.log("4. Owner creates a draft that stays off the public board")
    const missingCsrf = await request(jarA, "/career/employer/jobs", {
      method: "POST",
      body: { title, description: "Missing csrf" },
    })
    assert(missingCsrf.response.status === 403, `Missing CSRF should be 403, got ${missingCsrf.response.status}`)

    const invalid = await request(jarA, "/career/employer/jobs", {
      method: "POST",
      csrf: true,
      body: { title: "A", description: "Too short", applicationUrl: "javascript:alert(1)" },
    })
    assert(invalid.response.status === 400, `Invalid job should be 400, got ${invalid.response.status}`)

    const created = await request(jarA, "/career/employer/jobs", {
      method: "POST",
      csrf: true,
      body: {
        title,
        description: "Own the hiring workflow for this employer.",
        location: "Remote",
        workMode: "REMOTE",
        employmentType: "FULL_TIME",
      },
    })
    assert(created.response.status === 201, `Create failed: ${JSON.stringify(created.data)}`)
    assert(created.data.data.status === "DRAFT", "New jobs must start as drafts")
    jobId = created.data.data.id as string

    const publicDraft = await request(new Map(), `/career/jobs?q=${encodeURIComponent(title)}`)
    assert(publicDraft.response.ok, "Public job list failed")
    assert(!JSON.stringify(publicDraft.data).includes(jobId), "Draft jobs must stay off the public board")
    const draftFilter = await request(new Map(), "/career/jobs?status=DRAFT")
    assert(draftFilter.response.status === 400, "Public draft filter must be rejected")

    console.log("5. Another recruiter cannot read or change the job")
    const otherList = await request(jarB, "/career/employer/jobs")
    assert(otherList.response.ok && otherList.data.meta.linked === true, "Linked recruiter B should have a board")
    assert(!JSON.stringify(otherList.data.data).includes(jobId), "Recruiter B must not see recruiter A jobs")
    for (const path of [
      { method: "PATCH", path: `/career/employer/jobs/${jobId}`, body: { title: "Stolen title here" } },
      { method: "POST", path: `/career/employer/jobs/${jobId}/publish`, body: {} },
      { method: "GET", path: `/career/employer/jobs/${jobId}/applications` },
    ]) {
      const result = await request(jarB, path.path, { method: path.method, csrf: path.method !== "GET", body: path.body })
      assert(result.response.status === 404, `${path.method} ${path.path} should be 404, got ${result.response.status}`)
    }

    console.log("6. Owner can edit and publish, then the public board shows the job")
    const edited = await request(jarA, `/career/employer/jobs/${jobId}`, {
      method: "PATCH",
      csrf: true,
      body: { title: `${title} published`, description: "Updated description for the published role." },
    })
    assert(edited.response.ok, `Edit failed: ${JSON.stringify(edited.data)}`)
    const published = await request(jarA, `/career/employer/jobs/${jobId}/publish`, { method: "POST", csrf: true, body: {} })
    assert(published.response.ok && published.data.data.status === "OPEN", "Publish should open the job")
    assert(published.data.data.postedAt, "Publish should set postedAt")
    const publicOpen = await request(new Map(), `/career/jobs?q=${encodeURIComponent(`${title} published`)}`)
    assert(JSON.stringify(publicOpen.data).includes(jobId!), "Published job should be public")

    console.log("7. Private tracker rows stay hidden until the learner shares")
    const tracked = await request(studentJar, "/career/applications", {
      method: "POST",
      csrf: true,
      body: {
        jobId,
        roleTitle: `${title} published`,
        notes: "Private note that employers must never see",
        source: "career-os-jobs",
      },
    })
    assert(tracked.response.status === 201, `Tracker create failed: ${JSON.stringify(tracked.data)}`)
    assert(tracked.data.data.sharedWithEmployer === false, "Tracker applications stay private")
    const hidden = await request(jarA, `/career/employer/jobs/${jobId}/applications`)
    assert(hidden.response.ok && hidden.data.data.length === 0, "Unshared tracker rows must not reach the employer")

    const shared = await request(studentJar, "/career/applications/share", {
      method: "POST",
      csrf: true,
      body: { jobId },
    })
    assert(shared.response.ok && shared.data.data.sharedWithEmployer === true, "Share should mark the learner application")
    const visible = await request(jarA, `/career/employer/jobs/${jobId}/applications`)
    assert(visible.response.ok && visible.data.data.length === 1, "Shared application should be visible to the owner")
    const row = visible.data.data[0]
    assert(row.applicantName === "Employer Student", `Applicant name mismatch: ${row.applicantName}`)
    const serialized = JSON.stringify(visible.data)
    assert(!serialized.includes("Private note"), "Employer payload leaked notes")
    assert(!serialized.includes("employer-student-"), "Employer payload leaked email")
    assert(!serialized.includes("notes"), "Employer payload included notes")
    const stored = await prisma.jobApplication.findUnique({ where: { id: tracked.data.data.id } })
    assert(stored?.notes?.includes("Private note") && stored.sharedWithEmployer === true, "Sharing must keep the learner note private in storage")

    console.log("8. Closing removes the job from the public board")
    const closed = await request(jarA, `/career/employer/jobs/${jobId}/close`, { method: "POST", csrf: true, body: {} })
    assert(closed.response.ok && closed.data.data.status === "CLOSED", "Close should mark the job closed")
    const publicClosed = await request(new Map(), `/career/jobs/${jobId}`)
    assert(publicClosed.response.status === 404, "Closed jobs must leave the public board")
    const ownerStillSees = await request(jarA, "/career/employer/jobs")
    assert(JSON.stringify(ownerStillSees.data.data).includes(jobId!), "Owner should still see a closed job")

    console.log("Employer job ownership tests passed")
  } finally {
    if (jobId) await prisma.jobApplication.deleteMany({ where: { jobId } })
    if (employerIds.length) await prisma.employer.deleteMany({ where: { id: { in: employerIds } } })
    await prisma.user.deleteMany({
      where: { id: { in: [student.userId, recruiterA.userId, recruiterB.userId, admin.userId] } },
    }).catch(() => undefined)
    await prisma.$disconnect()
  }
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
