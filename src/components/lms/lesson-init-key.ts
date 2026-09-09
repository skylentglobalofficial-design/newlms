export function buildLessonInitKey(input: {
  slug: string | undefined
  lessonId: string | undefined
  locked: boolean
  lessonType: string | undefined
}): string | null {
  if (!input.slug || !input.lessonId || !input.lessonType) return null
  if (input.locked) return `${input.slug}:${input.lessonId}:locked`
  return `${input.slug}:${input.lessonId}:${input.lessonType}`
}

export function shouldRunLessonInitialization(
  completedKey: string | null,
  nextKey: string | null,
): boolean {
  if (!nextKey) return false
  return completedKey !== nextKey
}
