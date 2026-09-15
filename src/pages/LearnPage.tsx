import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent, getLmsTabAccent } from '../role-themes'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import type { QuizQuestion } from '../components/lms/AssessmentSurface'
import { getDaQuiz } from '../content/data-analytics/quizzes'
import {
  computeCourseProgress,
  defaultTabForLesson,
  getAdjacentLessons,
  isLessonUnlocked,
  lessonObjective,
  lessonTypeLabel,
} from '../components/lms/lms-utils'
import { useLmsCourse } from '../hooks/useLms'
import LockedLessonState from '../components/lms/LockedLessonState'
import type { VideoPlaybackSource } from '../lib/media/types'
import {
  fetchLessonMedia,
  fetchQuizQuestions,
  markLessonAccess,
  markLessonComplete,
  submitQuizAttempt,
  updateAssignment,
} from '../lib/lms-api'
import { workspaceErrorMessage } from '../lib/http'
import './LearnWorkspace.css'

function dashRoute(role?: string) {
  switch (role) {
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
    default: return '/dashboard/student'
  }
}

export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates, reload, enroll } = useLmsCourse(slug)
  const roleAccent = getLmsRoleAccent(user?.role)

  const course = access.status === 'ready' ? access.course : null
  const allLessons = course ? course.modules.flatMap((module) => module.lessons) : []
  const resumeLessonId = access.status === 'ready' ? access.workspace.resume.lessonId : ''
  const firstLessonId = resumeLessonId || allLessons[0]?.id || ''

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizStatus, setQuizStatus] = useState<'loading' | 'ready'>('ready')
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const selectedLessonType = allLessons.find((lesson) => lesson.id === selectedLessonId)?.type ?? null
  const selectedLessonLocked = Boolean(selectedLessonId && lessonStates[selectedLessonId]?.locked)

  useEffect(() => {
    if (firstLessonId && !lessonId && access.status === 'ready') {
      setSelectedLessonId(firstLessonId)
    }
  }, [firstLessonId, lessonId, access.status])

  useEffect(() => {
    if (!selectedLessonId || !slug || access.status !== 'ready') return
    const target = `/learn/${slug}/${selectedLessonId}`
    if (location.pathname === target) return
    navigate(target, { replace: true })
  }, [selectedLessonId, slug, navigate, access.status, location.pathname])

  useEffect(() => {
    if (lessonId) setSelectedLessonId(lessonId)
  }, [lessonId])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (!slug || access.status !== 'ready' || !selectedLessonId) return
    if (selectedLessonLocked) {
      setQuizQuestions([])
      setQuizStatus('ready')
      setLessonMedia(undefined)
      return
    }

    void markLessonAccess(slug, selectedLessonId).catch(() => undefined)

    if (selectedLessonType === 'quiz') {
      setQuizStatus('loading')
      fetchQuizQuestions(slug, selectedLessonId)
        .then((questions) => {
          const bank = slug === 'data-analytics' ? getDaQuiz(selectedLessonId) : undefined
          setQuizQuestions(questions.map((q, index) => ({
            q: q.q,
            options: q.options,
            explanation: bank?.questions[index]?.explanation,
            correct: bank?.questions[index]?.correctIndex,
          })))
          setQuizStatus('ready')
        })
        .catch(() => {
          setQuizQuestions([])
          setQuizStatus('ready')
        })
    } else {
      setQuizQuestions([])
      setQuizStatus('ready')
    }

    if (selectedLessonType === 'video') {
      fetchLessonMedia(slug, selectedLessonId)
        .then((payload) => setLessonMedia(payload.media))
        .catch(() => setLessonMedia({ provider: 'unavailable' }))
    } else {
      setLessonMedia(undefined)
    }
  }, [slug, access.status, selectedLessonId, selectedLessonType, selectedLessonLocked])

  const refreshWorkspace = useCallback(async () => {
    if (!slug) return
    await reload()
  }, [slug, reload])

  if (!slug) {
    return (
      <div className="os-state">
        <h1>Course not found</h1>
        <Link className="os-link" to="/courses">Back to courses</Link>
      </div>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <div className="os-state">
        <p>Loading course…</p>
      </div>
    )
  }

  if (access.status === 'login_required') {
    return (
      <div className="os-state">
        <h1>Sign in to continue learning</h1>
        <p>Course content is available after you sign in and enrol.</p>
        <Link className="os-btn os-btn-primary" to="/login" state={{ returnTo: location.pathname }}>Go to sign in</Link>
      </div>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <div className="os-state">
        <h1>{access.courseTitle}</h1>
        <p>You are signed in but not enrolled in this course yet.</p>
        <button
          type="button"
          className="os-btn os-btn-primary"
          disabled={enrolling}
          onClick={() => {
            setEnrolling(true)
            setEnrollError(null)
            void enroll()
              .catch((err) => setEnrollError(workspaceErrorMessage(err)))
              .finally(() => setEnrolling(false))
          }}
        >
          {enrolling ? 'Enrolling…' : 'Enrol to start learning'}
        </button>
        {enrollError ? <p className="os-error">{enrollError}</p> : null}
        <Link className="os-link" to="/dashboard/student">Back to dashboard</Link>
      </div>
    )
  }

  if (access.status !== 'ready') {
    return (
      <div className="os-state">
        <h1>Course unavailable</h1>
        <p>This course could not be opened. Check your connection, then try again.</p>
        <Link className="os-link" to="/dashboard/student">Back to dashboard</Link>
      </div>
    )
  }

  const readyCourse = access.course
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedState = selectedLessonId ? (lessonStates[selectedLessonId] ?? { ...EMPTY_LESSON_STATE }) : { ...EMPTY_LESSON_STATE }
  const { progressPct, completedCount, totalLessons, allComplete } = computeCourseProgress(allLessons, lessonStates)
  const tabAccent = getLmsTabAccent(selectedLesson ? defaultTabForLesson(selectedLesson) : 'notes')
  const { prev, next } = getAdjacentLessons(allLessons, selectedLessonId)
  const currentModule = selectedLesson
    ? readyCourse.modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLesson.id))
    : null
  const nextUnlocked = next && isLessonUnlocked(next.id, allLessons, lessonStates) ? next : null

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id, allLessons, lessonStates)) return
    setSelectedLessonId(id)
    setSidebarOpen(false)
    setActionError(null)
  }

  async function handleLessonComplete() {
    if (!slug || !selectedLesson) return
    setActionError(null)
    try {
      await markLessonComplete(slug, selectedLesson.id)
      await refreshWorkspace()
    } catch (err) {
      setActionError(workspaceErrorMessage(err) || 'Could not save your progress. Try again.')
    }
  }

  async function handleQuizSubmit(answers: Record<number, number>) {
    if (!slug || !selectedLesson) return false
    setActionError(null)
    try {
      const ordered = quizQuestions.map((_, index) => answers[index] ?? -1)
      const result = await submitQuizAttempt(slug, selectedLesson.id, ordered)
      if (result.passed) await refreshWorkspace()
      return result.passed
    } catch (err) {
      setActionError(workspaceErrorMessage(err) || 'Could not submit the quiz. Try again.')
      return false
    }
  }

  async function handleAssignmentSubmit(text: string) {
    if (!slug || !selectedLesson) return
    setActionError(null)
    try {
      await updateAssignment(slug, selectedLesson.id, 'submit', text)
      await handleLessonComplete()
    } catch (err) {
      setActionError(workspaceErrorMessage(err) || 'Could not submit the assignment. Try again.')
    }
  }

  return (
    <div className="os-shell">
      {sidebarOpen ? (
        <div className="os-overlay" onClick={() => setSidebarOpen(false)} role="presentation" />
      ) : null}
      <aside
        className={sidebarOpen ? 'os-rail is-open' : 'os-rail'}
        id="os-curriculum"
        aria-label="Course curriculum"
        {...(sidebarOpen ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <CurriculumRail
          course={readyCourse}
          lessonStates={lessonStates}
          selectedLessonId={selectedLessonId}
          accent={roleAccent}
          onSelectLesson={handleLessonSelect}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      <div className="os-main">
        <header className="os-top">
          <button type="button" className="os-menu" onClick={() => setSidebarOpen(true)} aria-label="Open curriculum" aria-expanded={sidebarOpen} aria-controls="os-curriculum">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <button type="button" className="os-top-link" onClick={() => navigate(dashRoute(user?.role))}>
            Dashboard
          </button>
          <span className="os-top-course">{readyCourse.title}</span>
          <div className="os-top-progress">{completedCount}/{totalLessons} · {progressPct}%</div>
        </header>

        <div className="os-stage">
          <div className="os-article">
            {allComplete ? (
              <div className="os-banner">
                <p className="os-rail-kicker">Course complete</p>
                <h2>{readyCourse.title}</h2>
                <p className="os-lead">You have finished every lesson in this workspace. Certificates are not issued in this pilot. You can carry learning evidence into Career OS.</p>
                <div className="os-actions">
                  <Link className="os-btn os-btn-primary" to="/career-os">Open Career OS</Link>
                </div>
              </div>
            ) : null}

            {selectedLesson ? (
              <>
                <p className="os-kicker">
                  <strong>{lessonTypeLabel(selectedLesson.type, selectedLesson.title)}</strong>
                  <span>{selectedLesson.duration ?? 'Self-paced'}</span>
                  <span>{currentModule?.title ?? 'Current module'}</span>
                </p>
                <h1>{selectedLesson.title}</h1>
                <p className="os-lead">{lessonObjective(selectedLesson)}</p>
                <p className={selectedState.complete ? 'os-status is-done' : 'os-status'}>
                  {selectedState.locked ? 'Locked until the previous lesson is complete.' : selectedState.complete ? 'Completed' : 'In progress'}
                </p>

                <div className="os-paper">
                  {selectedState.locked ? (
                    <LockedLessonState
                      lessonTitle={selectedLesson.title}
                      requiredLessonTitle={
                        selectedState.requiredLessonKey
                          ? allLessons.find((lesson) => lesson.id === selectedState.requiredLessonKey)?.title
                          : null
                      }
                      accent={{ ...tabAccent, text: roleAccent.text }}
                    />
                  ) : (
                    <LessonContentView
                      lesson={selectedLesson}
                      lessonState={selectedState}
                      accent={{ ...tabAccent, text: roleAccent.text }}
                      onComplete={() => { void handleLessonComplete() }}
                      quizQuestions={selectedLesson.type === 'quiz' ? quizQuestions : undefined}
                      quizStatus={selectedLesson.type === 'quiz' ? quizStatus : undefined}
                      onQuizSubmit={selectedLesson.type === 'quiz' ? handleQuizSubmit : undefined}
                      onAssignmentSubmit={selectedLesson.type === 'assignment' ? handleAssignmentSubmit : undefined}
                      lessonMedia={lessonMedia}
                      courseSlug={readyCourse.slug}
                    />
                  )}
                </div>
                {actionError ? <p className="os-error">{actionError}</p> : null}
                <LessonNavigation
                  prev={prev}
                  next={nextUnlocked}
                  courseSlug={readyCourse.slug}
                  accent={roleAccent}
                  onNavigate={handleLessonSelect}
                />
              </>
            ) : (
              <p className="os-lead">This lesson is unavailable. Choose another from the curriculum.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
