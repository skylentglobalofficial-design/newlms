/**
 * Storage service abstraction for file uploads.
 * 
 * BLOCKED: No storage provider is currently configured. This module provides
 * the interface and validation but cannot upload/download files until credentials are set.
 * 
 * Required environment variables (none configured):
 * - STORAGE_PROVIDER: "s3" | "gcs" | "azure" | "local"
 * - STORAGE_BUCKET: Bucket/container name
 * 
 * Provider-specific variables:
 * 
 * AWS S3:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_S3_REGION
 * - AWS_S3_ENDPOINT (optional, for S3-compatible services like MinIO)
 * 
 * Google Cloud Storage:
 * - GCS_PROJECT_ID
 * - GCS_SERVICE_ACCOUNT_KEY (JSON string or path to JSON file)
 * 
 * Azure Blob Storage:
 * - AZURE_STORAGE_ACCOUNT
 * - AZURE_STORAGE_KEY
 * - AZURE_STORAGE_CONNECTION_STRING (alternative to account+key)
 * 
 * Local filesystem (development/testing only):
 * - STORAGE_LOCAL_PATH (default: ./uploads)
 * 
 * SECURITY NOTES:
 * - Never expose storage credentials in responses or logs
 * - Use signed URLs for client-side uploads/downloads when possible
 * - Validate file types and sizes before storage
 * - Scan uploads for malware in production
 */

import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"

export type StorageProvider = "s3" | "gcs" | "azure" | "local" | "none"

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
  ) {
    super(message)
    this.name = "StorageServiceError"
  }
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB default
const ALLOWED_MIME_TYPES = new Set([
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
  const provider = (process.env.STORAGE_PROVIDER || "none") as StorageProvider
  const bucket = process.env.STORAGE_BUCKET

  if (provider === "none" || !bucket) {
    return null
  }

  return { provider, bucket }
}

export function isStorageConfigured(): boolean {
  return getStorageConfig() !== null
}

export function getStorageConfigStatus(): {
  configured: boolean
  provider: StorageProvider
  requiredVariables: string[]
  missingVariables: string[]
} {
  const provider = (process.env.STORAGE_PROVIDER || "none") as StorageProvider

  const providerVars: Record<StorageProvider, string[]> = {
    none: [],
    s3: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_REGION", "STORAGE_BUCKET"],
    gcs: ["GCS_PROJECT_ID", "GCS_SERVICE_ACCOUNT_KEY", "STORAGE_BUCKET"],
    azure: ["AZURE_STORAGE_ACCOUNT", "STORAGE_BUCKET"],
    local: ["STORAGE_LOCAL_PATH", "STORAGE_BUCKET"],
  }

  const required = providerVars[provider] || []
  const missing = required.filter((v) => {
    if (v === "STORAGE_LOCAL_PATH") return false // Has default
    if (v === "AZURE_STORAGE_ACCOUNT") {
      return !process.env.AZURE_STORAGE_CONNECTION_STRING && !process.env.AZURE_STORAGE_ACCOUNT
    }
    return !process.env[v]
  })

  return {
    configured: provider !== "none" && missing.length === 0,
    provider,
    requiredVariables: required,
    missingVariables: missing,
  }
}

export function validateFile(
  file: { size: number; mimeType: string; fileName: string },
  options?: { maxSize?: number; allowedTypes?: string[] }
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE
  const allowedTypes = options?.allowedTypes ? new Set(options.allowedTypes) : ALLOWED_MIME_TYPES

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`,
    }
  }

  if (!allowedTypes.has(file.mimeType)) {
    return {
      valid: false,
      error: `File type ${file.mimeType} is not allowed`,
    }
  }

  const sanitizedName = sanitizeFileName(file.fileName)
  if (sanitizedName !== file.fileName && sanitizedName.length === 0) {
    return {
      valid: false,
      error: "Invalid file name",
    }
  }

  return { valid: true }
}

export function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const sanitized = trimmed
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/__+/g, "_")
    .slice(0, 200)
  return sanitized || "attachment"
}

export function generateStorageKey(
  prefix: string,
  fileName: string,
  options?: { includeTimestamp?: boolean }
): string {
  const sanitized = sanitizeFileName(fileName)
  const token = crypto.randomUUID()
  const timestamp = options?.includeTimestamp ? `${Date.now()}/` : ""
  return `${prefix}/${timestamp}${token}/${sanitized}`
}

export async function uploadFile(
  key: string,
  data: Buffer,
  options?: UploadOptions
): Promise<UploadResult> {
  const config = getStorageConfig()

  if (!config) {
    throw new StorageServiceError(
      "Storage service is not configured. Set STORAGE_PROVIDER and STORAGE_BUCKET environment variables.",
      "NOT_CONFIGURED"
    )
  }

  switch (config.provider) {
    case "s3":
      return uploadToS3(config, key, data, options)
    case "gcs":
      return uploadToGCS(config, key, data, options)
    case "azure":
      return uploadToAzure(config, key, data, options)
    case "local":
      return uploadToLocal(config, key, data, options)
    default:
      throw new StorageServiceError(`Unknown storage provider: ${config.provider}`, "INVALID_CONFIG")
  }
}

export async function downloadFile(key: string): Promise<Buffer> {
  const config = getStorageConfig()

  if (!config) {
    throw new StorageServiceError(
      "Storage service is not configured.",
      "NOT_CONFIGURED"
    )
  }

  switch (config.provider) {
    case "s3":
      return downloadFromS3(config, key)
    case "gcs":
      return downloadFromGCS(config, key)
    case "azure":
      return downloadFromAzure(config, key)
    case "local":
      return downloadFromLocal(config, key)
    default:
      throw new StorageServiceError(`Unknown storage provider: ${config.provider}`, "INVALID_CONFIG")
  }
}

export async function deleteFile(key: string): Promise<void> {
  const config = getStorageConfig()

  if (!config) {
    throw new StorageServiceError(
      "Storage service is not configured.",
      "NOT_CONFIGURED"
    )
  }

  switch (config.provider) {
    case "s3":
      return deleteFromS3(config, key)
    case "gcs":
      return deleteFromGCS(config, key)
    case "azure":
      return deleteFromAzure(config, key)
    case "local":
      return deleteFromLocal(config, key)
    default:
      throw new StorageServiceError(`Unknown storage provider: ${config.provider}`, "INVALID_CONFIG")
  }
}

export async function generateSignedUrl(
  key: string,
  options?: SignedUrlOptions
): Promise<string> {
  const config = getStorageConfig()

  if (!config) {
    throw new StorageServiceError(
      "Storage service is not configured.",
      "NOT_CONFIGURED"
    )
  }

  switch (config.provider) {
    case "s3":
      return generateS3SignedUrl(config, key, options)
    case "gcs":
      return generateGCSSignedUrl(config, key, options)
    case "azure":
      return generateAzureSignedUrl(config, key, options)
    case "local":
      throw new StorageServiceError(
        "Signed URLs are not supported for local storage. Use direct file serving instead.",
        "INVALID_CONFIG"
      )
    default:
      throw new StorageServiceError(`Unknown storage provider: ${config.provider}`, "INVALID_CONFIG")
  }
}

// S3 Implementation
// NOTE: The @aws-sdk/client-s3 package must be installed to use S3 storage.
// Run: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
async function uploadToS3(
  _config: StorageConfig,
  _key: string,
  _data: Buffer,
  _options?: UploadOptions
): Promise<UploadResult> {
  throw new StorageServiceError(
    "S3 storage requires @aws-sdk/client-s3 package. Install with: npm install @aws-sdk/client-s3",
    "INVALID_CONFIG"
  )
}

async function downloadFromS3(_config: StorageConfig, _key: string): Promise<Buffer> {
  throw new StorageServiceError(
    "S3 storage requires @aws-sdk/client-s3 package. Install with: npm install @aws-sdk/client-s3",
    "INVALID_CONFIG"
  )
}

async function deleteFromS3(_config: StorageConfig, _key: string): Promise<void> {
  throw new StorageServiceError(
    "S3 storage requires @aws-sdk/client-s3 package. Install with: npm install @aws-sdk/client-s3",
    "INVALID_CONFIG"
  )
}

async function generateS3SignedUrl(
  _config: StorageConfig,
  _key: string,
  _options?: SignedUrlOptions
): Promise<string> {
  throw new StorageServiceError(
    "S3 signed URLs require @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner packages.",
    "INVALID_CONFIG"
  )
}

// GCS Implementation (stub)
async function uploadToGCS(
  _config: StorageConfig,
  _key: string,
  _data: Buffer,
  _options?: UploadOptions
): Promise<UploadResult> {
  throw new StorageServiceError(
    "Google Cloud Storage integration not yet implemented. Use S3 or local storage.",
    "INVALID_CONFIG"
  )
}

async function downloadFromGCS(_config: StorageConfig, _key: string): Promise<Buffer> {
  throw new StorageServiceError(
    "Google Cloud Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

async function deleteFromGCS(_config: StorageConfig, _key: string): Promise<void> {
  throw new StorageServiceError(
    "Google Cloud Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

async function generateGCSSignedUrl(
  _config: StorageConfig,
  _key: string,
  _options?: SignedUrlOptions
): Promise<string> {
  throw new StorageServiceError(
    "Google Cloud Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

// Azure Implementation (stub)
async function uploadToAzure(
  _config: StorageConfig,
  _key: string,
  _data: Buffer,
  _options?: UploadOptions
): Promise<UploadResult> {
  throw new StorageServiceError(
    "Azure Blob Storage integration not yet implemented. Use S3 or local storage.",
    "INVALID_CONFIG"
  )
}

async function downloadFromAzure(_config: StorageConfig, _key: string): Promise<Buffer> {
  throw new StorageServiceError(
    "Azure Blob Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

async function deleteFromAzure(_config: StorageConfig, _key: string): Promise<void> {
  throw new StorageServiceError(
    "Azure Blob Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

async function generateAzureSignedUrl(
  _config: StorageConfig,
  _key: string,
  _options?: SignedUrlOptions
): Promise<string> {
  throw new StorageServiceError(
    "Azure Blob Storage integration not yet implemented.",
    "INVALID_CONFIG"
  )
}

// Local filesystem implementation (development/testing only)
async function uploadToLocal(
  config: StorageConfig,
  key: string,
  data: Buffer,
  _options?: UploadOptions
): Promise<UploadResult> {
  const basePath = process.env.STORAGE_LOCAL_PATH || "./uploads"
  const fullPath = path.join(basePath, config.bucket, key)
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
  } catch (error: any) {
    throw new StorageServiceError(
      `Local storage upload failed: ${error.message}`,
      "UPLOAD_FAILED"
    )
  }
}

async function downloadFromLocal(config: StorageConfig, key: string): Promise<Buffer> {
  const basePath = process.env.STORAGE_LOCAL_PATH || "./uploads"
  const fullPath = path.join(basePath, config.bucket, key)

  try {
    return await fs.readFile(fullPath)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new StorageServiceError("File not found", "FILE_NOT_FOUND")
    }
    throw new StorageServiceError(
      `Local storage download failed: ${error.message}`,
      "DOWNLOAD_FAILED"
    )
  }
}

async function deleteFromLocal(config: StorageConfig, key: string): Promise<void> {
  const basePath = process.env.STORAGE_LOCAL_PATH || "./uploads"
  const fullPath = path.join(basePath, config.bucket, key)

  try {
    await fs.unlink(fullPath)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return
    }
    throw new StorageServiceError(
      `Local storage delete failed: ${error.message}`,
      "DELETE_FAILED"
    )
  }
}

// In-memory storage for testing
const testStorage = new Map<string, Buffer>()

export function resetTestStorage(): void {
  testStorage.clear()
}

export async function uploadToTestStorage(
  key: string,
  data: Buffer
): Promise<UploadResult> {
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
  const data = testStorage.get(key)
  if (!data) {
    throw new StorageServiceError("File not found", "FILE_NOT_FOUND")
  }
  return data
}

export async function deleteFromTestStorage(key: string): Promise<void> {
  testStorage.delete(key)
}
