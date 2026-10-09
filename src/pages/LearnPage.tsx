import { useState, useEffect, useCallback, useRef, lazy, Suspense, type ReactNode } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import { LessonContextPanel } from '../components/product/ProductLanguage'
import { AiMark, ProductSlice } from '../components/skylent/primitives'
import { getLessonMeta } from '../content/course-lookups'
import { isAuthoredCourse } from '../lib/live-intents'
import type { QuizQuestion } from '../components/lms/AssessmentSurface'
import { courseProductProfile } from '../lib/course-product'
import {
  getAdjacentLessons,
  isLessonUnlocked,
  lessonObjective,
  learnerErrorMessage,
  lessonTypeLabel,
  productStepForLesson,
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
import { TermsConsent } from '../components/legal/TermsConsent'
import LessonSlide from '../components/lms/LessonSlide'
import './LearnWorkspace.css'

const TERMS_REQUIRED = '__terms_required__'
import '../components/lms/SkylentAI.css'

const SkylentAI = lazy(() => import('../components/lms/SkylentAI'))

/** One accent for the whole player: cobalt, from the system tokens. */
const ACCENT = {
  primary: 'var(--skylent-color-accent)',
  subtle: 'var(--skylent-color-accent-soft)',
  border: 'var(--skylent-color-accent-border)',
  text: 'var(--skylent-color-accent)',
}

const SLICE = ['Learn', 'Practice', 'Build', 'Prove'] as const

function SkylentAiFallback({ compact }: { compact: boolean }) {
  return (
    <aside className={compact ? 'os-ai is-compact os-ai-fallback' : 'os-ai os-ai-fallback'} aria-hidden="true">
      <AiMark />
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

function StateScreen({ children }: { children: ReactNode }) {
  return (
    <div className="os-state">
      <div className="os-state-body">{children}</div>
    </div>
  )
}

export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates, reload, enroll } = useLmsCourse(slug)

  const course = access.status === 'ready' ? access.course : null
  const allLessons = course ? course.modules.flatMap((module) => module.lessons) : []
  const resumeLessonId = access.status === 'ready' ? access.workspace.resume.lessonId : ''
  const firstLessonId = resumeLessonId || allLessons[0]?.id || ''

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
  const [aiCompact, setAiCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1200px)').matches)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizStatus, setQuizStatus] = useState<'loading' | 'ready' | 'error'>('ready')
  const [quizAttempt, setQuizAttempt] = useState(0)
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLElement>(null)

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
    stageRef.current?.scrollTo({ top: 0 })
  }, [selectedLessonId])

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
          // Correct answers stay server-side. The browser receives question text/options only.
          setQuizQuestions(questions.map((q) => ({
            q: q.q,
            options: q.options,
          })))
          setQuizStatus('ready')
        })
        .catch(() => {
          // Not "no questions": the request failed, and the learner can retry it.
          setQuizQuestions([])
          setQuizStatus('error')
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
  }, [slug, access.status, selectedLessonId, selectedLessonType, selectedLessonLocked, quizAttempt])

  const refreshWorkspace = useCallback(async () => {
    if (!slug) return
    await reload({ silent: true })
  }, [slug, reload])

  if (!slug) {
    return (
      <StateScreen>
        <p className="os-eyebrow">My learning</p>
        <h1>Course not found</h1>
        <p>This address does not point to a course.</p>
        <div className="os-actions">
          <Link className="os-btn os-btn-primary" to="/dashboard/student">Back to my learning</Link>
        </div>
      </StateScreen>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <StateScreen>
        <div className="os-state-skeleton" role="status" aria-label="Loading the course">
          <span className="os-skeleton" style={{ width: '30%' }} />
          <span className="os-skeleton" style={{ height: 28, width: '80%' }} />
          <span className="os-skeleton" />
          <span className="os-skeleton" style={{ width: '90%' }} />
          <span className="os-skeleton" style={{ width: '60%' }} />
        </div>
      </StateScreen>
    )
  }

  if (access.status === 'login_required') {
    return (
      <StateScreen>
        <p className="os-eyebrow">My learning</p>
        <h1>Sign in to continue learning</h1>
        <p>Course content is available after you sign in and enrol.</p>
        <div className="os-actions">
          <Link className="os-btn os-btn-primary" to="/login" state={{ returnTo: location.pathname }}>Go to sign in</Link>
        </div>
      </StateScreen>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <StateScreen>
        <p className="os-eyebrow">Not enrolled</p>
        <h1>{access.courseTitle}</h1>
        <p>You are signed in but not enrolled in this course yet.</p>
        <TermsConsent checked={termsAccepted} onChange={setTermsAccepted} action="enrolling" showError={enrollError === TERMS_REQUIRED} />
        <div className="os-actions">
          <button
            type="button"
            className="os-btn os-btn-primary"
            disabled={enrolling}
            onClick={() => {
              if (!termsAccepted) {
                setEnrollError(TERMS_REQUIRED)
                return
              }
              setEnrolling(true)
              setEnrollError(null)
              void enroll()
                .catch((err) => setEnrollError(learnerErrorMessage(err, 'Enrolment could not be completed right now. Try again in a moment.')))
                .finally(() => setEnrolling(false))
            }}
          >
            {enrolling ? 'Enrolling…' : 'Enrol to start learning'}
          </button>
          <Link className="os-link" to="/dashboard/student">Back to my learning</Link>
        </div>
        {enrollError && enrollError !== TERMS_REQUIRED ? <p className="os-error" role="alert">{enrollError}</p> : null}
      </StateScreen>
    )
  }

  if (access.status !== 'ready') {
    return (
      <StateScreen>
        <p className="os-eyebrow">My learning</p>
        <h1>This course could not be opened</h1>
        <p>The learning service did not respond. Check your connection, then try again.</p>
        <div className="os-actions">
          <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
          <Link className="os-link" to="/dashboard/student">Back to my learning</Link>
        </div>
      </StateScreen>
    )
  }

  const readyCourse = access.course
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedState = selectedLessonId ? (lessonStates[selectedLessonId] ?? { ...EMPTY_LESSON_STATE }) : { ...EMPTY_LESSON_STATE }
  // Course progress exactly as the server computed it for this enrolment.
  const { progressPct, completedCount, totalLessons, allComplete } = access.workspace.progress
  const { prev, next } = getAdjacentLessons(allLessons, selectedLessonId)
  const prevUnlocked = prev && isLessonUnlocked(prev.id, allLessons, lessonStates) ? prev : null
  const currentModule = selectedLesson
    ? readyCourse.modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLesson.id))
    : null
  const moduleIndex = currentModule
    ? readyCourse.modules.findIndex((module) => module.id === currentModule.id) + 1
    : 0
  const lessonIndex = selectedLesson
    ? allLessons.findIndex((lesson) => lesson.id === selectedLesson.id) + 1
    : 0
  const nextUnlocked = next && isLessonUnlocked(next.id, allLessons, lessonStates) ? next : null
  const showAi = Boolean(selectedLesson && !selectedState.locked)
  // Mirrors the server's academic policy (skylent-ai/integrity.ts deriveAcademicPolicy) so the panel
  // states the rule that will actually apply. The server still enforces it.
  const assessmentOpen = Boolean(
    selectedLesson &&
      ((selectedLesson.type === 'quiz' && !selectedState.quizPassed && !selectedState.complete) ||
        (selectedLesson.type === 'assignment' && !selectedState.assignmentSubmitted && !selectedState.complete)),
  )
  const profile = courseProductProfile(readyCourse.slug)

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id, allLessons, lessonStates)) return
    setSelectedLessonId(id)
    setSidebarOpen(false)
    setActionError(null)
  }

  async function handleLessonComplete(): Promise<boolean> {
    if (!slug || !selectedLesson) return false
    setActionError(null)
    try {
      await markLessonComplete(slug, selectedLesson.id)
      await refreshWorkspace()
      return true
    } catch (err) {
      setActionError(learnerErrorMessage(err, 'Your progress could not be saved. Try again in a moment.'))
      return false
    }
  }

  /** Records completion with the server, then moves to the next lesson it has just unlocked. */
  async function handleCompleteAndContinue() {
    if (completing) return
    setCompleting(true)
    const saved = await handleLessonComplete()
    setCompleting(false)
    if (saved && next) {
      setSelectedLessonId(next.id)
      setActionError(null)
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
      // A failed request is not a failed attempt: rethrow so the check keeps the learner's answers.
      setActionError(learnerErrorMessage(err, 'Your answers could not be submitted. They have not been graded. Try again.'))
      throw err
    }
  }

  /** True only once the server has recorded the submission. */
  async function handleAssignmentSubmit(text: string): Promise<boolean> {
    if (!slug || !selectedLesson) return false
    setActionError(null)
    try {
      await updateAssignment(slug, selectedLesson.id, 'submit', text)
    } catch (err) {
      setActionError(learnerErrorMessage(err, 'Your assignment could not be submitted. Your text is still here. Try again.'))
      return false
    }
    await handleLessonComplete()
    return true
  }

  let primaryAction: { label: string; onClick: () => void; busy?: boolean } | undefined
  let navHint: string | undefined
  if (selectedLesson && !selectedState.locked) {
    if (selectedLesson.type === 'notes' && !selectedState.complete) {
      primaryAction = {
        label: next ? 'Complete and continue' : 'Complete lesson',
        onClick: () => { void handleCompleteAndContinue() },
        busy: completing,
      }
    } else if (selectedState.complete && nextUnlocked) {
      primaryAction = { label: 'Continue', onClick: () => handleLessonSelect(nextUnlocked.id) }
    } else if (!selectedState.complete && next) {
      navHint =
        selectedLesson.type === 'quiz'
          ? 'opens when you pass this check'
          : selectedLesson.type === 'assignment'
            ? 'opens when you submit this assignment'
            : 'opens when you finish this lesson'
    }
  }

  return (
    <div className="os-shell">
      <header className="os-top">
        <div className="os-top-lead">
          <button
            ref={menuBtnRef}
            type="button"
            className="os-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open course outline"
            aria-expanded={sidebarOpen}
            aria-controls="os-curriculum"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link className="os-top-back" to={dashRoute(user?.role)} aria-label="Back to my learning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>My learning</span>
          </Link>
          <span className="os-top-rule" aria-hidden="true" />
          <div className="os-top-context">
            <div className="os-top-module">
              {currentModule ? `Module ${moduleIndex} · ${currentModule.title}` : 'Course'}
            </div>
            <div className="os-top-course">{readyCourse.title}</div>
          </div>
        </div>
        <div className="sky-on-navy">
          <ProductSlice
            steps={SLICE}
            current={selectedLesson ? productStepForLesson(selectedLesson, allLessons) : undefined}
            label="Where this lesson sits"
          />
        </div>
        <div className="os-top-progress">
          <span>{completedCount} of {totalLessons} complete · {progressPct}%</span>
          <div
            className="os-progress-bar"
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
          >
            <span style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <div className="os-body">
        {sidebarOpen ? (
          <div className="os-overlay" onClick={() => setSidebarOpen(false)} role="presentation" />
        ) : null}
        <aside
          className={sidebarOpen ? 'os-rail is-open' : 'os-rail'}
          id="os-curriculum"
          aria-label="Course outline"
          aria-hidden={compact && !sidebarOpen}
          {...(compact && !sidebarOpen ? { inert: true } : {})}
          {...(sidebarOpen && compact ? { role: 'dialog', 'aria-modal': true } : {})}
        >
          <CurriculumRail
            course={readyCourse}
            lessonStates={lessonStates}
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleLessonSelect}
            onClose={() => {
              setSidebarOpen(false)
              menuBtnRef.current?.focus()
            }}
          />
        </aside>

        <main ref={stageRef} className={showAi && aiCompact ? 'os-stage is-ai-compact' : 'os-stage'}>
          <div className="os-workspace">
            {allComplete ? (
              <div className="os-banner">
                <p className="os-eyebrow">Course complete</p>
                <h2>{readyCourse.title}</h2>
                <p className="os-lead">You have completed every lesson. Claim your certificate from My learning, and add your project to Career OS when you want it on your profile.</p>
                <div className="os-actions">
                  <Link className="os-btn os-btn-primary" to="/dashboard/student">Go to my learning</Link>
                  <Link className="os-btn os-btn-ghost" to="/career-os">Open Career OS</Link>
                </div>
              </div>
            ) : null}

            {selectedLesson ? (
              <article className="os-lesson-stage">
                {!selectedState.locked && selectedLesson.type !== 'video' && isAuthoredCourse(readyCourse.slug) ? (
                  <LessonSlide
                    courseSlug={readyCourse.slug}
                    lessonId={selectedLesson.id}
                    title={selectedLesson.title}
                    kicker={`${moduleIndex ? `Module ${moduleIndex} · ` : ''}Lesson ${lessonIndex} · ${lessonTypeLabel(selectedLesson.type, selectedLesson.title)}`}
                  />
                ) : null}
                <div className="os-lesson-head">
                  <p className="os-kicker">
                    {moduleIndex ? `Module ${moduleIndex} · ` : ''}
                    Lesson {lessonIndex} · {lessonTypeLabel(selectedLesson.type, selectedLesson.title)} · {selectedLesson.duration ?? 'Self-paced'}
                  </p>
                  <h1>{selectedLesson.title}</h1>
                  <div className="os-lesson-sub">
                    <span className={selectedState.locked ? 'os-status is-idle' : selectedState.complete ? 'os-status is-done' : 'os-status'}>
                      {selectedState.locked ? 'Locked' : selectedState.complete ? 'Completed' : 'In progress'}
                    </span>
                    {profile && !selectedState.locked ? (
                      <div className="os-tools">
                        {profile.lab ? (
                          <Link className="os-chip" to={profile.lab.href(selectedLesson.id)} title={profile.lab.note}>
                            {profile.lab.label}
                          </Link>
                        ) : profile.labOmission ? (
                          <span className="os-chip is-mute" title={profile.labOmission}>No lab in this course</span>
                        ) : null}
                        {profile.project ? (
                          <Link className="os-chip" to={profile.project.href} title={profile.project.note}>
                            {profile.project.label}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                {selectedState.locked ? null : isAuthoredCourse(readyCourse.slug) ? (
                  <LessonContextPanel courseSlug={readyCourse.slug} lessonId={selectedLesson.id} />
                ) : (
                  <p className="os-lead">
                    {getLessonMeta(readyCourse.slug, selectedLesson.id)?.objective ?? lessonObjective(selectedLesson)}
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
                      accent={ACCENT}
                      onComplete={() => { void handleLessonComplete() }}
                      quizQuestions={selectedLesson.type === 'quiz' ? quizQuestions : undefined}
                      quizStatus={selectedLesson.type === 'quiz' ? quizStatus : undefined}
                      onQuizRetry={() => setQuizAttempt((value) => value + 1)}
                      onQuizSubmit={selectedLesson.type === 'quiz' ? handleQuizSubmit : undefined}
                      onAssignmentSubmit={selectedLesson.type === 'assignment' ? handleAssignmentSubmit : undefined}
                      lessonMedia={lessonMedia}
                      courseSlug={readyCourse.slug}
                    />
                  )}
                </div>
                {actionError ? <p className="os-error" role="alert">{actionError}</p> : null}
                {!selectedState.locked ? (
                  <LessonNavigation
                    prev={prevUnlocked}
                    next={nextUnlocked}
                    nextPreview={next}
                    onNavigate={handleLessonSelect}
                    primaryAction={primaryAction}
                    hint={navHint}
                  />
                ) : null}
              </article>
            ) : (
              <div className="os-locked">
                <p className="os-eyebrow">Not found</p>
                <h2>This lesson is not in the course</h2>
                <p className="os-lead">Choose another lesson from the outline.</p>
              </div>
            )}
          </div>
        </main>

        {showAi && selectedLesson ? (
          <Suspense fallback={<SkylentAiFallback compact={aiCompact} />}>
            <SkylentAI
              key={selectedLesson.id}
              courseSlug={readyCourse.slug}
              lessonId={selectedLesson.id}
              lessonTitle={selectedLesson.title}
              lessonNumber={lessonIndex}
              lessonKind={selectedLesson.type}
              assessmentOpen={assessmentOpen}
              compact={aiCompact}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}
