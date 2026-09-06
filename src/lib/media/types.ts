export type VideoPlaybackSource = {
  provider: "mux" | "unavailable"
  playbackId?: string
}

export type LessonMediaPayload = {
  lessonKey: string
  title: string
  duration?: string | null
  media: VideoPlaybackSource
}
