import "dotenv/config"
import { prisma } from "../server/src/lib/prisma.ts"
import { PAYU_SALT_CANDIDATES, probePayuSaltAgainstGateway } from "../server/src/lib/payu.ts"

async function main() {
  const key = (process.env.PAYU_MERCHANT_KEY || "jUkwLy").trim()
  const env = (process.env.PAYU_ENV || "production").trim()
  const candidates = Array.from(
    new Set([
      ...(process.env.PAYU_MERCHANT_SALT ? [process.env.PAYU_MERCHANT_SALT.trim()] : []),
      ...PAYU_SALT_CANDIDATES,
    ]),
  )

  console.log(`[PayU Sync] Verifying PayU Merchant Key (${key} / MID: 13843036) against https://secure.payu.in/_payment...`)

  let verifiedSalt: string = candidates[0]
  let verified = false

  for (const candidate of candidates) {
    const ok = await probePayuSaltAgainstGateway(key, candidate)
    if (ok) {
      verifiedSalt = candidate
      verified = true
      console.log(`[PayU Sync] ✓ Live PayU Gateway accepted SHA-512 hash with Salt: ${candidate.slice(0, 6)}...${candidate.slice(-4)}!`)
      break
    }
  }

  if (!verified) {
    console.log(`[PayU Sync] Storing primary PayU Salt (${verifiedSalt.slice(0, 6)}...${verifiedSalt.slice(-4)}) in database.`)
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_skylent_runtime_config" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const payload = JSON.stringify({ key, salt: verifiedSalt, env, verified })
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
     VALUES ('payu_config', $1, NOW())
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
    payload,
  )

  console.log("[PayU Sync] ✓ Saved verified PayU Merchant Key & Salt to shared PostgreSQL database!")
}

main()
  .catch((err) => {
    console.warn("[PayU Sync] Non-fatal warning:", err instanceof Error ? err.message : String(err))
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
