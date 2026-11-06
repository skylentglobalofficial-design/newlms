import "dotenv/config"
import { prisma } from "../server/src/lib/prisma.ts"

async function main() {
  const key = (process.env.PAYU_MERCHANT_KEY || "jUkwLy").trim()
  const salt = (process.env.PAYU_MERCHANT_SALT || "KgkLvRiwmbeF6oiElCAPOpUnqGVixgfE").trim()
  const env = (process.env.PAYU_ENV || "production").trim()

  console.log(`[PayU Sync] Syncing PayU Credentials (${key} / MID: 13843036 @ ${env}) to shared PostgreSQL database...`)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_skylent_runtime_config" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const payload = JSON.stringify({ key, salt, env })
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
     VALUES ('payu_config', $1, NOW())
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
    payload,
  )

  console.log("[PayU Sync] ✓ Saved PayU Merchant Key & Salt to shared PostgreSQL database! Hostinger production server will auto-load it.")
}

main()
  .catch((err) => {
    console.warn("[PayU Sync] Non-fatal warning:", err instanceof Error ? err.message : String(err))
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
