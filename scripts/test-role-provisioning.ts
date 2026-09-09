import "dotenv/config"
import { RoleName, PrismaClient } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.js"
import { resolveGoogleAccount, type GoogleIdTokenClaims } from "../server/src/lib/google-oauth.js"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"
const PASSWORD = "role-provisioning-test-123"

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
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
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
    redirect: "manual",
  })

  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)

  const text = await response.text()
  let data: any = null
  if (text) {
    const contentType = response.headers.get("content-type") ?? ""
    data = contentType.includes("application/json") ? JSON.parse(text) : text
  }
  return { response, data }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function assertNoSecrets(payload: unknown) {
  const serialized = JSON.stringify(payload)
  assert(!serialized.includes("passwordHash"), "Response leaked passwordHash")
  assert(!serialized.includes("secretHash"), "Response leaked secretHash")
}

const createdUserIds: string[] = []
const createdOrganisationIds: string[] = []

async function signup(email: string, displayName: string) {
  const jar: CookieJar = new Map()
  const csrf = await request(jar, "/auth/csrf")
  assert(csrf.response.ok, "CSRF bootstrap failed")
  const result = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName, email, password: PASSWORD },
  })
  assert(result.response.status === 201, `Signup failed for ${email}: ${result.response.status}`)
  createdUserIds.push(result.data.user.id)
  return { jar, userId: result.data.user.id as string, payload: result.data }
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

async function login(email: string) {
  const jar: CookieJar = new Map()
  const csrf = await request(jar, "/auth/csrf")
  assert(csrf.response.ok, "CSRF bootstrap failed")
  const result = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: PASSWORD },
  })
  assert(result.response.ok, `Login failed for ${email}: ${result.response.status}`)
  return { jar, payload: result.data }
}

async function main() {
  const stamp = Date.now()

  console.log("1. Public signup still creates STUDENT only")
  const studentEmail = `role-student-${stamp}@example.com`
  const student = await signup(studentEmail, "Role Student")
  assert(student.payload.role === "student", "Public signup must produce the student role")
  assert(
    Array.isArray(student.payload.roles) && student.payload.roles.length === 1,
    "Public signup must grant exactly one role",
  )

  const forcedRoleSignup = await request(new Map(), "/auth/csrf")
  assert(forcedRoleSignup.response.ok, "CSRF bootstrap failed")
  const elevationJar: CookieJar = new Map()
  await request(elevationJar, "/auth/csrf")
  const selfElevate = await request(elevationJar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: {
      displayName: "Self Elevating",
      email: `role-self-elevate-${stamp}@example.com`,
      password: PASSWORD,
      role: "superadmin",
      roles: ["superadmin"],
    },
  })
  assert(selfElevate.response.status === 201, "Signup with an extra role field should still succeed")
  createdUserIds.push(selfElevate.data.user.id)
  assert(selfElevate.data.role === "student", "Signup must ignore a client-supplied role")

  console.log("2. Google signup remains STUDENT")
  const googleEmail = `role-google-${stamp}@example.com`
  const claims: GoogleIdTokenClaims = {
    sub: `role-google-sub-${stamp}`,
    email: googleEmail,
    email_verified: true,
    name: "Google Role User",
    iss: "https://accounts.google.com",
    aud: process.env.GOOGLE_CLIENT_ID ?? "test-client-id",
    exp: Math.floor(Date.now() / 1000) + 3600,
  }
  const googleUser = await resolveGoogleAccount(claims)
  createdUserIds.push(googleUser.id)
  const googleRoles = await prisma.userRole.findMany({
    where: { userId: googleUser.id },
    include: { role: true },
  })
  assert(googleRoles.length === 1, "Google signup must grant exactly one role")
  assert(googleRoles[0].role.name === RoleName.STUDENT, "Google signup must grant STUDENT")

  console.log("3. Unauthenticated access rejected")
  const anonymous = await request(new Map(), "/admin/users")
  assert(anonymous.response.status === 401, `Unauthenticated list should be 401, got ${anonymous.response.status}`)

  console.log("4. Non-superadmin roles rejected")
  const targetEmail = `role-target-${stamp}@example.com`
  const target = await signup(targetEmail, "Role Target")

  for (const roleName of [RoleName.STUDENT, RoleName.FACULTY, RoleName.ORGANISATION_ADMIN, RoleName.RECRUITER]) {
    const email = `role-actor-${roleName.toLowerCase()}-${stamp}@example.com`
    const actor = await signup(email, `Actor ${roleName}`)
    await setRoleDirectly(actor.userId, roleName)
    const session = await login(email)

    const list = await request(session.jar, "/admin/users")
    assert(list.response.status === 403, `${roleName} list should be 403, got ${list.response.status}`)

    const assign = await request(session.jar, `/admin/users/${target.userId}/role`, {
      method: "PATCH",
      csrf: true,
      body: { role: "superadmin" },
    })
    assert(assign.response.status === 403, `${roleName} assign should be 403, got ${assign.response.status}`)

    const stillStudent = await prisma.userRole.findMany({
      where: { userId: target.userId },
      include: { role: true },
    })
    assert(
      stillStudent.every((entry) => entry.role.name === RoleName.STUDENT),
      `${roleName} must not be able to elevate another user`,
    )
  }

  console.log("5. Superadmin allowed")
  const adminEmail = `role-admin-${stamp}@example.com`
  const admin = await signup(adminEmail, "Role Admin")
  await setRoleDirectly(admin.userId, RoleName.ADMIN)
  const adminSession = await login(adminEmail)
  assert(adminSession.payload.role === "superadmin", "Superadmin login should report superadmin")

  const list = await request(adminSession.jar, `/admin/users?query=${encodeURIComponent(targetEmail)}`)
  assert(list.response.ok, `Superadmin list failed: ${list.response.status}`)
  assert(list.data.data.length === 1, "Superadmin list should find the target user by email")
  assert(list.data.pagination.total === 1, "Pagination total should be present")
  assertNoSecrets(list.data)

  const detail = await request(adminSession.jar, `/admin/users/${target.userId}`)
  assert(detail.response.ok, "Superadmin user detail failed")
  assert(detail.data.data.role === "student", "Target should currently be a student")
  assertNoSecrets(detail.data)

  const roleCatalog = await request(adminSession.jar, "/admin/roles")
  assert(roleCatalog.response.ok, "Role catalog failed")
  assert(roleCatalog.data.data.length === 5, "Role catalog should list all five roles")

  console.log("6. CSRF still enforced on mutations")
  const noCsrf = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    body: { role: "faculty" },
  })
  assert(noCsrf.response.status === 403, `Missing CSRF should be 403, got ${noCsrf.response.status}`)

  console.log("7. Invalid role rejected")
  const invalid = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "root" },
  })
  assert(invalid.response.status === 400, `Invalid role should be 400, got ${invalid.response.status}`)

  console.log("8. Faculty provisioning persists and session reflects it")
  const faculty = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "faculty" },
  })
  assert(faculty.response.ok, `Faculty assignment failed: ${faculty.response.status}`)
  assert(faculty.data.data.role === "faculty", "Response should report the faculty role")

  const persisted = await prisma.userRole.findMany({
    where: { userId: target.userId },
    include: { role: true },
  })
  assert(persisted.length === 1 && persisted[0].role.name === RoleName.FACULTY, "Faculty role should persist")

  const targetSession = await login(targetEmail)
  assert(targetSession.payload.role === "faculty", "Login should reflect the new faculty role")
  const targetMe = await request(targetSession.jar, "/auth/me")
  assert(targetMe.data.role === "faculty", "/auth/me should reflect the new faculty role")
  const facultyDashboard = await request(targetSession.jar, "/faculty/dashboard")
  assert(facultyDashboard.response.ok, `Faculty role should reach the faculty dashboard: ${facultyDashboard.response.status}`)

  console.log("9. Recruiter provisioning")
  const recruiter = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "recruiter" },
  })
  assert(recruiter.response.ok, `Recruiter assignment failed: ${recruiter.response.status}`)
  assert(recruiter.data.data.role === "recruiter", "Response should report the recruiter role")

  console.log("10. Organisation role requires a real organisation")
  const missingOrg = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "organisation" },
  })
  assert(missingOrg.response.status === 422, `Organisation role without an organisation should be 422, got ${missingOrg.response.status}`)

  const unknownOrg = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "organisation", organisationId: "00000000-0000-0000-0000-000000000000" },
  })
  assert(unknownOrg.response.status === 404, `Unknown organisation should be 404, got ${unknownOrg.response.status}`)

  const organisation = await request(adminSession.jar, "/admin/organisations", {
    method: "POST",
    csrf: true,
    body: { name: `Role Test Institute ${stamp}`, slug: `role-test-institute-${stamp}` },
  })
  assert(organisation.response.status === 201, `Organisation creation failed: ${organisation.response.status}`)
  createdOrganisationIds.push(organisation.data.data.id)

  const orgAssign = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "organisation", organisationId: organisation.data.data.id },
  })
  assert(orgAssign.response.ok, `Organisation assignment failed: ${orgAssign.response.status}`)
  assert(orgAssign.data.data.role === "organisation", "Response should report the organisation role")
  assert(orgAssign.data.data.organisations.length === 1, "Organisation membership should be created")

  const orgSession = await login(targetEmail)
  const orgDashboard = await request(orgSession.jar, "/organisation/dashboard")
  assert(orgDashboard.response.ok, `Organisation role should reach the organisation dashboard: ${orgDashboard.response.status}`)

  console.log("11. Self-mutation blocked")
  const selfPatch = await request(adminSession.jar, `/admin/users/${admin.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "student" },
  })
  assert(selfPatch.response.status === 403, `Self role change should be 403, got ${selfPatch.response.status}`)

  const selfDelete = await request(adminSession.jar, `/admin/users/${admin.userId}/role`, {
    method: "DELETE",
    csrf: true,
  })
  assert(selfDelete.response.status === 403, `Self revoke should be 403, got ${selfDelete.response.status}`)

  const adminStillAdmin = await prisma.userRole.findMany({
    where: { userId: admin.userId },
    include: { role: true },
  })
  assert(
    adminStillAdmin.some((entry) => entry.role.name === RoleName.ADMIN),
    "Acting superadmin must keep the ADMIN role",
  )

  console.log("12. Cross-admin promotion and demotion")
  const secondAdminEmail = `role-admin2-${stamp}@example.com`
  const secondAdmin = await signup(secondAdminEmail, "Role Admin Two")
  const promoteSecond = await request(adminSession.jar, `/admin/users/${secondAdmin.userId}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "superadmin" },
  })
  assert(promoteSecond.response.ok, `Superadmin promotion failed: ${promoteSecond.response.status}`)
  assert(promoteSecond.data.data.role === "superadmin", "Second admin should be a superadmin")

  const secondAdminSession = await login(secondAdminEmail)
  const secondAdminList = await request(secondAdminSession.jar, "/admin/users?limit=1")
  assert(secondAdminList.response.ok, "A newly promoted superadmin should reach the admin API")

  // A superadmin can demote another superadmin, but never themselves (test 11),
  // so the acting account always survives a demotion. The last-superadmin 409
  // guard in the route is a redundant server-side safety net for non-HTTP
  // callers and cannot be triggered through the API surface.
  const demoteOtherAdmin = await request(secondAdminSession.jar, `/admin/users/${selfElevate.data.user.id}/role`, {
    method: "PATCH",
    csrf: true,
    body: { role: "student" },
  })
  assert(demoteOtherAdmin.response.ok, "A superadmin should be able to demote another account")
  const remainingAdmins = await prisma.user.count({
    where: { roles: { some: { role: { name: RoleName.ADMIN } } } },
  })
  assert(remainingAdmins > 0, "At least one superadmin must always remain")

  console.log("13. Revoke returns the user to STUDENT")
  const revoke = await request(adminSession.jar, `/admin/users/${target.userId}/role`, {
    method: "DELETE",
    csrf: true,
  })
  assert(revoke.response.ok, `Revoke failed: ${revoke.response.status}`)
  assert(revoke.data.data.role === "student", "Revoke should leave the user as a student")

  const revokedSession = await login(targetEmail)
  const revokedFaculty = await request(revokedSession.jar, "/faculty/dashboard")
  assert(revokedFaculty.response.status === 403, `Revoked user should lose faculty access, got ${revokedFaculty.response.status}`)

  console.log("All role provisioning checks passed.")
}

async function cleanup() {
  if (createdUserIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } }).catch(() => undefined)
  }
  if (createdOrganisationIds.length) {
    await prisma.organisation
      .deleteMany({ where: { id: { in: createdOrganisationIds } } })
      .catch(() => undefined)
  }
  await prisma.$disconnect()
}

main()
  .then(cleanup)
  .catch(async (error) => {
    console.error(error)
    await cleanup()
    process.exit(1)
  })
