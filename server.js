// Emergency Hostinger recovery entrypoint.
// Do not run migrations automatically: this release is intentionally pinned to
// the schema-compatible recovery commit. Run migrations only as a separately
// reviewed operation.
void (async () => {
  await import("./server/dist/index.js")
})().catch((error) => {
  console.error("Failed to start compiled Skylent API:", error)
  process.exitCode = 1
})
