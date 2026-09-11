import fs from "node:fs/promises"
import fsSync from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

export const LOCAL_STORAGE_PROVIDER = "local"
export const PENDING_STORAGE_PROVIDER = "pending"

/**
 * Local filesystem artifact store for LMS assignment submissions.
 * Suitable for single-node / volume-backed deployments.
 * Not a multi-region object store — document LMS_ARTIFACT_STORAGE_DIR for production.
 */
export function getArtifactStorageRoot(): string {
  const configured = process.env.LMS_ARTIFACT_STORAGE_DIR?.trim()
  if (configured) {
    return path.resolve(configured)
  }
  return path.resolve(process.cwd(), "storage", "lms-artifacts")
}

export function ensureArtifactStorageRoot(): string {
  const root = getArtifactStorageRoot()
  fsSync.mkdirSync(root, { recursive: true, mode: 0o750 })
  return root
}

export function buildLocalStorageKey(parts: {
  userId: string
  enrollmentId: string
  nodeId: string
  attachmentId: string
  extension: string
}): string {
  const ext = parts.extension.startsWith(".") ? parts.extension.toLowerCase() : `.${parts.extension.toLowerCase()}`
  // Opaque key — never includes original learner filename.
  return path.posix.join(
    "assignments",
    parts.userId,
    parts.enrollmentId,
    parts.nodeId,
    `${parts.attachmentId}${ext}`,
  )
}

export function resolveLocalStorageAbsolutePath(storageKey: string): string | null {
  if (!storageKey || storageKey.includes("\0")) return null
  const normalized = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "")
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) return null
  if (!normalized.startsWith(`assignments${path.sep}`) && !normalized.startsWith("assignments/")) {
    return null
  }
  const root = getArtifactStorageRoot()
  const absolute = path.resolve(root, normalized)
  if (!absolute.startsWith(root + path.sep) && absolute !== root) return null
  return absolute
}

export async function writeLocalArtifact(storageKey: string, buffer: Buffer): Promise<string> {
  const absolute = resolveLocalStorageAbsolutePath(storageKey)
  if (!absolute) {
    throw new Error("Invalid storage key")
  }
  ensureArtifactStorageRoot()
  await fs.mkdir(path.dirname(absolute), { recursive: true, mode: 0o750 })
  const tempPath = `${absolute}.${crypto.randomUUID()}.tmp`
  await fs.writeFile(tempPath, buffer, { mode: 0o640 })
  await fs.rename(tempPath, absolute)
  return absolute
}

export async function readLocalArtifact(storageKey: string): Promise<Buffer | null> {
  const absolute = resolveLocalStorageAbsolutePath(storageKey)
  if (!absolute || !fsSync.existsSync(absolute)) return null
  return fs.readFile(absolute)
}

export async function deleteLocalArtifact(storageKey: string): Promise<void> {
  const absolute = resolveLocalStorageAbsolutePath(storageKey)
  if (!absolute) return
  try {
    await fs.unlink(absolute)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
}

export function isStoredBinaryAttachment(attachment: {
  storageProvider: string
  storageKey: string
}): boolean {
  if (attachment.storageProvider !== LOCAL_STORAGE_PROVIDER) return false
  const absolute = resolveLocalStorageAbsolutePath(attachment.storageKey)
  return Boolean(absolute && fsSync.existsSync(absolute))
}
