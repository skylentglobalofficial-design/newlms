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
import { publishedProgrammeSummaries } from "../lib/catalogue-fallback"

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

export function useCatalogCourses() {
  return useCatalogResource(fetchCatalogCourses)
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

export function useCatalogCourse(slug: string | undefined) {
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

export function useCatalogProgram(slug: string | undefined) {
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
