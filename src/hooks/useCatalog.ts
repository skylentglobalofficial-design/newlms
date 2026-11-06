import { useCallback, useEffect, useState } from "react"
import {
  fetchCatalogCourse,
  fetchCatalogCourses,
  fetchCatalogProgram,
  fetchCatalogPrograms,
  type CatalogCourseDetail,
  type CatalogCourseSummary,
  type CatalogProgramDetail,
  type CatalogProgramSummary,
} from "../lib/catalog-api"
import {
  publishedCourseDetail,
  publishedCourseSummaries,
  publishedProgrammeDetail,
  publishedProgrammeSummaries,
} from "../lib/catalogue-fallback"

type CatalogState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const memCatalogCache = new Map<string, unknown>()

function mergeCourseSummaries(
  apiRows: CatalogCourseSummary[],
  fallbackRows: CatalogCourseSummary[],
): CatalogCourseSummary[] {
  const bySlug = new Map<string, CatalogCourseSummary>()
  for (const row of fallbackRows) {
    bySlug.set(row.slug, row)
  }
  for (const row of apiRows) {
    const existing = bySlug.get(row.slug)
    bySlug.set(row.slug, existing ? { ...existing, ...row } : row)
  }
  return Array.from(bySlug.values())
}

function useCatalogResource<T>(key: string, loader: () => Promise<T>, initialFallback: () => T): CatalogState<T> {
  const [data, setData] = useState<T | null>(() => {
    const cached = memCatalogCache.get(key) as T | undefined
    return cached ?? initialFallback()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const fresh = await loader()
      memCatalogCache.set(key, fresh)
      setData(fresh)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalog data")
    } finally {
      setLoading(false)
    }
  }, [key, loader])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload }
}

/**
 * Courses for /courses. Renders instantaneously in 0ms from published data while refreshing silently,
 * and always guarantees all 6 flagship courses are present alongside any custom DB-authored courses.
 */
export function useCatalogCourses() {
  const loadMergedCourses = useCallback(async () => {
    const apiCourses = await fetchCatalogCourses()
    return mergeCourseSummaries(apiCourses, publishedCourseSummaries())
  }, [])
  const state = useCatalogResource("courses:list", loadMergedCourses, publishedCourseSummaries)
  const offline = !state.loading && Boolean(state.error)
  const data = offline ? publishedCourseSummaries() : state.data
  return { ...state, data, error: null as string | null, offline, requestError: state.error }
}

/**
 * Detail fallback: when the API request failed (not a 404), use the published record for the slug.
 */
function withDetailFallback<T>(
  state: { data: T | null; loading: boolean; error: string | null; reload: () => Promise<void> },
  fallback: T | null,
) {
  const offline = !state.loading && Boolean(state.error) && fallback !== null
  return {
    ...state,
    data: offline ? fallback : state.data,
    error: offline ? null : state.error,
    offline,
    requestError: state.error,
  }
}

/**
 * Programmes for the public index and homepage. Renders instantaneously in 0ms.
 */
export function useCatalogPrograms() {
  const state = useCatalogResource("programs:list", fetchCatalogPrograms, publishedProgrammeSummaries)
  const offline = !state.loading && Boolean(state.error)
  const data = offline ? publishedProgrammeSummaries() : state.data
  return { ...state, data, error: null as string | null, offline, requestError: state.error }
}

function useCatalogCourseRequest(slug: string | undefined) {
  const initial = slug ? ((memCatalogCache.get(`course:${slug}`) as CatalogCourseDetail | undefined) ?? publishedCourseDetail(slug)) : null
  const [data, setData] = useState<CatalogCourseDetail | null>(initial)
  const [loading, setLoading] = useState(Boolean(slug && !initial))
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!slug) {
      setData(null)
      setLoading(false)
      return
    }
    const pub = (memCatalogCache.get(`course:${slug}`) as CatalogCourseDetail | undefined) ?? publishedCourseDetail(slug)
    if (pub) {
      setData(pub)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const fresh = await fetchCatalogCourse(slug)
      if (fresh) memCatalogCache.set(`course:${slug}`, fresh)
      setData(fresh)
    } catch (err) {
      if (!pub) setData(null)
      setError(err instanceof Error ? err.message : "Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload }
}

function useCatalogProgramRequest(slug: string | undefined) {
  const initial = slug ? ((memCatalogCache.get(`program:${slug}`) as CatalogProgramDetail | undefined) ?? publishedProgrammeDetail(slug)) : null
  const [data, setData] = useState<CatalogProgramDetail | null>(initial)
  const [loading, setLoading] = useState(Boolean(slug && !initial))
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!slug) {
      setData(null)
      setLoading(false)
      return
    }
    const pub = (memCatalogCache.get(`program:${slug}`) as CatalogProgramDetail | undefined) ?? publishedProgrammeDetail(slug)
    if (pub) {
      setData(pub)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const fresh = await fetchCatalogProgram(slug)
      if (fresh) memCatalogCache.set(`program:${slug}`, fresh)
      setData(fresh)
    } catch (err) {
      if (!pub) setData(null)
      setError(err instanceof Error ? err.message : "Failed to load program")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload }
}

export function useCatalogCourse(slug: string | undefined) {
  const state = useCatalogCourseRequest(slug)
  return withDetailFallback(state, slug && state.error ? publishedCourseDetail(slug) : null)
}

export function useCatalogProgram(slug: string | undefined) {
  const state = useCatalogProgramRequest(slug)
  return withDetailFallback(state, slug && state.error ? publishedProgrammeDetail(slug) : null)
}
