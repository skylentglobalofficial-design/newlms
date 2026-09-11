import path from "node:path"

/** Default 25 MiB — enough for Excel/PDF and modest Power BI exports; override via LMS_ARTIFACT_MAX_BYTES. */
export const DEFAULT_ARTIFACT_MAX_BYTES = 25 * 1024 * 1024

export type ArtifactKind = "xlsx" | "xls" | "pbix" | "pdf" | "sql"

export type ArtifactPolicy = {
  kind: ArtifactKind
  extension: string
  /** Canonical MIME we persist after validation (not client-trusted). */
  canonicalMime: string
  /** Client-reported MIME values we accept as hints only. */
  acceptedClientMimes: string[]
}

export const PROJECT_ARTIFACT_POLICIES: ArtifactPolicy[] = [
  {
    kind: "xlsx",
    extension: ".xlsx",
    canonicalMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    acceptedClientMimes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
      "application/zip",
    ],
  },
  {
    kind: "xls",
    extension: ".xls",
    canonicalMime: "application/vnd.ms-excel",
    acceptedClientMimes: ["application/vnd.ms-excel", "application/octet-stream"],
  },
  {
    kind: "pbix",
    extension: ".pbix",
    canonicalMime: "application/octet-stream",
    acceptedClientMimes: ["application/octet-stream", "application/zip"],
  },
  {
    kind: "pdf",
    extension: ".pdf",
    canonicalMime: "application/pdf",
    acceptedClientMimes: ["application/pdf", "application/octet-stream"],
  },
  {
    kind: "sql",
    extension: ".sql",
    canonicalMime: "application/sql",
    acceptedClientMimes: ["application/sql", "text/plain", "application/octet-stream"],
  },
]

export function getArtifactMaxBytes(): number {
  const raw = process.env.LMS_ARTIFACT_MAX_BYTES
  if (!raw) return DEFAULT_ARTIFACT_MAX_BYTES
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1024) return DEFAULT_ARTIFACT_MAX_BYTES
  return Math.floor(parsed)
}

export function extensionOf(fileName: string): string {
  return path.extname(fileName).toLowerCase()
}

export function findPolicyByFileName(fileName: string): ArtifactPolicy | null {
  const ext = extensionOf(fileName)
  return PROJECT_ARTIFACT_POLICIES.find((policy) => policy.extension === ext) ?? null
}

function hasPrefix(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false
  return bytes.every((value, index) => buffer[index] === value)
}

function looksLikeZip(buffer: Buffer): boolean {
  // Local file header / empty archive / spanned marker
  return (
    hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
    hasPrefix(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
    hasPrefix(buffer, [0x50, 0x4b, 0x07, 0x08])
  )
}

function looksLikeOle(buffer: Buffer): boolean {
  return hasPrefix(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
}

function looksLikePdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-"
}

function looksLikeExecutable(buffer: Buffer): boolean {
  return (
    hasPrefix(buffer, [0x4d, 0x5a]) || // MZ
    hasPrefix(buffer, [0x7f, 0x45, 0x4c, 0x46]) || // ELF
    hasPrefix(buffer, [0xca, 0xfe, 0xba, 0xbe]) || // Mach-O fat
    hasPrefix(buffer, [0xcf, 0xfa, 0xed, 0xfe]) // Mach-O
  )
}

function looksLikeSqlText(buffer: Buffer): boolean {
  if (buffer.length === 0) return false
  if (looksLikeExecutable(buffer)) return false
  // Reject NUL-heavy binary payloads disguised as .sql
  const sample = buffer.subarray(0, Math.min(buffer.length, 2048))
  let nulCount = 0
  for (const byte of sample) {
    if (byte === 0) nulCount += 1
  }
  if (nulCount > 0) return false
  return true
}

export type ArtifactValidationResult =
  | { ok: true; policy: ArtifactPolicy }
  | { ok: false; error: string }

export function validateProjectArtifactBuffer(
  fileName: string,
  clientMimeType: string | undefined,
  buffer: Buffer,
): ArtifactValidationResult {
  const policy = findPolicyByFileName(fileName)
  if (!policy) {
    return {
      ok: false,
      error: "Unsupported file type. Allowed: .xlsx, .xls, .pbix, .pdf, .sql",
    }
  }

  if (looksLikeExecutable(buffer)) {
    return { ok: false, error: "File signature looks like an executable and was rejected" }
  }

  // Extension is authoritative; client MIME is a soft hint only.
  if (clientMimeType) {
    const normalized = clientMimeType.toLowerCase().split(";")[0]?.trim()
    if (normalized && !policy.acceptedClientMimes.includes(normalized)) {
      // Soft reject only when the client claims a clearly unrelated type (e.g. text/html).
      const clearlyDangerous = [
        "text/html",
        "application/javascript",
        "text/javascript",
        "application/x-msdownload",
        "application/x-executable",
        "application/wasm",
      ]
      if (clearlyDangerous.includes(normalized)) {
        return { ok: false, error: `Rejected MIME type: ${normalized}` }
      }
    }
  }

  switch (policy.kind) {
    case "xlsx":
    case "pbix":
      if (!looksLikeZip(buffer)) {
        return { ok: false, error: `${policy.extension} files must be valid ZIP-based packages` }
      }
      break
    case "xls":
      if (!looksLikeOle(buffer)) {
        return { ok: false, error: ".xls files must match the OLE compound document signature" }
      }
      break
    case "pdf":
      if (!looksLikePdf(buffer)) {
        return { ok: false, error: ".pdf files must begin with a %PDF- signature" }
      }
      break
    case "sql":
      if (!looksLikeSqlText(buffer)) {
        return { ok: false, error: ".sql files must be plain text (no binary/executable content)" }
      }
      break
  }

  return { ok: true, policy }
}

export function projectArtifactLimitsPayload() {
  return {
    maxBytes: getArtifactMaxBytes(),
    allowedExtensions: PROJECT_ARTIFACT_POLICIES.map((policy) => policy.extension),
    allowedKinds: PROJECT_ARTIFACT_POLICIES.map((policy) => policy.kind),
    storageProvider: "local" as const,
    honesty:
      "Analytical artifacts are stored on the LMS server filesystem under authenticated access. This is not cloud object storage unless separately configured in deployment.",
  }
}

/** @deprecated alias kept for clarity in route docs */
export const ARTIFACT_MAX_BYTES = DEFAULT_ARTIFACT_MAX_BYTES
