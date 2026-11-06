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

const DASH_CACHE_KEY = "skylent:lms:dashboard:v1"
let memDashboardWorkspace: ApiCourseWorkspace | null = null
const memCourseWorkspaces = new Map<string, ApiCourseWorkspace>()

function readCachedDashboard(): ApiCourseWorkspace | null {
  if (memDashboardWorkspace) return memDashboardWorkspace
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(DASH_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ApiCourseWorkspace
    memDashboardWorkspace = parsed
    return parsed
  } catch {
    return null
  }
}

function writeCachedDashboard(ws: ApiCourseWorkspace | null) {
  memDashboardWorkspace = ws
  if (typeof window === "undefined") return
  try {
    if (ws) window.sessionStorage.setItem(DASH_CACHE_KEY, JSON.stringify(ws))
    else window.sessionStorage.removeItem(DASH_CACHE_KEY)
  } catch {
    // ignore
  }
}

function readCachedCourseWorkspace(slug: string): ApiCourseWorkspace | null {
  const mem = memCourseWorkspaces.get(slug)
  if (mem) return mem
  if (memDashboardWorkspace?.course?.slug === slug) return memDashboardWorkspace
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(`skylent:lms:course:${slug}:v1`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ApiCourseWorkspace
    memCourseWorkspaces.set(slug, parsed)
    return parsed
  } catch {
    return null
  }
}

function writeCachedCourseWorkspace(slug: string, ws: ApiCourseWorkspace) {
  memCourseWorkspaces.set(slug, ws)
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(`skylent:lms:course:${slug}:v1`, JSON.stringify(ws))
  } catch {
    // ignore
  }
}

export function useLmsDashboard() {
  const initial = readCachedDashboard()
  const [workspace, setWorkspace] = useState<ApiCourseWorkspace | null>(initial)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    const cached = readCachedDashboard()
    if (!options?.silent && !cached) setLoading(true)
    setError(null)
    try {
      const data = await fetchLmsDashboard()
      writeCachedDashboard(data)
      if (data?.course?.slug) {
        writeCachedCourseWorkspace(data.course.slug, data)
      }
      setWorkspace(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
      if (!options?.silent && !cached) setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload({ silent: Boolean(readCachedDashboard()) })
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
    const cached = readCachedCourseWorkspace(slug)
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
    const cached = readCachedCourseWorkspace(slug)
    if (!options?.silent && !cached) {
      setAccess({ status: "loading" })
    } else if (cached) {
      setAccess({
        status: "ready",
        workspace: cached,
        course: workspaceToCourse(cached),
      })
    }
    try {
      // Run access check and workspace fetch in parallel instead of sequentially!
      const [accessInfo, workspaceRes] = await Promise.all([
        fetchCourseAccess(slug),
        fetchCourseWorkspace(slug).catch(() => null),
      ])
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
      const workspace = workspaceRes ?? (await fetchCourseWorkspace(slug))
      writeCachedCourseWorkspace(slug, workspace)
      setAccess({
        status: "ready",
        workspace,
        course: workspaceToCourse(workspace),
      })
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
    void reload({ silent: Boolean(slug && readCachedCourseWorkspace(slug)) })
  }, [reload, slug])

  const enroll = useCallback(async (acceptedTerms: boolean) => {
    if (!slug) return
    const workspace = await enrollInCourse(slug, acceptedTerms)
    writeCachedCourseWorkspace(slug, workspace)
    writeCachedDashboard(workspace)
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
    if (slug) writeCachedCourseWorkspace(slug, workspace)
    writeCachedDashboard(workspace)
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
      if (slug) writeCachedCourseWorkspace(slug, newWorkspace)
      writeCachedDashboard(newWorkspace)
      return {
        status: "ready",
        workspace: newWorkspace,
        course: workspaceToCourse(newWorkspace),
      }
    })
  }, [slug])

  return { access, lessonStates, getLessonState, reload, enroll, patchWorkspace, patchLessonStates }
}
