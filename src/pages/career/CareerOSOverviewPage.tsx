/**
 * Career OS home (signed-in /career-os).
 * The next useful action comes first. Every row is read from this learner's account.
 * Missing data stays missing: this page does not invent progress, matches, or scores.
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
  type CareerProfile,
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

/* ── Loading model: one independent request per block, each with its own retry ── */

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string }

/** Runs `load` when `key` is a string (and again on retry). `key === null` means "not applicable yet". */
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
    listApplications(),
    listInterviewRounds(),
    listSupportRequests(),
  ])
  return { applications, rounds, support }
}

/* ── Small pieces ───────────────────────────────────────────────────────────── */

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

function BlockError({
  message,
  onRetry,
  what,
}: {
  message: string
  onRetry: () => void
  what: string
}) {
  const signedOut = message === "Sign in to continue."
  return (
    <div className="cosh-error" role="alert">
      <p>
        {what} could not be loaded.{" "}
        {signedOut
          ? "Your session has ended."
          : "Nothing is shown in its place."}
      </p>
      {signedOut ? (
        <Link className="cosh-textlink" to="/login">
          Sign in again
        </Link>
      ) : (
        <button type="button" className="cosh-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
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

/* ── Evidence ledger ────────────────────────────────────────────────────────── */

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

/* ── Page ───────────────────────────────────────────────────────────────────── */

type OverviewAction = {
  key: string
  title: string
  detail: string
  href?: string
  cta?: string
  busy?: boolean
  error?: { message: string; onRetry: () => void }
}

export default function CareerOSOverviewPage() {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    reload: reloadProfile,
  } = useCareerProfile()
  const [completeness, retryCompleteness] = useLoad<CareerCompleteness>(
    fetchProfileCompleteness,
  )
  const [dashboard, retryDashboard] = useLoad<ApiCourseWorkspace | null>(
    fetchLmsDashboard,
  )
  const [enrollments, retryEnrollments] =
    useLoad<ApiEnrollmentSummary[]>(fetchLmsEnrollments)
  const [learnerProjects, retryLearnerProjects] = useLoad<ProjectSummary[]>(
    () => listLearnerProjects(),
  )
  const [careerProjects, retryCareerProjects] =
    useLoad<CareerEvidenceSummary[]>(() => listCareerEvidenceProjects())
  const [certificates, retryCertificates] = useLoad<SkylentCertificate[]>(() =>
    fetchMyCertificates(),
  )
  const [jobs, retryJobs] = useLoad<JobListResult>(() => searchJobs())
  const [activity, retryActivity] = useLoad<Activity>(loadActivity)

  const profileLoad: Load<CareerProfile> = profileLoading
    ? { status: "loading" }
    : profile
      ? { status: "ready", data: profile }
      : {
          status: "error",
          message: profileError ?? "Unable to load this workspace. Try again.",
        }

  // The profile payload carries the same server-computed completeness; use it if the dedicated request fails.
  const completenessLoad: Load<CareerCompleteness> =
    completeness.status === "error" && profile
      ? { status: "ready", data: profile.completeness }
      : completeness

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
  const firstMissing =
    completenessLoad.status === "ready"
      ? completenessLoad.data.items.find((item) => !item.complete)
      : undefined
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
    "Nothing. This record is visible only to you; sharing it is in development."

  for (const project of learnerList) {
    const linked = linkedCareer.find(
      (item) => item.projectType === project.projectType,
    )
    ledger.push({
      key: `project-${project.id}`,
      type: "Project",
      what: project.title,
      source: `${courseTitle(project.courseSlug)} · your own work in the project workspace`,
      skill:
        linked && linked.skills.length > 0 ? (
          <SkillChips skills={linked.skills} />
        ) : (
          "Listed once the finished project is added to Career OS"
        ),
      status: (
        <>
          {projectStatusLabel(project.status)}
          <span className="cosh-ledger__sub">
            {project.progress.complete} of {project.progress.total} tasks ·{" "}
            {linked ? "added to Career OS" : "not added to Career OS"}
          </span>
        </>
      ),
      reviewer: linked
        ? `${privateNote} It holds ${plural(linked.evidenceCount, "evidence item")}.`
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
  for (const record of linkedCareer) {
    if (
      learnerList.some((project) => project.projectType === record.projectType)
    )
      continue
    ledger.push({
      key: `career-${record.id}`,
      type: "Project",
      what: record.title,
      source: `${record.context || "Learner project"} · added to Career OS by you`,
      skill:
        record.skills.length > 0 ? (
          <SkillChips skills={record.skills} />
        ) : (
          "None listed"
        ),
      status: record.eligible
        ? "Complete"
        : (record.incompleteMessage ?? "Incomplete"),
      reviewer: `${privateNote} It holds ${plural(record.evidenceCount, "evidence item")}.`,
      actions: (
        <Link className="cosh-textlink" to={record.href}>
          View record
        </Link>
      ),
    })
  }
  if (certificates.status === "ready") {
    for (const certificate of certificates.data) {
      ledger.push({
        key: `certificate-${certificate.id}`,
        type: "Certificate",
        what: <span className="cosh-code">{certificate.code}</span>,
        source: `${certificate.courseTitle} · issued by Skylent when every lesson was complete`,
        skill: "None. A certificate records course completion, not a skill.",
        status: certificate.revoked
          ? "Revoked"
          : `Issued ${formatDate(certificate.issuedAt)}`,
        reviewer: certificate.revoked
          ? "The public check reports that no valid certificate has this ID."
          : "The certificate ID, your name, the course and the issue date, on the public check page.",
        actions: (
          <Link className="cosh-textlink" to={`/verify/${certificate.code}`}>
            Verify
          </Link>
        ),
      })
    }
  }
  const evidenceSources = [learnerProjects, careerProjects, certificates]
  const evidenceLoading = evidenceSources.some(
    (source) => source.status === "loading",
  )
  const evidenceAllFailed = evidenceSources.every(
    (source) => source.status === "error",
  )
  function retryEvidence() {
    if (learnerProjects.status === "error") retryLearnerProjects()
    if (careerProjects.status === "error") retryCareerProjects()
    if (certificates.status === "error") retryCertificates()
    if (enrollments.status === "error") retryEnrollments()
  }
  const evidenceGaps = [
    learnerProjects.status === "error" ? "projects" : "",
    careerProjects.status === "error" ? "Career OS records" : "",
    certificates.status === "error" ? "certificates" : "",
    enrollments.status === "error" ? "course names" : "",
  ].filter(Boolean)
  const showEvidence =
    evidenceAllFailed || ledger.length > 0 || evidenceGaps.length > 0

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

  if (completenessLoad.status === "error") {
    actions.push({
      key: "profile",
      title: "Complete your profile",
      detail: "",
      error: { message: completenessLoad.message, onRetry: retryCompleteness },
    })
  } else if (firstMissing) {
    actions.push({
      key: "profile",
      title: "Complete your profile",
      detail: `${firstMissing.label} is the first section still open.`,
      href: `/career-os/profile#profile-${firstMissing.section}`,
      cta: "Complete profile",
    })
  }

  if (dashboard.status === "loading") {
    actions.push({
      key: "learn",
      title: "Continue learning",
      detail: "Checking your courses.",
      busy: true,
    })
  } else if (dashboard.status === "error") {
    actions.push({
      key: "learn",
      title: "Continue learning",
      detail: "",
      error: { message: dashboard.message, onRetry: retryDashboard },
    })
  } else if (resumeLesson && workspace) {
    const started = Boolean(
      workspace.lessonStates[resumeLesson.lessonId]?.started,
    )
    const lessonNumber =
      lessons.findIndex((lesson) => lesson.id === resumeLesson.lessonId) + 1
    const place =
      lessonNumber > 0
        ? `Lesson ${lessonNumber}, ${resumeLesson.lessonTitle}`
        : resumeLesson.lessonTitle
    actions.push({
      key: "learn",
      title: started ? "Continue learning" : "Start learning",
      detail: `${place} in ${workspace.course.title}. ${workspace.progress.completedCount} of ${workspace.progress.totalLessons} lessons complete.`,
      href: `/learn/${workspace.course.slug}/${resumeLesson.lessonId}`,
      cta: started ? "Continue" : "Start lesson",
    })
  } else if (workspace?.progress.allComplete) {
    actions.push({
      key: "learn",
      title: "Continue learning",
      detail: `Every lesson in ${workspace.course.title} is complete.`,
      href: "/dashboard/student#sh-my-learning",
      cta: "Open My Courses",
    })
  } else if (dashboard.status === "ready") {
    actions.push({
      key: "learn",
      title: "Continue learning",
      detail: "You are not enrolled in a course yet.",
      href: "/programmes",
      cta: "Explore programmes",
    })
  }

  if (learnerProjects.status === "loading") {
    actions.push({
      key: "project",
      title: "Open a project",
      detail: "Checking your projects.",
      busy: true,
    })
  } else if (learnerProjects.status === "error") {
    actions.push({
      key: "project",
      title: "Open a project",
      detail: "",
      error: {
        message: learnerProjects.message,
        onRetry: retryLearnerProjects,
      },
    })
  } else if (leadProject) {
    actions.push({
      key: "project",
      title: "Open a project",
      detail: `${leadProject.title}. ${leadProject.progress.complete} of ${leadProject.progress.total} tasks complete.`,
      href: learnerProjectPath(leadProject.courseSlug, leadProject.projectType),
      cta: "Open project",
    })
  } else {
    actions.push({
      key: "project",
      title: "Build a project",
      detail:
        "Nothing is kept yet. A project appears after you add work from a course.",
      href: "/career-os/projects",
      cta: "Open projects",
    })
  }

  if (jobs.status === "loading") {
    actions.push({
      key: "jobs",
      title: "Explore opportunities",
      detail: "Checking published openings.",
      busy: true,
    })
  } else if (jobs.status === "error") {
    actions.push({
      key: "jobs",
      title: "Explore opportunities",
      detail: "",
      error: { message: jobs.message, onRetry: retryJobs },
    })
  } else if (jobTotal === 0) {
    actions.push({
      key: "jobs",
      title: "Explore opportunities",
      detail: "No openings are published yet.",
      href: "/career-os/jobs",
      cta: "View opportunities",
    })
  } else {
    const firstJob = jobs.data.jobs[0]
    const where = firstJob
      ? [firstJob.title, firstJob.employer?.name].filter(Boolean).join(" · ")
      : ""
    actions.push({
      key: "jobs",
      title: "Explore opportunities",
      detail: where
        ? `${plural(jobTotal, "opening")} published. ${where}.`
        : `${plural(jobTotal, "opening")} published.`,
      href: "/career-os/jobs",
      cta: "View opportunities",
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
      title: "Review applications",
      detail:
        line ||
        plural(
          activity.status === "ready" ? activity.data.applications.length : 0,
          "application",
        ),
      href: `/career-os/applications/${latestApplication.id}`,
      cta: "Review",
    })
  }

  if (upcomingRounds[0]) {
    const round = upcomingRounds[0]
    actions.push({
      key: "interviews",
      title: "Upcoming interview",
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
      title: "Support",
      detail: nextSupportTask
        ? `Next task: ${nextSupportTask.title}`
        : openTasks > 0
          ? plural(openTasks, "open task")
          : "Open in your tracker.",
      href: `/career-os/support/${activeSupport[0].id}`,
      cta: "Open request",
    })
  }

  let primaryKey: string | null = null
  if (resumeLesson && workspace) primaryKey = "learn"
  else if (completenessLoad.status === "loading") primaryKey = null
  else if (firstMissing) primaryKey = "profile"
  else if (leadProject) primaryKey = "project"
  else if (dashboard.status === "ready" && !workspace) primaryKey = "learn"
  else if (latestApplication) primaryKey = "applications"
  else if (upcomingRounds[0]) primaryKey = "interviews"
  else if (jobs.status === "ready") primaryKey = "jobs"

  return (
    <div className="cosh">
      <header className="cosh-intro">
        <p className="cosh-kicker">Career OS</p>
        {profileLoad.status === "loading" ? (
          <div aria-busy="true">
            <h1 className="cosh-sr">Career OS</h1>
            <Skeleton width="min(420px, 72%)" height={36} />
          </div>
        ) : profileLoad.status === "error" ? (
          <>
            <h1>Career OS</h1>
            <BlockError
              what="Your career profile"
              message={profileLoad.message}
              onRetry={() => void reloadProfile()}
            />
          </>
        ) : (
          <>
            <h1>{targetRole || "Career OS"}</h1>
            {targetRole ? (
              <p className="cosh-intro__meta">
                Target role you entered.{" "}
                <Link to="/career-os/profile#profile-basics">Edit</Link>
              </p>
            ) : (
              <p className="cosh-intro__meta">
                Your profile, courses, projects and applications, in one place.
              </p>
            )}
          </>
        )}
      </header>

      <section aria-labelledby="cosh-actions-title">
        <h2 id="cosh-actions-title">What to do next</h2>
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
                    <p className="cosh-action__kicker">Next step</p>
                  ) : null}
                  <h3>{action.title}</h3>
                  {action.error ? (
                    <BlockError
                      what={action.title}
                      message={action.error.message}
                      onRetry={action.error.onRetry}
                    />
                  ) : (
                    <p className="cosh-action__detail">{action.detail}</p>
                  )}
                </div>
                {action.href && action.cta && !action.busy && !action.error ? (
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

      {activity.status === "error" ? (
        <div className="cosh-follow">
          <BlockError
            what="Applications, interviews and support"
            message={activity.message}
            onRetry={retryActivity}
          />
        </div>
      ) : null}

      {skills.length > 0 ? (
        <div className="cosh-follow">
          <Panel
            id="cosh-skills-title"
            title="Skills"
            meta={`${skills.length} entered · not assessed by Skylent`}
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
                            <span className="cosh-quiet">Not set</span>
                          )}
                        </td>
                        <td data-label="Proficiency">
                          {proficiency ? (
                            <span className="cosh-prof">
                              <span className="cosh-prof__label">
                                {proficiency.label}
                              </span>
                              <span
                                className="cosh-prof__bars"
                                role="img"
                                aria-label={`Level ${proficiency.level} of 4`}
                              >
                                {[1, 2, 3, 4].map((step) => (
                                  <span
                                    key={step}
                                    className={
                                      step <= proficiency.level
                                        ? "on"
                                        : undefined
                                    }
                                  />
                                ))}
                              </span>
                            </span>
                          ) : (
                            <span className="cosh-quiet">Not set</span>
                          )}
                        </td>
                        <td data-label="Source" className="cosh-source">
                          Self-entered
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
                Add a skill
                <ArrowRight />
              </Link>
            </div>
          </Panel>
        </div>
      ) : null}

      {showEvidence ? (
        <div className="cosh-follow">
          <Panel
            id="cosh-evidence-title"
            title="Evidence"
            tone="proof"
            meta={
              !evidenceLoading && !evidenceAllFailed && ledger.length > 0
                ? plural(ledger.length, "item")
                : undefined
            }
          >
            {evidenceAllFailed ? (
              <div className="cosh-panel__pad">
                <BlockError
                  what="Your evidence"
                  message={
                    learnerProjects.status === "error"
                      ? learnerProjects.message
                      : "Try again."
                  }
                  onRetry={retryEvidence}
                />
              </div>
            ) : (
              <>
                {ledger.length > 0 ? (
                  <div className="cosh-ledger" role="list">
                    <div className="cosh-ledger__head" aria-hidden="true">
                      <span>What</span>
                      <span>Source</span>
                      <span>Skill</span>
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
                            <dt>What</dt>
                            <dd>
                              <span className="cosh-ledger__type">
                                {row.type}
                              </span>
                              <span className="cosh-ledger__what">
                                {row.what}
                              </span>
                            </dd>
                          </div>
                          <div>
                            <dt>Source</dt>
                            <dd>{row.source}</dd>
                          </div>
                          <div>
                            <dt>Skill</dt>
                            <dd>{row.skill}</dd>
                          </div>
                          <div>
                            <dt>Status</dt>
                            <dd className="cosh-ledger__status">
                              {row.status}
                            </dd>
                          </div>
                          <div className="cosh-ledger__reviewer">
                            <dt>A reviewer sees</dt>
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
                ) : null}
                {evidenceGaps.length > 0 ? (
                  <div className="cosh-panel__pad">
                    <div className="cosh-error" role="alert">
                      <p>
                        Your {evidenceGaps.join(" and ")} could not be loaded,
                        so this list may be incomplete.
                      </p>
                      <button
                        type="button"
                        className="cosh-retry"
                        onClick={retryEvidence}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
            {ledger.length > 0 ? (
              <p className="cosh-proofnote">
                A certificate confirms that every lesson of a course was
                completed. Project evidence is your own work on a project.
                Neither is an employment outcome, and Career OS records none.
              </p>
            ) : null}
          </Panel>
        </div>
      ) : null}
    </div>
  )
}
