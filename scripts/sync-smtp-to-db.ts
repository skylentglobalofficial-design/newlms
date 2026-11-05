import "dotenv/config"
import { prisma } from "../server/src/lib/prisma.ts"
import { sendEmail, buildLoginOtpEmail } from "../server/src/lib/email.ts"

async function main() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim()
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").trim()
  const host = (process.env.SMTP_HOST || (user.endsWith("@gmail.com") ? "smtp.gmail.com" : "smtp.hostinger.com")).trim()
  const port = Number(process.env.SMTP_PORT || 465)
  const from = (process.env.EMAIL_FROM || (user ? `Skylent <${user}>` : "Skylent <noreply@skylent.live>")).trim()

  if (!user || !pass) {
    console.log("[SMTP Sync] SMTP_USER / SMTP_PASS not set in local .env — skipping DB sync.")
    return
  }

  console.log(`[SMTP Sync] Syncing Hostinger SMTP (${user} @ ${host}:${port}) to shared PostgreSQL database...`)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_skylent_runtime_config" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const payload = JSON.stringify({ host, port, user, pass, from })
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
     VALUES ('smtp_config', $1, NOW())
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
    payload,
  )

  console.log("[SMTP Sync] ✓ Saved SMTP config to shared PostgreSQL database! Hostinger server will auto-load it.")

  const testRecipient = process.env.SUPERADMIN_EMAIL?.trim() || "tariniprasadtripathy17@gmail.com"
  try {
    const sample = buildLoginOtpEmail("849201", testRecipient)
    await sendEmail({
      to: testRecipient,
      subject: "Skylent Hostinger Email & OTP Active (noreply@skylent.live)",
      text: sample.text,
      html: sample.html,
    })
    console.log(`[SMTP Sync] ✓ Sent live verification email from ${from} to ${testRecipient}!`)
  } catch (err) {
    console.warn(`[SMTP Sync] Warning: Test email send returned: ${err instanceof Error ? err.message : String(err)}`)
  }
}

main()
  .catch((err) => {
    console.warn("[SMTP Sync] Non-fatal warning:", err instanceof Error ? err.message : String(err))
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
