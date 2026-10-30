export interface DraftStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface ProjectReflectionDraft {
  projectId?: string
  baseUpdatedAt?: string | null
  finding: string
  whyItMatters: string
  recommendation: string
  savedAt: string
}

export interface PracticeWorkspaceDraft {
  baseServerBody?: string
  body: string
  savedAt: string
}

export interface AssignmentDraft {
  baseServerText: string
  responseText: string
  savedAt: string
}

const DRAFT_PREFIX = "skylent:draft:v1"

function defaultStorage(): DraftStorageLike | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // sessionStorage may be blocked in restricted browser contexts
  }
  return null
}

export function buildProjectReflectionDraftKey(projectType: string, projectId?: string | null): string {
  const cleanType = projectType.trim().toLowerCase()
  const cleanId = projectId?.trim() || "default"
  return `${DRAFT_PREFIX}:project:${cleanType}:${cleanId}`
}

export function buildPracticeWorkspaceDraftKey(courseSlug: string, lessonId: string): string {
  return `${DRAFT_PREFIX}:practice:${courseSlug.trim().toLowerCase()}:${lessonId.trim().toLowerCase()}`
}

export function buildAssignmentDraftKey(courseSlug: string, lessonKey: string): string {
  return `${DRAFT_PREFIX}:assignment:${courseSlug.trim().toLowerCase()}:${lessonKey.trim().toLowerCase()}`
}

export function readLocalDraft<T>(key: string, storage: DraftStorageLike | null = defaultStorage()): T | null {
  if (!storage || !key) return null
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as T
    return parsed && typeof parsed === "object" ? parsed : null
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
    // Ignore storage removal errors
  }
}

export function reconcileProjectReflectionDraft(
  serverState: {
    finding: string | null | undefined
    whyItMatters: string | null | undefined
    recommendation: string | null | undefined
    updatedAt?: string | null
  },
  localDraft: ProjectReflectionDraft | null,
  expectedProjectId?: string | null,
): {
  finding: string
  whyItMatters: string
  recommendation: string
  restoredFromLocal: boolean
} {
  const serverFinding = serverState.finding ?? ""
  const serverWhy = serverState.whyItMatters ?? ""
  const serverRec = serverState.recommendation ?? ""

  if (!localDraft) {
    return {
      finding: serverFinding,
      whyItMatters: serverWhy,
      recommendation: serverRec,
      restoredFromLocal: false,
    }
  }

  if (expectedProjectId && localDraft.projectId && localDraft.projectId !== expectedProjectId) {
    return {
      finding: serverFinding,
      whyItMatters: serverWhy,
      recommendation: serverRec,
      restoredFromLocal: false,
    }
  }

  const hasLocalDiff =
    localDraft.finding !== serverFinding ||
    localDraft.whyItMatters !== serverWhy ||
    localDraft.recommendation !== serverRec

  if (!hasLocalDiff) {
    return {
      finding: serverFinding,
      whyItMatters: serverWhy,
      recommendation: serverRec,
      restoredFromLocal: false,
    }
  }

  if (
    localDraft.baseUpdatedAt !== undefined &&
    (serverState.updatedAt ?? null) !== (localDraft.baseUpdatedAt ?? null)
  ) {
    return {
      finding: serverFinding,
      whyItMatters: serverWhy,
      recommendation: serverRec,
      restoredFromLocal: false,
    }
  }

  if (serverState.updatedAt && localDraft.savedAt) {
    const serverTime = Date.parse(serverState.updatedAt)
    const localTime = Date.parse(localDraft.savedAt)
    if (Number.isFinite(serverTime) && Number.isFinite(localTime) && serverTime > localTime) {
      return {
        finding: serverFinding,
        whyItMatters: serverWhy,
        recommendation: serverRec,
        restoredFromLocal: false,
      }
    }
  }

  return {
    finding: localDraft.finding,
    whyItMatters: localDraft.whyItMatters,
    recommendation: localDraft.recommendation,
    restoredFromLocal: true,
  }
}

export function reconcilePracticeTextDraft(
  serverBody: string | null | undefined,
  localDraft: PracticeWorkspaceDraft | null,
): {
  body: string
  restoredFromLocal: boolean
} {
  const cleanServer = serverBody ?? ""
  if (!localDraft || typeof localDraft.body !== "string") {
    return { body: cleanServer, restoredFromLocal: false }
  }
  if (localDraft.body === cleanServer || !localDraft.body.trim()) {
    return { body: cleanServer, restoredFromLocal: false }
  }
  if (localDraft.baseServerBody !== undefined && localDraft.baseServerBody !== cleanServer) {
    return { body: cleanServer, restoredFromLocal: false }
  }
  return { body: localDraft.body, restoredFromLocal: true }
}

export function reconcileAssignmentDraft(
  serverText: string | null | undefined,
  serverStatus: string | null | undefined,
  localDraft: AssignmentDraft | null,
): {
  responseText: string
  restoredFromLocal: boolean
} {
  const cleanServer = serverText ?? ""
  const status = serverStatus ?? "not_started"
  if (status !== "not_started" && status !== "in_progress" && status !== "draft") {
    return { responseText: cleanServer, restoredFromLocal: false }
  }
  if (!localDraft || typeof localDraft.responseText !== "string") {
    return { responseText: cleanServer, restoredFromLocal: false }
  }
  if (localDraft.responseText === cleanServer || !localDraft.responseText.trim()) {
    return { responseText: cleanServer, restoredFromLocal: false }
  }
  // When serverText is null/undefined (e.g. transient fetch failure), preserve local draft regardless of baseServerText
  if (serverText != null && localDraft.baseServerText !== undefined && localDraft.baseServerText !== cleanServer) {
    return { responseText: cleanServer, restoredFromLocal: false }
  }
  return { responseText: localDraft.responseText, restoredFromLocal: true }
}
