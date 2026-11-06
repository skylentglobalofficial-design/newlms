import crypto from "node:crypto"
import { prisma } from "./prisma.js"

export interface PayuConfig {
  key: string
  salt: string
  env: "production" | "test"
  actionUrl: string
}

let dbPayuHydrationPromise: Promise<void> | null = null
let dbPayuHydratedAt = 0

export function getPayuConfig(): PayuConfig {
  const key = (process.env.PAYU_MERCHANT_KEY || "jUkwLy").trim()
  const salt = (process.env.PAYU_MERCHANT_SALT || "KgkLvRiwmbeF6oiElCAPOpUnqGVixgfE").trim()
  const env = (process.env.PAYU_ENV === "test" ? "test" : "production")
  const actionUrl = env === "test" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment"
  return { key, salt, env, actionUrl }
}

export async function ensurePayuConfigHydrated(): Promise<void> {
  if (process.env.PAYU_MERCHANT_KEY && process.env.PAYU_MERCHANT_SALT) return
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
      if (!raw) return
      const parsed = JSON.parse(raw) as { key?: string; salt?: string; env?: string }
      if (parsed.key) process.env.PAYU_MERCHANT_KEY = parsed.key
      if (parsed.salt) process.env.PAYU_MERCHANT_SALT = parsed.salt
      if (parsed.env) process.env.PAYU_ENV = parsed.env
    } catch {
      // ignore table absence on clean dev DB
    }
  })()
  await dbPayuHydrationPromise
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
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`
  return crypto.createHash("sha512").update(hashString).digest("hex")
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

  let hashSequence = ""
  if (additionalCharges) {
    hashSequence = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
  } else {
    hashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
  }

  const calculatedHash = crypto.createHash("sha512").update(hashSequence).digest("hex")
  return calculatedHash.toLowerCase() === hash.toLowerCase()
}
