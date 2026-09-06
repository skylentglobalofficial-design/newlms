import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { courses } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState, EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent, getLmsTabAccent } from '../role-themes'
import CurriculumRail from '../components/lms/CurriculumRail'
import { LessonContentView, LessonNavigation } from '../components/lms/LessonContent'
import {
  computeCourseProgress,
  defaultTabForLesson,
  getAdjacentLessons,
  isLessonUnlocked,
  lessonTypeLabel,
} from '../components/lms/lms-utils'

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
  const { user } = useAuth()
  const demo = useDemoState()
  const roleAccent = getLmsRoleAccent(user?.role)

  const course = courses.find(c => c.slug === slug)
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : []
  const firstLessonId = allLessons[0]?.id ?? ''
  const lessonStates = slug ? demo.getLessonStates(slug) : {}

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)

  useEffect(() => {
    if (selectedLessonId && slug) navigate(`/learn/${slug}/${selectedLessonId}`, { replace: true })
  }, [selectedLessonId, slug, navigate])

  useEffect(() => {
    if (lessonId && allLessons.some(l => l.id === lessonId)) setSelectedLessonId(lessonId)
  }, [lessonId, allLessons])

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

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id, allLessons, lessonStates)) return
    setSelectedLessonId(id)
    setSidebarOpen(false)
  }

  function handleLessonComplete() {
    if (!slug || !selectedLesson) return
    const patch = selectedLesson.type === 'video'
      ? { videoWatched: true, complete: true }
      : selectedLesson.type === 'quiz'
        ? { quizPassed: true, complete: true }
        : selectedLesson.type === 'assignment'
          ? { assignmentSubmitted: true, complete: true }
          : { complete: true }
    demo.updateLesson(slug, selectedLesson.id, patch)
    const remaining = allLessons.filter(l => l.id !== selectedLesson.id && !lessonStates[l.id]?.complete)
    if (remaining.length === 0) setTimeout(() => setShowCertificate(true), 600)
    else if (next && isLessonUnlocked(next.id, allLessons, { ...lessonStates, [selectedLesson.id]: { ...selectedState, ...patch } })) {
      setTimeout(() => setSelectedLessonId(next.id), 400)
    }
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
          <div className="lms-header-progress">{progressPct}%</div>
        </header>

        <div className="lms-content">
          {(allComplete || showCertificate) && (
            <div className="lms-certificate-banner" style={{ background: roleAccent.subtle, border: `1px solid ${roleAccent.border}`, borderRadius: T.rCard, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ color: roleAccent.text, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>COURSE COMPLETE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16 }}>Certificate issuance is not available in this demo workspace.</div>
            </div>
          )}

          {selectedLesson ? (
            <div className={`lms-lesson-panel lms-lesson-type-${selectedLesson.type}`} style={{ border: `1px solid ${tabAccent.border}`, borderLeft: `3px solid ${tabAccent.primary}`, borderRadius: T.rCard, background: 'rgba(255,255,255,0.015)', padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: tabAccent.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lessonTypeLabel(selectedLesson.type)}
                </span>
                <span style={{ fontSize: 11, color: selectedState.complete ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
                  {selectedState.complete ? 'Complete' : 'In progress'}
                </span>
              </div>
              <LessonContentView
                lesson={selectedLesson}
                lessonState={selectedState}
                accent={{ ...tabAccent, text: roleAccent.text }}
                onComplete={handleLessonComplete}
              />
              <LessonNavigation
                prev={prev}
                next={next && isLessonUnlocked(next.id, allLessons, lessonStates) ? next : null}
                courseSlug={course.slug}
                accent={roleAccent}
                onNavigate={handleLessonSelect}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Select a lesson from the curriculum.</div>
          )}
        </div>
      </div>
    </div>
  )
}
