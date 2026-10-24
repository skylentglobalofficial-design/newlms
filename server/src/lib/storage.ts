/**
 * Storage service abstraction for file uploads.
 *
 * Implemented providers:
 * - `local` — filesystem under STORAGE_LOCAL_PATH (development/testing only).
 *   Refused when NODE_ENV=production.
 *
 * Not implemented (reported as unconfigured / throw INVALID_CONFIG):
 * - `s3`, `gcs`, `azure` — stubs only. Do not claim these as supported until
 *   upload, download, delete, signed URL, and config validation are complete.
 *
 * Environment:
 * - STORAGE_PROVIDER: "local" | "s3" | "gcs" | "azure" | "none"
 * - STORAGE_BUCKET: logical bucket/container name
 * - STORAGE_LOCAL_PATH: base directory for local provider (default ./uploads)
 */

import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"

export type StorageProvider = "s3" | "gcs" | "azure" | "local" | "none"

/** Providers with working upload/download/delete in this codebase. */
export const IMPLEMENTED_STORAGE_PROVIDERS: ReadonlySet<StorageProvider> = new Set(["local"])

export interface StorageConfig {
  provider: StorageProvider
  bucket: string
}

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
}

export interface UploadResult {
  provider: StorageProvider
  bucket: string
  key: string
  size: number
  etag?: string
}

export interface SignedUrlOptions {
  expiresInSeconds?: number
  contentType?: string
  method?: "GET" | "PUT"
}

export class StorageServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_CONFIGURED"
      | "UPLOAD_FAILED"
      | "DOWNLOAD_FAILED"
      | "DELETE_FAILED"
      | "INVALID_CONFIG"
      | "FILE_NOT_FOUND"
      | "PERMISSION_DENIED"
      | "INVALID_KEY"
      | "VALIDATION_FAILED",
  ) {
    super(message)
    this.name = "StorageServiceError"
  }
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB default

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/zip",
  "application/x-zip-compressed",
  "application/json",
])

function getStorageConfig(): StorageConfig | null {
  const status = getStorageConfigStatus()
  if (!status.configured) return null
  return {
    provider: status.provider,
    bucket: process.env.STORAGE_BUCKET!,
  }
}

export function isStorageConfigured(): boolean {
  return getStorageConfigStatus().configured
}

export function getStorageConfigStatus(): {
  configured: boolean
  provider: StorageProvider
  implemented: boolean
  productionAllowed: boolean
  requiredVariables: string[]
  missingVariables: string[]
} {
  const raw = (process.env.STORAGE_PROVIDER || "none").toLowerCase()
  const provider = (
    ["s3", "gcs", "azure", "local", "none"].includes(raw) ? raw : "none"
  ) as StorageProvider

  const providerVars: Record<StorageProvider, string[]> = {
    none: [],
    local: ["STORAGE_BUCKET"],
    s3: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_REGION", "STORAGE_BUCKET"],
    gcs: ["GCS_PROJECT_ID", "GCS_SERVICE_ACCOUNT_KEY", "STORAGE_BUCKET"],
    azure: ["AZURE_STORAGE_ACCOUNT", "STORAGE_BUCKET"],
  }

  const required = providerVars[provider] || []
  const missing = required.filter((v) => !process.env[v])
  const implemented = IMPLEMENTED_STORAGE_PROVIDERS.has(provider)
  const productionAllowed = provider !== "local"
  const inProduction = process.env.NODE_ENV === "production"

  return {
    configured: implemented && missing.length === 0 && !(inProduction && !productionAllowed),
    provider,
    implemented,
    productionAllowed,
    requiredVariables: required,
    missingVariables: missing,
  }
}

export function validateFile(
  file: { size: number; mimeType: string; fileName: string },
  options?: { maxSize?: number; allowedTypes?: string[] },
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE
  const allowedTypes = options?.allowedTypes ? new Set(options.allowedTypes) : ALLOWED_MIME_TYPES

  if (!Number.isFinite(file.size) || file.size < 0) {
    return { valid: false, error: "Invalid file size" }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`,
    }
  }

  if (file.size === 0) {
    return { valid: false, error: "Empty files are not allowed" }
  }

  if (!allowedTypes.has(file.mimeType)) {
    return {
      valid: false,
      error: `File type ${file.mimeType} is not allowed`,
    }
  }

  const sanitizedName = sanitizeFileName(file.fileName)
  if (!sanitizedName || sanitizedName === ".") {
    return { valid: false, error: "Invalid file name" }
  }

  return { valid: true }
}

export function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName.trim())
  const sanitized = base
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .replace(/__+/g, "_")
    .slice(0, 200)
  return sanitized || "attachment"
}

/** Reject path traversal and absolute paths in storage keys. */
export function assertSafeStorageKey(key: string): void {
  if (!key || typeof key !== "string") {
    throw new StorageServiceError("Storage key is required", "INVALID_KEY")
  }
  if (key.includes("\0")) {
    throw new StorageServiceError("Storage key contains null bytes", "INVALID_KEY")
  }
  if (key.startsWith("/") || key.startsWith("\\") || /^[a-zA-Z]:[\\/]/.test(key)) {
    throw new StorageServiceError("Absolute storage keys are not allowed", "INVALID_KEY")
  }
  const segments = key.split(/[/\\]/)
  if (segments.some((s) => s === ".." || s === "")) {
    throw new StorageServiceError("Storage key must not contain empty or parent segments", "INVALID_KEY")
  }
}

export function generateStorageKey(
  prefix: string,
  fileName: string,
  options?: { includeTimestamp?: boolean },
): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9/_-]/g, "_").replace(/^\/+|\/+$/g, "")
  const sanitized = sanitizeFileName(fileName)
  const token = crypto.randomUUID()
  const timestamp = options?.includeTimestamp ? `${Date.now()}/` : ""
  const key = `${safePrefix}/${timestamp}${token}/${sanitized}`
  assertSafeStorageKey(key)
  return key
}

export async function uploadFile(
  key: string,
  data: Buffer,
  options?: UploadOptions,
): Promise<UploadResult> {
  assertSafeStorageKey(key)
  const config = requireConfiguredStorage()

  switch (config.provider) {
    case "local":
      return uploadToLocal(config, key, data, options)
    default:
      throw new StorageServiceError(
        `Storage provider "${config.provider}" is not implemented`,
        "INVALID_CONFIG",
      )
  }
}

export async function downloadFile(key: string): Promise<Buffer> {
  assertSafeStorageKey(key)
  const config = requireConfiguredStorage()

  switch (config.provider) {
    case "local":
      return downloadFromLocal(config, key)
    default:
      throw new StorageServiceError(
        `Storage provider "${config.provider}" is not implemented`,
        "INVALID_CONFIG",
      )
  }
}

export async function deleteFile(key: string): Promise<void> {
  assertSafeStorageKey(key)
  const config = requireConfiguredStorage()

  switch (config.provider) {
    case "local":
      return deleteFromLocal(config, key)
    default:
      throw new StorageServiceError(
        `Storage provider "${config.provider}" is not implemented`,
        "INVALID_CONFIG",
      )
  }
}

export async function generateSignedUrl(
  _key: string,
  _options?: SignedUrlOptions,
): Promise<string> {
  throw new StorageServiceError(
    "Signed URLs are not implemented. Only local storage exists, and it does not support signed URLs.",
    "INVALID_CONFIG",
  )
}

function requireConfiguredStorage(): StorageConfig {
  const config = getStorageConfig()
  if (!config) {
    const status = getStorageConfigStatus()
    if (status.provider === "local" && process.env.NODE_ENV === "production") {
      throw new StorageServiceError(
        "Local filesystem storage is not allowed in production",
        "INVALID_CONFIG",
      )
    }
    if (!status.implemented && status.provider !== "none") {
      throw new StorageServiceError(
        `Storage provider "${status.provider}" is not implemented`,
        "INVALID_CONFIG",
      )
    }
    throw new StorageServiceError(
      "Storage service is not configured. Set STORAGE_PROVIDER=local (dev only) and STORAGE_BUCKET.",
      "NOT_CONFIGURED",
    )
  }
  return config
}

function resolveLocalPath(config: StorageConfig, key: string): string {
  assertSafeStorageKey(key)
  const basePath = path.resolve(process.env.STORAGE_LOCAL_PATH || "./uploads")
  const fullPath = path.resolve(basePath, config.bucket, key)
  const root = path.resolve(basePath, config.bucket)
  if (!fullPath.startsWith(root + path.sep) && fullPath !== root) {
    throw new StorageServiceError("Resolved path escapes storage root", "INVALID_KEY")
  }
  return fullPath
}

async function uploadToLocal(
  config: StorageConfig,
  key: string,
  data: Buffer,
  _options?: UploadOptions,
): Promise<UploadResult> {
  if (process.env.NODE_ENV === "production") {
    throw new StorageServiceError(
      "Local filesystem storage is not allowed in production",
      "INVALID_CONFIG",
    )
  }

  const fullPath = resolveLocalPath(config, key)
  const dir = path.dirname(fullPath)

  try {
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, data)
    const hash = crypto.createHash("md5").update(data).digest("hex")
    return {
      provider: "local",
      bucket: config.bucket,
      key,
      size: data.length,
      etag: hash,
    }
  } catch (error: unknown) {
    if (error instanceof StorageServiceError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new StorageServiceError(`Local storage upload failed: ${message}`, "UPLOAD_FAILED")
  }
}

async function downloadFromLocal(config: StorageConfig, key: string): Promise<Buffer> {
  if (process.env.NODE_ENV === "production") {
    throw new StorageServiceError(
      "Local filesystem storage is not allowed in production",
      "INVALID_CONFIG",
    )
  }

  const fullPath = resolveLocalPath(config, key)
  try {
    return await fs.readFile(fullPath)
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new StorageServiceError("File not found", "FILE_NOT_FOUND")
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new StorageServiceError(`Local storage download failed: ${message}`, "DOWNLOAD_FAILED")
  }
}

async function deleteFromLocal(config: StorageConfig, key: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new StorageServiceError(
      "Local filesystem storage is not allowed in production",
      "INVALID_CONFIG",
    )
  }

  const fullPath = resolveLocalPath(config, key)
  try {
    await fs.unlink(fullPath)
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new StorageServiceError(`Local storage delete failed: ${message}`, "DELETE_FAILED")
  }
}

// In-memory storage for unit tests (never used in production paths)
const testStorage = new Map<string, Buffer>()

export function resetTestStorage(): void {
  testStorage.clear()
}

export async function uploadToTestStorage(key: string, data: Buffer): Promise<UploadResult> {
  assertSafeStorageKey(key)
  testStorage.set(key, data)
  return {
    provider: "local",
    bucket: "test",
    key,
    size: data.length,
    etag: crypto.createHash("md5").update(data).digest("hex"),
  }
}

export async function downloadFromTestStorage(key: string): Promise<Buffer> {
  assertSafeStorageKey(key)
  const data = testStorage.get(key)
  if (!data) {
    throw new StorageServiceError("File not found", "FILE_NOT_FOUND")
  }
  return data
}

export async function deleteFromTestStorage(key: string): Promise<void> {
  assertSafeStorageKey(key)
  testStorage.delete(key)
}
