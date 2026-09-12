import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { useAuth } from '../context/AuthContext'
import { EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent, getLmsTabAccent } from '../role-themes'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import type { QuizQuestion } from '../components/lms/AssessmentSurface'
import {
  computeCourseProgress,
  defaultTabForLesson,
  getAdjacentLessons,
  isLessonUnlocked,
  lessonTypeLabel,
} from '../components/lms/lms-utils'
import { useLmsCourse } from '../hooks/useLms'
import LockedLessonState from '../components/lms/LockedLessonState'
import ProductShell from '../design/ProductShell'
import { Rail, EmptyState, ButtonLink, Button } from '../design/primitives'
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
import { labsForLearningContext } from '../lib/virtual-labs'
import { labRunPath } from '../lib/safe-return'

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
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates, reload, enroll } = useLmsCourse(slug)
  const roleAccent = getLmsRoleAccent(user?.role)

  const course = access.status === 'ready' ? access.course : null
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : []
  const resumeLessonId = access.status === 'ready' ? access.workspace.resume.lessonId : ''
  const firstLessonId = resumeLessonId || allLessons[0]?.id || ''

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  useEffect(() => {
    if (firstLessonId && !lessonId && access.status === 'ready') {
      setSelectedLessonId(firstLessonId)
    }
  }, [firstLessonId, lessonId, access.status])

  useEffect(() => {
    if (selectedLessonId && slug && access.status === 'ready') {
      navigate(`/learn/${slug}/${selectedLessonId}`, { replace: true })
    }
  }, [selectedLessonId, slug, navigate, access.status])

  useEffect(() => {
    if (lessonId && allLessons.some(l => l.id === lessonId)) setSelectedLessonId(lessonId)
  }, [lessonId, allLessons])

  useEffect(() => {
    if (!slug || access.status !== 'ready' || !selectedLessonId) return
    const lesson = allLessons.find(l => l.id === selectedLessonId)
    if (!lesson) return
    const state = lessonStates[selectedLessonId]
    if (state?.locked) {
      setQuizQuestions([])
      setLessonMedia(undefined)
      return
    }

    void markLessonAccess(slug, selectedLessonId).catch(() => undefined)

    if (lesson.type === 'quiz') {
      setQuizLoading(true)
      fetchQuizQuestions(slug, selectedLessonId)
        .then((questions) => setQuizQuestions(questions.map(q => ({ q: q.q, options: q.options }))))
        .catch(() => setQuizQuestions([]))
        .finally(() => setQuizLoading(false))
    } else {
      setQuizQuestions([])
      setQuizLoading(false)
    }

    if (lesson.type === 'video') {
      fetchLessonMedia(slug, selectedLessonId)
        .then((payload) => setLessonMedia(payload.media))
        .catch(() => setLessonMedia(lesson.media ?? { provider: 'unavailable' }))
    } else {
      setLessonMedia(undefined)
    }
  }, [slug, access.status, selectedLessonId, allLessons, lessonStates])

  const refreshWorkspace = useCallback(async () => {
    if (!slug) return
    await reload()
  }, [slug, reload])

  if (!slug) {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Course not found"
              body="That address is not a course in the learning platform."
              action={<ButtonLink to="/courses">Back to courses</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState title="Loading course…" body="Fetching your lessons and progress." />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  if (access.status === 'login_required') {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Sign in to continue learning"
              body="Course content is available to enrolled learners after authentication."
              action={
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login', { state: { enrollTarget: { kind: 'course', slug } } })}
                >
                  Go to sign in
                </Button>
              }
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title={access.courseTitle}
              body={enrollError
                ? `${enrollError} Please try again.`
                : 'You are signed in but not enrolled in this course yet.'}
              action={
                <>
                  <Button
                    disabled={enrolling}
                    onClick={() => {
                      setEnrollError(null)
                      setEnrolling(true)
                      void enroll()
                        .catch((err: unknown) => {
                          setEnrollError(err instanceof Error ? err.message : 'Enrollment failed')
                        })
                        .finally(() => setEnrolling(false))
                    }}
                  >
                    {enrolling ? 'Enrolling…' : 'Enrol to start learning'}
                  </Button>
                  <ButtonLink to="/dashboard/student" variant="ghost">Back to dashboard</ButtonLink>
                </>
              }
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  if (!course) {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Course not found"
              body="That course is not in the learning platform."
              action={<ButtonLink to="/courses">Back to courses</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const selectedLesson = allLessons.find(l => l.id === selectedLessonId)
  const selectedModule = course.modules.find(module => module.lessons.some(lesson => lesson.id === selectedLessonId))
  const moduleLabs = selectedLesson
    ? labsForLearningContext({ moduleTitle: selectedModule?.title, lessonTitle: selectedLesson.title })
    : []
  const selectedState = selectedLessonId ? (lessonStates[selectedLessonId] ?? { ...EMPTY_LESSON_STATE }) : { ...EMPTY_LESSON_STATE }
  const { progressPct, allComplete } = computeCourseProgress(allLessons, lessonStates)
  const tabAccent = getLmsTabAccent(selectedLesson ? defaultTabForLesson(selectedLesson) : 'video')
  const { prev, next } = getAdjacentLessons(allLessons, selectedLessonId)
  const certificateEligible = access.workspace.enrollment.certificateEligible

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id, allLessons, lessonStates)) return
    setSelectedLessonId(id)
    setSidebarOpen(false)
  }

  async function handleLessonComplete() {
    if (!slug || !selectedLesson) return
    await markLessonComplete(slug, selectedLesson.id)
    await refreshWorkspace()
    const workspace = await fetchCourseWorkspace(slug)
    const updatedStates = Object.fromEntries(
      Object.entries(workspace.lessonStates).map(([key, state]) => [
        key,
        {
          videoWatched: state.videoWatched,
          quizPassed: state.quizPassed,
          assignmentSubmitted: state.assignmentSubmitted,
          complete: state.complete,
          locked: state.locked,
          requiredLessonKey: state.requiredLessonKey ?? null,
        },
      ]),
    )
    const remaining = allLessons.filter(l => l.id !== selectedLesson.id && !updatedStates[l.id]?.complete)
    if (remaining.length === 0) setTimeout(() => setShowCertificate(true), 600)
    else if (next && isLessonUnlocked(next.id, allLessons, updatedStates)) {
      setTimeout(() => setSelectedLessonId(next.id), 400)
    }
  }

  async function handleQuizSubmit(answers: Record<number, number>) {
    if (!slug || !selectedLesson) return false
    const ordered = quizQuestions.map((_, index) => answers[index] ?? -1)
    const result = await submitQuizAttempt(slug, selectedLesson.id, ordered)
    if (result.passed) await refreshWorkspace()
    return result.passed
  }

  async function handleAssignmentSubmit(text: string) {
    if (!slug || !selectedLesson) return
    await updateAssignment(slug, selectedLesson.id, 'submit', text)
    await handleLessonComplete()
  }

  return (
    <div className="lms-shell" style={{ display: 'flex', height: '100vh', background: C.canvas, overflow: 'hidden' }}>
      {sidebarOpen && (
        <div className="lms-sidebar-overlay" onClick={() => setSidebarOpen(false)} role="presentation" />
      )}
      <aside className={`lms-sidebar${sidebarOpen ? ' open' : ''}`}>
        <CurriculumRail
          course={course}
          lessonStates={lessonStates}
          selectedLessonId={selectedLessonId}
          accent={roleAccent}
          onSelectLesson={handleLessonSelect}
        />
      </aside>

      <div className="lms-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header className="lms-header">
          <button type="button" className="lms-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open curriculum">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <button type="button" onClick={() => navigate(dashRoute(user?.role))} className="lms-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <span className="lms-header-sep">·</span>
          <span className="lms-header-course">{course.title}</span>
          {selectedLesson && (
            <>
              <span className="lms-header-lesson-sep">·</span>
              <span className="lms-header-lesson">{selectedLesson.title}</span>
            </>
          )}
          <div className="lms-header-progress" style={{ color: roleAccent.text }}>{progressPct}%</div>
        </header>

        <div className="lms-content">
          <div className="lms-content-inner">
          {(allComplete || showCertificate) && (
            <div className="lms-certificate-banner" style={{ background: roleAccent.subtle, border: `1px solid ${roleAccent.border}`, borderRadius: T.rCard, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ color: roleAccent.text, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>COURSE COMPLETE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16 }}>
                {certificateEligible
                  ? 'You are eligible for a certificate. Download and issuance will be available in a later phase.'
                  : 'Complete all requirements to unlock certificate eligibility.'}
              </div>
            </div>
          )}

          {selectedLesson ? (
            <div className="lms-lesson-panel">
              <header className="lms-lesson-header" style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                    <div className="skylent-label" style={{ color: roleAccent.text, marginBottom: 8 }}>
                      {course.title}
                    </div>
                    <h1 style={{ color: C.white, fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.25 }}>
                      {selectedLesson.title}
                    </h1>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {lessonTypeLabel(selectedLesson.type)}
                      </span>
                      {selectedLesson.duration && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>{selectedLesson.duration}</span>
                      )}
                      <span style={{ fontSize: 11, color: selectedState.complete ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
                        {selectedState.complete ? 'Complete' : `${progressPct}% course progress`}
                      </span>
                    </div>
                  </div>
                </div>
              </header>
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
                  quizLoading={selectedLesson.type === 'quiz' ? quizLoading : false}
                  onQuizSubmit={selectedLesson.type === 'quiz' ? handleQuizSubmit : undefined}
                  onAssignmentSubmit={selectedLesson.type === 'assignment' ? handleAssignmentSubmit : undefined}
                  lessonMedia={lessonMedia}
                />
              )}
              {!selectedState.locked && moduleLabs.length > 0 && (
                <aside className="lms-lab-cta">
                  <p className="lms-lab-cta-kicker">Virtual lab for this lesson</p>
                  <p>Practice the same subject. We do not open an unrelated experiment from another course.</p>
                  <ul>
                    {moduleLabs.map(lab => (
                      <li key={lab.id}>
                        <Link to={labRunPath(lab.id, `/learn/${slug}/${selectedLessonId}`)}>{lab.title}</Link>
                        <span>{lab.subject} · {lab.duration} · runs in your browser</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
              <LessonNavigation
                prev={prev}
                next={next && isLessonUnlocked(next.id, allLessons, lessonStates) ? next : null}
                courseSlug={course.slug}
                accent={roleAccent}
                onNavigate={handleLessonSelect}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Select a lesson from the curriculum.</div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
