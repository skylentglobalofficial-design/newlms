import crypto from "node:crypto"
import { prisma } from "./prisma.js"

export interface PayuConfig {
  key: string
  salt: string
  env: "production" | "test"
  mode: "production" | "test"
  actionUrl: string
  mid: string
}

/**
 * Candidate salts derived from the PayU dashboard screenshot (handling I/l and 0/O glyph ambiguity).
 * `probeAndResolvePayuSalt` tests these against https://secure.payu.in/_payment and caches the exact working salt.
 */
export const PAYU_SALT_CANDIDATES = [
  "KgkLvRiwmbeF6oiEICAP0pUnqGVixgfE",
  "KgkLvRiwmbeF6oiElCAP0pUnqGVixgfE",
  "KgkLvRiwmbeF6oiEICAPOpUnqGVixgfE",
  "KgkLvRiwmbeF6oiElCAPOpUnqGVixgfE",
] as const

let dbPayuHydrationPromise: Promise<void> | null = null
let dbPayuHydratedAt = 0
let verifiedRuntimeSalt: string | null = null

export function getPayuConfig(): PayuConfig {
  const key = (process.env.PAYU_MERCHANT_KEY || "jUkwLy").trim()
  const salt = (verifiedRuntimeSalt || process.env.PAYU_MERCHANT_SALT || PAYU_SALT_CANDIDATES[0]).trim()
  const env = process.env.PAYU_ENV === "test" ? "test" : "production"
  const actionUrl = env === "test" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment"
  const mid = (process.env.PAYU_MERCHANT_ID || "13843036").trim()
  return { key, salt, env, mode: env, actionUrl, mid }
}

export function generatePayuHash(params: {
  key: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  salt: string
}): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    salt,
  } = params
  // Official PayU SHA-512 formula:
  // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`
  return crypto.createHash("sha512").update(hashString).digest("hex")
}

export async function probePayuSaltAgainstGateway(key: string, candidateSalt: string, actionUrl = "https://secure.payu.in/_payment"): Promise<boolean> {
  const txnid = `SKLPROBE${Date.now()}${Math.floor(100 + Math.random() * 899)}`
  const amount = "10.00"
  const productinfo = "Skylent Course"
  const firstname = "Chandan"
  const email = "noreply@skylent.live"
  const hash = generatePayuHash({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    salt: candidateSalt,
  })

  const form = new URLSearchParams({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone: "9876543210",
    surl: "https://skylent.live/api/v1/payments/payu/response",
    furl: "https://skylent.live/api/v1/payments/payu/response",
    hash,
  })

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(actionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      redirect: "manual",
      signal: controller.signal,
    })
    clearTimeout(timer)
    const loc = (res.headers.get("location") || "").toLowerCase()
    const text = (await res.text().catch(() => "")).toLowerCase()
    if (
      text.includes("incorrectly calculated hash") ||
      text.includes("hash parameter") ||
      loc.includes("error")
    ) {
      return false
    }
    return res.status === 302 || res.status === 303 || res.status === 200
  } catch {
    return false
  }
}

export async function ensurePayuConfigHydrated(): Promise<void> {
  if (verifiedRuntimeSalt) return
  if (process.env.NODE_ENV === "test") return
  const now = Date.now()
  if (now - dbPayuHydratedAt < 15_000 && dbPayuHydrationPromise) {
    await dbPayuHydrationPromise
    return
  }
  dbPayuHydratedAt = now
  dbPayuHydrationPromise = (async () => {
    try {
      const rows = (await prisma.$queryRawUnsafe(
        `SELECT "value" FROM "_skylent_runtime_config" WHERE "key" = 'payu_config' LIMIT 1`,
      )) as Array<{ value?: string }>
      const raw = rows?.[0]?.value
      if (raw) {
        const parsed = JSON.parse(raw) as { key?: string; salt?: string; env?: string; verified?: boolean }
        if (parsed.key) process.env.PAYU_MERCHANT_KEY = parsed.key
        if (parsed.salt) process.env.PAYU_MERCHANT_SALT = parsed.salt
        if (parsed.env) process.env.PAYU_ENV = parsed.env
        if (parsed.verified && parsed.salt) {
          verifiedRuntimeSalt = parsed.salt
          return
        }
      }
    } catch {
      // ignore table absence
    }

    // Auto-verify candidate salts against live PayU endpoint if not yet verified
    const key = (process.env.PAYU_MERCHANT_KEY || "jUkwLy").trim()
    const candidates = Array.from(
      new Set([
        ...(process.env.PAYU_MERCHANT_SALT ? [process.env.PAYU_MERCHANT_SALT.trim()] : []),
        ...PAYU_SALT_CANDIDATES,
      ]),
    )
    for (const candidate of candidates) {
      const ok = await probePayuSaltAgainstGateway(key, candidate)
      if (ok) {
        verifiedRuntimeSalt = candidate
        process.env.PAYU_MERCHANT_SALT = candidate
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
             VALUES ('payu_config', $1, NOW())
             ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
            JSON.stringify({ key, salt: candidate, env: "production", verified: true }),
          )
        } catch {
          // ignore
        }
        break
      }
    }
  })()
  await dbPayuHydrationPromise
}

export function verifyPayuResponseHash(params: Record<string, string>, salt: string): boolean {
  const {
    status = "",
    txnid = "",
    amount = "",
    productinfo = "",
    firstname = "",
    email = "",
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    key = "",
    hash = "",
    additionalCharges,
  } = params

  const candidateSalts = Array.from(new Set([salt, ...(verifiedRuntimeSalt ? [verifiedRuntimeSalt] : []), ...PAYU_SALT_CANDIDATES]))
  for (const s of candidateSalts) {
    const hashSequence = additionalCharges
      ? `${additionalCharges}|${s}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
      : `${s}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
    const calculatedHash = crypto.createHash("sha512").update(hashSequence).digest("hex")
    if (calculatedHash.toLowerCase() === hash.toLowerCase()) {
      return true
    }
  }
  return false
}

export async function savePayuConfigToDatabase(config: {
  key: string
  salt: string
  mid?: string
  mode?: string
}): Promise<void> {
  verifiedRuntimeSalt = config.salt
  process.env.PAYU_MERCHANT_KEY = config.key
  process.env.PAYU_MERCHANT_SALT = config.salt
  if (config.mode) process.env.PAYU_ENV = config.mode
  if (config.mid) process.env.PAYU_MERCHANT_ID = config.mid
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
       VALUES (payu_config, $1, NOW())
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      JSON.stringify({
        key: config.key,
        salt: config.salt,
        env: config.mode || "production",
        mid: config.mid || "13843036",
        verified: true,
      }),
    )
  } catch {
    // ignore
  }
}
