import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
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
  fetchCourseWorkspace,
  fetchLessonMedia,
  fetchQuizQuestions,
  markLessonAccess,
  markLessonComplete,
  submitQuizAttempt,
  updateAssignment,
  downloadCourseCertificate,
} from '../lib/lms-api'

import { roleRoute } from '../lib/auth-routing'
import LessonMaterialsPanel from '../components/lms/LessonMaterialsPanel'
import { buildLessonInitKey } from '../components/lms/lesson-init-key'

export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates, reload, enroll } = useLmsCourse(slug)
  const roleAccent = getLmsRoleAccent(user?.role)

  const course = access.status === 'ready' ? access.course : null
  const allLessons = useMemo(
    () => (course ? course.modules.flatMap((module) => module.lessons) : []),
    [course],
  )
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
  const [certificateDownloading, setCertificateDownloading] = useState(false)

  useEffect(() => {
    if (firstLessonId && !lessonId && access.status === 'ready') {
      setSelectedLessonId(firstLessonId)
    }
  }, [firstLessonId, lessonId, access.status])

  useEffect(() => {
    if (!selectedLessonId || !slug || access.status !== 'ready') return
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

  const selectedLessonLocked =
    access.status === 'ready' && selectedLessonId
      ? (lessonStates[selectedLessonId]?.locked ?? false)
      : true
  const selectedLessonType = allLessons.find((lesson) => lesson.id === selectedLessonId)?.type
  const selectedLessonFallbackMedia = useMemo(
    () => allLessons.find((lesson) => lesson.id === selectedLessonId)?.media,
    [allLessons, selectedLessonId],
  )
  const lessonInitKey =
    access.status === 'ready'
      ? buildLessonInitKey({
          slug,
          lessonId: selectedLessonId,
          locked: selectedLessonLocked,
          lessonType: selectedLessonType,
        })
      : null
  const completedLessonInitKeyRef = useRef<string | null>(null)
  const lessonInitContextRef = useRef({
    slug,
    selectedLessonId,
    selectedLessonType,
    selectedLessonLocked,
    selectedLessonFallbackMedia,
  })
  lessonInitContextRef.current = {
    slug,
    selectedLessonId,
    selectedLessonType,
    selectedLessonLocked,
    selectedLessonFallbackMedia,
  }

  useEffect(() => {
    if (access.status !== 'ready' || !lessonInitKey) return
    if (completedLessonInitKeyRef.current === lessonInitKey) return
    completedLessonInitKeyRef.current = lessonInitKey

    const {
      slug: activeSlug,
      selectedLessonId: activeLessonId,
      selectedLessonType: activeLessonType,
      selectedLessonLocked: activeLessonLocked,
      selectedLessonFallbackMedia: activeFallbackMedia,
    } = lessonInitContextRef.current

    if (!activeSlug || !activeLessonId) return

    if (activeLessonLocked) {
      setQuizQuestions([])
      setLessonMedia(undefined)
      return
    }

    void markLessonAccess(activeSlug, activeLessonId).catch(() => undefined)

    if (activeLessonType === 'quiz') {
      setQuizLoading(true)
      fetchQuizQuestions(activeSlug, activeLessonId)
        .then((questions) => setQuizQuestions(questions.map(q => ({ q: q.q, options: q.options }))))
        .catch(() => setQuizQuestions([]))
        .finally(() => setQuizLoading(false))
    } else {
      setQuizQuestions([])
      setQuizLoading(false)
    }

    if (activeLessonType === 'video') {
      fetchLessonMedia(activeSlug, activeLessonId)
        .then((payload) => setLessonMedia(payload.media))
        .catch(() => setLessonMedia(activeFallbackMedia ?? { provider: 'unavailable' }))
    } else {
      setLessonMedia(undefined)
    }
  }, [access.status, lessonInitKey])

  const refreshWorkspace = useCallback(async () => {
    if (!slug) return
    await reload()
  }, [slug, reload])

  if (!slug) {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.white }}>Course not found</div>
      </div>
    )
  }

  if (!authReady || access.status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading course…</div>
      </div>
    )
  }

  if (access.status === 'login_required') {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Sign in to continue learning</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 420 }}>Course content is available to enrolled learners after authentication.</p>
        <Link to="/login" state={{ enrollTarget: { kind: 'course', slug } }} style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Go to login →</Link>
      </div>
    )
  }

  if (access.status === 'not_enrolled') {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{access.courseTitle}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 420 }}>You are signed in but not enrolled in this course yet.</p>
        {enrollError && (
          <p role="alert" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, margin: 0, textAlign: 'center', maxWidth: 420 }}>
            {enrollError} Please try again.
          </p>
        )}
        <button
          type="button"
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
          style={{ background: roleAccent.primary, border: 'none', color: C.black, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: enrolling ? 'wait' : 'pointer' }}
        >
          {enrolling ? 'Enrolling…' : 'Enroll to start learning'}
        </button>
        <Link to={roleRoute(user?.role ?? 'student')} style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 13 }}>← Back to dashboard</Link>
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
  const notesContent =
    selectedLesson?.type === 'notes' && selectedLesson.notesBody?.trim()
      ? { body: selectedLesson.notesBody }
      : null
  const showMaterialsPanel = Boolean(selectedLesson && !selectedState.locked && slug)

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

  async function handleAssignmentSubmit(input: { text: string; attachmentIds: string[] }) {
    if (!slug || !selectedLesson) return
    await updateAssignment(slug, selectedLesson.id, 'submit', input.text, input.attachmentIds)
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
          <button type="button" onClick={() => navigate(roleRoute(user?.role ?? 'student'))} className="lms-back-btn">
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
                  ? 'You have completed all course requirements. Download your certificate below.'
                  : 'Complete all requirements to unlock certificate eligibility.'}
              </div>
              {certificateEligible && (
                <button
                  type="button"
                  disabled={certificateDownloading}
                  onClick={() => {
                    if (!slug) return
                    setCertificateDownloading(true)
                    void downloadCourseCertificate(slug)
                      .then((blob) => {
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `${slug}-certificate.pdf`
                        link.click()
                        URL.revokeObjectURL(url)
                      })
                      .catch(() => undefined)
                      .finally(() => setCertificateDownloading(false))
                  }}
                  style={{
                    background: roleAccent.primary,
                    border: 'none',
                    color: C.black,
                    padding: '10px 18px',
                    borderRadius: T.rControl,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: certificateDownloading ? 'wait' : 'pointer',
                  }}
                >
                  {certificateDownloading ? 'Preparing…' : 'Download certificate'}
                </button>
              )}
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
                <>
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
                  notesContent={notesContent}
                  hasMaterials={showMaterialsPanel}
                  courseSlug={slug}
                />
                {showMaterialsPanel && slug && (
                  <div style={{ marginTop: 24 }}>
                    <LessonMaterialsPanel
                      courseSlug={slug}
                      lessonKey={selectedLesson.id}
                      accent={{ ...tabAccent, text: roleAccent.text }}
                    />
                  </div>
                )}
                </>
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
