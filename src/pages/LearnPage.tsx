import { useState, useEffect, useId, useMemo } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent } from '../role-themes'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import type { QuizQuestion } from '../components/lms/AssessmentSurface'
import {
  computeCourseProgress,
  getAdjacentLessons,
  isLessonUnlocked,
  lessonTypeLabel,
} from '../components/lms/lms-utils'
import { useLmsCourse } from '../hooks/useLms'
import LockedLessonState from '../components/lms/LockedLessonState'
import type { VideoPlaybackSource } from '../lib/media/types'
import {
  fetchCourseWorkspace,
  fetchLessonMedia,
  fetchQuizQuestions,
  markLessonAccess,
  markLessonComplete,
  submitQuizAttempt,
  updateAssignment,
} from '../lib/lms-api'

function dashRoute(role?: string) {
  switch (role) {
    case 'faculty':
      return '/dashboard/faculty'
    case 'organisation':
      return '/dashboard/organisation'
    case 'recruiter':
      return '/dashboard/recruiter'
    case 'superadmin':
      return '/dashboard/admin'
    default:
      return '/dashboard/student'
  }
}

export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates, enroll, patchWorkspace } = useLmsCourse(slug)
  const roleAccent = getLmsRoleAccent(user?.role)
  const railTitleId = useId()
  const learnerDash = dashRoute(user?.role)

  const course = access.status === 'ready' ? access.course : null
  const allLessons = useMemo(
    () => (course ? course.modules.flatMap((module) => module.lessons) : []),
    [course],
  )
  const resumeLessonId = access.status === 'ready' ? access.workspace.resume.lessonId : ''
  const firstLessonId = resumeLessonId || allLessons[0]?.id || ''

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (firstLessonId && !lessonId && access.status === 'ready') {
      setSelectedLessonId(firstLessonId)
    }
  }, [firstLessonId, lessonId, access.status])

  useEffect(() => {
    if (!selectedLessonId || !slug || access.status !== 'ready') return
    // Do not override the Practice route if this page remains mounted during navigation.
    if (location.pathname.endsWith('/practice')) return
    const target = `/learn/${slug}/${selectedLessonId}`
    if (location.pathname !== target) {
      navigate(target, { replace: true })
    }
  }, [selectedLessonId, slug, navigate, access.status, location.pathname])

  useEffect(() => {
    if (lessonId && allLessons.some((lesson) => lesson.id === lessonId)) {
      setSelectedLessonId(lessonId)
    }
  }, [lessonId, allLessons])

  useEffect(() => {
    if (!slug || access.status !== 'ready' || !selectedLessonId) return
    const lesson = allLessons.find((item) => item.id === selectedLessonId)
    if (!lesson) return
    const state = lessonStates[selectedLessonId]
    if (state?.locked) {
      setQuizQuestions([])
      setLessonMedia(undefined)
      return
    }

    void markLessonAccess(slug, selectedLessonId).catch(() => undefined)

    if (lesson.type === 'quiz') {
      fetchQuizQuestions(slug, selectedLessonId)
        .then((questions) => setQuizQuestions(questions.map((q) => ({ q: q.q, options: q.options }))))
        .catch(() => setQuizQuestions([]))
    } else {
      setQuizQuestions([])
    }

    if (lesson.type === 'video') {
      fetchLessonMedia(slug, selectedLessonId)
        .then((payload) => setLessonMedia(payload.media))
        .catch(() => setLessonMedia(lesson.media ?? { provider: 'unavailable' }))
    } else {
      setLessonMedia(undefined)
    }
  }, [slug, access.status, selectedLessonId, allLessons, lessonStates])

  if (!slug) {
    return (
      <div className="lms-gate lms-learn-gate" role="status">
        <h1>Course unavailable</h1>
        <p>No course was specified in the URL.</p>
        <Link to={learnerDash} className="lms-gate-primary">
          Back to learner workspace
        </Link>
      </div>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <div className="lms-gate lms-learn-gate" role="status">
        <p>Loading lesson…</p>
      </div>
    )
  }

  if (access.status === 'login_required') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Sign in to continue learning</h1>
        <p>Lesson access requires an authenticated learner account with an enrollment for this course.</p>
        <div className="lms-gate-actions">
          <Link to="/login" className="lms-gate-primary">
            Sign in
          </Link>
          <Link to="/signup" className="lms-gate-secondary">
            Create account
          </Link>
        </div>
      </div>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>{access.courseTitle}</h1>
        <p>You are signed in but not enrolled in this course yet.</p>
        <div className="lms-gate-actions">
          <button
            type="button"
            className="lms-gate-primary"
            disabled={enrolling}
            onClick={() => {
              setEnrolling(true)
              void enroll().finally(() => setEnrolling(false))
            }}
          >
            {enrolling ? 'Enrolling…' : 'Enroll to start learning'}
          </button>
          <Link to={learnerDash} className="lms-gate-secondary">
            Back to learner workspace
          </Link>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Course unavailable</h1>
        <p>This course could not be loaded from the LMS.</p>
        <Link to={learnerDash} className="lms-gate-primary">
          Back to learner workspace
        </Link>
      </div>
    )
  }

  const lessonIdInvalid = Boolean(lessonId && !allLessons.some((lesson) => lesson.id === lessonId))
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedModule = selectedLesson
    ? course.modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLesson.id)) ?? null
    : null
  const selectedState = selectedLessonId
    ? (lessonStates[selectedLessonId] ?? { ...EMPTY_LESSON_STATE })
    : { ...EMPTY_LESSON_STATE }
  const { progressPct, allComplete } = computeCourseProgress(allLessons, lessonStates)
  const { prev, next } = getAdjacentLessons(allLessons, selectedLessonId)
  const nextUnlocked = next ? isLessonUnlocked(next.id, allLessons, lessonStates) : false

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id, allLessons, lessonStates)) return
    setSelectedLessonId(id)
    setSidebarOpen(false)
  }

  async function handleLessonComplete() {
    if (!slug || !selectedLesson || completing) return
    setCompleting(true)
    try {
      await markLessonComplete(slug, selectedLesson.id)
      const workspace = await fetchCourseWorkspace(slug)
      patchWorkspace(workspace)
    } catch {
      /* keep current progress on failure */
    } finally {
      setCompleting(false)
    }
  }

  async function handleQuizSubmit(answers: Record<number, number>) {
    if (!slug || !selectedLesson) return false
    const ordered = quizQuestions.map((_, index) => answers[index] ?? -1)
    const result = await submitQuizAttempt(slug, selectedLesson.id, ordered)
    if (result.passed) {
      const workspace = await fetchCourseWorkspace(slug)
      patchWorkspace(workspace)
    }
    return result.passed
  }

  async function handleAssignmentSubmit(text: string) {
    if (!slug || !selectedLesson) return
    await updateAssignment(slug, selectedLesson.id, 'submit', text)
    await handleLessonComplete()
  }

  if (lessonIdInvalid) {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Lesson unavailable</h1>
        <p>Lesson content isn't available yet.</p>
        <div className="lms-gate-actions">
          <Link to={`/learn/${course.slug}`} className="lms-gate-primary">
            Open course
          </Link>
          <Link to={learnerDash} className="lms-gate-secondary">
            Back to learner workspace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="lms-shell skylent-lms-shell lms-learn-shell">
      <a href="#lms-lesson-main" className="lms-skip-link">
        Skip to lesson content
      </a>

      {sidebarOpen && (
        <button
          type="button"
          className="lms-sidebar-overlay"
          aria-label="Close course navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="lms-curriculum-nav"
        className={`lms-sidebar${sidebarOpen ? ' open' : ''}`}
        aria-labelledby={railTitleId}
      >
        <CurriculumRail
          course={course}
          lessonStates={lessonStates}
          selectedLessonId={selectedLessonId}
          accent={roleAccent}
          onSelectLesson={handleLessonSelect}
          homeHref={learnerDash}
          titleId={railTitleId}
        />
      </aside>

      <div className="lms-main">
        <header className="lms-header lms-learn-header">
          <button
            type="button"
            className="lms-menu-btn"
            aria-expanded={sidebarOpen}
            aria-controls="lms-curriculum-nav"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>Modules</span>
          </button>
          <Link to={learnerDash} className="lms-back-btn">
            Workspace
          </Link>
          <span className="lms-header-sep" aria-hidden="true">
            ·
          </span>
          <span className="lms-header-course">{course.title}</span>
          {allLessons.length > 0 ? (
            <div className="lms-header-progress" aria-label={`${progressPct}% of lessons complete`}>
              {progressPct}%
            </div>
          ) : null}
        </header>

        <main id="lms-lesson-main" className="lms-content lms-learn-content" tabIndex={-1}>
          {allComplete ? (
            <p className="lms-course-complete-note" role="status">
              All lessons in this course are marked complete.
            </p>
          ) : null}

          {selectedLesson ? (
            <article className="lms-lesson-article">
              <header className="lms-lesson-context">
                <p className="lms-lesson-crumb">
                  <span>{course.title}</span>
                  {selectedModule ? (
                    <>
                      <span aria-hidden="true"> → </span>
                      <span>{selectedModule.title}</span>
                    </>
                  ) : null}
                </p>
                <p className="lms-lesson-meta">
                  <span>{lessonTypeLabel(selectedLesson.type)}</span>
                  {selectedLesson.duration ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span>{selectedLesson.duration}</span>
                    </>
                  ) : null}
                  {selectedState.complete ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="lms-lesson-complete-flag">Complete</span>
                    </>
                  ) : null}
                </p>
                <h1 className="lms-lesson-title">{selectedLesson.title}</h1>
              </header>

              <div className="lms-lesson-panel">
                {selectedState.locked ? (
                  <LockedLessonState
                    lessonTitle={selectedLesson.title}
                    requiredLessonTitle={
                      selectedState.requiredLessonKey
                        ? allLessons.find((lesson) => lesson.id === selectedState.requiredLessonKey)?.title
                        : null
                    }
                    accent={roleAccent}
                  />
                ) : (
                  <LessonContentView
                    lesson={selectedLesson}
                    lessonState={selectedState}
                    accent={roleAccent}
                    onComplete={() => {
                      void handleLessonComplete()
                    }}
                    completing={completing}
                    quizQuestions={selectedLesson.type === 'quiz' ? quizQuestions : undefined}
                    onQuizSubmit={selectedLesson.type === 'quiz' ? handleQuizSubmit : undefined}
                    onAssignmentSubmit={selectedLesson.type === 'assignment' ? handleAssignmentSubmit : undefined}
                    lessonMedia={lessonMedia}
                  />
                )}
              </div>

              {!selectedState.locked && selectedLesson.hasPractice && slug ? (
                <div className="lms-practice-entry">
                  <Link
                    to={`/learn/${slug}/${selectedLesson.id}/practice`}
                    className="lms-practice-entry-link"
                    style={{ borderColor: roleAccent.border, background: roleAccent.subtle, color: roleAccent.text }}
                  >
                    Try the practice
                  </Link>
                  <p className="lms-practice-entry-hint">Apply the idea from this lesson in a short decision task.</p>
                </div>
              ) : null}

              <LessonNavigation
                prev={prev}
                next={next}
                courseSlug={course.slug}
                accent={roleAccent}
                onNavigate={handleLessonSelect}
                nextUnlocked={nextUnlocked}
                complete={selectedState.complete}
                dashboardHref={learnerDash}
              />
            </article>
          ) : (
            <div className="lms-gate lms-learn-gate lms-learn-inline-gate">
              <h1>Lesson content isn't available yet.</h1>
              <p>This course does not have a lesson ready to open.</p>
              <Link to={learnerDash} className="lms-gate-primary">
                Back to learner workspace
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
