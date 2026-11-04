import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { AuthDashboardShell, type AuthNavItem } from "../components/AuthDashboardShell"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"
import { ensureCsrfToken } from "../lib/auth-api"

export type LectureMaterial = {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
}

export type Lecture = {
  id: string
  position: number
  title: string
  summary?: string | null
  nodeType: string
  referenceUrl?: string | null
  materials?: LectureMaterial[]
}

export type ModuleRow = {
  id: string
  position: number
  title: string
  description: string | null
  lectures: Lecture[]
}

export type CourseRow = {
  id: string
  slug: string
  title: string
  description?: string
  category?: string
  level?: string
  duration?: string
  mode?: string
  price?: number
  originalPrice?: number
  outcomes?: string[]
  forWhom?: string[]
  publicationStatus: string | null
  authoredInApp?: boolean
  coverFileName?: string | null
  modules: ModuleRow[]
}

export type CourseListItem = {
  id: string
  slug: string
  title: string
  category?: string
  level?: string
  duration?: string
  mode?: string
  price?: number
  lessonCount?: number
  publicationStatus: string | null
  authoredInApp?: boolean
}

type FacultyAssignmentPayload = {
  assigned: Array<{ userId: string; name: string; email: string; assignedAt: string }>
  availableFaculty: Array<{ id: string; name: string; email: string }>
}

type QuizDraftQuestion = {
  question: string
  options: [string, string, string, string]
  correctIndex: number
  explanation: string
}

async function curriculumRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (method !== "GET") headers["X-CSRF-Token"] = await ensureCsrfToken()
  const response = await fetch(`${apiV1()}/admin/curriculum${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as { error?: string; data?: T }
  if (!response.ok) throw new Error(payload.error || "The curriculum request failed")
  return (payload.data ?? payload) as T
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderTop: "4px solid #5142b5",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 10px 28px -12px rgba(15, 23, 42, 0.08)",
} as const

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13.5,
  fontFamily: "var(--font-body)",
} as const

const labelStyle = {
  display: "grid",
  gap: 5,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
} as const

const NODE_TYPE_META: Record<string, { badge: string; color: string; bg: string; desc: string }> = {
  NOTES: {
    badge: "📖 NOTES / READING",
    color: "#5142b5",
    bg: "#f5f3ff",
    desc: "Structured reading notes with 1-click Hinglish & English Socratic AI coach.",
  },
  VIDEO: {
    badge: "🎬 VIDEO LECTURE",
    color: "#0369a1",
    bg: "#e0f2fe",
    desc: "Video stream (Mux public playback ID or reference URL) + written transcript notes.",
  },
  LAB: {
    badge: "🧪 BROWSER LAB",
    color: "#047857",
    bg: "#ecfdf5",
    desc: "In-browser interactive SQL, Python ETL, GenAI RAG, or Ledger execution sandbox.",
  },
  ASSIGNMENT: {
    badge: "✍️ CASE BRIEF (GRADED)",
    color: "#b45309",
    bg: "#fef3c7",
    desc: "Written case memo routed to Faculty TA for V1 → V2 Red-Line review & grading.",
  },
  PROJECT: {
    badge: "🏆 CAPSTONE STUDIO",
    color: "#6d28d9",
    bg: "#ede9fe",
    desc: "6-Task Capstone Project Studio feeding the public /verify Proof-of-Work Dossier.",
  },
  QUIZ: {
    badge: "✅ GRADED QUIZ",
    color: "#0f766e",
    bg: "#ccfbf1",
    desc: "Auto-graded multiple-choice checkpoint with passing score % and attempt limits.",
  },
}

export function CourseAuthoringStudio({
  embedded = false,
  activeSubTab,
  onSubTabChange,
}: {
  embedded?: boolean
  activeSubTab?: string
  onSubTabChange?: (tab: string) => void
}) {
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [selected, setSelected] = useState<CourseRow | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL")
  const [localTab, setLocalTab] = useState<string>("course")

  const studioTab = activeSubTab ?? localTab
  function setStudioTab(next: string) {
    setLocalTab(next)
    onSubTabChange?.(next)
  }

  // Course creation state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Data & Analytics")
  const [level, setLevel] = useState("Foundation to Professional")
  const [duration, setDuration] = useState("8 weeks · 60 notional hrs")
  const [mode, setMode] = useState("Self-paced + Browser Lab")
  const [price, setPrice] = useState("0")
  const [outcomesText, setOutcomesText] = useState(
    "Execute real-world commercial SQL & Python analysis\nDefend trade-offs in a V1 to V2 Faculty Red-Line review",
  )
  const [forWhomText, setForWhomText] = useState(
    "Final-year students and early-career analysts\nWorking professionals switching into applied tech roles",
  )

  // Module creation state
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [modulePosition, setModulePosition] = useState("1")

  // Lecture creation state
  const [lectureTitle, setLectureTitle] = useState("")
  const [lectureModule, setLectureModule] = useState("")
  const [lectureNodeType, setLectureNodeType] = useState<string>("NOTES")
  const [lectureSummary, setLectureSummary] = useState("")
  const [lectureReferenceUrl, setLectureReferenceUrl] = useState("")
  const [lecturePosition, setLecturePosition] = useState("")
  const [quizPassingScore, setQuizPassingScore] = useState("70")
  const [quizMaxAttempts, setQuizMaxAttempts] = useState("3")
  const [quizQuestions, setQuizQuestions] = useState<QuizDraftQuestion[]>([
    {
      question: "Why does an unvalidated 1-to-many LEFT JOIN inflate revenue totals?",
      options: [
        "Parent order header amounts repeat across multiple line-item rows (fan-out)",
        "SQL automatically multiplies numeric columns by 2",
        "NULL values convert to positive integers",
        "GROUP BY deletes primary keys",
      ],
      correctIndex: 0,
      explanation: "Joining header-grain metrics to line-item grain without pre-aggregating duplicates parent rows.",
    },
  ])

  // Faculty assignment state
  const [facultyData, setFacultyData] = useState<FacultyAssignmentPayload | null>(null)
  const [selectedFacultyUserId, setSelectedFacultyUserId] = useState("")

  async function refreshCourses(selectId?: string) {
    try {
      const rows = await curriculumRequest<CourseListItem[]>("/courses", "GET")
      setCourses(rows)
      const targetId = selectId ?? selected?.id ?? rows[0]?.id
      if (targetId) {
        const detail = await curriculumRequest<CourseRow>(`/courses/${targetId}`, "GET")
        setSelected(detail)
        if (!lectureModule && detail.modules[0]) {
          setLectureModule(detail.modules[0].id)
        }
        setModulePosition(String(detail.modules.length + 1))
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not load courses")
    }
  }

  async function loadFacultyAssignments(courseId: string) {
    try {
      const data = await curriculumRequest<FacultyAssignmentPayload>(`/courses/${courseId}/faculty`, "GET")
      setFacultyData(data)
      if (!selectedFacultyUserId && data.availableFaculty[0]) {
        setSelectedFacultyUserId(data.availableFaculty[0].id)
      }
    } catch {
      setFacultyData(null)
    }
  }

  useEffect(() => {
    void refreshCourses()
  }, [])

  useEffect(() => {
    if (selected?.id) {
      if (selected.modules[0] && !selected.modules.some((m) => m.id === lectureModule)) {
        setLectureModule(selected.modules[0].id)
      }
      setModulePosition(String(selected.modules.length + 1))
      void loadFacultyAssignments(selected.id)
    }
  }, [selected?.id])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 75))
    }
  }

  async function onCreateCourse(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    setErrorMsg(null)
    try {
      const created = await curriculumRequest<CourseRow>("/courses", "POST", {
        title,
        slug,
        description,
        category,
        level,
        duration,
        mode,
        price: Math.max(0, parseInt(price, 10) || 0),
        originalPrice: Math.max(0, parseInt(price, 10) || 0),
        outcomes: outcomesText.split("\n").map((s) => s.trim()).filter(Boolean),
        forWhom: forWhomText.split("\n").map((s) => s.trim()).filter(Boolean),
      })
      setCourses((current) => [
        {
          id: created.id,
          slug: created.slug,
          title: created.title,
          category: created.category,
          publicationStatus: created.publicationStatus,
          authoredInApp: true,
        },
        ...current,
      ])
      setSelected(created)
      setTitle("")
      setSlug("")
      setDescription("")
      setMessage(`Draft course "${created.title}" (${created.slug}) created. Now add Modules and Lectures!`)
      setStudioTab("modules")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not create the course")
    }
  }

  async function onAddModule(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/modules`, "POST", {
        title: moduleTitle,
        description: moduleDescription.trim() || undefined,
        position: Number(modulePosition || 1),
      })
      setSelected(next)
      setModuleTitle("")
      setModuleDescription("")
      setModulePosition(String(next.modules.length + 1))
      if (!lectureModule && next.modules[0]) setLectureModule(next.modules[0].id)
      setMessage("Module saved and ordered in syllabus.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not add the module")
    }
  }

  async function onMoveModule(moduleId: string, direction: -1 | 1) {
    if (!selected) return
    const idx = selected.modules.findIndex((m) => m.id === moduleId)
    if (idx === -1) return
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= selected.modules.length) return
    const ids = selected.modules.map((m) => m.id)
    const [moved] = ids.splice(idx, 1)
    ids.splice(targetIdx, 0, moved)
    try {
      const next = await curriculumRequest<CourseRow>("/modules/order", "POST", {
        courseId: selected.id,
        moduleIds: ids,
      })
      setSelected(next)
      setMessage("Module order updated.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not reorder modules")
    }
  }

  async function onDeleteModule(moduleId: string, moduleName: string) {
    if (!selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/modules/${moduleId}`, "DELETE", {
        confirm: true,
      })
      setSelected(next)
      setMessage(`Deleted module "${moduleName}".`)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not delete module")
    }
  }

  async function onAddLecture(event: FormEvent) {
    event.preventDefault()
    if (!lectureModule) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const bodyPayload: Record<string, unknown> = {
        title: lectureTitle,
        nodeType: lectureNodeType,
        ...(lectureSummary.trim() ? { summary: lectureSummary.trim() } : {}),
        ...(lectureReferenceUrl.trim() ? { referenceUrl: lectureReferenceUrl.trim() } : {}),
        ...(lecturePosition.trim() ? { position: Number(lecturePosition) } : {}),
      }
      if (lectureNodeType === "QUIZ") {
        bodyPayload.passingScore = Math.min(100, Math.max(0, Number(quizPassingScore) || 70))
        bodyPayload.maxAttempts = Math.min(20, Math.max(1, Number(quizMaxAttempts) || 3))
        bodyPayload.questions = quizQuestions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctIndex: q.correctIndex,
          ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
        }))
      }
      const next = await curriculumRequest<CourseRow>(`/modules/${lectureModule}/lectures`, "POST", bodyPayload)
      setSelected(next)
      setLectureTitle("")
      setLectureSummary("")
      setLectureReferenceUrl("")
      setLecturePosition("")
      setMessage(`Lecture saved on the selected module (${lectureNodeType}).`)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not add the lecture")
    }
  }

  async function onDeleteLecture(lectureId: string, titleText: string) {
    setMessage(null)
    setErrorMsg(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/lectures/${lectureId}`, "DELETE")
      setSelected(next)
      setMessage(`Deleted lecture "${titleText}".`)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not delete lecture")
    }
  }

  async function onUploadLectureMaterial(lectureId: string, file: File | null) {
    if (!file) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const dataBase64 = await fileToBase64(file)
      const next = await curriculumRequest<CourseRow>(`/lectures/${lectureId}/materials`, "POST", {
        fileName: file.name,
        contentType: file.type || "application/pdf",
        dataBase64,
      })
      setSelected(next)
      setMessage(`Attached material "${file.name}" to lecture.`)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not upload lecture material")
    }
  }

  async function onUploadCourseCover(file: File | null) {
    if (!file || !selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const dataBase64 = await fileToBase64(file)
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/cover`, "POST", {
        fileName: file.name,
        contentType: file.type || "image/webp",
        dataBase64,
      })
      setSelected(next)
      setMessage(`Uploaded course cover "${file.name}".`)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not upload course cover")
    }
  }

  async function onPublish() {
    if (!selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/publish`, "POST", {})
      setSelected(next)
      setCourses((prev) =>
        prev.map((c) => (c.id === next.id ? { ...c, publicationStatus: next.publicationStatus } : c)),
      )
      setMessage("Course published! It is now live in the public catalogue and student learning player.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not publish")
    }
  }

  async function onUnpublish() {
    if (!selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/unpublish`, "POST", {})
      setSelected(next)
      setCourses((prev) =>
        prev.map((c) => (c.id === next.id ? { ...c, publicationStatus: next.publicationStatus } : c)),
      )
      setMessage("Course moved back to DRAFT status.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not move course to draft")
    }
  }

  async function onAssignFaculty(event: FormEvent) {
    event.preventDefault()
    if (!selected || !selectedFacultyUserId) return
    setMessage(null)
    setErrorMsg(null)
    try {
      await curriculumRequest(`/courses/${selected.id}/faculty`, "POST", { userId: selectedFacultyUserId })
      await loadFacultyAssignments(selected.id)
      setMessage("Faculty instructor assigned to this course. They can now add lectures and grade submissions.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not assign faculty")
    }
  }

  async function onRemoveFaculty(userId: string) {
    if (!selected) return
    setMessage(null)
    setErrorMsg(null)
    try {
      await curriculumRequest(`/courses/${selected.id}/faculty/${userId}`, "DELETE")
      await loadFacultyAssignments(selected.id)
      setMessage("Faculty assignment removed from this course.")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not unassign faculty")
    }
  }

  const filteredCourses = courses.filter((c) => {
    if (filterStatus === "ALL") return true
    return (c.publicationStatus || "PUBLISHED").toUpperCase() === filterStatus
  })

  const totalLectures = selected ? selected.modules.reduce((s, m) => s + m.lectures.length, 0) : 0

  return (
    <div style={{ display: "grid", gap: 22 }}>
      {/* Royal Purple Institutional Course Studio Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
          border: "1px solid rgba(196, 184, 255, 0.42)",
          borderRadius: 18,
          padding: "clamp(22px, 3vw, 30px)",
          color: "#ffffff",
          boxShadow: "0 18px 40px -14px rgba(59, 45, 150, 0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 6px", color: "#e9d5ff", font: "700 11px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              SKYLENT CURRICULUM &amp; LECTURE AUTHORING STUDIO · ADMIN → FACULTY → STUDENT PIPELINE
            </p>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px, 2.6vw, 30px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
              Course builder &amp; Multi-Modal Lecture Studio
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.55, maxWidth: 740 }}>
              New courses stay draft until you publish them. Publishing needs one module and one lecture. Create structured modules, add Notes, Video lectures, Browser SQL/Python Labs, Graded Quizzes, or Written Case Briefs, assign Faculty TAs, and publish directly to the live student player.
            </p>
          </div>
          {selected ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                to={`/learn/${selected.slug}`}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "#ffffff",
                  color: "#5142b5",
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
                }}
              >
                Preview in Student Player (/learn/{selected.slug}) →
              </Link>
              <Link
                to={`/courses/${selected.slug}`}
                style={{
                  padding: "9px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textDecoration: "none",
                }}
              >
                Public Catalogue Page →
              </Link>
            </div>
          ) : null}
        </div>

        {/* 4-Step End-to-End Governance Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10,
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {[
            ["01 · Admin Creates Course", "Starts in DRAFT mode with outcomes, pricing & cover"],
            ["02 · Structure Modules", "Add & reorder sequential learning modules (M1, M2…)"],
            ["03 · Author Lectures & Quizzes", "Add NOTES, VIDEO, LAB, QUIZ, ASSIGNMENT or PROJECT"],
            ["04 · Assign Faculty & Publish", "Link Faculty TAs & publish live to /learn/:slug"],
          ].map(([stepTitle, stepSub], i) => (
            <div
              key={stepTitle}
              style={{
                background: "rgba(15, 23, 42, 0.32)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <strong style={{ display: "block", fontSize: 12, color: "#f3e8ff", fontFamily: "var(--font-mono)" }}>
                {stepTitle}
              </strong>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.82)" }}>{stepSub}</span>
            </div>
          ))}
        </div>
      </section>

      {message ? (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          ✓ {message}
        </div>
      ) : null}
      {errorMsg ? (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          ⚠️ {errorMsg}
        </div>
      ) : null}

      {/* Studio Sub-Navigation Pill Bar */}
      <div
        role="tablist"
        aria-label="Course Studio Authoring Tabs"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 14,
          background: "#f6f4ff",
          border: "1px solid #ddd6fe",
        }}
      >
        {[
          { id: "course", label: "1. Select or Create Course" },
          { id: "modules", label: `2. Modules & Syllabus (${selected?.modules.length ?? 0})` },
          { id: "lectures", label: `3. Add Lecture / Lab / Quiz (${totalLectures})` },
          { id: "faculty", label: `4. Assign Faculty TA (${facultyData?.assigned.length ?? 0})` },
          { id: "all", label: "⚡ Split-Screen Full Studio" },
        ].map((t) => {
          const active = studioTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStudioTab(t.id)}
              style={{
                padding: "8px 15px",
                borderRadius: 999,
                border: active ? "1px solid #5142b5" : "1px solid #cbd5e1",
                background: active ? "#5142b5" : "#ffffff",
                color: active ? "#ffffff" : "#334155",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Main 2-Column Studio Grid: Left = Course & Live Syllabus Tree, Right = Active Workbench Tab */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: 22,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Course Selector + Live Syllabus Tree + Publish Control */}
        <div style={{ display: "grid", gap: 18 }}>
          <section style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
                  ACTIVE COURSE SELECTOR
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>Open a course to edit</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["ALL", "PUBLISHED", "DRAFT"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: filterStatus === st ? "1px solid #5142b5" : "1px solid #cbd5e1",
                      background: filterStatus === st ? "#f5f3ff" : "#ffffff",
                      color: filterStatus === st ? "#5142b5" : "#475569",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <label style={labelStyle}>
              Open a course
              <select
                aria-label="Open a course"
                style={inputStyle}
                value={selected?.id ?? ""}
                onChange={(event) => {
                  const id = event.target.value
                  if (!id) return
                  void curriculumRequest<CourseRow>(`/courses/${id}`, "GET")
                    .then((detail) => {
                      setSelected(detail)
                      if (detail.modules[0]) setLectureModule(detail.modules[0].id)
                    })
                    .catch((error: unknown) => {
                      setErrorMsg(error instanceof Error ? error.message : "Could not open the course")
                    })
                }}
              >
                <option value="">Select</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} · {course.publicationStatus ?? "PUBLISHED"} ({course.slug})
                  </option>
                ))}
              </select>
            </label>

            {selected ? (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: "#f6f4ff",
                  border: "1px solid #ddd6fe",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "var(--font-mono)",
                        background: selected.publicationStatus === "PUBLISHED" ? "#dcfce7" : "#fef3c7",
                        color: selected.publicationStatus === "PUBLISHED" ? "#166534" : "#92400e",
                        marginBottom: 6,
                      }}
                    >
                      ● {selected.publicationStatus ?? "PUBLISHED"} · /{selected.slug}
                    </span>
                    <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>{selected.title}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#475569" }}>
                      {selected.modules.length} modules · {totalLectures} lectures
                      {selected.coverFileName ? ` · Cover: ${selected.coverFileName}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="os-btn os-btn-primary"
                      type="button"
                      onClick={() => void onPublish()}
                      style={{
                        background: "#5142b5",
                        color: "#ffffff",
                        borderColor: "#5142b5",
                        fontWeight: 700,
                        padding: "8px 16px",
                        borderRadius: 999,
                        cursor: "pointer",
                      }}
                    >
                      Publish course
                    </button>
                    {selected.publicationStatus === "PUBLISHED" ? (
                      <button
                        className="os-btn os-btn-ghost"
                        type="button"
                        onClick={() => void onUnpublish()}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 999,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#334155",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Revert to Draft
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Course Cover Upload */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                    Course Cover Image (JPEG / PNG / WebP ≤ 350 KB):
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Upload course cover"
                    onChange={(e) => void onUploadCourseCover(e.target.files?.[0] ?? null)}
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {/* LIVE SYLLABUS TREE */}
          {selected ? (
            <section style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                    LIVE SYLLABUS TREE · MODULES &amp; LECTURES
                  </span>
                  <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>
                    {selected.title} Curriculum ({selected.modules.length} Modules)
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setStudioTab("modules")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid #5142b5",
                      background: "#f5f3ff",
                      color: "#5142b5",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Add Module
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioTab("lectures")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid #5142b5",
                      background: "#5142b5",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Add Lecture
                  </button>
                </div>
              </div>

              {selected.modules.length === 0 ? (
                <p style={{ margin: 0, padding: 16, borderRadius: 12, background: "#f8fafc", color: "#64748b", fontSize: 13.5 }}>
                  No modules yet. Use the "Add module" form on the right to create Module 1.
                </p>
              ) : (
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
                  {selected.modules.map((module, mIdx) => (
                    <li
                      key={module.id}
                      style={{
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                            MODULE 0{module.position}
                          </span>
                          <strong style={{ display: "block", fontSize: 15.5, color: "#0f172a", marginTop: 2 }}>
                            {module.position}. {module.title}
                          </strong>
                          {module.description ? (
                            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#475569" }}>{module.description}</p>
                          ) : null}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            disabled={mIdx === 0}
                            onClick={() => void onMoveModule(module.id, -1)}
                            title="Move module up"
                            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#ffffff", fontSize: 11, cursor: "pointer" }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={mIdx === selected.modules.length - 1}
                            onClick={() => void onMoveModule(module.id, 1)}
                            title="Move module down"
                            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#ffffff", fontSize: 11, cursor: "pointer" }}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLectureModule(module.id)
                              setStudioTab("lectures")
                            }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid #5142b5",
                              background: "#f5f3ff",
                              color: "#5142b5",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            + Add Lecture here
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteModule(module.id, module.title)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {module.lectures.length === 0 ? (
                        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#64748b" }}>
                          No lectures in this module yet. Click "+ Add Lecture here" to add Notes, Video, Lab, or Quiz.
                        </p>
                      ) : (
                        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 8 }}>
                          {module.lectures.map((lecture) => {
                            const meta = NODE_TYPE_META[lecture.nodeType] ?? NODE_TYPE_META.NOTES
                            return (
                              <li
                                key={lecture.id}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: 10,
                                  background: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 10,
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span
                                      style={{
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        fontFamily: "var(--font-mono)",
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        background: meta.bg,
                                        color: meta.color,
                                      }}
                                    >
                                      {meta.badge}
                                    </span>
                                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
                                      {lecture.position}. {lecture.title} ({lecture.nodeType})
                                    </strong>
                                  </div>
                                  {lecture.summary ? (
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569", lineHeight: 1.45 }}>
                                      {lecture.summary.slice(0, 140)}
                                      {lecture.summary.length > 140 ? "…" : ""}
                                    </p>
                                  ) : null}
                                  {lecture.materials && lecture.materials.length > 0 ? (
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                      {lecture.materials.map((mat) => (
                                        <span
                                          key={mat.id}
                                          style={{
                                            fontSize: 11,
                                            padding: "2px 8px",
                                            borderRadius: 6,
                                            background: "#f1f5f9",
                                            color: "#334155",
                                            fontWeight: 600,
                                          }}
                                        >
                                          📎 {mat.fileName} ({Math.round(mat.byteSize / 1024)} KB)
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <label
                                    style={{
                                      padding: "4px 10px",
                                      borderRadius: 6,
                                      border: "1px solid #cbd5e1",
                                      background: "#f8fafc",
                                      color: "#334155",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    📎 Attach PDF/Slide
                                    <input
                                      type="file"
                                      accept=".pdf,.ppt,.pptx,.txt,.md"
                                      style={{ display: "none" }}
                                      onChange={(e) => void onUploadLectureMaterial(lecture.id, e.target.files?.[0] ?? null)}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => void onDeleteLecture(lecture.id, lecture.title)}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: 6,
                                      border: "1px solid #fecaca",
                                      background: "#ffffff",
                                      color: "#b91c1c",
                                      fontSize: 11,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ) : null}
        </div>

        {/* RIGHT COLUMN: Authoring Forms (Switched by studioTab or all shown in Split-Screen mode) */}
        <div style={{ display: "grid", gap: 18 }}>
          {/* TAB 1: CREATE NEW COURSE */}
          {studioTab === "course" || studioTab === "all" ? (
            <form onSubmit={onCreateCourse} style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  STEP 01 · CREATE NEW COURSE (STARTS IN DRAFT)
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>New course</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <label style={labelStyle}>
                  Course Title
                  <input
                    aria-label="Course title"
                    placeholder="e.g. Applied Business SQL & Analytics"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  URL Slug (kebab-case)
                  <input
                    aria-label="Course slug"
                    placeholder="e.g. applied-business-sql"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                <label style={labelStyle}>
                  Category
                  <input
                    aria-label="Category"
                    placeholder="Data & Analytics"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Level
                  <input
                    aria-label="Course level"
                    placeholder="Foundation to Pro"
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Duration
                  <input
                    aria-label="Course duration"
                    placeholder="8 weeks · 60 hrs"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Price (₹ INR, 0 = Free Pilot)
                  <input
                    aria-label="Course price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Course Overview &amp; Description
                <textarea
                  aria-label="Description"
                  rows={3}
                  placeholder="Explain what the learner will execute, build, and prove in this course…"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  style={inputStyle}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <label style={labelStyle}>
                  Learning Outcomes (1 per line)
                  <textarea
                    rows={3}
                    value={outcomesText}
                    onChange={(e) => setOutcomesText(e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Who This Course Is For (1 per line)
                  <textarea
                    rows={3}
                    value={forWhomText}
                    onChange={(e) => setForWhomText(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <button
                className="os-btn os-btn-primary"
                type="submit"
                style={{
                  background: "#5142b5",
                  color: "#ffffff",
                  borderColor: "#5142b5",
                  fontWeight: 700,
                  padding: "11px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Create draft course →
              </button>
            </form>
          ) : null}

          {/* TAB 2: ADD MODULE */}
          {(studioTab === "modules" || studioTab === "all") && selected ? (
            <form onSubmit={onAddModule} style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  STEP 02 · ADD MODULE TO {selected.slug.toUpperCase()}
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>Add module</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569" }}>
                  There {selected.modules.length === 1 ? "is" : "are"} {selected.modules.length} module
                  {selected.modules.length === 1 ? "" : "s"} now. Position {modulePosition || "1"} places the new module in that order.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                <label style={labelStyle}>
                  Module Title
                  <input
                    aria-label="Module title"
                    placeholder="e.g. Module 1: Commercial Revenue & SQL Grain"
                    value={moduleTitle}
                    onChange={(event) => setModuleTitle(event.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Order Position
                  <input
                    aria-label="Module position"
                    type="number"
                    min={1}
                    value={modulePosition}
                    onChange={(event) => setModulePosition(event.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Module Objective / Description (Optional)
                <input
                  placeholder="What will students master and submit at the end of this module?"
                  value={moduleDescription}
                  onChange={(event) => setModuleDescription(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <button
                className="os-btn os-btn-primary"
                type="submit"
                style={{
                  background: "#5142b5",
                  color: "#ffffff",
                  borderColor: "#5142b5",
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Add module →
              </button>
            </form>
          ) : null}

          {/* TAB 3: ADD LECTURE / LAB / QUIZ / VIDEO */}
          {(studioTab === "lectures" || studioTab === "all") && selected ? (
            <form onSubmit={onAddLecture} style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  STEP 03 · AUTHOR LECTURE, VIDEO, LAB, CASE BRIEF OR QUIZ
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>Add lecture</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <label style={labelStyle}>
                  Parent Module
                  <select
                    aria-label="Parent module"
                    value={lectureModule}
                    onChange={(event) => setLectureModule(event.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">Choose the module</option>
                    {selected.modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.position}. {module.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={labelStyle}>
                  Lecture Format / Node Type
                  <select
                    aria-label="Lecture node type"
                    value={lectureNodeType}
                    onChange={(e) => setLectureNodeType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="NOTES">NOTES — Reading + Hinglish AI Coach</option>
                    <option value="VIDEO">VIDEO — Video Lecture + Transcript</option>
                    <option value="LAB">LAB — Browser SQL / Python / RAG Sandbox</option>
                    <option value="ASSIGNMENT">ASSIGNMENT — Graded Case Brief (V1→V2 Review)</option>
                    <option value="PROJECT">PROJECT — Graded Capstone Studio</option>
                    <option value="QUIZ">QUIZ — Graded Multiple-Choice Assessment</option>
                  </select>
                </label>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: NODE_TYPE_META[lectureNodeType]?.bg ?? "#f5f3ff",
                  color: NODE_TYPE_META[lectureNodeType]?.color ?? "#5142b5",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {NODE_TYPE_META[lectureNodeType]?.badge}: {NODE_TYPE_META[lectureNodeType]?.desc}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                <label style={labelStyle}>
                  Lecture Title
                  <input
                    aria-label="Lecture title"
                    placeholder="e.g. Diagnosing Order-to-Line-Item Join Fan-Out"
                    value={lectureTitle}
                    onChange={(event) => setLectureTitle(event.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Position (Optional)
                  <input
                    type="number"
                    min={1}
                    placeholder="Auto"
                    value={lecturePosition}
                    onChange={(e) => setLecturePosition(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Lecture Content / Reading Notes / Case Prompt (Markdown &amp; Hinglish AI Grounding Text)
                <textarea
                  rows={5}
                  placeholder="Write the full lesson notes, SQL/Python explanation, or assignment prompt here. Skylent AI uses this exact text to coach learners in English and Hinglish!"
                  value={lectureSummary}
                  onChange={(e) => setLectureSummary(e.target.value)}
                  style={inputStyle}
                />
              </label>

              {lectureNodeType === "VIDEO" || lectureNodeType === "NOTES" || lectureNodeType === "LAB" ? (
                <label style={labelStyle}>
                  Video / Live Session / Reference URL (Optional — e.g. https://… or Zoom/Meet/Mux link)
                  <input
                    type="url"
                    placeholder="https://stream.mux.com/..."
                    value={lectureReferenceUrl}
                    onChange={(e) => setLectureReferenceUrl(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              ) : null}

              {lectureNodeType === "QUIZ" ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>Interactive Quiz Builder</strong>
                    <button
                      type="button"
                      onClick={() =>
                        setQuizQuestions((prev) => [
                          ...prev,
                          {
                            question: "",
                            options: ["Option A", "Option B", "Option C", "Option D"],
                            correctIndex: 0,
                            explanation: "",
                          },
                        ])
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        border: "1px solid #5142b5",
                        background: "#f5f3ff",
                        color: "#5142b5",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Question
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label style={labelStyle}>
                      Passing Score (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={quizPassingScore}
                        onChange={(e) => setQuizPassingScore(e.target.value)}
                        style={inputStyle}
                      />
                    </label>
                    <label style={labelStyle}>
                      Max Attempts
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={quizMaxAttempts}
                        onChange={(e) => setQuizMaxAttempts(e.target.value)}
                        style={inputStyle}
                      />
                    </label>
                  </div>

                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#5142b5" }}>Question {qIdx + 1}</span>
                        {quizQuestions.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                            style={{ fontSize: 11, color: "#b91c1c", background: "none", border: "none", cursor: "pointer" }}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <input
                        placeholder="Question prompt"
                        value={q.question}
                        onChange={(e) =>
                          setQuizQuestions((prev) =>
                            prev.map((item, i) => (i === qIdx ? { ...item, question: e.target.value } : item)),
                          )
                        }
                        required
                        style={inputStyle}
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctIndex === oIdx}
                              onChange={() =>
                                setQuizQuestions((prev) =>
                                  prev.map((item, i) => (i === qIdx ? { ...item, correctIndex: oIdx } : item)),
                                )
                              }
                              title="Mark as correct option"
                            />
                            <input
                              value={opt}
                              placeholder={`Option ${oIdx + 1}`}
                              onChange={(e) =>
                                setQuizQuestions((prev) =>
                                  prev.map((item, i) => {
                                    if (i !== qIdx) return item
                                    const nextOpts = [...item.options] as [string, string, string, string]
                                    nextOpts[oIdx] = e.target.value
                                    return { ...item, options: nextOpts }
                                  }),
                                )
                              }
                              required
                              style={inputStyle}
                            />
                          </div>
                        ))}
                      </div>
                      <input
                        placeholder="First-principles explanation shown after answer"
                        value={q.explanation}
                        onChange={(e) =>
                          setQuizQuestions((prev) =>
                            prev.map((item, i) => (i === qIdx ? { ...item, explanation: e.target.value } : item)),
                          )
                        }
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                className="os-btn os-btn-primary"
                type="submit"
                style={{
                  background: "#5142b5",
                  color: "#ffffff",
                  borderColor: "#5142b5",
                  fontWeight: 700,
                  padding: "11px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Add lecture →
              </button>
            </form>
          ) : null}

          {/* TAB 4: ASSIGN FACULTY / TA TO COURSE */}
          {(studioTab === "faculty" || studioTab === "all") && selected ? (
            <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  STEP 04 · FACULTY TA COURSE ASSIGNMENT &amp; PERMISSIONS
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>
                  Assign Faculty / TA to {selected.title}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                  Assigned Faculty TAs can add lectures, upload PDF/PPTX study materials, resolve 20-minute student doubts, and grade V1 → V2 Capstone submissions for this course inside <code>/dashboard/faculty</code>.
                </p>
              </div>

              <form onSubmit={onAssignFaculty} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <label style={{ ...labelStyle, flex: 1, minWidth: 220 }}>
                  Select Faculty or Admin User
                  <select
                    value={selectedFacultyUserId}
                    onChange={(e) => setSelectedFacultyUserId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select user…</option>
                    {(facultyData?.availableFaculty ?? []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="os-btn os-btn-primary"
                  style={{
                    background: "#5142b5",
                    color: "#ffffff",
                    borderColor: "#5142b5",
                    fontWeight: 700,
                    padding: "10px 18px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Assign to Course
                </button>
              </form>

              {facultyData && facultyData.assigned.length > 0 ? (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                  {facultyData.assigned.map((a) => (
                    <li
                      key={a.userId}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{a.name}</strong>
                        <span style={{ display: "block", fontSize: 12, color: "#64748b" }}>{a.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void onRemoveFaculty(a.userId)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "1px solid #fecaca",
                          background: "#ffffff",
                          color: "#b91c1c",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                  No dedicated Faculty TA assigned yet (Superadmin has automatic access to all courses).
                </p>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const BUILDER_NAV_ITEMS: AuthNavItem[] = [
  { id: "all", label: "Full Studio View", short: "Studio" },
  { id: "course", label: "1. Create / Select Course", short: "Courses" },
  { id: "modules", label: "2. Modules & Syllabus", short: "Modules" },
  { id: "lectures", label: "3. Add Lectures & Quizzes", short: "Lectures" },
  { id: "faculty", label: "4. Assign Faculty TA", short: "Faculty" },
  { id: "admin-back", label: "← Back to Admin OS", short: "Admin", href: "/dashboard/admin" },
]

export default function CourseBuilderPage() {
  const { user, ready } = useAuth()
  const [activeNav, setActiveNav] = useState("all")

  if (!ready || !user) return null

  return (
    <AuthDashboardShell
      themeId="superadmin"
      workspace="learning"
      workspaceLabel="Curriculum Studio"
      roleLabel={user.role === "superadmin" ? "Super Admin" : "Admin"}
      navItems={BUILDER_NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={() => null}
    >
      <div className="sh" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <CourseAuthoringStudio activeSubTab={activeNav} onSubTabChange={setActiveNav} />
      </div>
    </AuthDashboardShell>
  )
}
