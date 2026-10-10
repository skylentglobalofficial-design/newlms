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

function useCatalogResource<T>(loader: () => Promise<T>): CatalogState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await loader())
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : "Failed to load catalog data")
    } finally {
      setLoading(false)
    }
  }, [loader])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}

/**
 * Courses for /courses. Same rule as programmes: when the API cannot be reached the published list
 * is shown and `offline` is true, so the page can say availability is not confirmed.
 */
export function useCatalogCourses() {
  const state = useCatalogResource(fetchCatalogCourses)
  const offline = !state.loading && Boolean(state.error)
  const data = offline ? publishedCourseSummaries() : state.data
  return { ...state, data, error: null as string | null, offline, requestError: state.error }
}

/**
 * Detail fallback: when the API request failed (not a 404), use the published record for the slug.
 * A slug that is not published keeps the error, because the page cannot tell missing from down.
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
 * Programmes for the public index and homepage. When the API cannot be reached the published
 * list (the records the seed writes, src/lib/catalogue-fallback.ts) is shown instead of an
 * error page; `offline` tells the page so it can say enrolment needs a moment.
 */
export function useCatalogPrograms() {
  const state = useCatalogResource(fetchCatalogPrograms)
  const offline = !state.loading && Boolean(state.error)
  const data = offline ? publishedProgrammeSummaries() : state.data
  return { ...state, data, error: null as string | null, offline, requestError: state.error }
}

function useCatalogCourseRequest(slug: string | undefined) {
  const [data, setData] = useState<CatalogCourseDetail | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!slug) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await fetchCatalogCourse(slug))
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : "Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}

function useCatalogProgramRequest(slug: string | undefined) {
  const [data, setData] = useState<CatalogProgramDetail | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!slug) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await fetchCatalogProgram(slug))
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : "Failed to load program")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    reload()
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
