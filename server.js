// Hostinger-compatible entrypoint for the schema-compatible recovery release.
// Deliberately does NOT run Prisma migrations during startup.
// Run migrations only as a separate, explicitly reviewed operation.
void (async () => {
  await import("./server/dist/index.js")
})().catch((error) => {
  console.error("Failed to start compiled Skylent API:", error)
  process.exitCode = 1
})
