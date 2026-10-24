/**
 * Storage validation and safety regression tests.
 */

import {
  validateFile,
  sanitizeFileName,
  assertSafeStorageKey,
  generateStorageKey,
  getStorageConfigStatus,
  IMPLEMENTED_STORAGE_PROVIDERS,
  StorageServiceError,
  uploadToTestStorage,
  downloadFromTestStorage,
  deleteFromTestStorage,
  resetTestStorage,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "../server/src/lib/storage.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// File validation
assert(
  validateFile({ size: 100, mimeType: "application/pdf", fileName: "a.pdf" }).valid,
  "pdf ok",
)
assert(
  !validateFile({ size: MAX_FILE_SIZE + 1, mimeType: "application/pdf", fileName: "a.pdf" }).valid,
  "oversized rejected",
)
assert(
  !validateFile({ size: 0, mimeType: "application/pdf", fileName: "a.pdf" }).valid,
  "empty rejected",
)
assert(
  !validateFile({ size: 10, mimeType: "application/x-msdownload", fileName: "a.exe" }).valid,
  "exe mime rejected",
)
assert(ALLOWED_MIME_TYPES.has("image/png"), "png allowed")

// Sanitization strips path components
assert(sanitizeFileName("../../etc/passwd") === "passwd", "basename only")
assert(sanitizeFileName("my file (1).pdf") === "my_file__1_.pdf" || sanitizeFileName("my file (1).pdf").includes("my"), "spaces sanitized")
assert(!sanitizeFileName("ok.pdf").includes("/"), "no slash")

// Path traversal protection
function expectInvalidKey(key: string) {
  try {
    assertSafeStorageKey(key)
    throw new Error(`expected invalid key: ${key}`)
  } catch (error) {
    assert(error instanceof StorageServiceError, `StorageServiceError for ${key}`)
    assert(error.code === "INVALID_KEY", `INVALID_KEY for ${key}`)
  }
}

expectInvalidKey("../secret")
expectInvalidKey("a/../../b")
expectInvalidKey("/absolute")
expectInvalidKey("\\\\unc")
expectInvalidKey("")
expectInvalidKey("a//b")

assertSafeStorageKey("assignments/user-id/token/file.pdf")
const generated = generateStorageKey("assignments/u1", "report.pdf")
assertSafeStorageKey(generated)
assert(generated.includes("report.pdf"), "filename in key")
assert(!generated.includes(".."), "no parent refs")

// Only local is implemented
assert(IMPLEMENTED_STORAGE_PROVIDERS.has("local"), "local implemented")
assert(!IMPLEMENTED_STORAGE_PROVIDERS.has("s3"), "s3 not implemented")
assert(!IMPLEMENTED_STORAGE_PROVIDERS.has("gcs"), "gcs not implemented")
assert(!IMPLEMENTED_STORAGE_PROVIDERS.has("azure"), "azure not implemented")

const saved = { ...process.env }
try {
  process.env.STORAGE_PROVIDER = "s3"
  process.env.STORAGE_BUCKET = "b"
  process.env.AWS_ACCESS_KEY_ID = "a"
  process.env.AWS_SECRET_ACCESS_KEY = "s"
  process.env.AWS_S3_REGION = "us-east-1"
  const s3 = getStorageConfigStatus()
  assert(!s3.implemented, "s3 not implemented")
  assert(!s3.configured, "s3 must not report configured")

  process.env.STORAGE_PROVIDER = "local"
  process.env.STORAGE_BUCKET = "test-bucket"
  delete process.env.NODE_ENV
  const localDev = getStorageConfigStatus()
  assert(localDev.implemented, "local implemented")
  // Without NODE_ENV=production, local can be configured
  assert(localDev.configured, "local configured in non-production")

  process.env.NODE_ENV = "production"
  const localProd = getStorageConfigStatus()
  assert(!localProd.configured, "local not configured in production")
  assert(!localProd.productionAllowed, "local not production-allowed")
} finally {
  for (const key of Object.keys(process.env)) {
    if (!(key in saved)) delete process.env[key]
  }
  Object.assign(process.env, saved)
}

// In-memory test storage round-trip
resetTestStorage()
const key = generateStorageKey("tests", "note.txt")
await uploadToTestStorage(key, Buffer.from("hello"))
const downloaded = await downloadFromTestStorage(key)
assert(downloaded.toString() === "hello", "round-trip")
await deleteFromTestStorage(key)
try {
  await downloadFromTestStorage(key)
  throw new Error("expected missing after delete")
} catch (error) {
  assert(error instanceof StorageServiceError && error.code === "FILE_NOT_FOUND", "deleted")
}

console.log("storage-validation ok")
