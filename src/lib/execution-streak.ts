export type LearnerActivityPoint = {
  date: string
  count: number
  active: boolean
}

export type LearnerExecutionStreak = {
  currentStreakDays: number
  longestStreakDays: number
  weeklyActionsCount: number
  streakBonusElixir: number
  activityHeatmap: LearnerActivityPoint[]
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function computeLearnerExecutionStreak(
  activityTimestamps: Array<string | Date | number | null | undefined>,
  baseDate = new Date(),
): LearnerExecutionStreak {
  const countsByDay = new Map<string, number>()

  for (const raw of activityTimestamps) {
    if (!raw) continue
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) continue
    const key = toDateKey(d)
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
  }

  // Generate 14-day trailing heatmap ending today
  const activityHeatmap: LearnerActivityPoint[] = []
  let weeklyActionsCount = 0

  for (let i = 13; i >= 0; i--) {
    const day = new Date(baseDate)
    day.setUTCDate(day.getUTCDate() - i)
    const key = toDateKey(day)
    const count = countsByDay.get(key) ?? 0
    activityHeatmap.push({
      date: key,
      count,
      active: count > 0,
    })
    if (i < 7) {
      weeklyActionsCount += count
    }
  }

  // Calculate current streak (look back from today; if today has 0, check if yesterday had >0 to preserve active streak)
  let currentStreak = 0
  const todayKey = toDateKey(baseDate)
  const yesterday = new Date(baseDate)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = toDateKey(yesterday)

  const todayActive = (countsByDay.get(todayKey) ?? 0) > 0
  const yesterdayActive = (countsByDay.get(yesterdayKey) ?? 0) > 0

  if (todayActive || yesterdayActive) {
    let checkDate = todayActive ? new Date(baseDate) : yesterday
    while (true) {
      const key = toDateKey(checkDate)
      if ((countsByDay.get(key) ?? 0) > 0) {
        currentStreak += 1
        checkDate.setUTCDate(checkDate.getUTCDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak across all recorded days
  const sortedDays = Array.from(countsByDay.keys()).sort()
  let longestStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  for (const dayKey of sortedDays) {
    if ((countsByDay.get(dayKey) ?? 0) === 0) continue
    const cur = new Date(`${dayKey}T00:00:00Z`)
    if (!prevDate) {
      tempStreak = 1
    } else {
      const diffMs = cur.getTime() - prevDate.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        tempStreak += 1
      } else {
        tempStreak = 1
      }
    }
    prevDate = cur
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak)
  const streakBonusElixir = currentStreak * 5

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
    weeklyActionsCount,
    streakBonusElixir,
    activityHeatmap,
  }
}
