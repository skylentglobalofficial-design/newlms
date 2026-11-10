import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { GlassSurface } from '../components/foundation'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import {
  claimDefaultFacultyCourses,
  createFacultyLecture,
  createFacultyModule,
  deleteFacultyLecture,
  deleteFacultyMaterial,
  fetchFacultyDashboard,
  fetchFacultyDoubts,
  fetchFacultySubmissionDetail,
  gradeFacultySubmission,
  resolveFacultyDoubt,
  updateFacultyLecture,
  updateFacultyModule,
  uploadFacultyLessonMaterial,
  type FacultyDashboard,
  type FacultyDoubtItem,
  type FacultySubmission,
  type FacultySubmissionDetail,
} from '../lib/faculty-api'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview & SLA', short: 'Home' },
  { id: 'classes', label: 'Assigned Courses', short: 'Courses' },
  { id: 'curriculum', label: 'Add Lectures & PDFs', short: 'Author' },
  { id: 'assignments', label: 'V1→V2 Grading Studio', short: 'Grade' },
  { id: 'assessments', label: '20-Min Doubt Queue', short: 'Doubts' },
  { id: 'learners', label: 'Learner Cohort', short: 'Learners' },
  { id: 'settings', label: 'Rubric & Settings', short: 'Settings' },
]

const accent = getRoleAccent('faculty')

const canvasSectionStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderTop: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: '22px 24px',
  boxShadow: '0 10px 28px -12px rgba(15, 23, 42, 0.08)',
} as const

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 13.5,
  fontFamily: 'var(--font-body)',
} as const

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'classes') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'curriculum') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'assignments') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'assessments') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'learners') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const base64 = result.includes(',') ? result.split(',')[1] ?? '' : result
      resolve(base64)
    }
    reader.onerror = () =>reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function TeachingEmptyState({
  message,
  onOpenCurriculum,
  onQuickActivate,
}: {
  message?: string | null
  onOpenCurriculum?: () => void
  onQuickActivate?: () => void
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 65%)',
      border: '1px solid #ddd6fe',
      borderTop: '3px solid #5142b5',
      borderRadius: 16,
      padding: '22px 24px',
      boxShadow: '0 4px 16px -8px rgba(15, 23, 42, 0.06)',
    }}>
      <h1 style={{ color: '#0f172a', margin: '0 0 6px', fontSize: 22, fontFamily: 'var(--font-display)' }}>
        Faculty Workspace
      </h1>
      <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 14px', lineHeight: 1.55, maxWidth: 640 }}>
        {message ?? 'Manage your courses, upload lecture videos and study materials, and review student submissions.'}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {onQuickActivate ? (
          <button
            type="button"
            onClick={onQuickActivate}
            style={{
              background: '#5142b5',
              color: '#ffffff',
              border: '1px solid #5142b5',
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Load My 6 Teaching Courses
          </button>
        ) : null}
        {onOpenCurriculum ? (
          <button
            type="button"
            onClick={onOpenCurriculum}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            My Courses &amp; Upload Video / Material
          </button>
        ) : null}
      </div>
    </div>
  )
}

function CatalogOverview({
  programCount,
  courseCount,
  pendingCount,
  onReview,
  onAuthorLecture,
}: {
  programCount: number
  courseCount: number
  pendingCount: number
  onReview: () => void
  onAuthorLecture: () => void
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 65%)',
      border: '1px solid #ddd6fe',
      borderTop: '3px solid #5142b5',
      borderRadius: 16,
      padding: '22px 24px',
      boxShadow: '0 4px 16px -8px rgba(15, 23, 42, 0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 4px', fontSize: 22, fontFamily: 'var(--font-display)' }}>
            Faculty Workspace
          </h1>
          <p style={{ color: '#475569', fontSize: 13.5, margin: 0 }}>
            Manage course modules, upload lecture videos and files, and grade student submissions (20-minute doubt &amp; rubric SLA).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onAuthorLecture}
            style={{
              background: '#5142b5',
              color: '#ffffff',
              border: '1px solid #5142b5',
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Lecture or Upload Video / PDF
          </button>
          <button
            type="button"
            onClick={onReview}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Review Submissions ({pendingCount})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: 11.5, display: 'block' }}>Assigned courses</span>
          <strong style={{ fontSize: 22, color: '#0f172a' }}>{courseCount}</strong>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: 11.5, display: 'block' }}>Linked programmes</span>
          <strong style={{ fontSize: 22, color: '#0f172a' }}>{programCount}</strong>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: 11.5, display: 'block' }}>Submissions to grade</span>
          <strong style={{ fontSize: 22, color: '#5142b5' }}>{pendingCount}</strong>
        </div>
      </div>
    </div>
  )
}

function FacultyLectureAuthoringStudio({
  courses,
  onReload,
}: {
  courses: FacultyDashboard['courses']
  onReload: () => void
}) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(courses[0]?.slug ?? '')
  const currentCourse = courses.find((c) => c.slug === selectedCourseSlug) ?? courses[0]
  const modules = currentCourse?.modules ?? []
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [nodeType, setNodeType] = useState<'NOTES' | 'VIDEO' | 'LAB' | 'ASSIGNMENT' | 'PROJECT'>('NOTES')
  const [summary, setSummary] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [newModTitle, setNewModTitle] = useState('')
  const [editingModId, setEditingModId] = useState<string | null>(null)
  const [editModTitle, setEditModTitle] = useState('')
  const [editingLecId, setEditingLecId] = useState<string | null>(null)
  const [editLecTitle, setEditLecTitle] = useState('')
  const [editLecType, setEditLecType] = useState('NOTES')
  const [editLecSummary, setEditLecSummary] = useState('')
  const [editLecUrl, setEditLecUrl] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentCourse && currentCourse.modules?.[0] && !currentCourse.modules.some((m) => m.id === selectedModuleId)) {
      setSelectedModuleId(currentCourse.modules[0].id)
    }
  }, [currentCourse?.slug, currentCourse?.modules?.length])

  async function handleClaimCourses() {
    setSubmitting(true)
    setErrMsg(null)
    try {
      await claimDefaultFacultyCourses()
      setStatusMsg('Activated your Teacher workspace and linked all courses!')
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not activate courses')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateModule(e: FormEvent) {
    e.preventDefault()
    if (!currentCourse?.id || !newModTitle.trim()) return
    setSubmitting(true)
    setStatusMsg(null)
    setErrMsg(null)
    try {
      const created = await createFacultyModule(currentCourse.id, { title: newModTitle.trim() })
      setNewModTitle('')
      setSelectedModuleId(created.id)
      setStatusMsg(`Added Module ${created.position}: "${created.title}" to ${currentCourse.title}.`)
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not add module')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveEditModule(e: FormEvent, modId: string) {
    e.preventDefault()
    if (!currentCourse?.id || !editModTitle.trim()) return
    setStatusMsg(null)
    setErrMsg(null)
    try {
      await updateFacultyModule(currentCourse.id, modId, { title: editModTitle.trim() })
      setEditingModId(null)
      setStatusMsg('Updated module title.')
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not update module')
    }
  }

  async function handleCreateLecture(e: FormEvent) {
    e.preventDefault()
    if (!currentCourse?.id || !selectedModuleId) {
      setErrMsg('Select an assigned course and module first.')
      return
    }
    setSubmitting(true)
    setStatusMsg(null)
    setErrMsg(null)
    try {
      const created = await createFacultyLecture(currentCourse.id, {
        moduleId: selectedModuleId,
        title: title.trim(),
        summary: summary.trim() || undefined,
        referenceUrl: referenceUrl.trim() || undefined,
        nodeType,
      })
      let fileNote = ''
      if (pendingFile) {
        const dataBase64 = await fileToBase64(pendingFile)
        const saved = await uploadFacultyLessonMaterial(currentCourse.id, created.id, {
          fileName: pendingFile.name,
          contentType: pendingFile.type || 'application/octet-stream',
          dataBase64,
        })
        fileNote = ` + uploaded "${saved.fileName}"`
      }
      setTitle('')
      setSummary('')
      setReferenceUrl('')
      setPendingFile(null)
      setStatusMsg(`Added ${created.nodeType} lecture "${created.title}"${fileNote} to ${currentCourse.title}.`)
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not add lecture')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveEditLecture(e: FormEvent, lectureId: string) {
    e.preventDefault()
    if (!currentCourse?.id) return
    setStatusMsg(null)
    setErrMsg(null)
    try {
      await updateFacultyLecture(currentCourse.id, lectureId, {
        title: editLecTitle.trim(),
        nodeType: editLecType,
        summary: editLecSummary.trim() || null,
        referenceUrl: editLecUrl.trim() || null,
      })
      setEditingLecId(null)
      setStatusMsg('Updated lecture content and video link! Changes are now live for students.')
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not update lecture')
    }
  }

  async function handleDeleteLecture(lectureId: string, lecTitle: string) {
    if (!currentCourse?.id) return
    setStatusMsg(null)
    setErrMsg(null)
    try {
      await deleteFacultyLecture(currentCourse.id, lectureId)
      setStatusMsg(`Removed lecture "${lecTitle}".`)
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not remove lecture')
    }
  }

  async function handleAttachFile(courseId: string, lectureId: string, file: File | null) {
    if (!file) return
    setStatusMsg(null)
    setErrMsg(null)
    try {
      const dataBase64 = await fileToBase64(file)
      const saved = await uploadFacultyLessonMaterial(courseId, lectureId, {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        dataBase64,
      })
      setStatusMsg(`Uploaded "${saved.fileName}" (${Math.max(1, Math.round(saved.byteSize / 1024))} KB) to lecture!`)
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not upload study material')
    }
  }

  async function handleDeleteMaterial(courseId: string, materialId: string, fileName: string) {
    setStatusMsg(null)
    setErrMsg(null)
    try {
      await deleteFacultyMaterial(courseId, materialId)
      setStatusMsg(`Removed "${fileName}".`)
      onReload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Could not remove file')
    }
  }

  if (courses.length === 0) {
    return (
      <div style={canvasSectionStyle}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
          TEACHER / FACULTY COURSE &amp; UPLOAD STUDIO
        </span>
        <h3 style={{ margin: '4px 0 8px', fontSize: 18, color: '#0f172a' }}>Activate Your Teaching Courses</h3>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#475569', lineHeight: 1.55 }}>
          Click below to load your assigned courses so you can edit modules &amp; lectures, upload lecture videos (<code>.mp4</code>) &amp; study PDFs/Slides, grade V1→V2 submissions, and resolve student doubts.
        </p>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleClaimCourses()}
          style={{
            padding: '11px 20px',
            borderRadius: 10,
            background: '#5142b5',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Activating Workspace…' : '⚡ Load & Activate My Teaching Courses →'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {/* Clear Teacher vs Admin Role Permissions Strip */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          fontSize: 12.5,
          color: '#334155',
        }}
      >
        <div>
          <strong style={{ color: '#5142b5' }}>🎓 Teacher / Faculty Permissions:</strong> You can <strong>Edit Existing Modules &amp; Lectures</strong>, <strong>Add New Modules &amp; Lectures</strong>, <strong>Upload Videos (.mp4 / YouTube) &amp; PDF/PPTX Slides</strong>, <strong>Grade V1→V2 Assignments</strong>, and <strong>Resolve 20-Min Doubts</strong>. <em>(Course Creation/Deletion, Pricing &amp; Coupons are managed by Admin).</em>
        </div>
      </div>

      {statusMsg ? (
        <div role="status" style={{ padding: '12px 16px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13.5, fontWeight: 700 }}>
          ✓ {statusMsg}
        </div>
      ) : null}
      {errMsg ? (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13.5, fontWeight: 700 }}>
          {errMsg}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Form 1: Add Lecture + Direct Video/PDF Upload */}
          <form onSubmit={handleCreateLecture} style={{ ...canvasSectionStyle, display: 'grid', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                TEACHER LECTURE &amp; UPLOAD STUDIO · SYNCED WITH STUDENT PLAYER
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: 18, color: '#0f172a' }}>Add New Lecture &amp; Upload Video / PDF</h3>
            </div>

            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
              Assigned Course
              <select
                value={currentCourse?.slug ?? ''}
                onChange={(e) => setSelectedCourseSlug(e.target.value)}
                style={inputStyle}
              >
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title} ({c.moduleCount} modules · {c.lessonCount} lessons)
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                Target Module
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">Choose module…</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      M{m.position}: {m.title}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                Lecture Type
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as typeof nodeType)}
                  style={inputStyle}
                >
                  <option value="NOTES">NOTES — Reading &amp; Notes</option>
                  <option value="VIDEO">VIDEO — Video Lecture</option>
                  <option value="LAB">LAB — Browser Sandbox</option>
                  <option value="ASSIGNMENT">ASSIGNMENT — Graded Brief</option>
                  <option value="PROJECT">PROJECT — Capstone Studio</option>
                </select>
              </label>
            </div>

            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
              Lecture Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Executive Cohort Retention Memo Walkthrough"
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
              Lecture Notes / Case Brief Instructions
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write the lesson reading notes or case assignment rubric instructions…"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
              🎬 Video Link (Optional — YouTube / Direct MP4 / Drive URL)
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#5142b5' }}>
              📤 Upload Video (.mp4/.webm), PDF Notes, PPTX Slides, or CSV File from Device (Optional)
              <input
                type="file"
                accept=".mp4,.webm,.mov,.pdf,.ppt,.pptx,.doc,.docx,.csv,.xlsx,.zip,.txt,.md,.png,.jpg,.webp"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                style={{ ...inputStyle, padding: '7px 10px', background: '#f5f3ff', borderColor: '#5142b5' }}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#5142b5',
                color: '#ffffff',
                border: '1px solid #5142b5',
                padding: '10px 18px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Saving & Uploading…' : 'Save Lecture & Upload to Module →'}
            </button>
          </form>

          {/* Form 2: Add New Module to Assigned Course */}
          <form onSubmit={handleCreateModule} style={{ ...canvasSectionStyle, display: 'grid', gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
              ADD NEW MODULE TO {currentCourse?.title.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                placeholder="New module title (e.g. Module 6: Live Case Workshop)"
                required
                style={{ ...inputStyle, flex: '1 1 220px', width: 'auto' }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                + Add Module
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Course Syllabus, Inline Lecture Editor & Upload Manager */}
        <div style={canvasSectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                EDIT EXISTING MODULES, LECTURES &amp; UPLOAD VIDEOS / PDFS / SLIDES
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: 18, color: '#0f172a' }}>{currentCourse?.title}</h3>
            </div>
            {currentCourse ? (
              <Link
                to={`/learn/${currentCourse.slug}`}
                style={{ fontSize: 12.5, fontWeight: 700, color: '#5142b5', textDecoration: 'none' }}
              >
                Open Student Player (/learn/{currentCourse.slug}) →
              </Link>
            ) : null}
          </div>

          {modules.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>No modules found on this course.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {modules.map((m) => (
                <div key={m.id} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                      Module {m.position}: {m.title} ({m.lectures.length} lectures)
                    </strong>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingModId === m.id) setEditingModId(null)
                        else {
                          setEditingModId(m.id)
                          setEditModTitle(m.title)
                        }
                      }}
                      style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {editingModId === m.id ? 'Close' : '✏️ Rename Module'}
                    </button>
                  </div>

                  {editingModId === m.id ? (
                    <form onSubmit={(e) => void handleSaveEditModule(e, m.id)} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <input
                        value={editModTitle}
                        onChange={(e) => setEditModTitle(e.target.value)}
                        required
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        type="submit"
                        style={{ padding: '6px 12px', borderRadius: 8, background: '#5142b5', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </form>
                  ) : null}

                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                    {m.lectures.map((lec) => {
                      const isEditing = editingLecId === lec.id
                      return (
                        <li
                          key={lec.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gap: 8,
                            fontSize: 12.5,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <div>
                              <strong>{m.position}.{lec.position} {lec.title}</strong>{' '}
                              <span style={{ color: '#64748b', fontSize: 11.5 }}>({lec.nodeType})</span>
                              {lec.referenceUrl ? (
                                <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                                  🎬 Video/Link: {lec.referenceUrl}
                                </div>
                              ) : null}
                              {lec.materials && lec.materials.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                  {lec.materials.map((mat) => (
                                    <span
                                      key={mat.id}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        background: '#f5f3ff',
                                        border: '1px solid #ddd6fe',
                                        color: '#5142b5',
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      <a href={`/api/v1/lms/materials/${mat.id}?download=1`} target="_blank" rel="noopener noreferrer" style={{ color: '#5142b5', textDecoration: 'none' }}>
                                        📥 {mat.fileName} ({Math.max(1, Math.round(mat.byteSize / 1024))} KB)
                                      </a>
                                      {currentCourse?.id ? (
                                        <button
                                          type="button"
                                          onClick={() => void handleDeleteMaterial(currentCourse.id!, mat.id, mat.fileName)}
                                          style={{ border: 'none', background: 'transparent', color: '#b91c1c', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                                        >
                                          ×
                                        </button>
                                      ) : null}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {currentCourse?.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditing) setEditingLecId(null)
                                    else {
                                      setEditingLecId(lec.id)
                                      setEditLecTitle(lec.title)
                                      setEditLecType(lec.nodeType)
                                      setEditLecSummary(lec.summary ?? '')
                                      setEditLecUrl(lec.referenceUrl ?? '')
                                    }
                                  }}
                                  style={{
                                    padding: '4px 9px',
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff',
                                    color: '#334155',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {isEditing ? 'Close' : '✏️ Edit'}
                                </button>
                                <label
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    border: '1px solid #5142b5',
                                    background: '#5142b5',
                                    color: '#ffffff',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  📤 Upload Video / PDF / Slide
                                  <input
                                    type="file"
                                    accept=".mp4,.webm,.mov,.pdf,.ppt,.pptx,.doc,.docx,.csv,.xlsx,.zip,.txt,.md,.png,.jpg,.webp"
                                    style={{ display: 'none' }}
                                    onChange={(e) => void handleAttachFile(currentCourse.id!, lec.id, e.target.files?.[0] ?? null)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteLecture(lec.id, lec.title)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #fecaca',
                                    background: '#ffffff',
                                    color: '#b91c1c',
                                    fontSize: 11,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {isEditing ? (
                            <form
                              onSubmit={(e) => void handleSaveEditLecture(e, lec.id)}
                              style={{
                                marginTop: 6,
                                paddingTop: 10,
                                borderTop: '1px solid #e2e8f0',
                                display: 'grid',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8 }}>
                                <input
                                  value={editLecTitle}
                                  onChange={(e) => setEditLecTitle(e.target.value)}
                                  placeholder="Lecture title"
                                  required
                                  style={inputStyle}
                                />
                                <select
                                  value={editLecType}
                                  onChange={(e) => setEditLecType(e.target.value)}
                                  style={inputStyle}
                                >
                                  <option value="NOTES">NOTES</option>
                                  <option value="VIDEO">VIDEO</option>
                                  <option value="LAB">LAB</option>
                                  <option value="ASSIGNMENT">ASSIGNMENT</option>
                                  <option value="PROJECT">PROJECT</option>
                                </select>
                              </div>
                              <textarea
                                rows={3}
                                value={editLecSummary}
                                onChange={(e) => setEditLecSummary(e.target.value)}
                                placeholder="Written lesson notes / summary / instructions"
                                style={inputStyle}
                              />
                              <input
                                type="url"
                                value={editLecUrl}
                                onChange={(e) => setEditLecUrl(e.target.value)}
                                placeholder="Video / YouTube / MP4 URL (optional, https://...)"
                                style={inputStyle}
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  type="submit"
                                  style={{ padding: '6px 14px', borderRadius: 8, background: '#5142b5', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                >
                                  Save Lecture Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLecId(null)}
                                  style={{ padding: '6px 12px', borderRadius: 8, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: 12, cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CurriculumTeachingPath({ summary }: { summary: FacultyDashboard['curriculumSummary'] }) {
  if (summary.length === 0) {
    return (
      <div id="faculty-curriculum" style={canvasSectionStyle}>
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No teaching path is assigned yet. Curriculum steps appear here when a programme or course is linked to your account.
        </p>
      </div>
    )
  }

  const curriculum = summary.map((node, index) => ({
    id: `step-${index}`,
    label: node.label,
    detail: node.detail,
    status: (node.status === 'complete' || node.status === 'current' || node.status === 'upcoming'
      ? node.status
      : 'upcoming') as 'complete' | 'current' | 'upcoming',
  }))

  return (
    <div id="faculty-curriculum" style={canvasSectionStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', display: 'block', marginBottom: 10 }}>
        MODULE TEACHING PATHWAY
      </span>
      <div className="faculty-path-timeline">
        {curriculum.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          const isLast = i === curriculum.length - 1
          return (
            <div key={node.id} className="faculty-path-step" style={{ display: 'flex', gap: 16, minHeight: isLast ? 'auto' : 46 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                <div style={{
                  width: isCurrent ? 12 : 8,
                  height: isCurrent ? 12 : 8,
                  borderRadius: '50%',
                  background: isCurrent ? '#5142b5' : isComplete ? '#5142b5' : '#cbd5e1',
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                {!isLast && (
                  <div style={{
                    width: 1, flex: 1, minHeight: 24,
                    background: '#e2e8f0',
                    marginTop: 4,
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 14, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                }}>
                  {node.label}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: '#475569',
                  marginTop: 2,
                }}>
                  {node.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatSubmittedAt(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function AssignmentReview({
  submissions,
  onFocus,
  onReload,
}: {
  submissions: FacultySubmission[]
  onFocus: () =>void
  onReload: () =>void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<FacultySubmissionDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [gradeVal, setGradeVal] = useState('88')
  const [feedbackVal, setFeedbackVal] = useState('Verified V1 → V2 Red-Line revision: SQL grain and commercial trade-offs are accurately defended.')
  const [gradingMsg, setGradingMsg] = useState<string | null>(null)
  const [savingGrade, setSavingGrade] = useState(false)

  const pendingCount = submissions.length
  const featured = submissions[0]

  async function openSubmission(id: string) {
    setSelectedId(id)
    setLoadingDetail(true)
    setGradingMsg(null)
    try {
      const d = await fetchFacultySubmissionDetail(id)
      setDetail(d)
      if (d.grade != null) setGradeVal(String(d.grade))
      if (d.feedback) setFeedbackVal(d.feedback)
    } catch {
      setDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function submitGrade(e: FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setSavingGrade(true)
    setGradingMsg(null)
    try {
      await gradeFacultySubmission(selectedId, {
        grade: Math.min(100, Math.max(0, parseInt(gradeVal, 10) || 0)),
        feedback: feedbackVal.trim() || undefined,
      })
      setGradingMsg('Submission graded and V1 → V2 Red-Line feedback saved!')
      onReload()
    } catch (err) {
      setGradingMsg(err instanceof Error ? err.message : 'Could not save grade')
    } finally {
      setSavingGrade(false)
    }
  }

  return (
    <div style={canvasSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            V1 → V2 RED-LINE ASSIGNMENT GRADING STUDIO
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
            {featured?.lessonTitle ?? 'Assignment review queue'}
          </h3>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#f5f3ff', color: '#5142b5' }}>
          {pendingCount} pending
        </span>
      </div>

      {gradingMsg ? (
        <div role="status" style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13, fontWeight: 700 }}>
          {gradingMsg}
        </div>
      ) : null}

      {submissions.length >0 ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {submissions.map((row) => (
            <div key={row.id} style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gap: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#0f172a', fontSize: 14.5, fontWeight: 700 }}>{row.studentName}</div>
                  <div style={{ color: '#475569', fontSize: 12.5, marginTop: 2 }}>
                    {row.lessonTitle}
                    {row.courseTitle ? ` · ${row.courseTitle}` : ''}
                    {row.attachmentCount >0 ? ` · ${row.attachmentCount} attachment(s)` : ''}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11.5, marginTop: 2 }}>{formatSubmittedAt(row.submittedAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      onFocus()
                      void openSubmission(row.id)
                    }}
                    style={{
                      background: '#5142b5',
                      border: '1px solid #5142b5',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Review &amp; Grade
                  </button>
                </div>
              </div>

              {selectedId === row.id ? (
                <div style={{ padding: 14, borderRadius: 10, background: '#ffffff', border: '1px solid #ddd6fe', display: 'grid', gap: 10 }}>
                  {loadingDetail ? (
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Loading learner submission…</p>
                  ) : detail ? (
                    <form onSubmit={submitGrade} style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                          LEARNER WRITTEN SUBMISSION ({detail.student.email})
                        </span>
                        <pre style={{ margin: '6px 0 0', padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: 13, color: '#0f172a' }}>
                          {detail.responseText || 'No text body submitted (check attachments).'}
                        </pre>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10 }}>
                        <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                          Score (0–100)
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={gradeVal}
                            onChange={(e) =>setGradeVal(e.target.value)}
                            required
                            style={inputStyle}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                          V1 → V2 Faculty Red-Line Feedback
                          <input
                            value={feedbackVal}
                            onChange={(e) =>setFeedbackVal(e.target.value)}
                            placeholder="Write actionable feedback for the learner…"
                            style={inputStyle}
                          />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="submit"
                          disabled={savingGrade}
                          style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                        >
                          {savingGrade ? 'Saving Grade…' : '✓ Submit Verified Grade'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>setSelectedId(null)}
                          style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No submitted assignments yet. Learner submissions will appear here when available.
        </p>
      )}
    </div>
  )
}

function LearnerProgress({ dashboard }: { dashboard: FacultyDashboard | null }) {
  return (
    <div style={canvasSectionStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
        LEARNER COHORT ANALYTICS
      </span>
      <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#0f172a' }}>Learner progress</h3>
      <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.6 }}>
          {dashboard?.teachingScopeAvailable === false
            ? (dashboard.teachingScopeMessage ?? "Teaching scope is unavailable until faculty assignment is modeled in the backend.")
            : "Cohort completion analytics are tracked across your assigned courses. Use the V1 → V2 Grading Studio and 20-Minute Doubt SLA Queue to review active student work."}
        </div>
      </div>
    </div>
  )
}

function UpcomingTeaching({ pendingCount }: { pendingCount: number }) {
  return (
    <div style={canvasSectionStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
        ACTION QUEUE
      </span>
      <h3 style={{ margin: '0 0 12px', fontSize: 17, color: '#0f172a' }}>Upcoming teaching</h3>
      {pendingCount >0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center', padding: '10px 0' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5142b5" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>Assignment review</div>
            <div style={{ color: '#475569', fontSize: 12.5, marginTop: 2 }}>{pendingCount} submissions pending review</div>
          </div>
        </div>
      ) : (
        <p style={{ color: C.slate, fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
          No pending assignment reviews right now. New student submissions appear here automatically.
        </p>
      )}
    </div>
  )
}

function ClassesRail({
  programs,
  courses,
  catalogPeek,
}: {
  programs: FacultyDashboard['programs']
  courses: FacultyDashboard['courses']
  catalogPeek: boolean
}) {
  return (
    <div style={{ ...canvasSectionStyle, marginTop: 20 }}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
        {catalogPeek ? 'CATALOG PROGRAMS & COURSES' : 'ASSIGNED PROGRAMS & COURSES'}
      </span>
      <div style={{ display: 'grid', gap: 10 }}>
        {programs.map((p) => (
          <div key={p.slug} style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
            <div style={{ color: '#475569', fontSize: 12 }}>{p.duration} · {p.format}</div>
          </div>
        ))}
        {courses.map((course) => (
          <div key={course.slug} style={{ padding: '12px 14px', borderRadius: 10, background: '#f6f4ff', border: '1px solid #ddd6fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#5142b5', fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>LMS COURSE</span>
              <Link to={`/learn/${course.slug}`} style={{ fontSize: 11.5, fontWeight: 700, color: '#5142b5', textDecoration: 'none' }}>
                Open Player →
              </Link>
            </div>
            <div style={{ color: '#0f172a', fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{course.title}</div>
            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>{course.moduleCount} modules · {course.lessonCount} lessons</div>
          </div>
        ))}
        {programs.length === 0 && courses.length === 0 && (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programmes or courses are assigned to your account yet.</p>
        )}
      </div>
    </div>
  )
}

function FacultyDoubtQueue({
  doubts,
  onResolve,
  resolvingId,
}: {
  doubts: FacultyDoubtItem[]
  onResolve: (id: string, note?: string) =>void
  resolvingId: string | null
}) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const openDoubts = doubts.filter((d) =>d.status === 'open')
  return (
    <div id="faculty-doubts" style={canvasSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            20-Minute Faculty TA Doubt Queue
          </div>
          <h2 style={{ color: '#0f172a', fontSize: 18, margin: '4px 0 0', fontFamily: 'var(--font-display)' }}>
            Live Lesson Doubt Escalations ({openDoubts.length} open)
          </h2>
        </div>
      </div>
      {openDoubts.length === 0 ? (
        <p style={{ color: C.slate, fontSize: 14, margin: 0 }}>
          No open learner doubts in the 20-minute SLA queue right now.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {openDoubts.map((item) => (
            <li
              key={item.id}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gap: 10,
              }}
            >
              <div>
                <strong style={{ color: '#0f172a', fontSize: 14 }}>{item.learnerName}</strong>
                <span style={{ color: '#5142b5', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>
                  {item.courseSlug} · {item.lessonTitle} ({item.slaMinutes}-min SLA)
                </span>
                <p style={{ color: '#0f172a', fontSize: 13.5, margin: '6px 0 0' }}>{item.question}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={notes[item.id] ?? ''}
                  onChange={(e) =>setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Write faculty resolution note (sent directly to learner notifications)…"
                  style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                />
                <button
                  type="button"
                  onClick={() =>onResolve(item.id, notes[item.id])}
                  disabled={resolvingId === item.id}
                  style={{
                    background: '#5142b5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {resolvingId === item.id ? 'Resolving…' : 'Mark Resolved'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DashboardFacultyPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [dashboard, setDashboard] = useState<FacultyDashboard | null>(null)
  const [doubts, setDoubts] = useState<FacultyDoubtItem[]>([])
  const [resolvingDoubtId, setResolvingDoubtId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  function reloadAll() {
    if (!ready || !user) return
    void fetchFacultyDoubts().then(setDoubts).catch(() =>setDoubts([]))
    fetchFacultyDashboard()
      .then((data) => {
        setDashboard(data)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        setDashboard(null)
        setLoadError(err instanceof Error ? err.message : "Unable to load this workspace. Try again.")
      })
  }

  useEffect(() => {
    reloadAll()
  }, [ready, user])

  if (!ready || !user) return null

  const programs = dashboard?.programs ?? []
  const courses = dashboard?.courses ?? []
  const submissions = dashboard?.submissions ?? []
  const curriculumSummary = dashboard?.curriculumSummary ?? []
  const teachingScopeAvailable = dashboard?.teachingScopeAvailable === true
  const catalogPeek = teachingScopeAvailable && (programs.length >0 || courses.length >0)

  function focusAssignments() {
    setActiveNav('assignments')
  }

  async function handleResolveDoubt(id: string, customNote?: string) {
    setResolvingDoubtId(id)
    try {
      const updated = await resolveFacultyDoubt(id, customNote?.trim() || 'Resolved by Faculty TA within 20-min SLA')
      setDoubts((prev) =>prev.map((d) => (d.id === id ? updated : d)))
    } catch {
      // Keep current state if resolve fails transiently
    } finally {
      setResolvingDoubtId(null)
    }
  }

  return (
    <AuthDashboardShell
      themeId="data-analytics"
      workspaceLabel="Teaching"
      roleLabel="Faculty"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'classes', 'curriculum', 'assignments', 'assessments'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="faculty-overview" className="faculty-teaching-workspace" style={{ display: 'grid', gap: 20 }}>
        {activeNav === 'overview' ? (
          <AuthDashboardLayout
            primary={
              <div style={{ display: 'grid', gap: 20 }}>
                {loadError ? (
                  <GlassSurface level={2} padding="clamp(24px, 4vw, 36px)">
                    <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px' }}>Teaching scope</h1>
                    <p style={{ color: C.slate, fontSize: 15, margin: '0 0 16px' }}>{loadError}</p>
                    <button
                      type="button"
                      onClick={reloadAll}
                      style={{
                        background: '#5142b5', color: C.white, border: 'none',
                        padding: '11px 18px', borderRadius: T.rControl, cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontWeight: 600,
                      }}
                    >
                      Try again
                    </button>
                  </GlassSurface>
                ) : catalogPeek ? (
                  <CatalogOverview
                    programCount={programs.length}
                    courseCount={courses.length}
                    pendingCount={submissions.length}
                    onReview={focusAssignments}
                    onAuthorLecture={() =>setActiveNav('curriculum')}
                  />
                ) : (
                  <TeachingEmptyState
                    message={dashboard?.teachingScopeMessage}
                    onOpenCurriculum={() => setActiveNav('curriculum')}
                    onQuickActivate={async () => {
                      await claimFacultyDefaultScope().catch(() => null)
                      reloadAll()
                    }}
                  />
                )}
                <FacultyDoubtQueue doubts={doubts} onResolve={(id, note) =>void handleResolveDoubt(id, note)} resolvingId={resolvingDoubtId} />
                <div id="faculty-assignments">
                  <AssignmentReview submissions={submissions} onFocus={focusAssignments} onReload={reloadAll} />
                </div>
              </div>
            }
            rail={
              <div>
                <div id="faculty-upcoming">
                  <UpcomingTeaching pendingCount={submissions.length} />
                </div>
                <div id="faculty-classes">
                  <ClassesRail programs={programs} courses={courses} catalogPeek={catalogPeek} />
                </div>
              </div>
            }
          />
        ) : null}

        {activeNav === 'classes' ? (
          <ClassesRail programs={programs} courses={courses} catalogPeek={catalogPeek} />
        ) : null}

        {activeNav === 'curriculum' ? (
          <div style={{ display: 'grid', gap: 20 }}>
            <FacultyLectureAuthoringStudio courses={courses} onReload={reloadAll} />
            <CurriculumTeachingPath summary={curriculumSummary} />
          </div>
        ) : null}

        {activeNav === 'assignments' ? (
          <AssignmentReview submissions={submissions} onFocus={focusAssignments} onReload={reloadAll} />
        ) : null}

        {activeNav === 'assessments' ? (
          <FacultyDoubtQueue doubts={doubts} onResolve={(id, note) =>void handleResolveDoubt(id, note)} resolvingId={resolvingDoubtId} />
        ) : null}

        {activeNav === 'learners' ? (
          <LearnerProgress dashboard={dashboard} />
        ) : null}

        {activeNav === 'settings' ? (
          <div id="faculty-settings" style={canvasSectionStyle}>
            <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              5-DIMENSION RUBRIC &amp; SLA SETTINGS
            </span>
            <h3 style={{ margin: '0 0 10px', fontSize: 18, color: '#0f172a' }}>Faculty TA Rubric Standard</h3>
            <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 14px', lineHeight: 1.6 }}>
              All Capstone and Written Case Brief submissions are evaluated on Skylent&apos;s 5-Dimension Competency Standard:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {[
                ['15% Knowledge', 'First-Principles Accuracy'],
                ['30% Execution', 'Browser Lab & Code Output'],
                ['20% Judgement', 'Commercial Trade-Offs'],
                ['15% Oral Defence', 'Boardroom Cold Call'],
                ['20% V1 → V2 Revision', 'Red-Line Diff Resolution'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: 12, borderRadius: 10, background: '#f6f4ff', border: '1px solid #ddd6fe' }}>
                  <strong style={{ display: 'block', fontSize: 13.5, color: '#5142b5' }}>{k}</strong>
                  <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AuthDashboardShell>
  )
}
