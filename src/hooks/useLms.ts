import { useCallback, useEffect, useState } from "react"
import type { ApiCourseWorkspace } from "../lib/lms-api"
import {
  apiLessonStateToUi,
  enrollInCourse,
  fetchCourseAccess,
  fetchCourseWorkspace,
  fetchLmsDashboard,
  workspaceToCourse,
} from "../lib/lms-api"
import type { LessonState } from "../demo/types"
import type { LmsCourseView } from "../components/lms/lms-utils"
import { EMPTY_LESSON_STATE } from "../demo/DemoStateContext"

export type LmsAccessState =
  | { status: "loading" }
  | { status: "login_required" }
  | { status: "unavailable" }
  | { status: "not_enrolled"; courseSlug: string; courseTitle: string }
  | { status: "ready"; workspace: ApiCourseWorkspace; course: LmsCourseView }

const DASHBOARD_CACHE_KEY = "skylent:v62:lms-dashboard"
const COURSE_CACHE_PREFIX = "skylent:v62:lms-course:"

function readCachedWorkspace(key: string): ApiCourseWorkspace | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts?: number; data?: ApiCourseWorkspace }
    if (!parsed?.data?.course?.slug || !parsed.ts) return null
    if (Date.now() - parsed.ts > 5 * 60 * 1000) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCachedWorkspace(key: string, data: ApiCourseWorkspace | null) {
  if (typeof window === "undefined") return
  try {
    if (!data) {
      window.sessionStorage.removeItem(key)
      return
    }
    window.sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // ignore storage quota
  }
}

export function useLmsDashboard() {
  const initialCached = readCachedWorkspace(DASHBOARD_CACHE_KEY)
  const [workspace, setWorkspace] = useState<ApiCourseWorkspace | null>(initialCached)
  const [loading, setLoading] = useState(initialCached === null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    const hasCached = readCachedWorkspace(DASHBOARD_CACHE_KEY) !== null
    if (!options?.silent && !hasCached) setLoading(true)
    setError(null)
    try {
      const data = await fetchLmsDashboard()
      setWorkspace(data)
      writeCachedWorkspace(DASHBOARD_CACHE_KEY, data)
      if (data?.course?.slug) {
        writeCachedWorkspace(`${COURSE_CACHE_PREFIX}${data.course.slug}`, data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
      if (!options?.silent && !hasCached) setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload({ silent: initialCached !== null })
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
  const [access, setAccess] = useState<LmsAccessState>(() => {
    if (!slug) return { status: "loading" }
    const cached = readCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`)
    if (cached) {
      return {
        status: "ready",
        workspace: cached,
        course: workspaceToCourse(cached),
      }
    }
    return { status: "loading" }
  })

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    if (!slug) return
    const cached = readCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`)
    if (!options?.silent && !cached) setAccess({ status: "loading" })
    try {
      // Fetch workspace and access in parallel to eliminate sequential round-trip wait
      const [accessRes, workspaceRes] = await Promise.allSettled([
        fetchCourseAccess(slug),
        fetchCourseWorkspace(slug),
      ])

      if (workspaceRes.status === "fulfilled" && workspaceRes.value) {
        const workspace = workspaceRes.value
        writeCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`, workspace)
        setAccess({
          status: "ready",
          workspace,
          course: workspaceToCourse(workspace),
        })
        return
      }

      if (accessRes.status === "fulfilled") {
        const accessInfo = accessRes.value
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
      }

      if (accessRes.status === "rejected") {
        throw accessRes.reason
      }
      if (workspaceRes.status === "rejected") {
        throw workspaceRes.reason
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (message === "Sign in to continue.") {
        setAccess({ status: "login_required" })
        return
      }
      if (!options?.silent && !cached) {
        setAccess({ status: "unavailable" })
        return
      }
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    const cached = readCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`)
    if (cached) {
      setAccess({
        status: "ready",
        workspace: cached,
        course: workspaceToCourse(cached),
      })
      void reload({ silent: true })
    } else {
      void reload()
    }
  }, [slug, reload])

  const enroll = useCallback(async (acceptedTerms: boolean) => {
    if (!slug) return
    const workspace = await enrollInCourse(slug, acceptedTerms)
    writeCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`, workspace)
    writeCachedWorkspace(DASHBOARD_CACHE_KEY, workspace)
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
    if (slug) writeCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`, workspace)
    writeCachedWorkspace(DASHBOARD_CACHE_KEY, workspace)
    setAccess({
      status: "ready",
      workspace,
      course: workspaceToCourse(workspace),
    })
  }, [slug])

  const patchLessonStates = useCallback((updates: Record<string, ApiCourseWorkspace["lessonStates"][string]>) => {
    setAccess((current) => {
      if (current.status !== "ready") return current
      const newLessonStates = { ...current.workspace.lessonStates, ...updates }
      const newWorkspace = { ...current.workspace, lessonStates: newLessonStates }
      const completedCount = Object.values(newLessonStates).filter((s) => s.complete).length
      const totalLessons = Object.keys(newLessonStates).length
      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      newWorkspace.progress = {
        ...newWorkspace.progress,
        completedCount,
        progressPct,
        allComplete: completedCount === totalLessons,
      }
      if (slug) writeCachedWorkspace(`${COURSE_CACHE_PREFIX}${slug}`, newWorkspace)
      writeCachedWorkspace(DASHBOARD_CACHE_KEY, newWorkspace)
      return {
        status: "ready",
        workspace: newWorkspace,
        course: workspaceToCourse(newWorkspace),
      }
    })
  }, [slug])

  return { access, lessonStates, getLessonState, reload, enroll, patchWorkspace, patchLessonStates }
}
