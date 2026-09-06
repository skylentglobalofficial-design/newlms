import { useCallback, useEffect, useState } from "react"
import {
  searchJobs,
  listSavedJobs,
  type JobListing,
  type JobListParams,
  type SavedJobEntry,
} from "../lib/career-api"

export type JobsView = "browse" | "saved"

export function useJobBoard() {
  const [view, setView] = useState<JobsView>("browse")
  const [filters, setFilters] = useState<JobListParams>({ limit: "20", offset: "0" })
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [savedEntries, setSavedEntries] = useState<SavedJobEntry[]>([])
  const [meta, setMeta] = useState({ total: 0, limit: 20, offset: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const reloadBrowse = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = { ...filters, offset: "0" }
      const result = await searchJobs(query)
      setJobs(result.jobs)
      setMeta(result.meta)
      setFilters((f: JobListParams) => ({ ...f, offset: "0" }))
      setSelectedJobId((prev: string | null) => {
        if (result.jobs.length === 0) return null
        if (prev && result.jobs.some((j: JobListing) => j.id === prev)) return prev
        return result.jobs[0].id
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs")
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadMore = useCallback(async () => {
    if (loadingMore || meta.offset + meta.limit >= meta.total) return
    setLoadingMore(true)
    setError(null)
    try {
      const nextOffset = meta.offset + meta.limit
      const result = await searchJobs({ ...filters, offset: String(nextOffset) })
      setJobs((prev: JobListing[]) => {
        const ids = new Set(prev.map(j => j.id))
        return [...prev, ...result.jobs.filter((j: JobListing) => !ids.has(j.id))]
      })
      setMeta(result.meta)
      setFilters((f: JobListParams) => ({ ...f, offset: String(nextOffset) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more jobs")
    } finally {
      setLoadingMore(false)
    }
  }, [filters, loadingMore, meta.limit, meta.offset, meta.total])

  const reloadSaved = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const entries = await listSavedJobs()
      setSavedEntries(entries)
      const savedJobs = entries.map((e: SavedJobEntry) => e.job)
      setSelectedJobId((prev: string | null) => {
        if (savedJobs.length === 0) return null
        if (prev && savedJobs.some((j: JobListing) => j.id === prev)) return prev
        return savedJobs[0].id
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved jobs")
      setSavedEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === "browse") {
      void reloadBrowse()
    } else {
      void reloadSaved()
    }
  }, [view]) // eslint-disable-line react-hooks/exhaustive-deps -- reload on tab switch only

  const displayedJobs = view === "browse" ? jobs : savedEntries.map(e => e.job)
  const selectedJob = displayedJobs.find(j => j.id === selectedJobId) ?? null

  function updateSavedState(jobId: string, saved: boolean) {
    setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, saved } : j)))
    if (saved) {
      const job = jobs.find(j => j.id === jobId) ?? savedEntries.find(e => e.jobId === jobId)?.job
      if (job && !savedEntries.some(e => e.jobId === jobId)) {
        setSavedEntries(prev => [{
          id: `optimistic-${jobId}`,
          jobId,
          createdAt: new Date().toISOString(),
          job: { ...job, saved: true },
        }, ...prev])
      }
    } else {
      setSavedEntries(prev => prev.filter(e => e.jobId !== jobId))
    }
  }

  return {
    view,
    setView,
    filters,
    setFilters,
    jobs,
    savedEntries,
    meta,
    loading,
    loadingMore,
    error,
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    displayedJobs,
    reload: view === "browse" ? reloadBrowse : reloadSaved,
    loadMore,
    updateSavedState,
  }
}
