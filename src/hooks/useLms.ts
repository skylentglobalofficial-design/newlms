import { useCallback, useEffect, useMemo, useState } from "react"
import type { ApiCourseWorkspace } from "../lib/lms-api"
import {
  apiLessonStateToUi,
  enrollInCourse,
  fetchCourseAccess,
  fetchCourseWorkspace,
  fetchLmsDashboard,
  LmsHttpError,
  workspaceToCourse,
} from "../lib/lms-api"
import type { LessonState } from "../demo/types"
import type { LmsCourseView } from "../components/lms/lms-utils"
import { EMPTY_LESSON_STATE } from "../demo/DemoStateContext"

function mapLessonStates(workspace: ApiCourseWorkspace | null): Record<string, LessonState> {
  if (!workspace) return {}
  return Object.fromEntries(
    Object.entries(workspace.lessonStates).map(([key, state]) => [key, apiLessonStateToUi(state)]),
  )
}

export type LmsAccessState =
  | { status: "loading" }
  | { status: "login_required" }
  | { status: "not_enrolled"; courseSlug: string; courseTitle: string }
  | { status: "ready"; workspace: ApiCourseWorkspace; course: LmsCourseView }

export function useLmsDashboard() {
  const [workspace, setWorkspace] = useState<ApiCourseWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLmsDashboard()
      setWorkspace(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
      setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const course = useMemo(() => (workspace ? workspaceToCourse(workspace) : null), [workspace])
  const lessonStates = useMemo(() => mapLessonStates(workspace), [workspace])

  return { workspace, course, lessonStates, loading, error, reload }
}

export function useLmsCourse(slug: string | undefined) {
  const [access, setAccess] = useState<LmsAccessState>({ status: "loading" })

  const reload = useCallback(async () => {
    if (!slug) return
    setAccess({ status: "loading" })
    try {
      // Workspace-first: avoids access→workspace waterfall. Auth/enrollment
      // failures map from HTTP status (401/403) instead of a probe round-trip.
      const workspace = await fetchCourseWorkspace(slug)
      setAccess({
        status: "ready",
        workspace,
        course: workspaceToCourse(workspace),
      })
    } catch (err) {
      if (err instanceof LmsHttpError && err.status === 403) {
        try {
          const accessInfo = await fetchCourseAccess(slug)
          setAccess({
            status: "not_enrolled",
            courseSlug: accessInfo.courseSlug ?? slug,
            courseTitle: accessInfo.courseTitle ?? slug,
          })
        } catch {
          setAccess({
            status: "not_enrolled",
            courseSlug: slug,
            courseTitle: slug,
          })
        }
        return
      }
      setAccess({ status: "login_required" })
    }
  }, [slug])

  useEffect(() => {
    reload()
  }, [reload])

  const enroll = useCallback(async () => {
    if (!slug) return
    const workspace = await enrollInCourse(slug)
    setAccess({
      status: "ready",
      workspace,
      course: workspaceToCourse(workspace),
    })
    return workspace
  }, [slug])

  const lessonStates = useMemo(
    () => (access.status === "ready" ? mapLessonStates(access.workspace) : {}),
    [access],
  )

  const getLessonState = (lessonId: string): LessonState =>
    lessonStates[lessonId] ?? { ...EMPTY_LESSON_STATE }

  const patchWorkspace = useCallback((workspace: ApiCourseWorkspace) => {
    setAccess({
      status: "ready",
      workspace,
      course: workspaceToCourse(workspace),
    })
  }, [])

  return { access, lessonStates, getLessonState, reload, enroll, patchWorkspace }
}
