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
  useMuxPlayerScript(true)

  return (
    <div>
    <div
      className="lms-media-frame lms-media-frame--mux"
      data-mux-ready="true"
      data-playback-provider="mux"
      style={{
        background: C.soft,
        borderRadius: T.rCard,
        aspectRatio: "16/9",
        marginBottom: 20,
        overflow: "hidden",
        border: `1px solid ${T.lineDark}`,
      }}
    >
      {createElement("mux-player", {
        "playback-id": playbackId,
        "stream-type": "on-demand",
        title,
        style: { width: "100%", height: "100%", display: "block" },
      })}
    </div>
      {!watched && onMarkWatched ? (
        <button type="button" className="os-btn os-btn-primary" onClick={onMarkWatched}>
          Mark as watched
        </button>
      ) : null}
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
          background: C.soft,
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
        <div style={{ position: "absolute", top: 12, left: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: C.muted, letterSpacing: "0.06em" }}>
          VIDEO
        </div>
        {/* No play control: there is nothing to play until a video is published for this lesson. */}
        <div style={{ position: "relative", textAlign: "center", padding: 24, maxWidth: 420 }}>
          <span className="sky-chip sky-chip--development">In development</span>
          <div style={{ color: C.ink, fontSize: 14, fontWeight: 600, marginTop: 14, lineHeight: 1.4 }}>{title}</div>
          <div style={{ color: C.slate, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
            The video for this lesson has not been published yet.
          </div>
          {duration && (
            <div style={{ color: C.muted, fontSize: 11, marginTop: 8, fontFamily: "var(--font-mono)" }}>Planned length · {duration}</div>
          )}
        </div>
        {watched && (
          <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "#FFFFFF", background: C.navy, border: `1px solid ${C.navy}`, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 6 }}>
            Complete
          </div>
        )}
      </div>
      {!watched && onMarkWatched && (
        <>
          <button type="button" className="os-btn os-btn-ghost" onClick={onMarkWatched}>
            Mark lesson complete
          </button>
          <p className="dash-empty-copy" style={{ marginTop: 8 }}>This records progress only. It does not say you watched a video.</p>
        </>
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
    return <MuxPlaybackSurface playbackId={media.playbackId} title={title} accent={accent} watched={watched} onMarkWatched={onMarkWatched} />
  }

  if (!media) {
    // Media is still being requested from /lms/courses/:slug/lessons/:key/media.
    return (
      <div className="os-state-skeleton" role="status" aria-label="Loading the video">
        <span className="os-skeleton" style={{ aspectRatio: "16/9", height: "auto", width: "100%" }} />
      </div>
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
