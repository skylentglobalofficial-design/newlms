import "dotenv/config"
import crypto from "node:crypto"
import {
  CareerEmploymentType,
  CareerWorkMode,
  InterviewQuestionDifficulty,
  JobStatus,
  PrismaClient,
} from "@prisma/client"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? `http://localhost:${process.env.PORT ?? 3000}/api/v1`

type CookieJar = Map<string, string>

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
  const headers: Record<string, string> = {}
  if (jar.size) headers.Cookie = cookieHeader(jar)
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

async function signupUser(jar: CookieJar, label: string) {
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: {
      displayName: `Career ${label}`,
      email: `career-test-${label}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}@example.com`,
      password: "test-password-123",
    },
  })
  assert(signup.response.status === 201, `Signup failed for ${label}: ${JSON.stringify(signup.data)}`)
}

async function createTestJobFixture() {
  const suffix = crypto.randomBytes(4).toString("hex")
  const employer = await prisma.employer.create({
    data: {
      name: `Test Employer ${suffix}`,
      slug: `test-employer-${suffix}`,
      description: "Integration test fixture",
      location: "Remote",
    },
  })
  const job = await prisma.job.create({
    data: {
      employerId: employer.id,
      title: `Test Analyst ${suffix}`,
      slug: `test-analyst-${suffix}`,
      description: "Integration test job listing",
      employmentType: CareerEmploymentType.FULL_TIME,
      workMode: CareerWorkMode.REMOTE,
      location: "Remote",
      skills: ["SQL", "Python"],
      category: "Data",
      status: JobStatus.OPEN,
      postedAt: new Date(),
    },
  })
  return { employer, job }
}

async function createTestQuestionFixture() {
  const suffix = crypto.randomBytes(4).toString("hex")
  return prisma.interviewQuestion.create({
    data: {
      category: "Behavioral",
      question: `Tell me about a challenge you solved (${suffix})`,
      difficulty: InterviewQuestionDifficulty.MEDIUM,
      roleTag: "analyst",
      active: true,
    },
  })
}

async function cleanupFixtures(ids: {
  employerId?: string
  jobId?: string
  questionId?: string
}) {
  if (ids.jobId) await prisma.job.deleteMany({ where: { id: ids.jobId } }).catch(() => {})
  if (ids.employerId) await prisma.employer.deleteMany({ where: { id: ids.employerId } }).catch(() => {})
  if (ids.questionId) await prisma.interviewQuestion.deleteMany({ where: { id: ids.questionId } }).catch(() => {})
}

async function main() {
  const jarA: CookieJar = new Map()
  const jarB: CookieJar = new Map()
  await signupUser(jarA, "owner")
  await signupUser(jarB, "other")

  const { employer, job } = await createTestJobFixture()
  const question = await createTestQuestionFixture()

  try {
    console.log("1. Authenticated user can create/update own profile")
    const initial = await request(jarA, "/career/profile")
    assert(initial.response.ok, "Profile fetch failed")
    assert(initial.data.data.userId, "Profile missing userId")

    const patched = await request(jarA, "/career/profile", {
      method: "PATCH",
      csrf: true,
      body: {
        headline: "Aspiring data analyst",
        summary: "Building proof through Skylent programs.",
        location: "Bengaluru",
        preferredRole: "Data Analyst",
        preferredWorkMode: "HYBRID",
      },
    })
    assert(patched.response.ok, "Profile patch failed")
    assert(patched.data.data.headline === "Aspiring data analyst", "Headline not saved")

    console.log("2. Unauthenticated user rejected")
    const anon = await fetch(`${API_BASE}/career/profile`)
    assert(anon.status === 401, "Anonymous profile access should be 401")

    console.log("3. User cannot access another user's profile resources")
    const edu = await request(jarA, "/career/profile/education", {
      method: "POST",
      csrf: true,
      body: { institution: "Example University", degree: "B.Sc. Statistics", startDate: "2020-07-01" },
    })
    assert(edu.response.status === 201, "Education create failed")
    const eduId = edu.data.data.id
    const crossDelete = await request(jarB, `/career/profile/education/${eduId}`, { method: "DELETE", csrf: true })
    assert(crossDelete.response.status === 404, "Cross-user delete should be forbidden")

    console.log("4. Education CRUD works")
    const eduPatch = await request(jarA, `/career/profile/education/${eduId}`, {
      method: "PATCH",
      csrf: true,
      body: { grade: "8.5 CGPA" },
    })
    assert(eduPatch.response.ok, "Education patch failed")
    const afterEdu = await request(jarA, "/career/profile")
    assert(afterEdu.data.data.education[0].grade === "8.5 CGPA", "Education grade not updated")

    console.log("5. Experience CRUD works")
    const exp = await request(jarA, "/career/profile/experience", {
      method: "POST",
      csrf: true,
      body: {
        company: "Acme Corp",
        role: "Intern",
        startDate: "2023-01-01",
        currentlyWorking: true,
      },
    })
    assert(exp.response.status === 201, "Experience create failed")
    const expId = exp.data.data.experience[0].id
    const expPatch = await request(jarA, `/career/profile/experience/${expId}`, {
      method: "PATCH",
      csrf: true,
      body: { role: "Data Intern" },
    })
    assert(expPatch.response.ok, "Experience patch failed")

    console.log("6. Skills CRUD works")
    for (const skill of ["SQL", "Python", "Power BI"]) {
      const skillRes = await request(jarA, "/career/profile/skills", { method: "POST", csrf: true, body: { name: skill } })
      assert(skillRes.response.status === 201, `Skill create failed for ${skill}`)
    }
    const skillId = (await request(jarA, "/career/profile")).data.data.skills[0].id
    const skillPatch = await request(jarA, `/career/profile/skills/${skillId}`, {
      method: "PATCH",
      csrf: true,
      body: { proficiency: "INTERMEDIATE" },
    })
    assert(skillPatch.response.ok, "Skill patch failed")

    console.log("7. Projects CRUD works")
    const project = await request(jarA, "/career/profile/projects", {
      method: "POST",
      csrf: true,
      body: { title: "Sales dashboard", description: "Built in coursework", technologies: ["Power BI"] },
    })
    assert(project.response.status === 201, "Project create failed")
    const projectId = project.data.data.projects[0].id
    const projectPatch = await request(jarA, `/career/profile/projects/${projectId}`, {
      method: "PATCH",
      csrf: true,
      body: { outcome: "Improved reporting speed" },
    })
    assert(projectPatch.response.ok, "Project patch failed")

    console.log("8. Links CRUD works")
    const link = await request(jarA, "/career/profile/links", {
      method: "POST",
      csrf: true,
      body: { type: "GITHUB", url: "https://github.com/example" },
    })
    assert(link.response.status === 201, "Link create failed")
    const linkId = link.data.data.links[0].id
    const linkPatch = await request(jarA, `/career/profile/links/${linkId}`, {
      method: "PATCH",
      csrf: true,
      body: { label: "GitHub" },
    })
    assert(linkPatch.response.ok, "Link patch failed")

    console.log("9. Profile completeness calculated from actual data")
    const completeness = await request(jarA, "/career/profile/completeness")
    assert(completeness.response.ok, "Completeness endpoint failed")
    assert(completeness.data.data.percent > 0, "Completeness should be > 0")
    assert(Array.isArray(completeness.data.data.completed), "Completeness completed missing")
    assert(Array.isArray(completeness.data.data.missing), "Completeness missing missing")
    assert(typeof completeness.data.data.nextRecommended === "string" || completeness.data.data.nextRecommended === null, "nextRecommended invalid")

    console.log("10. Jobs can be listed/filtered")
    const jobs = await request(jarA, `/career/jobs?category=Data&workMode=REMOTE`)
    assert(jobs.response.ok, "Jobs list failed")
    assert(jobs.data.data.some((j: { id: string }) => j.id === job.id), "Fixture job not in filtered list")
    const jobDetail = await request(jarA, `/career/jobs/${job.slug}`)
    assert(jobDetail.response.ok, "Job detail failed")
    assert(jobDetail.data.data.id === job.id, "Job detail mismatch")

    console.log("11. User can save/unsave a job")
    const saved = await request(jarA, "/career/saved-jobs", { method: "POST", csrf: true, body: { jobId: job.id } })
    assert(saved.response.status === 201, "Save job failed")
    const savedList = await request(jarA, "/career/saved-jobs")
    assert(savedList.data.data.length === 1, "Saved jobs list should have one entry")
    const unsaved = await request(jarA, `/career/saved-jobs/${job.id}`, { method: "DELETE", csrf: true })
    assert(unsaved.response.ok, "Unsave job failed")
    const savedAfter = await request(jarA, "/career/saved-jobs")
    assert(savedAfter.data.data.length === 0, "Saved jobs should be empty after delete")

    console.log("12. User can create an application")
    const application = await request(jarA, "/career/applications", {
      method: "POST",
      csrf: true,
      body: { jobId: job.id, roleTitle: job.title, source: "job-board" },
    })
    assert(application.response.status === 201, "Application create failed")
    const applicationId = application.data.data.id

    console.log("13. User can update application status")
    const statusPatch = await request(jarA, `/career/applications/${applicationId}`, {
      method: "PATCH",
      csrf: true,
      body: { status: "SCREENING" },
    })
    assert(statusPatch.response.ok, "Application status patch failed")
    assert(statusPatch.data.data.status === "SCREENING", "Status not updated")

    console.log("14. Application events are private")
    const event = await request(jarA, `/career/applications/${applicationId}/events`, {
      method: "POST",
      csrf: true,
      body: {
        type: "status_change",
        title: "Moved to screening",
        occurredAt: new Date().toISOString(),
      },
    })
    assert(event.response.status === 201, "Event create failed")
    const crossEvents = await request(jarB, `/career/applications/${applicationId}/events`)
    assert(crossEvents.response.status === 404, "Cross-user application events should be forbidden")

    console.log("15. Interview round CRUD works")
    const round = await request(jarA, "/career/interviews", {
      method: "POST",
      csrf: true,
      body: {
        applicationId,
        type: "TECHNICAL",
        title: "Round 1",
        scheduledAt: new Date().toISOString(),
      },
    })
    assert(round.response.status === 201, "Interview round create failed")
    const roundId = round.data.data.id
    const roundPatch = await request(jarA, `/career/interviews/${roundId}`, {
      method: "PATCH",
      csrf: true,
      body: { status: "SCHEDULED" },
    })
    assert(roundPatch.response.ok, "Interview round patch failed")

    console.log("16. Practice records are private")
    const practice = await request(jarA, "/career/practice", {
      method: "POST",
      csrf: true,
      body: {
        questionId: question.id,
        interviewRoundId: roundId,
        answer: "Structured STAR response",
        score: 80,
      },
    })
    assert(practice.response.status === 201, "Practice create failed")
    const practiceList = await request(jarA, "/career/practice")
    assert(practiceList.data.data.length >= 1, "Practice list empty for owner")
    const crossPractice = await request(jarB, "/career/practice")
    assert(
      crossPractice.data.data.every((p: { id: string }) => p.id !== practice.data.data.id),
      "Other user should not see owner practice",
    )

    console.log("17. Resume storage metadata is server-controlled")
    const resumeCreate = await request(jarA, "/career/profile/resumes", {
      method: "POST",
      csrf: true,
      body: { label: "Primary resume" },
    })
    assert(resumeCreate.response.status === 201, "Resume create failed")
    const resumeId = resumeCreate.data.data.id
    assert(resumeCreate.data.data.storageProvider === null, "Resume storageProvider should be null on create")
    assert(resumeCreate.data.data.storageKey === null, "Resume storageKey should be null on create")

    const resumeWithFakeStorage = await request(jarA, "/career/profile/resumes", {
      method: "POST",
      csrf: true,
      body: {
        label: "Probe resume",
        storageProvider: "FAKE_PROVIDER",
        storageKey: "arbitrary/fake/path.pdf",
      },
    })
    assert(resumeWithFakeStorage.response.status === 201, "Resume create with extra storage fields should still succeed")
    const probeResumeId = resumeWithFakeStorage.data.data.id
    assert(resumeWithFakeStorage.data.data.storageProvider === null, "Client cannot set storageProvider")
    assert(resumeWithFakeStorage.data.data.storageKey === null, "Client cannot set storageKey")

    const resumeList = await request(jarA, "/career/profile/resumes")
    const listedProbe = resumeList.data.data.find((r: { id: string }) => r.id === probeResumeId)
    assert(listedProbe?.storageProvider === null, "Listed resume must not persist client storageProvider")
    assert(listedProbe?.storageKey === null, "Listed resume must not persist client storageKey")

    const resumeDelete = await request(jarA, `/career/profile/resumes/${probeResumeId}`, { method: "DELETE", csrf: true })
    assert(resumeDelete.response.ok, "Resume delete failed")

    const crossResumeDelete = await request(jarB, `/career/profile/resumes/${resumeId}`, { method: "DELETE", csrf: true })
    assert(crossResumeDelete.response.status === 404, "Cross-user resume delete should be forbidden")
    await request(jarA, `/career/profile/resumes/${resumeId}`, { method: "DELETE", csrf: true })

    console.log("18. Support request creation works")
    const support = await request(jarA, "/career/support", {
      method: "POST",
      csrf: true,
      body: {
        type: "RESUME_REVIEW",
        subject: "Need resume feedback",
        description: "Please review my data analyst resume.",
      },
    })
    assert(support.response.status === 201, "Support request create failed")

    console.log("19. Another user cannot access private career resources")
    const crossApp = await request(jarB, `/career/applications/${applicationId}`)
    assert(crossApp.response.status === 404, "Cross-user application access should be forbidden")
    const crossSupport = await request(jarB, `/career/support/${support.data.data.id}`)
    assert(crossSupport.response.status === 404, "Cross-user support access should be forbidden")
    const crossInterview = await request(jarB, `/career/interviews/${roundId}`, { method: "DELETE", csrf: true })
    assert(crossInterview.response.status === 404, "Cross-user interview delete should be forbidden")

    console.log("Career OS backend API tests passed")
  } finally {
    await cleanupFixtures({ employerId: employer.id, jobId: job.id, questionId: question.id })
    await prisma.$disconnect()
  }
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
