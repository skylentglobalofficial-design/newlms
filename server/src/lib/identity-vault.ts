import fs from "node:fs"
import path from "node:path"

export type ProfessionalProfileDetails = {
  status: string
  organization: string
  roleOrDegree: string
  graduationYear: string
  targetTrack: string
  linkedinUrl: string
  githubUrl: string
}

export type UserIdentityVaultEntry = {
  userId: string
  email: string
  phone: string | null
  emailLocked: boolean
  phoneLocked: boolean
  passwordUpdatedAt: string
  professional: ProfessionalProfileDetails
  updatedAt: string
}

type VaultStore = {
  byUserId: Record<string, UserIdentityVaultEntry>
  userIdByPhone: Record<string, string>
  userIdByEmail: Record<string, string>
}

const VAULT_FILE = path.resolve(process.cwd(), ".skylent-identity-vault.json")
const PASSWORD_ROTATION_DAYS = 90

let cache: VaultStore | null = null

function defaultProfessional(): ProfessionalProfileDetails {
  return {
    status: "College Student — Final Year",
    organization: "",
    roleOrDegree: "",
    graduationYear: "2026",
    targetTrack: "Data Analytics",
    linkedinUrl: "",
    githubUrl: "",
  }
}

function loadStore(): VaultStore {
  if (cache) return cache
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(VAULT_FILE, "utf8")) as Partial<VaultStore>
      cache = {
        byUserId: parsed.byUserId ?? {},
        userIdByPhone: parsed.userIdByPhone ?? {},
        userIdByEmail: parsed.userIdByEmail ?? {},
      }
      return cache
    }
  } catch {
    // Fallback to in-memory if filesystem is read-only
  }
  cache = { byUserId: {}, userIdByPhone: {}, userIdByEmail: {} }
  return cache
}

function saveStore(store: VaultStore): void {
  cache = store
  try {
    fs.writeFileSync(VAULT_FILE, JSON.stringify(store, null, 2), "utf8")
  } catch {
    // Ignore write failure in read-only environments
  }
}

export function normalizeIndianPhone(raw: string | undefined | null): string | null {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    return digits.slice(2)
  }
  return null
}

export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`
  return `${local[0]}***${local.slice(-1)}@${domain}`
}

export function computePasswordRotationStatus(passwordUpdatedAtIso: string | undefined): {
  passwordUpdatedAt: string
  daysSinceUpdate: number
  daysRemaining: number
  rotationDue: boolean
  nextRotationDate: string
} {
  const updatedMs = passwordUpdatedAtIso ? Date.parse(passwordUpdatedAtIso) : Date.now()
  const validMs = Number.isNaN(updatedMs) ? Date.now() : updatedMs
  const elapsedDays = Math.max(0, Math.floor((Date.now() - validMs) / (24 * 60 * 60 * 1000)))
  const daysRemaining = Math.max(0, PASSWORD_ROTATION_DAYS - elapsedDays)
  const nextDate = new Date(validMs + PASSWORD_ROTATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  return {
    passwordUpdatedAt: new Date(validMs).toISOString(),
    daysSinceUpdate: elapsedDays,
    daysRemaining,
    rotationDue: elapsedDays >= PASSWORD_ROTATION_DAYS,
    nextRotationDate: nextDate,
  }
}

export function getOrCreateIdentityEntry(input: {
  userId: string
  email: string
  phone?: string | null
}): UserIdentityVaultEntry {
  const store = loadStore()
  const normEmail = input.email.trim().toLowerCase()
  const normPhone = normalizeIndianPhone(input.phone)
  const now = new Date().toISOString()

  let entry = store.byUserId[input.userId]
  if (!entry) {
    entry = {
      userId: input.userId,
      email: normEmail,
      phone: normPhone,
      emailLocked: true,
      phoneLocked: Boolean(normPhone),
      passwordUpdatedAt: now,
      professional: defaultProfessional(),
      updatedAt: now,
    }
    store.byUserId[input.userId] = entry
  } else {
    entry.email = normEmail
    entry.emailLocked = true
    if (normPhone && !entry.phone) {
      entry.phone = normPhone
      entry.phoneLocked = true
    }
  }

  store.userIdByEmail[normEmail] = input.userId
  if (entry.phone) {
    store.userIdByPhone[entry.phone] = input.userId
  }
  saveStore(store)
  return entry
}

export function findIdentityByPhone(phone: string): UserIdentityVaultEntry | null {
  const normPhone = normalizeIndianPhone(phone)
  if (!normPhone) return null
  const store = loadStore()
  const userId = store.userIdByPhone[normPhone]
  if (!userId) return null
  return store.byUserId[userId] ?? null
}

export function findIdentityByEmail(email: string): UserIdentityVaultEntry | null {
  const normEmail = email.trim().toLowerCase()
  const store = loadStore()
  const userId = store.userIdByEmail[normEmail]
  if (!userId) return null
  return store.byUserId[userId] ?? null
}

export function validateOneEmailOnePhoneBinding(input: {
  email: string
  phone: string
  currentUserId?: string
}): { ok: true } | { ok: false; error: string } {
  const normEmail = input.email.trim().toLowerCase()
  const normPhone = normalizeIndianPhone(input.phone)
  if (!normPhone) {
    return { ok: false, error: "Enter a valid 10-digit Indian mobile number." }
  }
  const store = loadStore()

  const existingPhoneOwner = store.userIdByPhone[normPhone]
  if (existingPhoneOwner && existingPhoneOwner !== input.currentUserId) {
    return {
      ok: false,
      error: "This mobile number is already permanently linked to another Skylent account. Each account allows only 1 unique email and 1 unique mobile number.",
    }
  }

  const existingEmailOwner = store.userIdByEmail[normEmail]
  if (existingEmailOwner && existingEmailOwner !== input.currentUserId) {
    const ownerEntry = store.byUserId[existingEmailOwner]
    if (ownerEntry?.phone && ownerEntry.phone !== normPhone) {
      return {
        ok: false,
        error: "This email address is already permanently linked to another mobile number. Use your registered mobile number or sign in with email.",
      }
    }
  }

  return { ok: true }
}

export function recordPasswordRotationTimestamp(userId: string, email: string): UserIdentityVaultEntry {
  const entry = getOrCreateIdentityEntry({ userId, email })
  const store = loadStore()
  entry.passwordUpdatedAt = new Date().toISOString()
  entry.updatedAt = entry.passwordUpdatedAt
  store.byUserId[userId] = entry
  saveStore(store)
  return entry
}

export function updateStudentProfileDetails(input: {
  userId: string
  email: string
  phoneToBindOnce?: string | null
  professional?: Partial<ProfessionalProfileDetails>
}): { ok: true; entry: UserIdentityVaultEntry } | { ok: false; error: string } {
  const entry = getOrCreateIdentityEntry({ userId: input.userId, email: input.email })
  const store = loadStore()

  if (input.phoneToBindOnce !== undefined && input.phoneToBindOnce !== null && input.phoneToBindOnce.trim() !== "") {
    const normPhone = normalizeIndianPhone(input.phoneToBindOnce)
    if (!normPhone) {
      return { ok: false, error: "Enter a valid 10-digit Indian mobile number." }
    }
    if (entry.phone && entry.phoneLocked && entry.phone !== normPhone) {
      return {
        ok: false,
        error: "Your mobile number is permanently locked to this account and cannot be changed by the user. Please email support@skylent.live for Admin verification.",
      }
    }
    const check = validateOneEmailOnePhoneBinding({
      email: entry.email,
      phone: normPhone,
      currentUserId: input.userId,
    })
    if (!check.ok) return check
    entry.phone = normPhone
    entry.phoneLocked = true
    store.userIdByPhone[normPhone] = input.userId
  }

  if (input.professional) {
    entry.professional = {
      ...entry.professional,
      ...Object.fromEntries(
        Object.entries(input.professional).map(([k, v]) => [k, typeof v === "string" ? v.trim().slice(0, 200) : ""]),
      ),
    }
  }

  entry.updatedAt = new Date().toISOString()
  store.byUserId[input.userId] = entry
  saveStore(store)
  return { ok: true, entry }
}

export function adminOverrideUserIdentity(input: {
  userId: string
  newEmail?: string
  newPhone?: string
}): UserIdentityVaultEntry {
  const store = loadStore()
  const existing = store.byUserId[input.userId] ?? {
    userId: input.userId,
    email: input.newEmail?.trim().toLowerCase() ?? "",
    phone: normalizeIndianPhone(input.newPhone),
    emailLocked: true,
    phoneLocked: Boolean(normalizeIndianPhone(input.newPhone)),
    passwordUpdatedAt: new Date().toISOString(),
    professional: defaultProfessional(),
    updatedAt: new Date().toISOString(),
  }

  if (input.newEmail) {
    const cleanEmail = input.newEmail.trim().toLowerCase()
    if (existing.email && store.userIdByEmail[existing.email] === input.userId) {
      delete store.userIdByEmail[existing.email]
    }
    existing.email = cleanEmail
    existing.emailLocked = true
    store.userIdByEmail[cleanEmail] = input.userId
  }

  if (input.newPhone !== undefined) {
    const cleanPhone = normalizeIndianPhone(input.newPhone)
    if (existing.phone && store.userIdByPhone[existing.phone] === input.userId) {
      delete store.userIdByPhone[existing.phone]
    }
    existing.phone = cleanPhone
    existing.phoneLocked = Boolean(cleanPhone)
    if (cleanPhone) {
      store.userIdByPhone[cleanPhone] = input.userId
    }
  }

  existing.updatedAt = new Date().toISOString()
  store.byUserId[input.userId] = existing
  saveStore(store)
  return existing
}
