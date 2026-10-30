export type DraftStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

export type ProjectReflectionDraft = {
  finding: string
  whyItMatters: string
  recommendation: string
  savedAt: string
}

export type PracticeWorkspaceDraft = {
  body: string
  savedAt: string
}

function defaultStorage(): DraftStorageLike | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // Storage access may be blocked in restricted browser contexts.
  }
  return null
}

export function buildProjectReflectionDraftKey(projectType: string): string {
  return `skylent:draft:project:${projectType.trim()}`
}

export function buildPracticeWorkspaceDraftKey(courseSlug: string, lessonId: string): string {
  return `skylent:draft:practice:${courseSlug.trim()}:${lessonId.trim()}`
}

export function readLocalDraft<T>(key: string, storage: DraftStorageLike | null = defaultStorage()): T | null {
  if (!storage || !key) return null
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeLocalDraft<T>(key: string, value: T, storage: DraftStorageLike | null = defaultStorage()): boolean {
  if (!storage || !key) return false
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function clearLocalDraft(key: string, storage: DraftStorageLike | null = defaultStorage()): void {
  if (!storage || !key) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore storage removal errors.
  }
}

export function reconcileProjectReflectionDraft(
  serverReflection: { finding: string; whyItMatters: string; recommendation: string; updatedAt: string | null },
  localDraft: Partial<ProjectReflectionDraft> | null,
): { finding: string; whyItMatters: string; recommendation: string; restoredFromLocal: boolean } {
  if (!localDraft) {
    return {
      finding: serverReflection.finding,
      whyItMatters: serverReflection.whyItMatters,
      recommendation: serverReflection.recommendation,
      restoredFromLocal: false,
    }
  }

  const localFinding = typeof localDraft.finding === "string" ? localDraft.finding : serverReflection.finding
  const localWhy = typeof localDraft.whyItMatters === "string" ? localDraft.whyItMatters : serverReflection.whyItMatters
  const localRec = typeof localDraft.recommendation === "string" ? localDraft.recommendation : serverReflection.recommendation

  const hasNonEmptyLocal = Boolean(localFinding.trim() || localWhy.trim() || localRec.trim())
  const differsFromServer =
    localFinding !== serverReflection.finding ||
    localWhy !== serverReflection.whyItMatters ||
    localRec !== serverReflection.recommendation

  if (!hasNonEmptyLocal || !differsFromServer) {
    return {
      finding: serverReflection.finding,
      whyItMatters: serverReflection.whyItMatters,
      recommendation: serverReflection.recommendation,
      restoredFromLocal: false,
    }
  }

  if (serverReflection.updatedAt && localDraft.savedAt) {
    const serverTime = Date.parse(serverReflection.updatedAt)
    const localTime = Date.parse(localDraft.savedAt)
    if (Number.isFinite(serverTime) && Number.isFinite(localTime) && serverTime > localTime) {
      return {
        finding: serverReflection.finding,
        whyItMatters: serverReflection.whyItMatters,
        recommendation: serverReflection.recommendation,
        restoredFromLocal: false,
      }
    }
  }

  return {
    finding: localFinding,
    whyItMatters: localWhy,
    recommendation: localRec,
    restoredFromLocal: true,
  }
}

export function reconcilePracticeTextDraft(
  serverBody: string | null | undefined,
  localDraft: Partial<PracticeWorkspaceDraft> | null,
): { body: string; restoredFromLocal: boolean } {
  const cleanServer = serverBody ?? ""
  const localBody = typeof localDraft?.body === "string" ? localDraft.body : ""
  if (!localBody.trim() || localBody === cleanServer) {
    return { body: cleanServer, restoredFromLocal: false }
  }
  return { body: localBody, restoredFromLocal: true }
}
