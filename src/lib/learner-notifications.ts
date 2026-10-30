export type ElixirReasonInput = {
  id: string
  amount: number
  type: string
  activity: string | null
  note: string | null
  unrecovered: number
  createdAt: string
}

export type LearnerDoubtRecord = {
  id: string
  courseSlug: string
  lessonKey: string
  lessonTitle: string
  question: string
  status: "open" | "resolved"
  slaMinutes: number
  createdAt: string
  resolvedAt: string | null
  resolutionNote: string | null
}

export type CertificateNotificationInput = {
  code: string
  learnerName: string
  courseTitle: string
  courseSlug?: string | null
  verifyPath?: string
  issuedAt: string
  revoked?: boolean
}

export type SkylentNotificationItem = {
  id: string
  kind: "elixir" | "faculty_reply" | "doubt_open" | "certificate"
  title: string
  detail: string
  timestamp: string
  href: string
}

export function formatElixirReason(tx: ElixirReasonInput): string {
  if (tx.note && tx.note.trim().length > 0) {
    if (tx.note === "lesson_complete") return "Verified lesson completion reward"
    if (tx.note === "quiz_score") return "Module quiz high score (>=80%) reward"
    if (tx.note === "assignment_complete") return "Written case / assignment submission reward"
    if (tx.note === "case_study_complete") return "Elixir Case Study completion reward"
    return tx.note
  }
  if (tx.activity === "lesson_complete") return "Verified lesson completion reward"
  if (tx.activity === "quiz_score") return "Module quiz high score (>=80%) reward"
  if (tx.activity === "assignment_complete") return "Written case / assignment submission reward"
  if (tx.activity === "case_study_complete") return "Elixir Case Study completion reward"
  if (tx.type === "purchase_reward") return "Verified purchase / workshop cashback reward"
  if (tx.type === "resource_spend") return "Redeemed in Elixir Case Study Store"
  return "Verified Elixir ledger transaction"
}

export function buildNotificationItems(input: {
  transactions: ElixirReasonInput[]
  doubts: LearnerDoubtRecord[]
  certificates: CertificateNotificationInput[]
}): SkylentNotificationItem[] {
  const items: SkylentNotificationItem[] = []

  for (const tx of input.transactions) {
    if (tx.amount > 0) {
      items.push({
        id: `elixir:${tx.id}`,
        kind: "elixir",
        title: `+${tx.amount} Elixir credited`,
        detail: formatElixirReason(tx),
        timestamp: tx.createdAt,
        href: "/dashboard/student",
      })
    }
  }

  for (const doubt of input.doubts) {
    if (doubt.status === "resolved") {
      items.push({
        id: `doubt-resolved:${doubt.id}:${doubt.resolvedAt ?? doubt.createdAt}`,
        kind: "faculty_reply",
        title: `Faculty TA replied · ${doubt.lessonTitle}`,
        detail: doubt.resolutionNote || "Your lesson doubt has been reviewed and resolved.",
        timestamp: doubt.resolvedAt ?? doubt.createdAt,
        href: `/learn/${doubt.courseSlug}`,
      })
    } else {
      items.push({
        id: `doubt-open:${doubt.id}`,
        kind: "doubt_open",
        title: `Doubt in queue (${doubt.slaMinutes}-min SLA) · ${doubt.lessonTitle}`,
        detail: doubt.question,
        timestamp: doubt.createdAt,
        href: `/learn/${doubt.courseSlug}`,
      })
    }
  }

  for (const cert of input.certificates) {
    if (cert.revoked) continue
    items.push({
      id: `cert:${cert.code}`,
      kind: "certificate",
      title: `Certificate unlocked · ${cert.courseTitle}`,
      detail: `Credential ID ${cert.code} is ready for verification.`,
      timestamp: cert.issuedAt,
      href: cert.verifyPath || `/verify/${cert.code}`,
    })
  }

  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
