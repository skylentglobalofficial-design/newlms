import { createHash } from "node:crypto"
import { prisma } from "./prisma.js"
import {
  getArtifactStorage,
  newOpaqueStorageKey,
  StorageError,
} from "./object-storage.js"

export const ARTIFACT_MAX_BYTES = Math.min(
  Math.max(Number(process.env.ARTIFACT_MAX_BYTES ?? 25_000_000), 1024),
  50_000_000,
)

const SQL_MAX_BYTES = Math.min(2_000_000, ARTIFACT_MAX_BYTES)

const OLE_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])
const PDF_MAGIC = Buffer.from("%PDF")
const EXE_MAGIC = Buffer.from("MZ")

export const ALLOWED_ARTIFACT_EXTENSIONS = [".xlsx", ".xls", ".pbix", ".pdf", ".sql"] as const
export type AllowedArtifactExtension = (typeof ALLOWED_ARTIFACT_EXTENSIONS)[number]

const MIME_BY_EXTENSION: Record<AllowedArtifactExtension, string> = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pbix": "application/vnd.ms-powerbi.pbix",
  ".pdf": "application/pdf",
  ".sql": "application/sql",
}

export type ValidatedArtifact = {
  fileName: string
  extension: AllowedArtifactExtension
  mimeType: string
  byteSize: number
  sha256: string
  bytes: Buffer
}

export class ArtifactValidationError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = "ArtifactValidationError"
    this.status = status
  }
}

export function sanitizeAttachmentFileName(fileName: string): string {
  const base = fileName.replace(/\\/g, "/").split("/").pop()?.trim() ?? ""
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)
  return sanitized || "attachment"
}

function extensionOf(fileName: string): string {
  const match = /\.[a-z0-9]+$/i.exec(fileName)
  return match ? match[0].toLowerCase() : ""
}

function startsWith(bytes: Buffer, magic: Buffer): boolean {
  return bytes.length >= magic.length && bytes.subarray(0, magic.length).equals(magic)
}

function isUtf8Text(bytes: Buffer): boolean {
  if (bytes.includes(0)) return false
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    return decoded.length > 0
  } catch {
    return false
  }
}

export function validateArtifactBytes(fileName: string, declaredMime: string, bytes: Buffer): ValidatedArtifact {
  if (!bytes.length) throw new ArtifactValidationError("Empty files are not accepted")
  const safeName = sanitizeAttachmentFileName(fileName)
  const extension = extensionOf(safeName) as AllowedArtifactExtension
  if (!ALLOWED_ARTIFACT_EXTENSIONS.includes(extension)) {
    throw new ArtifactValidationError(`Allowed file types: ${ALLOWED_ARTIFACT_EXTENSIONS.join(", ")}`)
  }

  const maxBytes = extension === ".sql" ? SQL_MAX_BYTES : ARTIFACT_MAX_BYTES
  if (bytes.length > maxBytes) {
    throw new ArtifactValidationError(`File exceeds the ${maxBytes} byte limit`, 413)
  }

  const declared = declaredMime.split(";")[0]?.trim().toLowerCase() ?? ""
  const deniedMime = new Set([
    "text/html",
    "application/xhtml+xml",
    "application/javascript",
    "text/javascript",
    "image/svg+xml",
    "application/x-msdownload",
    "application/x-executable",
    "application/x-dosexec",
  ])
  if (declared && deniedMime.has(declared)) {
    throw new ArtifactValidationError("Declared MIME type is not accepted")
  }

  if (startsWith(bytes, EXE_MAGIC) || startsWith(bytes, Buffer.from("\x7fELF"))) {
    throw new ArtifactValidationError("Executable files are not accepted")
  }

  if (extension === ".pdf") {
    if (!startsWith(bytes, PDF_MAGIC)) throw new ArtifactValidationError("PDF magic bytes did not match")
  } else if (extension === ".xlsx" || extension === ".pbix") {
    if (!startsWith(bytes, ZIP_MAGIC)) throw new ArtifactValidationError("Archive magic bytes did not match")
  } else if (extension === ".xls") {
    if (!startsWith(bytes, OLE_MAGIC)) throw new ArtifactValidationError("Excel magic bytes did not match")
  } else if (extension === ".sql") {
    if (startsWith(bytes, PDF_MAGIC) || startsWith(bytes, ZIP_MAGIC) || startsWith(bytes, OLE_MAGIC)) {
      throw new ArtifactValidationError("SQL files must be plain text")
    }
    if (!isUtf8Text(bytes)) throw new ArtifactValidationError("SQL files must be UTF-8 text without null bytes")
  }

  return {
    fileName: safeName.endsWith(extension) ? safeName : `${safeName}${extension}`,
    extension,
    mimeType: MIME_BY_EXTENSION[extension],
    byteSize: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes,
  }
}

export function publicAttachment(file: {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
}) {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    downloadable: true,
  }
}

export async function storeAssignmentArtifact(assignmentProgressId: string, validated: ValidatedArtifact) {
  const storage = getArtifactStorage()
  const storageKey = newOpaqueStorageKey()
  await storage.put(storageKey, validated.bytes, {
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
  })

  try {
    return await prisma.assignmentAttachment.create({
      data: {
        assignmentProgressId,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        byteSize: validated.byteSize,
        sha256: validated.sha256,
        storageProvider: storage.provider,
        storageKey,
      },
    })
  } catch (error) {
    await storage.delete(storageKey).catch(() => undefined)
    throw error
  }
}

export async function deleteAssignmentArtifacts(assignmentProgressId: string) {
  const existing = await prisma.assignmentAttachment.findMany({
    where: { assignmentProgressId },
    select: { id: true, storageKey: true, storageProvider: true },
  })
  if (!existing.length) return
  const storage = getArtifactStorage()
  for (const file of existing) {
    if (file.storageKey && file.storageProvider !== "pending") {
      try {
        await storage.delete(file.storageKey)
      } catch (error) {
        if (!(error instanceof StorageError && error.status === 404)) {
          console.error("Failed to delete artifact blob:", error)
        }
      }
    }
  }
  await prisma.assignmentAttachment.deleteMany({ where: { assignmentProgressId } })
}

export async function readAssignmentArtifact(storageKey: string): Promise<Buffer> {
  return getArtifactStorage().get(storageKey)
}

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError
}

export function isArtifactValidationError(error: unknown): error is ArtifactValidationError {
  return error instanceof ArtifactValidationError
}
