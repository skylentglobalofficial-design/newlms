import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import {
  LearningWorkspacePanel,
  CurriculumProgressRail,
  StudentActionRail,
  computeCourseProgress,
  getRecentActivity,
  isLessonUnlocked,
  isCapstoneLesson,
  lessonTypeLabel,
} from '../components/lms'
import { useLmsDashboard } from '../hooks/useLms'
import { enrollInCourse, fetchLmsEnrollments, type ApiEnrollmentSummary } from '../lib/lms-api'
import EnrollmentEvidence from '../components/learner/EnrollmentEvidence'
import { LearnFlow, NorthwindWorkspace } from '../components/product/ProductLanguage'
import { workspaceErrorMessage } from '../lib/http'
import { courses } from '../data'
import { AUTHORED_COURSE_SLUG } from '../lib/live-intents'
import './LearnWorkspace.css'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Home', short: 'Home', sectionId: 'student-overview' },
  { id: 'learning', label: 'My learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os' },
]

const accent = getRoleAccent('student')
const recommendedCourse = courses.find((course) => course.slug === AUTHORED_COURSE_SLUG) ?? courses[0]

function greetingName(firstName: string) {
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${hello}, ${firstName}`
}

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<ApiEnrollmentSummary[]>([])

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    void fetchLmsEnrollments()
      .then((rows) => {
        if (!cancelled) setEnrollments(rows)
      })
      .catch(() => {
        if (!cancelled) setEnrollments([])
      })
    return () => {
      cancelled = true
    }
  }, [user, workspace])

  const learnSlug = workspace?.course.slug ?? ''
  const allLessons = course?.modules.flatMap((module) => module.lessons) ?? []
  const { progressPct } = course ? computeCourseProgress(allLessons, lessonStates) : { progressPct: 0 }
  const resume = workspace?.resume
  const currentLesson = allLessons.find((lesson) => lesson.id === resume?.lessonId)
  const recent = course ? getRecentActivity([course], () => lessonStates) : []
  const viaProgram = enrollments.find((item) => item.courseSlug === learnSlug && item.programName)?.programName ?? null
  const firstName = user?.name?.split(' ')[0] || 'there'

  const lessonModuleTitle = (lessonId: string) =>
    course?.modules.find((mod) => mod.lessons.some((lesson) => lesson.id === lessonId))?.title ?? course?.title ?? ''
  const currentIndex = resume?.lessonId ? allLessons.findIndex((lesson) => lesson.id === resume.lessonId) : 0
  const upcomingItems = allLessons
    .slice(Math.max(currentIndex, 0) + 1, Math.max(currentIndex, 0) + 4)
    .map((lesson) => ({ lesson, moduleTitle: lessonModuleTitle(lesson.id) }))
  const practiceItems = allLessons
    .filter((lesson) => lesson.type === 'quiz' || lesson.type === 'assignment')
    .filter((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates) && !lessonStates[lesson.id]?.complete)
    .map((lesson) => ({ lesson, moduleTitle: lessonModuleTitle(lesson.id) }))

  const submittedAssignments = allLessons.filter(
    (lesson) => lesson.type === 'assignment' && (lessonStates[lesson.id]?.assignmentSubmitted || lessonStates[lesson.id]?.complete),
  )
  const evidenceLesson = submittedAssignments[submittedAssignments.length - 1]
  const evidenceTitle = evidenceLesson ? evidenceLesson.title : 'No submitted assignments yet'
  const evidenceDetail = evidenceLesson
    ? 'This is work recorded in the course. Add it to Career OS when you want it on your profile. Nothing is created automatically.'
    : 'Assignments you submit in the course can be recorded in Career OS. Nothing is invented here.'

  const extraEnrollments = enrollments.filter((item) => item.courseSlug && item.courseSlug !== learnSlug)

  const shell = {
    themeId: 'data-science' as const,
    workspaceLabel: 'Learning',
    roleLabel: 'Learner',
    navItems: NAV_ITEMS,
    bottomNavItems: NAV_ITEMS,
    activeNav,
    onNavChange: setActiveNav,
    renderNavIcon: (id: string) => <NavIcon id={id} />,
  }

  if (!ready || !user) return null

  if (error && !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="dash-error" id="student-overview">
          <p className="os-eyebrow">Learning</p>
          <h1>Learning workspace unavailable</h1>
          <p className="dash-empty-copy">{error}</p>
          <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
        </div>
      </AuthDashboardShell>
    )
  }

  if (loading) {
    return (
      <AuthDashboardShell {...shell}>
        <p style={{ color: C.slate, fontSize: 14 }}>Loading your learning workspace…</p>
      </AuthDashboardShell>
    )
  }

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="dash-empty" id="student-overview">
          <div className="dash-welcome">
            <h1>{greetingName(firstName)}</h1>
            <p>
              You are signed in. Enrol in a live course to open a workspace with lessons, practice, and a place to keep the work.
            </p>
          </div>
          {recommendedCourse ? (
            <>
            <div className="dash-empty-grid">
              <div className="dash-empty-card">
                <p className="os-eyebrow">Ready to start</p>
                <h2>{recommendedCourse.title}</h2>
                <p>{recommendedCourse.desc}</p>
                <p className="dash-continue-meta">
                  {recommendedCourse.duration} · {recommendedCourse.lessons} lessons · {recommendedCourse.level}
                </p>
                <div className="os-actions">
                  <button
                    type="button"
                    className="os-btn os-btn-primary"
                    disabled={enrolling}
                    onClick={() => {
                      setEnrolling(true)
                      setEnrollError(null)
                      void enrollInCourse(recommendedCourse.slug)
                        .then(() => reload({ silent: true }))
                        .catch((err) => setEnrollError(workspaceErrorMessage(err)))
                        .finally(() => setEnrolling(false))
                    }}
                  >
                    {enrolling ? 'Enrolling…' : `Start ${recommendedCourse.title}`}
                  </button>
                  <Link className="os-btn os-btn-ghost" to="/courses">Browse courses</Link>
                </div>
                {enrollError ? <p className="os-error">{enrollError}</p> : null}
              </div>
              <NorthwindWorkspace compact />
            </div>
            <div className="dash-empty-flow">
              <LearnFlow
                steps={[
                  { title: "Learn", copy: "Enrolment opens Data Analytics in Skylent OS.", kind: "learn" },
                  { title: "Practise", copy: "Quizzes unlock after the written work.", kind: "practice" },
                  { title: "Build", copy: "Assignments use the Northwind extract.", kind: "build" },
                  { title: "Keep", copy: "Carry evidence into Career OS yourself.", kind: "keep" },
                ]}
              />
            </div>
            </>
          ) : (
            <div className="os-actions">
              <Link className="os-btn os-btn-primary" to="/courses">Browse courses</Link>
            </div>
          )}
        </div>
      </AuthDashboardShell>
    )
  }

  const pendingRail = upcomingItems.map((item) => ({
    label: lessonTypeLabel(item.lesson.type, item.lesson.title),
    title: item.lesson.title,
    detail: `${item.moduleTitle}${item.lesson.duration ? ` · ${item.lesson.duration}` : ''}`,
    href: `/learn/${course.slug}/${item.lesson.id}`,
    locked: !isLessonUnlocked(item.lesson.id, allLessons, lessonStates),
  }))

  const practiceRail = practiceItems.map((item) => ({
    label: isCapstoneLesson(item.lesson) ? 'Capstone' : lessonTypeLabel(item.lesson.type, item.lesson.title),
    title: item.lesson.title,
    detail: `${item.moduleTitle} · ${item.lesson.duration ?? 'Self-paced'}`,
    href: `/learn/${course.slug}/${item.lesson.id}`,
  }))

  const recentRail = recent.map((item) => ({
    label: item.label,
    detail: item.detail,
    href: item.lessonId ? `/learn/${item.courseSlug}/${item.lessonId}` : `/learn/${item.courseSlug}`,
  }))

  return (
    <AuthDashboardShell {...shell}>
      <div id="student-overview">
        <div className="dash-welcome">
          <h1>{greetingName(firstName)}</h1>
          <p>
            {resume?.lessonTitle
              ? `Continue ${course.title} from ${resume.lessonTitle}.`
              : `Start ${course.title} when you are ready.`}
          </p>
        </div>
        <AuthDashboardLayout
          className="dash-layout"
          primary={
            <>
              <LearningWorkspacePanel
                courseTitle={course.title}
                courseSlug={course.slug}
                programName={viaProgram}
                progressPct={progressPct}
                completedCount={workspace.progress.completedCount}
                totalLessons={workspace.progress.totalLessons}
                moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
                moduleIndex={resume?.moduleIndex ?? 1}
                moduleTotal={resume?.moduleTotal ?? course.modules.length}
                lessonTitle={resume?.lessonTitle ?? 'Start learning'}
                lessonType={currentLesson ? lessonTypeLabel(currentLesson.type, currentLesson.title) : ''}
                lessonDuration={currentLesson?.duration}
                nextLessonTitle={resume?.nextLessonTitle ?? null}
                learnSlug={learnSlug}
                lessonId={resume?.lessonId ?? ''}
                accent={accent}
                started={workspace.progress.completedCount > 0 || Boolean(resume?.lessonId)}
              />
              {extraEnrollments.length > 0 ? (
                <div className="dash-card dash-enrollments">
                  <h2>Other enrolled courses</h2>
                  <EnrollmentEvidence items={extraEnrollments} />
                </div>
              ) : null}
              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={learnSlug} />
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
              practiceTasks={practiceRail}
              recentActivity={recentRail}
              evidenceTitle={evidenceTitle}
              evidenceDetail={evidenceDetail}
              accent={accent}
            />
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
