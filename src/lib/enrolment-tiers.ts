/**
 * Skylent 2-Tier Course Enrolment & Smart Career OS Validity Engine.
 */

export type SkylentTierId = "certificate" | "professional" | "flagship"

export type SkylentTierPlan = {
  id: SkylentTierId
  name: string
  shortBadge: string
  tagline: string
  audience: string
  price: number
  mrp: number
  includesCareerOS: boolean
  includesLiveClasses: boolean
  includesJobAssistance: boolean
  features: string[]
  notIncluded?: string[]
  popular?: boolean
}

const STORAGE_KEY = "skylent:v62:course-tiers"
const ADMIN_PRICE_STORAGE_KEY = "skylent:v68:admin-price-overrides"

export type LocalPriceOverride = {
  slug: string
  basePrice: number
  certPrice: number
  proPrice: number
  flagshipPrice: number
  mrp: number
}

export function readAdminPriceOverrides(): Record<string, LocalPriceOverride> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(ADMIN_PRICE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, LocalPriceOverride>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function saveAdminPriceOverridesLocal(map: Record<string, LocalPriceOverride>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ADMIN_PRICE_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

export type StoredCourseTierRecord = {
  slug: string
  tier: SkylentTierId
  enrolledAt: string
  careerOsEnrolled?: boolean
  careerOsEnrolledAt?: string
}

export function buildSkylentTiersForPrice(_baseCoursePrice: number, slug?: string): SkylentTierPlan[] {
  const overrides = slug ? readAdminPriceOverrides()[slug] : undefined
  const certPrice = overrides?.certPrice ?? 1499
  const flagshipPrice = overrides?.flagshipPrice ?? 11999

  return [
    {
      id: "certificate",
      name: "Certification + Internship Plan",
      shortBadge: "2-Month Free Internship",
      tagline: "Part-time certification course with hands-on projects & 2-month complimentary internship",
      audience: "For learners who want practical skills, hands-on project practice & a 2-month internship",
      price: certPrice,
      mrp: 2999,
      includesCareerOS: false,
      includesLiveClasses: false,
      includesJobAssistance: false,
      features: [
        "Complete self-paced course modules & browser practice labs",
        "Hands-on capstone project & verifiable certificate",
        "2-Month Complimentary Practice & Internship included",
        "Top performers eligible for direct intern hiring",
      ],
    },
    {
      id: "flagship",
      name: "Job Assistance Program",
      shortBadge: "Full Job Assistance",
      tagline: "Complete training, 2-month internship, 1-on-1 mentorship & dedicated job assistance",
      audience: "For learners targeting full-time placement & career transition",
      price: flagshipPrice,
      mrp: 19999,
      includesCareerOS: true,
      includesLiveClasses: true,
      includesJobAssistance: true,
      popular: true,
      features: [
        "Everything in Certification + 2-Month Internship Plan",
        "Dedicated Job Assistance, recruiter job board & referrals",
        "1-on-1 mock interviews, resume & LinkedIn profile review",
        "Live weekend mentor sessions & priority project feedback",
      ],
    },
  ]
}

export function readStoredCourseTiers(): Record<string, StoredCourseTierRecord> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, StoredCourseTierRecord>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function saveStoredCourseTier(
  slug: string,
  tier: SkylentTierId,
  enrolledAt = new Date().toISOString(),
  careerOsEnrolled = false,
): StoredCourseTierRecord {
  const existing = readStoredCourseTiers()
  const prev = existing[slug]
  const record: StoredCourseTierRecord = {
    slug,
    tier,
    enrolledAt: prev?.enrolledAt ?? enrolledAt,
    careerOsEnrolled: careerOsEnrolled || Boolean(prev?.careerOsEnrolled),
    careerOsEnrolledAt: careerOsEnrolled
      ? prev?.careerOsEnrolledAt ?? new Date().toISOString()
      : prev?.careerOsEnrolledAt,
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...existing,
          [slug]: record,
        }),
      )
    } catch {
      // ignore storage errors
    }
  }
  return record
}

export function getCourseTierRecord(slug: string, fallbackEnrolledAt?: string): StoredCourseTierRecord {
  const map = readStoredCourseTiers()
  if (map[slug]) return map[slug]
  return {
    slug,
    tier: "professional",
    enrolledAt: fallbackEnrolledAt || new Date().toISOString(),
    careerOsEnrolled: false,
  }
}

export function tierLabelFor(tier: SkylentTierId): string {
  switch (tier) {
    case "certificate":
      return "Certification + 2M Internship Plan"
    case "flagship":
      return "Job Assistance Program"
    default:
      return "Job Assistance Program"
  }
}

export type CourseCareerOSStatus =
  | "tier_locked"
  | "expired_missed_gate"
  | "active_building_to_60"
  | "ready_to_enrol_plus_3m"
  | "unlocked_with_3m_extension"

export type CourseCareerOSValidity = {
  slug: string
  title: string
  tier: SkylentTierId
  tierLabel: string
  includesCareerOS: boolean
  progressPct: number
  completedLessons: number
  totalLessons: number
  enrolledAt: Date
  courseEndDate: Date
  practiceExtensionEndDate: Date
  daysRemainingInCourseWindow: number
  daysRemainingTotal: number
  meets60PctRule: boolean
  within6MonthWindow: boolean
  careerOsEnrolled: boolean
  status: CourseCareerOSStatus
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime())
  next.setMonth(next.getMonth() + months)
  return next
}

export function computeCourseCareerOSValidity(input: {
  slug: string
  title: string
  progressPct: number
  completedLessons?: number
  totalLessons?: number
  enrolledAtIso?: string
  backendCareerRiseEnrolled?: boolean
}): CourseCareerOSValidity {
  const stored = getCourseTierRecord(input.slug, input.enrolledAtIso)
  const tier = stored.tier
  const includesCareerOS = tier === "professional" || tier === "flagship"
  const enrolledDateRaw = new Date(input.enrolledAtIso || stored.enrolledAt || Date.now())
  const enrolledAt = Number.isNaN(enrolledDateRaw.getTime()) ? new Date() : enrolledDateRaw
  const courseEndDate = addMonths(enrolledAt, 6)
  const practiceExtensionEndDate = addMonths(courseEndDate, 3)

  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysRemainingInCourseWindow = Math.max(0, Math.ceil((courseEndDate.getTime() - now.getTime()) / msPerDay))
  const daysRemainingTotal = Math.max(0, Math.ceil((practiceExtensionEndDate.getTime() - now.getTime()) / msPerDay))

  const progressPct = Math.max(0, Math.min(100, Math.round(input.progressPct || 0)))
  const meets60PctRule = progressPct >= 60
  const within6MonthWindow = now.getTime() <= courseEndDate.getTime()
  const careerOsEnrolled = Boolean(stored.careerOsEnrolled || input.backendCareerRiseEnrolled)

  let status: CourseCareerOSStatus
  if (!includesCareerOS) {
    status = "tier_locked"
  } else if (careerOsEnrolled && meets60PctRule) {
    status = "unlocked_with_3m_extension"
  } else if (!within6MonthWindow) {
    status = "expired_missed_gate"
  } else if (meets60PctRule) {
    status = "ready_to_enrol_plus_3m"
  } else {
    status = "active_building_to_60"
  }

  return {
    slug: input.slug,
    title: input.title,
    tier,
    tierLabel: tierLabelFor(tier),
    includesCareerOS,
    progressPct,
    completedLessons: input.completedLessons ?? Math.round((progressPct / 100) * 15),
    totalLessons: input.totalLessons ?? 15,
    enrolledAt,
    courseEndDate,
    practiceExtensionEndDate,
    daysRemainingInCourseWindow,
    daysRemainingTotal,
    meets60PctRule,
    within6MonthWindow,
    careerOsEnrolled,
    status,
  }
}
