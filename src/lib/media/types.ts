export type VideoPlaybackSource = {
  provider: "mux" | "unavailable"
  playbackId?: string
  /** Optional playback state supplied by media adapters. */
  status?: "ready" | "unavailable" | "processing"
}

export type LessonMediaPayload = {
  lessonKey: string
  title: string
  duration?: string | null
  media: VideoPlaybackSource
}
