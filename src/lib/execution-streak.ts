/**
 * Phase P14: Daily Execution Streak, 14-Day Proof-of-Work Activity Heatmap & Weekly Elixir Goal
 * (inspired by Duolingo, LeetCode, and Boot.dev habit loops).
 */

export type HeatmapDay = {
  date: string
  label: string
  count: number
  active: boolean
}

export type ExecutionStreakSummary = {
  currentStreakDays: number
  longestStreakDays: number
  activeToday: boolean
  weeklyActionsCount: number
  weeklyGoalTarget: number
  weeklyGoalPercent: number
  streakBonusElixir: number
  heatmapDays: HeatmapDay[]
}

function toUtcDateKey(isoOrDate: string | Date): string | null {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function addUtcDays(dateKey: string, deltaDays: number): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

function formatShortDay(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`)
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "UTC" })
}

export function computeLearnerExecutionStreak(
  activityTimestamps: readonly (string | null | undefined)[],
  referenceDateIso: string = new Date().toISOString(),
): ExecutionStreakSummary {
  const todayKey = toUtcDateKey(referenceDateIso) ?? new Date().toISOString().slice(0, 10)
  const countsByDate = new Map<string, number>()

  for (const raw of activityTimestamps) {
    if (!raw) continue
    const key = toUtcDateKey(raw)
    if (!key) continue
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1)
  }

  // Build 14-day heatmap ending today (oldest -> newest)
  const heatmapDays: HeatmapDay[] = []
  for (let offset = -13; offset <= 0; offset += 1) {
    const key = addUtcDays(todayKey, offset)
    const count = countsByDate.get(key) ?? 0
    heatmapDays.push({
      date: key,
      label: formatShortDay(key),
      count,
      active: count > 0,
    })
  }

  // Weekly actions in last 7 days (including today)
  let weeklyActionsCount = 0
  for (let offset = -6; offset <= 0; offset += 1) {
    const key = addUtcDays(todayKey, offset)
    weeklyActionsCount += countsByDate.get(key) ?? 0
  }

  const activeToday = (countsByDate.get(todayKey) ?? 0) > 0
  const yesterdayKey = addUtcDays(todayKey, -1)
  const activeYesterday = (countsByDate.get(yesterdayKey) ?? 0) > 0

  // Current streak counts consecutive active days ending today (or yesterday if not yet active today)
  let currentStreakDays = 0
  if (activeToday || activeYesterday) {
    let cursor = activeToday ? todayKey : yesterdayKey
    while ((countsByDate.get(cursor) ?? 0) > 0) {
      currentStreakDays += 1
      cursor = addUtcDays(cursor, -1)
    }
  }

  // Longest streak across all recorded dates
  const sortedDates = [...countsByDate.keys()].sort()
  let longestStreakDays = currentStreakDays
  let run = 0
  let prevKey: string | null = null
  for (const key of sortedDates) {
    if (prevKey && addUtcDays(prevKey, 1) === key) {
      run += 1
    } else {
      run = 1
    }
    if (run > longestStreakDays) longestStreakDays = run
    prevKey = key
  }

  const weeklyGoalTarget = 5
  const weeklyGoalPercent = Math.min(100, Math.round((weeklyActionsCount / weeklyGoalTarget) * 100))
  const streakBonusElixir = currentStreakDays * 5

  return {
    currentStreakDays,
    longestStreakDays,
    activeToday,
    weeklyActionsCount,
    weeklyGoalTarget,
    weeklyGoalPercent,
    streakBonusElixir,
    heatmapDays,
  }
}
