import { useEffect, useState, type FormEvent } from "react"
import { AuthDashboardShell } from "../components/AuthDashboardShell"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"
import { ensureCsrfToken } from "../lib/auth-api"

type Lecture = { id: string; position: number; title: string; nodeType: string }
type ModuleRow = { id: string; position: number; title: string; description: string | null; lectures: Lecture[] }
type CourseRow = {
  id: string
  slug: string
  title: string
  publicationStatus: string
  modules: ModuleRow[]
}
type CourseListItem = { id: string; slug: string; title: string; publicationStatus: string }

async function curriculumRequest<T>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (method !== "GET") headers["X-CSRF-Token"] = await ensureCsrfToken()
  const response = await fetch(`${apiV1()}/admin/curriculum${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({})) as { error?: string; data?: T }
  if (!response.ok) throw new Error(payload.error || "The curriculum request failed")
  return (payload.data ?? payload) as T
}

export default function CourseBuilderPage() {
  const { user, ready } = useAuth()
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [selected, setSelected] = useState<CourseRow | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [moduleTitle, setModuleTitle] = useState("")
  const [modulePosition, setModulePosition] = useState("1")
  const [lectureTitle, setLectureTitle] = useState("")
  const [lectureModule, setLectureModule] = useState("")

  async function refresh(courseId?: string) {
    const list = await curriculumRequest<CourseListItem[]>("/courses", "GET")
    setCourses(list)
    const id = courseId ?? selected?.id
    if (id) setSelected(await curriculumRequest<CourseRow>(`/courses/${id}`, "GET"))
  }

  useEffect(() => {
    if (!ready || !user) return
    void refresh().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load courses"))
    // The first load does not depend on the selected course.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user])

  async function onCreateCourse(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      const created = await curriculumRequest<CourseRow>("/courses", "POST", { title, slug, description, category })
      setSelected(created)
      setTitle("")
      setSlug("")
      setDescription("")
      setCategory("")
      await refresh(created.id)
      setMessage("Draft course saved. It is not public until you publish it.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the course")
    }
  }

  async function onAddModule(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setMessage(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/modules`, "POST", {
        title: moduleTitle,
        position: Number(modulePosition) || 1,
      })
      setSelected(next)
      setModuleTitle("")
      setMessage(`Module saved at position ${modulePosition}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add the module")
    }
  }

  async function onAddLecture(event: FormEvent) {
    event.preventDefault()
    if (!lectureModule) return
    setMessage(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/modules/${lectureModule}/lectures`, "POST", {
        title: lectureTitle,
        nodeType: "NOTES",
      })
      setSelected(next)
      setLectureTitle("")
      setMessage("Lecture saved on the selected module.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add the lecture")
    }
  }

  async function onPublish() {
    if (!selected) return
    setMessage(null)
    try {
      const next = await curriculumRequest<CourseRow>(`/courses/${selected.id}/publish`, "POST", {})
      setSelected(next)
      setMessage("Course published.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not publish")
    }
  }

  if (!ready || !user) return null

  return (
    <AuthDashboardShell
      themeId="superadmin"
      workspace="learning"
      workspaceLabel="Curriculum"
      roleLabel={user.role === "superadmin" ? "Super Admin" : "Admin"}
      navItems={[{ id: "builder", label: "Course builder", short: "Courses" }]}
      activeNav="builder"
      onNavChange={() => undefined}
      renderNavIcon={() => null}
    >
      <div className="sh" style={{ display: "grid", gap: 24, maxWidth: 880 }}>
        <header>
          <p className="os-eyebrow">Curriculum</p>
          <h1>Course builder</h1>
          <p className="os-lead">New courses stay draft until you publish them. Publishing needs one module and one lecture.</p>
        </header>
        {message ? <p role="status">{message}</p> : null}
        <form onSubmit={onCreateCourse} style={{ display: "grid", gap: 8 }}>
          <h2>New course</h2>
          <input aria-label="Course title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <input aria-label="Course slug" placeholder="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          <input aria-label="Category" placeholder="Category" value={category} onChange={(event) => setCategory(event.target.value)} required />
          <textarea aria-label="Description" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
          <button className="os-btn os-btn-primary" type="submit">Create draft course</button>
        </form>
        <label>
          Open a course
          <select
            aria-label="Open a course"
            value={selected?.id ?? ""}
            onChange={(event) => {
              const id = event.target.value
              if (!id) return
              void curriculumRequest<CourseRow>(`/courses/${id}`, "GET").then(setSelected).catch((error: unknown) => {
                setMessage(error instanceof Error ? error.message : "Could not open the course")
              })
            }}
          >
            <option value="">Select</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title} · {course.publicationStatus}</option>
            ))}
          </select>
        </label>
        {selected ? (
          <>
            <section>
              <h2>{selected.title}</h2>
              <p>{selected.publicationStatus} · {selected.slug}</p>
              <ol>
                {selected.modules.map((module) => (
                  <li key={module.id}>
                    <strong>{module.position}. {module.title}</strong>
                    <ul>
                      {module.lectures.map((lecture) => (
                        <li key={lecture.id}>{lecture.position}. {lecture.title} ({lecture.nodeType})</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              {selected.modules.length === 0 ? <p>No modules yet.</p> : null}
            </section>
            <form onSubmit={onAddModule} style={{ display: "grid", gap: 8 }}>
              <h2>Add module</h2>
              <p>There {selected.modules.length === 1 ? "is" : "are"} {selected.modules.length} module{selected.modules.length === 1 ? "" : "s"} now. Position {modulePosition || "1"} places the new module in that order.</p>
              <input aria-label="Module title" placeholder="Module title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} required />
              <input aria-label="Module position" type="number" min={1} value={modulePosition} onChange={(event) => setModulePosition(event.target.value)} />
              <button className="os-btn" type="submit">Add module</button>
            </form>
            <form onSubmit={onAddLecture} style={{ display: "grid", gap: 8 }}>
              <h2>Add lecture</h2>
              <select aria-label="Parent module" value={lectureModule} onChange={(event) => setLectureModule(event.target.value)} required>
                <option value="">Choose the module</option>
                {selected.modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.position}. {module.title}</option>
                ))}
              </select>
              <input aria-label="Lecture title" placeholder="Lecture title" value={lectureTitle} onChange={(event) => setLectureTitle(event.target.value)} required />
              <button className="os-btn" type="submit">Add lecture</button>
            </form>
            <button className="os-btn os-btn-primary" type="button" onClick={() => void onPublish()}>Publish course</button>
          </>
        ) : null}
      </div>
    </AuthDashboardShell>
  )
}
