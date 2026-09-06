import { useCallback, useEffect, useState } from "react"
import type { ApiCourseWorkspace } from "../lib/lms-api"
import {
  apiLessonStateToUi,
  enrollInCourse,
  fetchCourseAccess,
  fetchCourseWorkspace,
  fetchEnrollments,
  fetchLmsDashboard,
  workspaceToCourse,
  type ApiEnrollment,
} from "../lib/lms-api"
import type { LessonState } from "../demo/types"
import type { LmsCourseView } from "../components/lms/lms-utils"
import { EMPTY_LESSON_STATE } from "../demo/DemoStateContext"

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

  const course = workspace ? workspaceToCourse(workspace) : null
  const lessonStates: Record<string, LessonState> = workspace
    ? Object.fromEntries(
        Object.entries(workspace.lessonStates).map(([key, state]) => [key, apiLessonStateToUi(state)]),
      )
    : {}

  return { workspace, course, lessonStates, loading, error, reload }
}

export function useLmsCourse(slug: string | undefined) {
  const [access, setAccess] = useState<LmsAccessState>({ status: "loading" })

  const reload = useCallback(async () => {
    if (!slug) return
    setAccess({ status: "loading" })
    try {
      const accessInfo = await fetchCourseAccess(slug)
      if (!accessInfo.authenticated) {
        setAccess({ status: "login_required" })
        return
      }
      if (!accessInfo.enrolled || !accessInfo.canAccess) {
        setAccess({
          status: "not_enrolled",
          courseSlug: accessInfo.courseSlug ?? slug,
          courseTitle: accessInfo.courseTitle ?? slug,
        })
        return
      }
      const workspace = await fetchCourseWorkspace(slug)
      setAccess({
        status: "ready",
        workspace,
        course: workspaceToCourse(workspace),
      })
    } catch {
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

  const lessonStates: Record<string, LessonState> =
    access.status === "ready"
      ? Object.fromEntries(
          Object.entries(access.workspace.lessonStates).map(([key, state]) => [
            key,
            apiLessonStateToUi(state),
          ]),
        )
      : {}

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

export function useLmsEnrollments() {
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEnrollments()
      setEnrollments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollments")
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { enrollments, loading, error, reload }
}
