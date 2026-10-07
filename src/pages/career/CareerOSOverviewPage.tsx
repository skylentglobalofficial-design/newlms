/**
 * Career OS home (signed-in /career-os).
 * Answers one question: "Where am I career-wise, and what should I do next?"
 *
 * Everything on this screen is read from the learner's own account. Nothing is invented:
 * a step with no backend support shows a truth chip and one honest line instead of a value.
 * The eleven-step Career OS model lives only here; the public seven-stage journey is not shown.
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
import { fetchLmsDashboard, fetchLmsEnrollments, type ApiCourseWorkspace, type ApiEnrollmentSummary } from "../../lib/lms-api"
import {
  fetchLearnerProject,
  learnerProjectPath,
  listLearnerProjects,
  projectStatusLabel,
  type ProjectSummary,
  type ProjectWorkspace,
} from "../../lib/projects-api"
import { listNorthwindLabWork, northwindLabPath, type SavedLabWorkSummary } from "../../lib/labs-api"
import { fetchMyCertificates, type SkylentCertificate } from "../../lib/skylent-api"
import { truthOf } from "../../lib/truth"
import { workspaceErrorMessage } from "../../lib/http"
import { AI_NAME, AiMark, ArrowRight, TruthChip, type TruthState } from "../../components/skylent/primitives"
import { applicationEmployerName, applicationRoleTitle, formatStatusLabel } from "../../components/career/application-utils"
import { formatInterviewDateTime, isUpcomingRound, sortRoundsBySchedule } from "../../components/career/interview-utils"
import { countOpenTasks, getNextOpenTask, isActiveRequest } from "../../components/career/support-utils"
import "./CareerOSHome.css"

/* ── Loading model: one independent request per block, each with its own retry ── */

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string }

/** Runs `load` when `key` is a string (and again on retry). `key === null` means "not applicable yet". */
function useLoad<T>(load: () => Promise<T>, key: string | null = ""): [Load<T>, () => void] {
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
        if (!cancelled) setState({ status: "error", message: workspaceErrorMessage(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return [state, retry]
}

type Activity = { applications: JobApplication[]; rounds: InterviewRound[]; support: CareerSupportRequest[] }

async function loadActivity(): Promise<Activity> {
  const [applications, rounds, support] = await Promise.all([listApplications(), listInterviewRounds(), listSupportRequests()])
  return { applications, rounds, support }
}

/* ── Small pieces ───────────────────────────────────────────────────────────── */

const PROFICIENCY: Record<CareerSkillProficiency, { label: string; level: number }> = {
  BEGINNER: { label: "Beginner", level: 1 },
  INTERMEDIATE: { label: "Intermediate", level: 2 },
  ADVANCED: { label: "Advanced", level: 3 },
  EXPERT: { label: "Expert", level: 4 },
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" })

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}

function capitalise(value: string | null | undefined): string {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function Skeleton({ width = "100%", height = 12 }: { width?: string | number; height?: number }) {
  return <span className="sky-skeleton cosh-skeleton" style={{ width, height }} aria-hidden="true" />
}

function BlockError({ message, onRetry, what }: { message: string; onRetry: () => void; what: string }) {
  const signedOut = message === "Sign in to continue."
  return (
    <div className="cosh-error" role="alert">
      <p>
        {what} could not be loaded. {signedOut ? "Your session has ended." : "Nothing is shown in its place."}
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

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <span className="cosh-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span style={{ width: `${pct}%` }} />
    </span>
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
    <section className={`cosh-panel${tone === "proof" ? " cosh-panel--proof" : ""}`} aria-labelledby={id}>
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

/* ── Career path: the eleven-step Career OS model ───────────────────────────── */

type CellKind = "data" | "none" | "development" | "soon" | "loading" | "error"

type PathCell = {
  label: string
  kind: CellKind
  value?: string
  note: string
  to?: string
  bar?: { value: number; max: number; label: string }
}

const CHIP_FOR: Partial<Record<CellKind, TruthState>> = { development: "development", soon: "soon" }

function CareerPath({ cells, onRetry }: { cells: PathCell[]; onRetry: () => void }) {
  const settled = cells.every((cell) => cell.kind !== "loading")
  const failed = cells.some((cell) => cell.kind === "error")
  const count = (kind: CellKind) => cells.filter((cell) => cell.kind === kind).length

  return (
    <section className="cosh-panel cosh-path" aria-labelledby="cosh-path-title">
      <div className="cosh-panel__head">
        <div className="cosh-panel__title">
          <h2 id="cosh-path-title">Career path</h2>
        </div>
        <span className="cosh-meta">11 steps · target role to next gap</span>
      </div>
      <ol className="cosh-path__grid">
        {cells.map((cell, index) => {
          const number = String(index + 1).padStart(2, "0")
          const chip = CHIP_FOR[cell.kind]
          return (
            <li key={cell.label} className="cosh-cell">
              <div className="cosh-label">
                <span className={cell.kind === "data" ? "cosh-cell__n cosh-cell__n--on" : "cosh-cell__n"}>{number}</span>
                {cell.label}
              </div>
              <div className="cosh-cell__value">
                {cell.kind === "loading" ? (
                  <Skeleton width="70%" height={14} />
                ) : chip ? (
                  <TruthChip state={chip} />
                ) : cell.to ? (
                  <Link className={cell.kind === "data" ? "cosh-cell__link" : "cosh-cell__link cosh-cell__link--quiet"} to={cell.to}>
                    {cell.value}
                  </Link>
                ) : (
                  <span className={cell.kind === "data" ? undefined : "cosh-cell__quiet"}>{cell.value}</span>
                )}
              </div>
              <div className="cosh-cell__note">
                {cell.kind === "loading" ? (
                  <Skeleton width="55%" height={10} />
                ) : (
                  <>
                    {cell.bar ? <Meter {...cell.bar} /> : null}
                    <span>{cell.note}</span>
                  </>
                )}
              </div>
            </li>
          )
        })}
        <li className="cosh-cell cosh-cell--legend" aria-label="Status of the eleven steps today">
          <div className="cosh-label">Today</div>
          {settled ? (
            <dl className="cosh-legend">
              <div>
                <dt><span className="cosh-legend__mark cosh-legend__mark--data" aria-hidden="true" />{count("data")}</dt>
                <dd>with your data</dd>
              </div>
              {count("none") > 0 ? (
                <div>
                  <dt><span className="cosh-legend__mark cosh-legend__mark--none" aria-hidden="true" />{count("none")}</dt>
                  <dd>nothing yet</dd>
                </div>
              ) : null}
              <div>
                <dt><span className="cosh-legend__mark cosh-legend__mark--dev" aria-hidden="true" />{count("development")}</dt>
                <dd>in development</dd>
              </div>
              {count("soon") > 0 ? (
                <div>
                  <dt><span className="cosh-legend__mark cosh-legend__mark--soon" aria-hidden="true" />{count("soon")}</dt>
                  <dd>coming soon</dd>
                </div>
              ) : null}
              {failed ? (
                <div>
                  <dt><span className="cosh-legend__mark cosh-legend__mark--soon" aria-hidden="true" />{count("error")}</dt>
                  <dd>
                    not loaded ·{" "}
                    <button type="button" className="cosh-retry cosh-retry--inline" onClick={onRetry}>
                      Try again
                    </button>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <div className="cosh-stack" aria-hidden="true">
              <Skeleton width="80%" height={10} />
              <Skeleton width="70%" height={10} />
              <Skeleton width="60%" height={10} />
            </div>
          )}
        </li>
      </ol>
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

function TaskRail({ project }: { project: ProjectWorkspace }) {
  const nextIndex = project.tasks.findIndex((task) => task.status !== "complete")
  return (
    <div className="cosh-tasks">
      <div className="cosh-tasks__head">
        <span className="cosh-label">Tasks in {project.title}</span>
        <span className="cosh-meta">
          {project.progress.complete} of {project.progress.total} complete
        </span>
      </div>
      <ol className="cosh-rail">
        {project.tasks.map((task, index) => {
          const done = task.status === "complete"
          const travelled = done && project.tasks[index + 1]?.status === "complete"
          const state = done ? "Done" : index === nextIndex ? "Next" : "Open"
          return (
            <li key={task.key}>
              <div className="cosh-rail__track">
                <span className={done ? "sky-step__node sky-step__node--on" : "sky-step__node"}>{task.number}</span>
                {index < project.tasks.length - 1 ? (
                  <span className={travelled ? "cosh-rail__line cosh-rail__line--on" : "cosh-rail__line"} aria-hidden="true" />
                ) : null}
              </div>
              <div className={state === "Next" ? "cosh-label cosh-label--ink" : "cosh-label"}>{state}</div>
              <div className={done ? "cosh-rail__title cosh-rail__title--done" : "cosh-rail__title"}>{task.title}</div>
            </li>
          )
        })}
      </ol>
      {project.disclaimer ? <p className="cosh-tasks__note">{project.disclaimer}</p> : null}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

/** What Skylent AI is designed to do with career context. None of it is built: see truthOf("careerAi"). */
const CAREER_AI_DESIGNED = ["Explain my skill gaps", "Explain my readiness", "Recommend what to learn next", "Compare paths", "Explain an opportunity"]

export default function CareerOSOverviewPage() {
  const { profile, loading: profileLoading, error: profileError, reload: reloadProfile } = useCareerProfile()
  const [completeness, retryCompleteness] = useLoad<CareerCompleteness>(fetchProfileCompleteness)
  const [dashboard, retryDashboard] = useLoad<ApiCourseWorkspace | null>(fetchLmsDashboard)
  const [enrollments, retryEnrollments] = useLoad<ApiEnrollmentSummary[]>(fetchLmsEnrollments)
  const [learnerProjects, retryLearnerProjects] = useLoad<ProjectSummary[]>(() => listLearnerProjects())
  const [careerProjects, retryCareerProjects] = useLoad<CareerEvidenceSummary[]>(() => listCareerEvidenceProjects())
  const [certificates, retryCertificates] = useLoad<SkylentCertificate[]>(() => fetchMyCertificates())
  const [jobs, retryJobs] = useLoad<JobListResult>(() => searchJobs())
  const [activity, retryActivity] = useLoad<Activity>(loadActivity)

  const profileLoad: Load<CareerProfile> = profileLoading
    ? { status: "loading" }
    : profile
      ? { status: "ready", data: profile }
      : { status: "error", message: profileError ?? "Unable to load this workspace. Try again." }

  // The profile payload carries the same server-computed completeness; use it if the dedicated request fails.
  const completenessLoad: Load<CareerCompleteness> =
    completeness.status === "error" && profile ? { status: "ready", data: profile.completeness } : completeness

  const workspace = dashboard.status === "ready" ? dashboard.data : null
  const enrolledSlugs =
    enrollments.status === "ready"
      ? enrollments.data.flatMap((item) => [item.courseSlug, ...(item.linkedCourses ?? []).map((course) => course.slug)])
      : []
  const hasNorthwindLab = workspace?.course.slug === "data-analytics" || enrolledSlugs.includes("data-analytics")
  const [labWork, retryLabWork] = useLoad<SavedLabWorkSummary[]>(() => listNorthwindLabWork(), hasNorthwindLab ? "northwind" : null)

  const leadProject = learnerProjects.status === "ready" ? learnerProjects.data[0] : undefined
  const [leadProjectDetail] = useLoad<ProjectWorkspace>(() => fetchLearnerProject(leadProject!.id), leadProject ? leadProject.id : null)

  function courseTitle(slug: string): string {
    if (workspace?.course.slug === slug) return workspace.course.title
    if (enrollments.status === "ready") {
      for (const item of enrollments.data) {
        if (item.courseSlug === slug && item.courseTitle) return item.courseTitle
        const linked = item.linkedCourses?.find((course) => course.slug === slug)
        if (linked) return linked.title
      }
    }
    return slug
  }

  /* ── Next step: resume lesson → first missing profile section → browse programmes ── */
  const lessons = workspace ? workspace.course.modules.flatMap((module) => module.lessons) : []
  const resumeLesson = workspace && workspace.resume.lessonId && !workspace.progress.allComplete ? workspace.resume : null
  const firstMissing = completenessLoad.status === "ready" ? completenessLoad.data.items.find((item) => !item.complete) : undefined

  let nextStep: ReactNode
  if (dashboard.status === "loading" || (!resumeLesson && dashboard.status === "ready" && completenessLoad.status === "loading")) {
    nextStep = (
      <div className="cosh-next__body" aria-busy="true">
        <div className="cosh-next__eyebrow">
          <span className="cosh-next__tag">Next step</span>
        </div>
        <div className="cosh-stack" aria-hidden="true">
          <Skeleton width="78%" height={18} />
          <Skeleton width="52%" height={12} />
        </div>
        <span className="cosh-sr">Working out your next step</span>
      </div>
    )
  } else if (dashboard.status === "error") {
    nextStep = (
      <div className="cosh-next__body">
        <div className="cosh-next__eyebrow">
          <span className="cosh-next__tag">Next step</span>
        </div>
        <BlockError
          what="Your next step"
          message={dashboard.message}
          onRetry={() => {
            retryDashboard()
            retryCompleteness()
          }}
        />
      </div>
    )
  } else if (resumeLesson && workspace) {
    const lesson = lessons.find((item) => item.id === resumeLesson.lessonId)
    const lessonNumber = lessons.findIndex((item) => item.id === resumeLesson.lessonId) + 1
    const started = Boolean(workspace.lessonStates[resumeLesson.lessonId]?.started)
    const meta = [workspace.course.title, `M${resumeLesson.moduleIndex}`, capitalise(lesson?.type), lesson?.duration].filter(Boolean).join(" · ")
    nextStep = (
      <>
        <div className="cosh-next__body">
          <div className="cosh-next__eyebrow">
            <span className="cosh-next__tag">Next step</span>
            <span>{meta}</span>
          </div>
          <h2>
            {started ? "Continue" : "Start"} {lessonNumber > 0 ? `lesson ${lessonNumber}` : "your lesson"} · {resumeLesson.lessonTitle}
          </h2>
          <p>
            The next lesson in {workspace.course.title}. {workspace.progress.completedCount} of {workspace.progress.totalLessons} lessons
            complete.
          </p>
        </div>
        <div className="cosh-next__action">
          <Link className="sk-btn sk-btn-primary" to={`/learn/${workspace.course.slug}/${resumeLesson.lessonId}`}>
            {started ? "Continue learning" : "Start learning"}
            <ArrowRight />
          </Link>
          <div className="cosh-next__hint">Opens in My learning</div>
        </div>
      </>
    )
  } else if (firstMissing) {
    nextStep = (
      <>
        <div className="cosh-next__body">
          <div className="cosh-next__eyebrow">
            <span className="cosh-next__tag">Next step</span>
            <span>Career profile</span>
          </div>
          <h2>Fill in your profile · {firstMissing.label}</h2>
          <p>
            {workspace?.progress.allComplete
              ? `Every lesson in ${workspace.course.title} is complete. `
              : workspace
                ? ""
                : "You are not enrolled in a programme yet. "}
            This is the first profile section still missing.
          </p>
        </div>
        <div className="cosh-next__action">
          <Link className="sk-btn sk-btn-primary" to={`/career-os/profile#profile-${firstMissing.section}`}>
            Open profile
            <ArrowRight />
          </Link>
          <div className="cosh-next__hint">Opens your career profile</div>
        </div>
      </>
    )
  } else {
    nextStep = (
      <>
        <div className="cosh-next__body">
          <div className="cosh-next__eyebrow">
            <span className="cosh-next__tag">Next step</span>
            <span>Programmes</span>
          </div>
          <h2>Browse programmes</h2>
          <p>
            {workspace?.progress.allComplete
              ? `Every lesson in ${workspace.course.title} is complete.`
              : "You have no lesson in progress."}{" "}
            {completenessLoad.status === "ready" ? "Your profile sections are filled in." : ""}
          </p>
        </div>
        <div className="cosh-next__action">
          <Link className="sk-btn sk-btn-primary" to="/programmes">
            Browse programmes
            <ArrowRight />
          </Link>
          <div className="cosh-next__hint">Opens the catalogue</div>
        </div>
      </>
    )
  }

  /* ── Career path cells ── */
  const targetRole = profile?.preferredRole?.trim() || ""
  const skills = profile ? [...profile.skills].sort((a, b) => a.sortOrder - b.sortOrder) : []
  const jobTotal = jobs.status === "ready" ? jobs.data.meta?.total ?? jobs.data.jobs.length : 0
  const careerProjectCount = careerProjects.status === "ready" ? careerProjects.data.length : 0
  const certificateCount = certificates.status === "ready" ? certificates.data.filter((item) => !item.revoked).length : 0

  const loading = (label: string): PathCell => ({ label, kind: "loading", note: "" })
  const failed = (label: string): PathCell => ({ label, kind: "error", value: "Not loaded", note: "Could not be read" })

  const cells: PathCell[] = [
    profileLoad.status === "loading"
      ? loading("Target role")
      : profileLoad.status === "error"
        ? failed("Target role")
        : targetRole
          ? { label: "Target role", kind: "data", value: targetRole, note: "Entered by you" }
          : { label: "Target role", kind: "none", value: "Not set", note: "Free text in your profile", to: "/career-os/profile#profile-basics" },
    // No role catalogue or required-skill data exists in the backend.
    { label: "Required skills", kind: "development", note: "Not defined per role yet" },
    profileLoad.status === "loading"
      ? loading("Your skills")
      : profileLoad.status === "error"
        ? failed("Your skills")
        : skills.length > 0
          ? { label: "Your skills", kind: "data", value: `${skills.length} entered`, note: "Self-entered" }
          : { label: "Your skills", kind: "none", value: "None entered", note: "Add them in your profile", to: "/career-os/profile#profile-skills" },
    { label: "Gaps", kind: "development", note: "Needs required skills first" },
    dashboard.status === "loading"
      ? loading("Learning")
      : dashboard.status === "error"
        ? failed("Learning")
        : workspace
          ? {
              label: "Learning",
              kind: "data",
              value: `${workspace.progress.completedCount} of ${workspace.progress.totalLessons} lessons`,
              note: workspace.course.title,
              bar: { value: workspace.progress.completedCount, max: workspace.progress.totalLessons, label: "Lessons complete" },
              to: `/learn/${workspace.course.slug}`,
            }
          : { label: "Learning", kind: "none", value: "Not enrolled", note: "Starts with a programme", to: "/programmes" },
    dashboard.status === "loading" || enrollments.status === "loading" || (hasNorthwindLab && labWork.status === "loading")
      ? loading("Practice")
      : hasNorthwindLab
        ? labWork.status === "error"
          ? failed("Practice")
          : labWork.status === "ready" && labWork.data.length > 0
            ? { label: "Practice", kind: "data", value: `${labWork.data.length} saved`, note: "Northwind Lab", to: northwindLabPath() }
            : { label: "Practice", kind: "none", value: "Nothing saved", note: "Northwind Lab", to: northwindLabPath() }
        : dashboard.status === "error" && enrollments.status === "error"
          ? failed("Practice")
          : { label: "Practice", kind: "none", value: "No lab yet", note: workspace ? "This course has no lab" : "Starts with a programme" },
    learnerProjects.status === "loading"
      ? loading("Project")
      : learnerProjects.status === "error"
        ? failed("Project")
        : leadProject
          ? {
              label: "Project",
              kind: "data",
              value: `${leadProject.progress.complete} of ${leadProject.progress.total} tasks`,
              note: leadProject.title,
              bar: { value: leadProject.progress.complete, max: leadProject.progress.total, label: "Project tasks complete" },
              to: learnerProjectPath(leadProject.courseSlug, leadProject.projectType),
            }
          : { label: "Project", kind: "none", value: "Not started", note: "Opens inside a course" },
    careerProjects.status === "loading" || certificates.status === "loading"
      ? loading("Evidence")
      : {
          label: "Evidence",
          kind: truthOf("projectsAndEvidence") === "live" ? (careerProjectCount + certificateCount > 0 ? "data" : "none") : "development",
          value: careerProjectCount + certificateCount > 0 ? `${careerProjectCount + certificateCount} on record` : "Nothing yet",
          note:
            careerProjects.status === "error" && certificates.status === "error"
              ? "Could not be read"
              : careerProjectCount + certificateCount > 0
                ? [careerProjectCount > 0 ? plural(careerProjectCount, "project") : "", certificateCount > 0 ? plural(certificateCount, "certificate") : ""]
                    .filter(Boolean)
                    .join(" · ")
                : "Records not released",
        },
    { label: "Readiness", kind: "development", note: "No score is calculated" },
    jobs.status === "loading"
      ? loading("Opportunity")
      : jobs.status === "ready" && jobTotal > 0
        ? { label: "Opportunity", kind: "data", value: plural(jobTotal, "opening"), note: "Published roles", to: "/career-os/jobs" }
        : { label: "Opportunity", kind: "soon", note: jobs.status === "error" ? "Openings could not be read" : "No openings published" },
    { label: "Next gap", kind: "development", note: "Follows from gaps" },
  ]

  function retryPath() {
    if (profileLoad.status === "error") void reloadProfile()
    if (dashboard.status === "error") retryDashboard()
    if (enrollments.status === "error") retryEnrollments()
    if (learnerProjects.status === "error") retryLearnerProjects()
    if (labWork.status === "error") retryLabWork()
  }

  /* ── Evidence rows: a certificate is not project evidence, and neither is an employment outcome ── */
  const ledger: LedgerRow[] = []
  const linkedCareer = careerProjects.status === "ready" ? careerProjects.data : []
  const learnerList = learnerProjects.status === "ready" ? learnerProjects.data : []
  const privateNote = "Nothing. This record is visible only to you; sharing it is in development."

  for (const project of learnerList) {
    const linked = linkedCareer.find((item) => item.projectType === project.projectType)
    ledger.push({
      key: `project-${project.id}`,
      type: "Project",
      what: project.title,
      source: `${courseTitle(project.courseSlug)} · your own work in the project workspace`,
      skill: linked && linked.skills.length > 0 ? <SkillChips skills={linked.skills} /> : "Listed once the finished project is added to Career OS",
      status: (
        <>
          {projectStatusLabel(project.status)}
          <span className="cosh-ledger__sub">
            {project.progress.complete} of {project.progress.total} tasks · {linked ? "added to Career OS" : "not added to Career OS"}
          </span>
        </>
      ),
      reviewer: linked ? `${privateNote} It holds ${plural(linked.evidenceCount, "evidence item")}.` : privateNote,
      actions: (
        <>
          <Link className="cosh-textlink" to={learnerProjectPath(project.courseSlug, project.projectType)}>
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
    if (learnerList.some((project) => project.projectType === record.projectType)) continue
    ledger.push({
      key: `career-${record.id}`,
      type: "Project",
      what: record.title,
      source: `${record.context || "Learner project"} · added to Career OS by you`,
      skill: record.skills.length > 0 ? <SkillChips skills={record.skills} /> : "None listed",
      status: record.eligible ? "Complete" : record.incompleteMessage ?? "Incomplete",
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
        status: certificate.revoked ? "Revoked" : `Issued ${formatDate(certificate.issuedAt)}`,
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
  const evidenceLoading = evidenceSources.some((source) => source.status === "loading")
  const evidenceAllFailed = evidenceSources.every((source) => source.status === "error")
  function retryEvidence() {
    if (learnerProjects.status === "error") retryLearnerProjects()
    if (careerProjects.status === "error") retryCareerProjects()
    if (certificates.status === "error") retryCertificates()
  }
  const evidenceGaps = [
    learnerProjects.status === "error" ? "projects" : "",
    careerProjects.status === "error" ? "Career OS records" : "",
    certificates.status === "error" ? "certificates" : "",
  ].filter(Boolean)

  /* ── Brand-new learner: no enrolment and an empty profile ── */
  const brandNew =
    profileLoad.status === "ready" &&
    enrollments.status === "ready" &&
    dashboard.status === "ready" &&
    !workspace &&
    enrollments.data.length === 0 &&
    !targetRole &&
    skills.length === 0

  const upcomingRounds = activity.status === "ready" ? sortRoundsBySchedule(activity.data.rounds.filter(isUpcomingRound)) : []
  const activeSupport = activity.status === "ready" ? activity.data.support.filter(isActiveRequest) : []
  const nextSupportTask = activity.status === "ready" ? getNextOpenTask(activity.data.support) : null
  const latestApplication = activity.status === "ready" ? activity.data.applications[0] : undefined

  return (
    <div className="cosh">
      {/* Target role and the one next step: first on every width */}
      <div className="cosh-top">
        <header className="cosh-role">
          <div className="cosh-label">Target role</div>
          {profileLoad.status === "loading" ? (
            <div className="cosh-stack" aria-busy="true">
              <h1 className="cosh-sr">Career OS</h1>
              <Skeleton width="60%" height={30} />
              <Skeleton width="40%" height={11} />
            </div>
          ) : profileLoad.status === "error" ? (
            <>
              <h1 className="cosh-role__title cosh-role__title--empty">Career OS</h1>
              <BlockError what="Your career profile" message={profileLoad.message} onRetry={() => void reloadProfile()} />
            </>
          ) : targetRole ? (
            <>
              <h1 className="cosh-role__title">{targetRole}</h1>
              <div className="cosh-role__by">
                entered by you ·{" "}
                <Link className="cosh-role__edit" to="/career-os/profile#profile-basics">
                  edit
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="cosh-role__title cosh-role__title--empty">No target role set</h1>
              <Link className="cosh-textlink cosh-textlink--arrow" to="/career-os/profile#profile-basics">
                Set a target role
                <ArrowRight />
              </Link>
            </>
          )}
          <p className="cosh-role__note">
            Free text from your career profile. Skylent does not match a role to required skills yet.
          </p>
        </header>

        <section className="cosh-next" aria-label="Next step">
          {nextStep}
        </section>
      </div>

      {brandNew ? (
        <section className="cosh-panel cosh-first" aria-labelledby="cosh-first-title">
          <div className="cosh-panel__head">
            <div className="cosh-panel__title">
              <h2 id="cosh-first-title">Start here</h2>
            </div>
            <span className="cosh-meta">Nothing is on your record yet</span>
          </div>
          <ol className="cosh-first__list">
            <li>
              <span className="sky-step__node">01</span>
              <div>
                <Link className="cosh-first__link" to="/career-os/profile#profile-basics">
                  Set a target role
                  <ArrowRight />
                </Link>
                <p>Free text in your career profile. It labels this page; nothing is matched to it yet.</p>
              </div>
            </li>
            <li>
              <span className="sky-step__node">02</span>
              <div>
                <Link className="cosh-first__link" to="/programmes">
                  Choose a programme
                  <ArrowRight />
                </Link>
                <p>Lessons, practice and a project come from the programme you enrol in.</p>
              </div>
            </li>
            <li>
              <span className="sky-step__node">03</span>
              <div>
                <Link className="cosh-first__link" to="/career-os/profile#profile-skills">
                  Add the skills you already have
                  <ArrowRight />
                </Link>
                <p>You enter them yourself, with a proficiency you choose.</p>
              </div>
            </li>
          </ol>
        </section>
      ) : null}

      <CareerPath cells={cells} onRetry={retryPath} />

      <div className="cosh-cols">
        <div className="cosh-main">
          {/* Your skills */}
          <Panel
            id="cosh-skills-title"
            title="Your skills"
            meta={profileLoad.status === "ready" ? `${skills.length} entered · not assessed by Skylent` : undefined}
          >
            {profileLoad.status === "loading" ? (
              <div className="cosh-panel__pad cosh-stack" aria-busy="true">
                <Skeleton height={14} />
                <Skeleton width="92%" height={14} />
                <Skeleton width="84%" height={14} />
              </div>
            ) : profileLoad.status === "error" ? (
              <div className="cosh-panel__pad">
                <BlockError what="Your skills" message={profileLoad.message} onRetry={() => void reloadProfile()} />
              </div>
            ) : skills.length === 0 ? (
              <div className="cosh-panel__pad">
                <div className="sky-empty">
                  <strong>No skills entered yet.</strong>
                  Skills on this page are the ones you add to your profile. Skylent does not assess them.
                </div>
              </div>
            ) : (
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
                      const proficiency = skill.proficiency ? PROFICIENCY[skill.proficiency] : null
                      return (
                        <tr key={skill.id}>
                          <th scope="row">{skill.name}</th>
                          <td data-label="Category">{skill.category || <span className="cosh-quiet">Not set</span>}</td>
                          <td data-label="Proficiency">
                            {proficiency ? (
                              <span className="cosh-prof">
                                <span className="cosh-prof__label">{proficiency.label}</span>
                                <span className="cosh-prof__bars" role="img" aria-label={`Level ${proficiency.level} of 4`}>
                                  {[1, 2, 3, 4].map((step) => (
                                    <span key={step} className={step <= proficiency.level ? "on" : undefined} />
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
            )}
            {profileLoad.status === "ready" ? (
              <div className="cosh-panel__foot">
                <Link className="cosh-textlink cosh-textlink--arrow" to="/career-os/profile#profile-skills">
                  Add a skill
                  <ArrowRight />
                </Link>
                <span className="cosh-meta">Scale: Beginner · Intermediate · Advanced · Expert</span>
              </div>
            ) : null}
          </Panel>

          {/* Evidence: the warm proof surface */}
          <Panel
            id="cosh-evidence-title"
            title="Evidence"
            tone="proof"
            meta={!evidenceLoading && !evidenceAllFailed ? `Ledger · ${plural(ledger.length, "item")}` : undefined}
            chip={<TruthChip state={truthOf("projectsAndEvidence")} />}
          >
            {evidenceLoading ? (
              <div className="cosh-panel__pad cosh-stack" aria-busy="true">
                <Skeleton height={14} />
                <Skeleton width="88%" height={14} />
                <Skeleton width="64%" height={14} />
              </div>
            ) : evidenceAllFailed ? (
              <div className="cosh-panel__pad">
                <BlockError
                  what="Your evidence"
                  message={learnerProjects.status === "error" ? learnerProjects.message : ""}
                  onRetry={retryEvidence}
                />
              </div>
            ) : (
              <>
                {ledger.length === 0 ? (
                  <div className="cosh-panel__pad">
                    <div className="sky-empty">
                      <strong>No evidence yet.</strong>
                      Evidence starts with a project inside a course you are enrolled in. A certificate is issued when every lesson of a
                      course is complete.
                      <div className="cosh-empty__action">
                        <Link className="cosh-textlink cosh-textlink--arrow" to={workspace ? "/dashboard/student" : "/programmes"}>
                          {workspace ? "Open My learning" : "Browse programmes"}
                          <ArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="cosh-ledger" role="list">
                    <div className="cosh-ledger__head" aria-hidden="true">
                      <span>What</span>
                      <span>Source</span>
                      <span>Skill</span>
                      <span>Status</span>
                    </div>
                    {ledger.map((row) => (
                      <article key={row.key} className="cosh-ledger__row" role="listitem">
                        <dl className="cosh-ledger__cells">
                          <div>
                            <dt>What</dt>
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
                            <dt>Skill</dt>
                            <dd>{row.skill}</dd>
                          </div>
                          <div>
                            <dt>Status</dt>
                            <dd className="cosh-ledger__status">{row.status}</dd>
                          </div>
                          <div className="cosh-ledger__reviewer">
                            <dt>A reviewer sees</dt>
                            <dd>
                              <span>{row.reviewer}</span>
                              <span className="cosh-ledger__actions">{row.actions}</span>
                            </dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>
                )}
                {evidenceGaps.length > 0 ? (
                  <div className="cosh-panel__pad cosh-panel__pad--tight">
                    <div className="cosh-error" role="alert">
                      <p>Your {evidenceGaps.join(" and ")} could not be loaded, so this list may be incomplete.</p>
                      <button type="button" className="cosh-retry" onClick={retryEvidence}>
                        Try again
                      </button>
                    </div>
                  </div>
                ) : null}
                {leadProject && leadProjectDetail.status === "ready" ? <TaskRail project={leadProjectDetail.data} /> : null}
                {leadProject && leadProjectDetail.status === "loading" ? (
                  <div className="cosh-tasks cosh-stack" aria-busy="true">
                    <Skeleton width="40%" height={11} />
                    <Skeleton height={32} />
                  </div>
                ) : null}
              </>
            )}
            <p className="cosh-proofnote">
              A certificate confirms that every lesson of a course was completed. Project evidence is your own work on a project. Neither is
              an employment outcome, and Career OS records none.
            </p>
          </Panel>

          {/* Applications, interviews and support: the learner's own records */}
          <Panel id="cosh-activity-title" title="Your activity">
            {activity.status === "loading" ? (
              <div className="cosh-panel__pad cosh-stack" aria-busy="true">
                <Skeleton height={14} />
                <Skeleton width="85%" height={14} />
                <Skeleton width="70%" height={14} />
              </div>
            ) : activity.status === "error" ? (
              <div className="cosh-panel__pad">
                <BlockError what="Applications, interviews and support" message={activity.message} onRetry={retryActivity} />
              </div>
            ) : (
              <ul className="cosh-activity">
                <li>
                  <Link to="/career-os/applications">
                    <span className="cosh-activity__n">{activity.data.applications.length}</span>
                    <span className="cosh-activity__text">
                      <strong>Applications</strong>
                      <span>
                        {latestApplication
                          ? [applicationRoleTitle(latestApplication), applicationEmployerName(latestApplication), formatStatusLabel(latestApplication.status)]
                              .filter(Boolean)
                              .join(" · ")
                          : "None tracked"}
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={upcomingRounds[0] ? `/career-os/interviews/${upcomingRounds[0].id}` : "/career-os/interviews"}>
                    <span className="cosh-activity__n">{upcomingRounds.length}</span>
                    <span className="cosh-activity__text">
                      <strong>Upcoming interviews</strong>
                      <span>
                        {upcomingRounds[0]
                          ? [upcomingRounds[0].title, upcomingRounds[0].scheduledAt ? formatInterviewDateTime(upcomingRounds[0].scheduledAt) : null]
                              .filter(Boolean)
                              .join(" · ")
                          : "None scheduled"}
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={activeSupport[0] ? `/career-os/support/${activeSupport[0].id}` : "/career-os/support"}>
                    <span className="cosh-activity__n">{activeSupport.length}</span>
                    <span className="cosh-activity__text">
                      <strong>Support requests</strong>
                      <span>
                        {activeSupport.length === 0
                          ? "None active"
                          : nextSupportTask
                            ? `Next task: ${nextSupportTask.title}`
                            : countOpenTasks(activeSupport) > 0
                              ? plural(countOpenTasks(activeSupport), "open task")
                              : "Waiting on the support team"}
                      </span>
                    </span>
                  </Link>
                </li>
              </ul>
            )}
          </Panel>
        </div>

        <div className="cosh-side">
          {/* Profile completeness */}
          <Panel
            id="cosh-complete-title"
            title="Profile completeness"
            meta={
              completenessLoad.status === "ready"
                ? `${completenessLoad.data.items.filter((item) => item.complete).length} of ${completenessLoad.data.items.length} sections`
                : undefined
            }
          >
            {completenessLoad.status === "loading" ? (
              <div className="cosh-panel__pad cosh-stack" aria-busy="true">
                <Skeleton width="45%" height={36} />
                <Skeleton height={4} />
                <Skeleton width="80%" height={12} />
                <Skeleton width="70%" height={12} />
              </div>
            ) : completenessLoad.status === "error" ? (
              <div className="cosh-panel__pad">
                <BlockError what="Profile completeness" message={completenessLoad.message} onRetry={retryCompleteness} />
              </div>
            ) : (
              <div className="cosh-panel__pad cosh-panel__pad--flush">
                <div className="cosh-pct">
                  <span className="cosh-pct__n">{completenessLoad.data.percent}%</span>
                  <span>of your profile is filled in</span>
                </div>
                <div
                  className="cosh-pctbar"
                  role="progressbar"
                  aria-label="Profile completeness"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completenessLoad.data.percent}
                >
                  <div style={{ width: `${completenessLoad.data.percent}%` }} />
                </div>
                <ul className="cosh-sections">
                  {completenessLoad.data.items
                    .filter((item) => !item.complete)
                    .map((item) => (
                      <li key={item.key}>
                        <span className="cosh-sections__box" aria-hidden="true" />
                        <span className="cosh-sections__name">{item.label}</span>
                        <span className="cosh-label cosh-label--ink">Missing</span>
                        <Link className="cosh-sections__add" to={`/career-os/profile#profile-${item.section}`} aria-label={`Add ${item.label}`}>
                          Add
                        </Link>
                      </li>
                    ))}
                  {completenessLoad.data.completed.length > 0 ? (
                    <li className="cosh-sections__done">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="cosh-sections__name">{completenessLoad.data.completed.join(" · ")}</span>
                      <span className="cosh-label">Done</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
            <p className="cosh-footnote">Measures profile sections filled in. It is not a readiness score.</p>
          </Panel>

          {/* Openings */}
          <Panel
            id="cosh-openings-title"
            title="Openings"
            chip={
              jobs.status === "ready" && jobTotal > 0 ? (
                <span className="cosh-meta">{jobTotal} published</span>
              ) : (
                <TruthChip state={truthOf("openings")} />
              )
            }
          >
            <div className="cosh-panel__pad">
              {jobs.status === "loading" ? (
                <div className="cosh-stack" aria-busy="true">
                  <Skeleton width="72%" height={14} />
                  <Skeleton width="56%" height={12} />
                </div>
              ) : jobs.status === "error" ? (
                <BlockError what="Openings" message={jobs.message} onRetry={retryJobs} />
              ) : jobs.data.jobs.length === 0 ? (
                <div className="sky-empty">
                  <strong>No openings published yet.</strong>
                  Saved jobs, applications and interviews stay empty until there are.
                </div>
              ) : (
                <>
                  <ul className="cosh-rows">
                    {jobs.data.jobs.slice(0, 3).map((job) => (
                      <li key={job.id}>
                        <Link to="/career-os/jobs">
                          <strong>{job.title}</strong>
                          <span>{[job.employer?.name, job.location].filter(Boolean).join(" · ")}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link className="cosh-textlink cosh-textlink--arrow" to="/career-os/jobs">
                    See all openings
                    <ArrowRight />
                  </Link>
                </>
              )}
            </div>
          </Panel>

          {/* Skylent AI: career context is not built */}
          <section className="cosh-panel cosh-ai" aria-label={AI_NAME}>
            <div className="sky-ai-head sky-on-navy cosh-ai__head">
              <div className="cosh-ai__top">
                <AiMark />
                <TruthChip state={truthOf("careerAi")} />
              </div>
              <div className="sky-label">Context in use</div>
              <div className="cosh-ai__context">
                <span>Skills · not connected</span>
                <span>Projects · not connected</span>
                <span>Evidence · not connected</span>
              </div>
            </div>
            <div className="cosh-panel__pad">
              <ul className="cosh-ai__list">
                {CAREER_AI_DESIGNED.map((capability) => (
                  <li key={capability}>
                    <button type="button" disabled>
                      {capability}
                      <span>Not yet</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cosh-ai__note">
                <span aria-hidden="true" />
                {AI_NAME} works inside lessons today.
              </p>
            </div>
          </section>
        </div>
      </div>

      <footer className="cosh-foot">
        <span>Career OS reads your career profile and My learning. It recommends lessons; it does not replace them.</span>
        <Link to="/dashboard/student">
          Open My learning
          <ArrowRight />
        </Link>
      </footer>
    </div>
  )
}
