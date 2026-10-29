// Hostinger loads this file with require(). It must not use top-level await.
// It also must not run migrations. Apply them explicitly with
// `npx prisma migrate deploy` or scripts/railway-start.sh before starting.
void (async () => {
  await import("./server/dist/index.js")
})().catch((error) => {
  console.error("Failed to start compiled Skylent API:", error)
  process.exit(1)
})
