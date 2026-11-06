/**
 * Skylent 3-Tier Course Enrolment & Smart Career OS Validity Engine.
 *
 * Tier 1 ("certificate"): Self-Paced Certificate Training (Internshala-style, budget price, NO Career OS)
 * Tier 2 ("professional"): Professional Job-Ready Certificate (For Final-Year Students, Career OS Included, no false job guarantee)
 * Tier 3 ("flagship"): Flagship Live + Career OS Pro (Live classes + Recorded + 1:1 TA Support + Full Career OS & Job Assistance)
 *
 * Career OS Smart Multi-Course Rule:
 * - Included only in Tier 2 ("professional") and Tier 3 ("flagship").
 * - Each eligible course has a 6-Month Active Course Window from enrollment date.
 * - Learner must complete >= 60% of the course BEFORE the 6-Month Course Window ends to enroll in Career OS.
 * - Enrolling in Career OS within the 6-Month window at >= 60% grants +3 Months of Intensive Practice & Placement Access.
 * - If 6 months pass without reaching 60% and enrolling in Career OS, access expires for that course.
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

export function buildSkylentTiersForPrice(baseCoursePrice: number, slug?: string): SkylentTierPlan[] {
  const overrides = slug ? readAdminPriceOverrides()[slug] : undefined
  const proPrice = overrides?.proPrice ?? (baseCoursePrice > 0 ? baseCoursePrice : 3499)
  const certPrice = overrides?.certPrice ?? Math.max(999, Math.round((proPrice * 0.43) / 100) * 100 - 1)
  const flagshipPrice = overrides?.flagshipPrice ?? (proPrice + 3000)

  return [
    {
      id: "certificate",
      name: "1. Certificate Training",
      shortBadge: "Self-Paced · Certificate Only",
      tagline: "Focused self-paced training + verified certificate (like Internshala Trainings)",
      audience: "Best for 1st/2nd year college students & quick skill foundation",
      price: certPrice,
      mrp: certPrice * 2,
      includesCareerOS: false,
      includesLiveClasses: false,
      includesJobAssistance: false,
      features: [
        "Full self-paced reading modules & concept quizzes",
        "In-browser practice workbench (SQL / Python / Case Sandbox)",
        "Verifiable SKL Course Completion Certificate (/verify)",
      ],
      notIncluded: [
        "Career OS & Recruiter Job Board NOT included",
        "Live weekend classes & 1:1 mock interviews NOT included",
      ],
    },
    {
      id: "professional",
      name: "2. Professional Certificate",
      shortBadge: "Job-Ready + Career OS",
      tagline: "Job-ready curriculum + Capstone Portfolio + Career OS (No false job guarantee)",
      audience: "Best for Final-Year Students building a recruiter-ready portfolio",
      price: proPrice,
      mrp: proPrice * 2,
      includesCareerOS: true,
      includesLiveClasses: false,
      includesJobAssistance: true,
      popular: true,
      features: [
        "Everything in Certificate Training + Graded Capstone Studio",
        "Public Proof-of-Work Dossier (/verify) for hiring managers",
        "Skylent Career OS Included (6-Month Active Window + 3-Month Practice Extension after 60% rule)",
        "Track-Specific Interview Prep, Spoken English, ATS Resume & LinkedIn Makeover",
      ],
    },
    {
      id: "flagship",
      name: "3. Flagship Live + Career OS Pro",
      shortBadge: "Live Classes + Full Job Assistance",
      tagline: "Live mentor classes + recorded sessions + 20-min TA SLA + Full Career OS & Job Board",
      audience: "Best for serious career switchers & placement-focused learners",
      price: flagshipPrice,
      mrp: flagshipPrice * 2,
      includesCareerOS: true,
      includesLiveClasses: true,
      includesJobAssistance: true,
      features: [
        "Live weekend mentor classes + full recorded lecture library",
        "Priority 20-Minute Faculty TA Doubt & Rubric Review SLA",
        "Full Career OS Pro (6M Window + 3M Intensive Practice Extension at 60%)",
        "1-on-1 Mock Interviews + Direct Recruiter Job Board & Referrals",
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
      return "Certificate Plan (Self-Paced)"
    case "flagship":
      return "Flagship Live + Career OS Pro"
    default:
      return "Professional Plan · Career OS"
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
