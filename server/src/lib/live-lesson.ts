/** Live teaching is not provided by this application. A stored URL is only a reference. */
export function describeLiveLesson(referenceUrl: string | null | undefined) {
  const provider = process.env.LIVE_LESSON_PROVIDER?.trim() || null
  return {
    referenceUrl: referenceUrl ?? null,
    provider,
    streaming: false,
    reason: provider
      ? "A live-lesson provider name is set, but no streaming integration is implemented."
      : "No live-lesson provider is configured.",
  }
}
