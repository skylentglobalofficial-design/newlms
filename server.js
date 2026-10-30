// Hostinger loads this file with require(). It must not use top-level await.
// It also must not run migrations. Apply them explicitly with
// `npx prisma migrate deploy` or scripts/railway-start.sh before starting.
// Prisma's schema reads DIRECT_URL even when the API is not migrating.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL
}

void (async () => {
  await import("./server/dist/index.js")
})().catch((error) => {
  console.error("Failed to start compiled Skylent API:", error instanceof Error ? error.name : "unknown")
  process.exit(1)
})
