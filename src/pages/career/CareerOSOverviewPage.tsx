/**
 * Career OS home (signed-in /career-os).
 * Clean Skylent Career Services Hub — no competitor placement-gate banners or ugly red error walls.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import {
  fetchProfileCompleteness,
  listApplications,
  listCareerEvidenceProjects,
  listInterviewRounds,
  listSupportRequests,
  searchJobs,
  type CareerCompleteness,
  type CareerEvidenceSummary,
  type CareerSkillProficiency,
  type CareerSupportRequest,
  type InterviewRound,
  type JobApplication,
  type JobListResult,
} from "../../lib/career-api"
import {
  fetchLmsDashboard,
  fetchLmsEnrollments,
  type ApiCourseWorkspace,
  type ApiEnrollmentSummary,
} from "../../lib/lms-api"
import {
  learnerProjectPath,
  listLearnerProjects,
  projectStatusLabel,
  type ProjectSummary,
} from "../../lib/projects-api"
import {
  fetchMyCertificates,
  type SkylentCertificate,
} from "../../lib/skylent-api"
import { workspaceErrorMessage } from "../../lib/http"
import { ArrowRight } from "../../components/skylent/primitives"
import {
  applicationEmployerName,
  applicationRoleTitle,
  formatStatusLabel,
} from "../../components/career/application-utils"
import {
  formatInterviewDateTime,
  isUpcomingRound,
  sortRoundsBySchedule,
} from "../../components/career/interview-utils"
import {
  countOpenTasks,
  getNextOpenTask,
  isActiveRequest,
} from "../../components/career/support-utils"
import "./CareerOSHome.css"

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string }

function useLoad<T>(
  load: () => Promise<T>,
  key: string | null = "",
): [Load<T>, () => void] {
  const [state, setState] = useState<Load<T>>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    if (key === null) return
    let cancelled = false
    setState({ status: "loading" })
    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data })
      },
      (err: unknown) => {
        if (!cancelled)
          setState({ status: "error", message: workspaceErrorMessage(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return [state, retry]
}

type Activity = {
  applications: JobApplication[]
  rounds: InterviewRound[]
  support: CareerSupportRequest[]
}

async function loadActivity(): Promise<Activity> {
  const [applications, rounds, support] = await Promise.all([
    listApplications().catch(() => []),
    listInterviewRounds().catch(() => []),
    listSupportRequests().catch(() => []),
  ])
  return { applications, rounds, support }
}

const PROFICIENCY: Record<CareerSkillProficiency, {
  label: string
  level: number
}> = {
  BEGINNER: { label: "Beginner", level: 1 },
  INTERMEDIATE: { label: "Intermediate", level: 2 },
  ADVANCED: { label: "Advanced", level: 3 },
  EXPERT: { label: "Expert", level: 4 },
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}

function Skeleton({
  width = "100%",
  height = 12,
}: {
  width?: string | number
  height?: number
}) {
  return (
    <span
      className="sky-skeleton cosh-skeleton"
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

function Panel({
  id,
  title,
  meta,
  chip,
  tone = "white",
  children,
}: {
  id: string
  title: string
  meta?: ReactNode
  chip?: ReactNode
  tone?: "white" | "proof"
  children: ReactNode
}) {
  return (
    <section
      className={`cosh-panel${tone === "proof" ? " cosh-panel--proof" : ""}`}
      aria-labelledby={id}
    >
      <div className="cosh-panel__head">
        <div className="cosh-panel__title">
          <h2 id={id}>{title}</h2>
          {meta ? <span className="cosh-meta">{meta}</span> : null}
        </div>
        {chip}
      </div>
      {children}
    </section>
  )
}

type LedgerRow = {
  key: string
  type: "Project" | "Certificate"
  what: ReactNode
  source: ReactNode
  skill: ReactNode
  status: ReactNode
  reviewer: ReactNode
  actions: ReactNode
}

function SkillChips({ skills }: { skills: string[] }) {
  return (
    <span className="cosh-chips">
      {skills.map((skill) => (
        <span key={skill} className="cosh-skillchip">
          {skill}
        </span>
      ))}
    </span>
  )
}

type OverviewAction = {
  key: string
  title: string
  detail: string
  href?: string
  cta?: string
  busy?: boolean
}

export default function CareerOSOverviewPage() {
  const {
    profile,
    loading: profileLoading,
  } = useCareerProfile()
  const [completeness] = useLoad<CareerCompleteness>(fetchProfileCompleteness)
  const [dashboard] = useLoad<ApiCourseWorkspace | null>(fetchLmsDashboard)
  const [enrollments] = useLoad<ApiEnrollmentSummary[]>(fetchLmsEnrollments)
  const [learnerProjects] = useLoad<ProjectSummary[]>(() => listLearnerProjects())
  const [careerProjects] = useLoad<CareerEvidenceSummary[]>(() => listCareerEvidenceProjects())
  const [certificates] = useLoad<SkylentCertificate[]>(() => fetchMyCertificates())
  const [jobs] = useLoad<JobListResult>(() => searchJobs())
  const [activity] = useLoad<Activity>(loadActivity)

  const completenessData =
    completeness.status === "ready"
      ? completeness.data
      : profile?.completeness ?? null

  const workspace = dashboard.status === "ready" ? dashboard.data : null
  const leadProject =
    learnerProjects.status === "ready" ? learnerProjects.data[0] : undefined

  function courseTitle(slug: string): string {
    if (workspace?.course.slug === slug) return workspace.course.title
    if (enrollments.status === "ready") {
      for (const item of enrollments.data) {
        if (item.courseSlug === slug && item.courseTitle)
          return item.courseTitle
        const linked = item.linkedCourses?.find(
          (course) => course.slug === slug,
        )
        if (linked) return linked.title
      }
    }
    return slug
  }

  const lessons = workspace
    ? workspace.course.modules.flatMap((module) => module.lessons)
    : []
  const resumeLesson =
    workspace && workspace.resume.lessonId && !workspace.progress.allComplete
      ? workspace.resume
      : null
  const firstMissing = completenessData?.items.find((item) => !item.complete)
  const targetRole = profile?.preferredRole?.trim() || ""
  const skills = profile
    ? [...profile.skills].sort((a, b) => a.sortOrder - b.sortOrder)
    : []
  const jobTotal =
    jobs.status === "ready"
      ? (jobs.data.meta?.total ?? jobs.data.jobs.length)
      : 0

  const ledger: LedgerRow[] = []
  const linkedCareer =
    careerProjects.status === "ready" ? careerProjects.data : []
  const learnerList =
    learnerProjects.status === "ready" ? learnerProjects.data : []
  const privateNote =
    "Visible on your verified Skylent portfolio when you choose to share it."

  for (const project of learnerList) {
    const linked = linkedCareer.find(
      (item) => item.projectType === project.projectType,
    )
    ledger.push({
      key: `project-${project.id}`,
      type: "Project",
      what: project.title,
      source: `${courseTitle(project.courseSlug)} · Project Workspace`,
      skill:
        linked && linked.skills.length > 0 ? (
          <SkillChips skills={linked.skills} />
        ) : (
          "Added when project tasks are completed"
        ),
      status: (
        <>
          {projectStatusLabel(project.status)}
          <span className="cosh-ledger__sub">
            {project.progress.complete} of {project.progress.total} tasks
          </span>
        </>
      ),
      reviewer: linked
        ? `${privateNote} Includes ${plural(linked.evidenceCount, "evidence item")}.`
        : privateNote,
      actions: (
        <>
          <Link
            className="cosh-textlink"
            to={learnerProjectPath(project.courseSlug, project.projectType)}
          >
            Open project
          </Link>
          {linked ? (
            <Link className="cosh-textlink" to={linked.href}>
              View record
            </Link>
          ) : null}
        </>
      ),
    })
  }

  if (certificates.status === "ready") {
    for (const certificate of certificates.data) {
      ledger.push({
        key: `certificate-${certificate.id}`,
        type: "Certificate",
        what: <span className="cosh-code">{certificate.code}</span>,
        source: `${certificate.courseTitle} · Issued by Skylent`,
        skill: "Verified course completion",
        status: certificate.revoked
          ? "Revoked"
          : `Issued ${formatDate(certificate.issuedAt)}`,
        reviewer: "Publicly verifiable on /verify with project evidence.",
        actions: (
          <Link className="cosh-textlink" to={`/verify/${certificate.code}`}>
            Verify
          </Link>
        ),
      })
    }
  }

  const upcomingRounds =
    activity.status === "ready"
      ? sortRoundsBySchedule(activity.data.rounds.filter(isUpcomingRound))
      : []
  const activeSupport =
    activity.status === "ready"
      ? activity.data.support.filter(isActiveRequest)
      : []
  const nextSupportTask =
    activity.status === "ready" ? getNextOpenTask(activity.data.support) : null
  const latestApplication =
    activity.status === "ready" ? activity.data.applications[0] : undefined

  const actions: OverviewAction[] = []

  if (firstMissing) {
    actions.push({
      key: "profile",
      title: "Complete your career profile & resume",
      detail: `${firstMissing.label} is the next section to add to your profile.`,
      href: `/career-os/profile#profile-${firstMissing.section}`,
      cta: "Update profile",
    })
  } else {
    actions.push({
      key: "profile",
      title: "Manage your career profile & resume",
      detail: "Add your target role, skills, education, and resume versions.",
      href: "/career-os/profile",
      cta: "Open profile",
    })
  }

  if (dashboard.status === "loading") {
    actions.push({
      key: "learn",
      title: "Continue learning",
      detail: "Checking your enrolled courses…",
      busy: true,
    })
  } else if (resumeLesson && workspace) {
    const started = Boolean(
      workspace.lessonStates[resumeLesson.lessonId]?.started,
    )
    const lessonNumber =
      lessons.findIndex((lesson) => lesson.id === resumeLesson.lessonId) + 1
    const place =
      lessonNumber > 0
        ? `Lesson ${lessonNumber}: ${resumeLesson.lessonTitle}`
        : resumeLesson.lessonTitle
    actions.push({
      key: "learn",
      title: started ? "Continue active course" : "Start active course",
      detail: `${place} in ${workspace.course.title} (${workspace.progress.completedCount}/${workspace.progress.totalLessons} lessons complete).`,
      href: `/learn/${workspace.course.slug}/${resumeLesson.lessonId}`,
      cta: started ? "Continue" : "Start lesson",
    })
  } else {
    actions.push({
      key: "learn",
      title: "Explore career-aligned programmes",
      detail: "Build verified project artifacts in Data, AI, Product, and Full-Stack.",
      href: "/dashboard/student#explore-programmes",
      cta: "Explore programmes",
    })
  }

  if (leadProject) {
    actions.push({
      key: "project",
      title: "Continue capstone project",
      detail: `${leadProject.title} · ${leadProject.progress.complete} of ${leadProject.progress.total} tasks complete.`,
      href: learnerProjectPath(leadProject.courseSlug, leadProject.projectType),
      cta: "Open project",
    })
  } else {
    actions.push({
      key: "project",
      title: "Portfolio Projects",
      detail: "Link your graded course capstones and case studies to your career portfolio.",
      href: "/career-os/projects",
      cta: "View projects",
    })
  }

  if (jobTotal > 0 && jobs.status === "ready") {
    const firstJob = jobs.data.jobs[0]
    const cleanText = (v?: string | null) =>
      String(v || "")
        .replace(/Skylent Demo Employer/gi, "Skylent Hiring Network")
        .replace(/\s*\(demo\)\s*/gi, "")
        .trim()
    const where = firstJob
      ? [cleanText(firstJob.title), cleanText(firstJob.employer?.name)].filter(Boolean).join(" · ")
      : ""
    actions.push({
      key: "jobs",
      title: "Explore job opportunities",
      detail: where
        ? `${plural(jobTotal, "opening")} available · ${where}.`
        : `${plural(jobTotal, "opening")} available.`,
      href: "/career-os/jobs",
      cta: "View jobs",
    })
  } else {
    actions.push({
      key: "jobs",
      title: "Explore job opportunities & mock interviews",
      detail: "Browse openings matched to your skills and practice technical interviews.",
      href: "/career-os/jobs",
      cta: "Browse jobs",
    })
  }

  if (latestApplication) {
    const line = [
      applicationRoleTitle(latestApplication),
      applicationEmployerName(latestApplication),
      formatStatusLabel(latestApplication.status),
    ]
      .filter(Boolean)
      .join(" · ")
    actions.push({
      key: "applications",
      title: "Track job applications",
      detail: line,
      href: `/career-os/applications/${latestApplication.id}`,
      cta: "Review",
    })
  }

  if (upcomingRounds[0]) {
    const round = upcomingRounds[0]
    actions.push({
      key: "interviews",
      title: "Upcoming interview round",
      detail: [
        round.title,
        round.scheduledAt ? formatInterviewDateTime(round.scheduledAt) : null,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/career-os/interviews/${round.id}`,
      cta: "Open interview",
    })
  }

  if (activeSupport[0]) {
    const openTasks = countOpenTasks(activeSupport)
    actions.push({
      key: "support",
      title: "Career mentor support",
      detail: nextSupportTask
        ? `Next task: ${nextSupportTask.title}`
        : openTasks > 0
          ? plural(openTasks, "open task")
          : "Open in your tracker.",
      href: `/career-os/support/${activeSupport[0].id}`,
      cta: "Open request",
    })
  }

  const primaryKey = resumeLesson && workspace ? "learn" : "profile"

  return (
    <div className="cosh">
      <header className="cosh-intro">
        <p className="cosh-kicker">Skylent Career Services</p>
        {profileLoading ? (
          <div aria-busy="true">
            <h1 className="cosh-sr">Career OS</h1>
            <Skeleton width="min(420px, 72%)" height={36} />
          </div>
        ) : (
          <>
            <h1>{targetRole || "Career & Portfolio Hub"}</h1>
            <p className="cosh-intro__meta">
              Manage your career profile, verified projects, interview preparation, and role applications in one workspace.{" "}
              <Link to="/career-os/profile">Edit profile →</Link>
            </p>
          </>
        )}
      </header>

      <section aria-labelledby="cosh-actions-title">
        <h2 id="cosh-actions-title">Next steps</h2>
        <ol className="cosh-actions">
          {actions.map((action) => {
            const primary = action.key === primaryKey
            return (
              <li
                key={action.key}
                className={
                  primary ? "cosh-action cosh-action--primary" : "cosh-action"
                }
                aria-busy={action.busy || undefined}
              >
                <div className="cosh-action__copy">
                  {primary ? (
                    <p className="cosh-action__kicker">Recommended next step</p>
                  ) : null}
                  <h3>{action.title}</h3>
                  <p className="cosh-action__detail">{action.detail}</p>
                </div>
                {action.href && action.cta && !action.busy ? (
                  <Link
                    className={
                      primary
                        ? "sk-btn sk-btn-primary"
                        : "sk-btn sk-btn-secondary"
                    }
                    to={action.href}
                  >
                    {action.cta}
                    {primary ? <ArrowRight /> : null}
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      {skills.length > 0 ? (
        <div className="cosh-follow">
          <Panel
            id="cosh-skills-title"
            title="Skills on Your Profile"
            meta={`${skills.length} listed`}
          >
            <div className="cosh-tablewrap">
              <table className="cosh-table cosh-table--skills">
                <thead>
                  <tr>
                    <th scope="col">Skill</th>
                    <th scope="col">Category</th>
                    <th scope="col">Proficiency</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => {
                    const proficiency = skill.proficiency
                      ? PROFICIENCY[skill.proficiency]
                      : null
                    return (
                      <tr key={skill.id}>
                        <th scope="row">{skill.name}</th>
                        <td data-label="Category">
                          {skill.category || (
                            <span className="cosh-quiet">General</span>
                          )}
                        </td>
                        <td data-label="Proficiency">
                          {proficiency ? (
                            <span className="cosh-prof">
                              <span className="cosh-prof__label">
                                {proficiency.label}
                              </span>
                            </span>
                          ) : (
                            <span className="cosh-quiet">Added</span>
                          )}
                        </td>
                        <td data-label="Source" className="cosh-source">
                          Profile
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="cosh-panel__foot">
              <Link
                className="cosh-textlink cosh-textlink--arrow"
                to="/career-os/profile#profile-skills"
              >
                Add or edit skills
                <ArrowRight />
              </Link>
            </div>
          </Panel>
        </div>
      ) : null}

      {ledger.length > 0 ? (
        <div className="cosh-follow">
          <Panel
            id="cosh-evidence-title"
            title="Verified Projects & Certificates"
            tone="proof"
            meta={plural(ledger.length, "item")}
          >
            <div className="cosh-ledger" role="list">
              <div className="cosh-ledger__head" aria-hidden="true">
                <span>Item</span>
                <span>Source</span>
                <span>Skills</span>
                <span>Status</span>
              </div>
              {ledger.map((row) => (
                <article
                  key={row.key}
                  className="cosh-ledger__row"
                  role="listitem"
                >
                  <dl className="cosh-ledger__cells">
                    <div>
                      <dt>Item</dt>
                      <dd>
                        <span className="cosh-ledger__type">{row.type}</span>
                        <span className="cosh-ledger__what">{row.what}</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{row.source}</dd>
                    </div>
                    <div>
                      <dt>Skills</dt>
                      <dd>{row.skill}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd className="cosh-ledger__status">{row.status}</dd>
                    </div>
                    <div className="cosh-ledger__reviewer">
                      <dt>Visibility</dt>
                      <dd>
                        <span>{row.reviewer}</span>
                        <span className="cosh-ledger__actions">
                          {row.actions}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  )
}
