import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent, getLmsTabAccent } from '../role-themes'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import { LessonContextPanel } from '../components/product/ProductLanguage'
import { getDaLessonMeta } from '../content/data-analytics/lessons'
import { isAuthoredCourse } from '../lib/live-intents'
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

const SkylentAI = lazy(() => import('../components/lms/SkylentAI'))

function SkylentAiFallback({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <section className="os-ai is-compact os-ai-fallback" aria-hidden="true">
        <p className="os-eyebrow">Skylent AI</p>
      </section>
    )
  }
  return (
    <aside className="os-ai os-ai-fallback" aria-hidden="true">
      <p className="os-eyebrow">Skylent AI</p>
      <p className="os-ai-idle">Ask about this lesson.</p>
    </aside>
  )
}

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
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
  const [aiCompact, setAiCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1200px)').matches)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizStatus, setQuizStatus] = useState<'loading' | 'ready'>('ready')
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

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
    const mq = window.matchMedia('(max-width: 900px)')
    const apply = () => setCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1200px)')
    const apply = () => setAiCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        menuBtnRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !compact) return
      const root = document.getElementById('os-curriculum')
      if (!root) return
      const items = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.style.overflow = compact ? 'hidden' : ''
    const closeBtn = document.querySelector<HTMLButtonElement>('#os-curriculum .os-rail-close')
    closeBtn?.focus()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sidebarOpen, compact])

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
    await reload({ silent: true })
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
  const prevUnlocked = prev && isLessonUnlocked(prev.id, allLessons, lessonStates) ? prev : null
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
        aria-hidden={compact && !sidebarOpen}
        {...(compact && !sidebarOpen ? { inert: true } : {})}
        {...(sidebarOpen && compact ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <CurriculumRail
          course={readyCourse}
          lessonStates={lessonStates}
          selectedLessonId={selectedLessonId}
          accent={roleAccent}
          onSelectLesson={handleLessonSelect}
          onClose={() => {
            setSidebarOpen(false)
            menuBtnRef.current?.focus()
          }}
        />
      </aside>

      <div className="os-main">
        <header className="os-top">
          <button ref={menuBtnRef} type="button" className="os-menu" onClick={() => setSidebarOpen(true)} aria-label="Open curriculum" aria-expanded={sidebarOpen} aria-controls="os-curriculum">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <nav className="os-crumb" aria-label="Course location">
            <button type="button" className="os-top-link" onClick={() => navigate(dashRoute(user?.role))} aria-label="Dashboard">
              <svg className="os-top-dash-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="os-top-dash-label">Dashboard</span>
            </button>
            <span className="os-crumb-sep" aria-hidden="true">→</span>
            <span className="os-top-course">{readyCourse.title}</span>
            {selectedLesson ? (
              <>
                <span className="os-crumb-sep os-crumb-sep-lesson" aria-hidden="true">→</span>
                <span className="os-top-lesson">{selectedLesson.title}</span>
              </>
            ) : null}
          </nav>
          <div
            className="os-top-progress"
            aria-label={`${completedCount} of ${totalLessons} lessons complete, ${progressPct} percent`}
          >
            <span>{completedCount} / {totalLessons}</span>
            <div className="os-progress-bar" aria-hidden="true">
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <span>{progressPct}%</span>
          </div>
        </header>

        <div className={selectedLesson && !selectedState.locked && aiCompact ? 'os-stage is-ai-compact' : 'os-stage'}>
          <div className={selectedLesson && !selectedState.locked ? 'os-stage-grid' : undefined}>
          <div className="os-workspace">
            {allComplete ? (
              <div className="os-banner">
                <p className="os-eyebrow">Course complete</p>
                <h2>{readyCourse.title}</h2>
                <p className="os-lead">You have finished every lesson in this workspace. Certificates are not issued in this pilot. You can carry learning evidence into Career OS.</p>
                <div className="os-actions">
                  <Link className="os-btn os-btn-primary" to="/career-os">Open Career OS</Link>
                </div>
              </div>
            ) : null}

            {selectedLesson ? (
              <div className="os-lesson-stage">
                <div className="os-lesson-head">
                <p className="os-kicker">
                  <span className="lx-type-pill">
                    <strong>{lessonTypeLabel(selectedLesson.type, selectedLesson.title)}</strong>
                  </span>
                  <span>{selectedLesson.duration ?? 'Self-paced'}</span>
                  <span>{currentModule?.title ?? 'Current module'}</span>
                </p>
                <h1>{selectedLesson.title}</h1>
                <p className={selectedState.complete ? 'os-status is-done' : 'os-status'}>
                  {selectedState.locked ? 'Locked until the previous lesson is complete.' : selectedState.complete ? 'Completed' : 'In progress'}
                </p>
                </div>
                {isAuthoredCourse(readyCourse.slug) && !selectedState.locked ? (
                  <LessonContextPanel lessonId={selectedLesson.id} />
                ) : (
                  <p className="os-lead" style={{ padding: '0 18px' }}>
                    {(isAuthoredCourse(readyCourse.slug) ? getDaLessonMeta(selectedLesson.id)?.objective : null)
                      ?? lessonObjective(selectedLesson)}
                  </p>
                )}

                <div className="os-paper">
                  {selectedState.locked ? (
                    <LockedLessonState
                      lessonTitle={selectedLesson.title}
                      requiredLessonTitle={
                        selectedState.requiredLessonKey
                          ? allLessons.find((lesson) => lesson.id === selectedState.requiredLessonKey)?.title
                          : null
                      }
                      continueTitle={
                        allLessons.find((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates) && !lessonStates[lesson.id]?.complete)?.title
                        ?? allLessons.find((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates))?.title
                        ?? null
                      }
                      onContinue={() => {
                        const target = allLessons.find((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates) && !lessonStates[lesson.id]?.complete)
                          ?? allLessons.find((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates))
                        if (target) handleLessonSelect(target.id)
                      }}
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
                {!selectedState.locked ? (
                  <LessonNavigation
                    prev={prevUnlocked}
                    next={nextUnlocked}
                    nextPreview={next}
                    courseSlug={readyCourse.slug}
                    accent={roleAccent}
                    onNavigate={handleLessonSelect}
                    completeAction={
                      selectedLesson.type === 'notes' && !selectedState.complete
                        ? { label: 'Mark lesson complete', onClick: () => { void handleLessonComplete() } }
                        : undefined
                    }
                  />
                ) : null}
              </div>
            ) : (
              <p className="os-lead">This lesson is unavailable. Choose another from the curriculum.</p>
            )}
          </div>
          {selectedLesson && !selectedState.locked ? (
            <Suspense fallback={<SkylentAiFallback compact={aiCompact} />}>
              <SkylentAI
                key={selectedLesson.id}
                courseSlug={readyCourse.slug}
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                compact={aiCompact}
              />
            </Suspense>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
