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
import type { VideoPlaybackSource } from '../lib/media/types'
import {
  downloadCourseCertificate,
  fetchCertificateState,
  fetchCourseWorkspace,
  fetchLessonMedia,
  fetchQuizQuestions,
  issueCertificate,
  markLessonAccess,
  markLessonComplete,
  submitQuizAttempt,
  updateAssignment,
  uploadAssignmentAttachment,
} from '../lib/lms-api'

function dashRoute(role?: string) {
  switch (role) {
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
    default: return '/dashboard/student'
  }
}

function lessonPhase(type: string) {
  if (type === 'assignment') return { label: 'BUILD', capability: 'Build and submit evidence.' }
  if (type === 'quiz') return { label: 'PROVE', capability: 'Solve, explain, and check your reasoning.' }
  if (type === 'notes') return { label: 'UNDERSTAND', capability: 'Explain the idea in your own words.' }
  return { label: 'LEARN', capability: 'Understand the concept before you apply it.' }
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
  const [quizStatus, setQuizStatus] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [lessonMedia, setLessonMedia] = useState<VideoPlaybackSource | undefined>()
  const [enrolling, setEnrolling] = useState(false)
  const [certificateBusy, setCertificateBusy] = useState(false)
  const [certificateMessage, setCertificateMessage] = useState<string | null>(null)

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
      setQuizStatus('idle')
      setLessonMedia(undefined)
      return
    }

    void markLessonAccess(slug, selectedLessonId).catch(() => undefined)

    if (lesson.type === 'quiz') {
      setQuizStatus('loading')
      fetchQuizQuestions(slug, selectedLessonId)
        .then((questions) => {
          setQuizQuestions(questions.map(q => ({ q: q.q, options: q.options })))
          setQuizStatus('ready')
        })
        .catch(() => {
          setQuizQuestions([])
          setQuizStatus('ready')
        })
    } else {
      setQuizQuestions([])
      setQuizStatus('idle')
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
      <div className="skylent-lms-state" style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.white }}>Course not found</div>
      </div>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <div className="skylent-lms-state" style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Loading course…</div>
      </div>
    )
  }

  if (access.status === 'login_required') {
    return (
      <div className="skylent-lms-state" style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Sign in to continue learning</div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 420 }}>Course content is available to enrolled learners after authentication.</p>
        <Link to="/login" style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Go to login →</Link>
      </div>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <div className="skylent-lms-state" style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{access.courseTitle}</div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 420 }}>You are signed in but not enrolled in this course yet.</p>
        <button
          type="button"
          disabled={enrolling}
          onClick={() => {
            setEnrolling(true)
            void enroll().finally(() => setEnrolling(false))
          }}
          style={{ background: roleAccent.primary, border: 'none', color: C.black, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: enrolling ? 'wait' : 'pointer' }}
        >
          {enrolling ? 'Enrolling…' : 'Enroll to start learning'}
        </button>
        <Link to="/dashboard/student" style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 13 }}>← Back to dashboard</Link>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Course not found</div>
        <Link to="/courses" style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 14 }}>← Back to courses</Link>
      </div>
    )
  }

  const selectedLesson = allLessons.find(l => l.id === selectedLessonId)
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

  async function handleAssignmentSubmit(text: string, file: File | null) {
    if (!slug || !selectedLesson) return
    if (file) await uploadAssignmentAttachment(slug, selectedLesson.id, file)
    await updateAssignment(slug, selectedLesson.id, 'submit', text)
    await handleLessonComplete()
  }

  async function handleCertificateDownload() {
    if (!slug) return
    setCertificateBusy(true)
    setCertificateMessage(null)
    try {
      const state = await fetchCertificateState(slug)
      if (!state.certificate) await issueCertificate(slug)
      await downloadCourseCertificate(slug)
    } catch (error) {
      setCertificateMessage(error instanceof Error ? error.message : 'Certificate is not available yet')
    } finally {
      setCertificateBusy(false)
    }
  }

  return (
    <div className="lms-shell skylent-lms-shell" style={{ display: 'flex', height: '100vh', background: C.canvas, overflow: 'hidden' }}>
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
          <div className="lms-header-progress">{progressPct}%</div>
        </header>

        <div className="lms-content">
          {(allComplete || showCertificate) && (
            <div className="lms-certificate-banner" style={{ background: roleAccent.subtle, border: `1px solid ${roleAccent.border}`, borderRadius: T.rCard, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ color: roleAccent.text, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>COURSE COMPLETE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16 }}>
                {certificateEligible
                  ? 'You completed the published requirements. Download records your name, this course, the issuer, the issue date, and a unique certificate ID. It is not an accredited or university credential.'
                  : 'Complete all requirements to unlock certificate eligibility.'}
              </div>
              {certificateEligible ? (
                <button
                  type="button"
                  onClick={() => { void handleCertificateDownload() }}
                  disabled={certificateBusy}
                  style={{ background: roleAccent.primary, border: 'none', color: C.black, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: certificateBusy ? 'wait' : 'pointer' }}
                >
                  {certificateBusy ? 'Preparing certificate…' : 'Download certificate'}
                </button>
              ) : null}
              {certificateMessage ? (
                <div style={{ color: '#fca5a5', fontSize: 13, marginTop: 12 }}>{certificateMessage}</div>
              ) : null}
            </div>
          )}

          {selectedLesson ? (
            <>
            <div className={`lms-learning-context lms-context-${selectedLesson.type}`}>
              <div className="lms-context-kicker"><span>{lessonTypeLabel(selectedLesson.type)}</span><span>{selectedLesson.duration ?? 'Self-paced'}</span></div>
              <div className="lms-context-module">{course.modules.find(module => module.lessons.some(lesson => lesson.id === selectedLesson.id))?.title ?? 'Current module'}</div>
              <h1>{selectedLesson.title}</h1>
              <p>{selectedLesson.type === 'video' ? 'Build a clear mental model, then use it in the next activity.' : selectedLesson.type === 'quiz' ? 'Work through the question carefully and use the feedback to sharpen your understanding.' : selectedLesson.type === 'assignment' ? 'Turn the brief into evidence you can stand behind.' : 'Read the key ideas, make a connection, and decide what you can do next.'}</p>
            </div>
            <div className={`lms-lesson-panel lms-lesson-frame lms-lesson-type-${selectedLesson.type}`} style={{ border: `1px solid ${tabAccent.border}`, borderLeft: `3px solid ${tabAccent.primary}`, borderRadius: T.rCard, background: 'rgba(255,255,255,0.015)', padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: tabAccent.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lessonTypeLabel(selectedLesson.type)}
                </span>
                <span style={{ fontSize: 11, color: selectedState.complete ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
                  {selectedState.complete ? 'Complete' : 'In progress'}
                </span>
              </div>
              <div className="lms-workspace-grid">
                <aside className="lms-workspace-brief">
                  <div className="lms-workspace-brief-label">YOUR BRIEF</div>
                  <div className="lms-workspace-phase">{lessonPhase(selectedLesson.type).label}</div>
                  <h2>{lessonPhase(selectedLesson.type).capability}</h2>
                  <p>{selectedLesson.type === 'video' ? 'Watch for the idea that changes how you see the problem. Pause, take notes, then continue.' : selectedLesson.type === 'quiz' ? 'Choose an answer, look at the feedback, and use it to decide what you understand next.' : selectedLesson.type === 'assignment' ? 'Make your thinking visible. A considered submission becomes evidence of what you can do.' : 'Read for the connection, not just the completion tick.'}</p>
                  <div className="lms-capability-list">
                    {['Explain', selectedLesson.type === 'assignment' ? 'Build' : selectedLesson.type === 'quiz' ? 'Solve' : 'Apply', 'Next step'].map((item, index) => <span key={item} className={index === 0 ? 'is-active' : ''}>{item}</span>)}
                  </div>
                  <div className="lms-brief-status"><span>{selectedState.complete ? 'Complete' : 'In progress'}</span><b>{selectedState.complete ? 'Ready for what comes next.' : 'Keep going. Your next action is here.'}</b></div>
                </aside>
                <div className="lms-workspace-activity">
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
                      quizStatus={selectedLesson.type === 'quiz' ? quizStatus : 'idle'}
                      onQuizSubmit={selectedLesson.type === 'quiz' ? handleQuizSubmit : undefined}
                      onAssignmentSubmit={selectedLesson.type === 'assignment' ? handleAssignmentSubmit : undefined}
                      lessonMedia={lessonMedia}
                      courseSlug={course.slug}
                    />
                  )}
                </div>
              </div>
              <LessonNavigation
                prev={prev}
                next={next && isLessonUnlocked(next.id, allLessons, lessonStates) ? next : null}
                courseSlug={course.slug}
                accent={roleAccent}
                onNavigate={handleLessonSelect}
              />
            </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Select a lesson from the curriculum.</div>
          )}
        </div>
      </div>
    </div>
  )
}
