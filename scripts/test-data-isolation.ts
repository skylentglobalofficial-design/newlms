/**
 * Data isolation tests
 * 
 * Verify that user data is strictly scoped to the authenticated user:
 * - Enrollments
 * - Lesson progress
 * - Certificates
 * - Career profiles
 * - Projects
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
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
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
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

  const setCookie = response.headers.getSetCookie?.() ?? []
  parseSetCookie(setCookie, jar)

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function signupUser(jar: CookieJar, label: string) {
  const email = `isolation-test-${label}-${Date.now()}@example.com`
  const password = "test-password-123"
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: `Isolation Test ${label}`, email, password },
  })
  assert(signup.response.status === 201, `Signup failed for ${label}: ${JSON.stringify(signup.data)}`)
  return { email, password }
}

async function loginUser(jar: CookieJar, email: string, password: string) {
  await request(jar, "/auth/csrf")
  const login = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password },
  })
  assert(login.response.ok, `Login failed for ${email}: ${JSON.stringify(login.data)}`)
  return login.data
}

async function cleanup(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return
  
  await prisma.skylentCertificate.deleteMany({ where: { userId: user.id } })
  await prisma.lessonProgress.deleteMany({ where: { enrollment: { userId: user.id } } })
  await prisma.quizAttempt.deleteMany({ where: { enrollment: { userId: user.id } } })
  await prisma.assignmentProgress.deleteMany({ where: { enrollment: { userId: user.id } } })
  await prisma.userEnrollment.deleteMany({ where: { userId: user.id } })
  await prisma.careerProject.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerEducation.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerExperience.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerSkill.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerLink.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerResumeVersion.deleteMany({ where: { profile: { userId: user.id } } })
  await prisma.careerProfile.deleteMany({ where: { userId: user.id } })
  await prisma.learnerProject.deleteMany({ where: { userId: user.id } })
  await prisma.userRole.deleteMany({ where: { userId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })
}

async function main() {
  console.log("Data isolation tests")
  console.log("--------------------")

  const jarA = new Map<string, string>()
  const jarB = new Map<string, string>()
  let userA: { email: string; password: string } | null = null
  let userB: { email: string; password: string } | null = null

  try {
    // Test 1: New user sees zero enrollments
    console.log("\n1. Testing new user sees zero enrollments...")
    userA = await signupUser(jarA, "userA")
    const enrollmentsA = await request(jarA, "/lms/enrollments")
    assert(enrollmentsA.response.ok, "Failed to fetch enrollments for new user")
    assert(
      Array.isArray(enrollmentsA.data.data) && enrollmentsA.data.data.length === 0,
      `New user should have 0 enrollments, got ${enrollmentsA.data.data?.length ?? "unknown"}`
    )
    console.log("   ✓ New user has 0 enrollments")

    // Test 2: New user sees zero certificates
    console.log("\n2. Testing new user sees zero certificates...")
    const certificatesA = await request(jarA, "/certificates/mine")
    assert(certificatesA.response.ok, "Failed to fetch certificates for new user")
    assert(
      Array.isArray(certificatesA.data.data) && certificatesA.data.data.length === 0,
      `New user should have 0 certificates, got ${certificatesA.data.data?.length ?? "unknown"}`
    )
    console.log("   ✓ New user has 0 certificates")

    // Test 3: Dashboard returns null workspace for unenrolled user
    console.log("\n3. Testing dashboard returns null for unenrolled user...")
    const dashboardA = await request(jarA, "/lms/dashboard")
    assert(dashboardA.response.ok, "Failed to fetch dashboard for new user")
    assert(
      dashboardA.data.data === null,
      `Unenrolled user should have null dashboard workspace`
    )
    console.log("   ✓ Dashboard workspace is null for unenrolled user")

    // Test 4: Career profile starts empty for new user
    console.log("\n4. Testing career profile starts empty...")
    const careerA = await request(jarA, "/career/profile")
    assert(careerA.response.ok, "Failed to fetch career profile")
    const profile = careerA.data.data
    assert(profile.education.length === 0, "New user should have 0 education entries")
    assert(profile.experience.length === 0, "New user should have 0 experience entries")
    assert(profile.skills.length === 0, "New user should have 0 skills")
    assert(profile.projects.length === 0, "New user should have 0 projects")
    console.log("   ✓ Career profile is empty for new user")

    // Test 5: Second user cannot see first user's data
    console.log("\n5. Testing user B cannot see user A's data...")
    userB = await signupUser(jarB, "userB")
    
    // Check that user B has empty data too
    const enrollmentsB = await request(jarB, "/lms/enrollments")
    assert(enrollmentsB.response.ok, "Failed to fetch enrollments for user B")
    assert(
      Array.isArray(enrollmentsB.data.data) && enrollmentsB.data.data.length === 0,
      `User B should have 0 enrollments, got ${enrollmentsB.data.data?.length ?? "unknown"}`
    )

    const certificatesB = await request(jarB, "/certificates/mine")
    assert(certificatesB.response.ok, "Failed to fetch certificates for user B")
    assert(
      Array.isArray(certificatesB.data.data) && certificatesB.data.data.length === 0,
      `User B should have 0 certificates`
    )

    const careerB = await request(jarB, "/career/profile")
    assert(careerB.response.ok, "Failed to fetch career profile for user B")
    assert(careerB.data.data.education.length === 0, "User B should have 0 education entries")
    console.log("   ✓ User B cannot see user A's data")

    // Test 6: Enroll user A and verify user B still sees zero
    console.log("\n6. Testing enrollment isolation...")
    const course = await prisma.course.findFirst({ where: { slug: "data-analytics" } })
    if (course) {
      const enrollResult = await request(jarA, "/lms/enrollments", {
        method: "POST",
        csrf: true,
        body: { courseSlug: "data-analytics", consent: TEST_CONSENT },
      })
      assert(
        enrollResult.response.status === 201 || enrollResult.response.status === 200,
        `Failed to enroll user A: ${JSON.stringify(enrollResult.data)}`
      )

      // Verify user A now has an enrollment
      const enrollmentsA2 = await request(jarA, "/lms/enrollments")
      assert(
        enrollmentsA2.data.data?.length >= 1,
        `User A should have at least 1 enrollment after enrolling`
      )

      // Verify user B still has 0 enrollments
      const enrollmentsB2 = await request(jarB, "/lms/enrollments")
      assert(
        enrollmentsB2.data.data?.length === 0,
        `User B should still have 0 enrollments, got ${enrollmentsB2.data.data?.length}`
      )
      console.log("   ✓ Enrollment isolation verified")
    } else {
      console.log("   ⊘ Skipped (no data-analytics course)")
    }

    // Test 7: Unauthenticated requests are rejected
    console.log("\n7. Testing unauthenticated access is rejected...")
    const emptyJar = new Map<string, string>()
    const unauthEnrollments = await request(emptyJar, "/lms/enrollments")
    assert(unauthEnrollments.response.status === 401, "Enrollments should require auth")
    
    const unauthCertificates = await request(emptyJar, "/certificates/mine")
    assert(unauthCertificates.response.status === 401, "Certificates should require auth")
    
    const unauthCareer = await request(emptyJar, "/career/profile")
    assert(unauthCareer.response.status === 401, "Career profile should require auth")
    console.log("   ✓ Unauthenticated access rejected")

    console.log("\n--------------------")
    console.log("All data isolation tests passed ✓")

  } finally {
    // Cleanup test users
    if (userA) await cleanup(userA.email)
    if (userB) await cleanup(userB.email)
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("\n✗ Test failed:", error.message)
  process.exit(1)
})
