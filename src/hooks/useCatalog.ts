import { useCallback, useEffect, useState } from "react"
import {
  fetchCatalogCourse,
  fetchCatalogCourses,
  fetchCatalogProgram,
  fetchCatalogPrograms,
  type CatalogCourseSummary,
  type CatalogProgramSummary,
} from "../lib/catalog-api"

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

export function useCatalogPrograms() {
  return useCatalogResource(fetchCatalogPrograms)
}

export function useCatalogCourse(slug: string | undefined) {
  const [data, setData] = useState<CatalogCourseSummary | null>(null)
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
  const [data, setData] = useState<CatalogProgramSummary | null>(null)
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
