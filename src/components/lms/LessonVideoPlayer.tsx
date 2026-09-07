import { useEffect, useRef, createElement } from "react"
import { C, T } from "../../tokens"
import type { VideoPlaybackSource } from "../../lib/media/types"

type Accent = { primary: string; subtle: string; border: string; text: string }

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "mux-player": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            "playback-id"?: string
            "stream-type"?: string
            title?: string
          },
          HTMLElement
        >
      }
    }
  }
}

function useMuxPlayerScript(enabled: boolean) {
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!enabled || loadedRef.current) return
    if (document.querySelector('script[data-mux-player="true"]')) {
      loadedRef.current = true
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player"
    script.async = true
    script.dataset.muxPlayer = "true"
    document.head.appendChild(script)
    loadedRef.current = true
  }, [enabled])
}

function MuxPlaybackSurface({
  playbackId,
  title,
  accent,
  watched,
  onMarkWatched,
}: {
  playbackId: string
  title: string
  accent: Accent
  watched: boolean
  onMarkWatched?: () => void
}) {
  const playerRef = useRef<HTMLElement>(null)
  useMuxPlayerScript(true)

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    player.setAttribute("playback-id", playbackId)
    player.setAttribute("stream-type", "on-demand")
    player.setAttribute("title", title)
  }, [playbackId, title])

  return (
    <div>
      <div
        className="lms-media-frame lms-media-frame--mux"
        data-mux-ready="true"
        data-playback-provider="mux"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: T.rCard,
          aspectRatio: "16/9",
          marginBottom: 20,
          overflow: "hidden",
          border: `1px solid ${accent.border}`,
        }}
      >
        {createElement("mux-player", {
          key: playbackId,
          ref: playerRef,
          "playback-id": playbackId,
          "stream-type": "on-demand",
          title,
          style: { width: "100%", height: "100%", display: "block" },
        })}
      </div>
      {!watched && onMarkWatched && (
        <button
          type="button"
          onClick={onMarkWatched}
          style={{
            background: accent.primary, border: "none", color: C.black,
            padding: "12px 24px", borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          Mark as watched →
        </button>
      )}
    </div>
  )
}

function VideoPreviewSurface({
  title,
  duration,
  watched,
  accent,
  onMarkWatched,
}: {
  title: string
  duration?: string
  watched: boolean
  accent: Accent
  onMarkWatched?: () => void
}) {
  return (
    <div>
      <div
        className="lms-media-frame lms-media-frame--preview"
        data-mux-ready="true"
        data-playback-provider="unavailable"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: T.rCard,
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${T.lineDark}`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 30% 20%, ${accent.subtle} 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", top: 12, left: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
          VIDEO · PREVIEW
        </div>
        <div style={{ position: "relative", textAlign: "center", padding: 24, maxWidth: 420 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: accent.subtle, border: `2px solid ${accent.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto", cursor: "default",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={accent.primary}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 500, marginTop: 14, lineHeight: 1.4 }}>{title}</div>
          {duration && (
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8, fontFamily: "var(--font-mono)" }}>{duration}</div>
          )}
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 10, fontFamily: "var(--font-mono)" }}>
            Video content is not available in this environment. A Mux playback ID is required for streaming.
          </div>
        </div>
        {watched && (
          <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", padding: "4px 10px", borderRadius: T.rPill }}>
            Watched
          </div>
        )}
      </div>
      {!watched && onMarkWatched && (
        <button
          type="button"
          onClick={onMarkWatched}
          style={{
            background: accent.primary, border: "none", color: C.black,
            padding: "12px 24px", borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          Mark as watched →
        </button>
      )}
    </div>
  )
}

export default function LessonVideoPlayer({
  media,
  title,
  duration,
  watched,
  accent,
  onMarkWatched,
}: {
  media?: VideoPlaybackSource
  title: string
  duration?: string
  watched: boolean
  accent: Accent
  onMarkWatched?: () => void
}) {
  if (media?.provider === "mux" && media.playbackId) {
    return (
      <MuxPlaybackSurface
        playbackId={media.playbackId}
        title={title}
        accent={accent}
        watched={watched}
        onMarkWatched={onMarkWatched}
      />
    )
  }

  return (
    <VideoPreviewSurface
      title={title}
      duration={duration}
      watched={watched}
      accent={accent}
      onMarkWatched={onMarkWatched}
    />
  )
}
