const MUX_PLAYBACK_ID_PATTERN = /^[A-Za-z0-9]{10,80}$/
const PLACEHOLDER_PATTERNS = [
  /^mux[-_]/i,
  /playback[-_]?contract/i,
  /placeholder/i,
  /vertical[-_]?slice/i,
  /qa[-_]?playback/i,
  /seed[-_]?verification/i,
]

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function extractFromMuxUrl(value: string): string | null {
  const match = value.match(/stream\.mux\.com\/([A-Za-z0-9]+)(?:\.m3u8)?/i)
  return match?.[1] ?? null
}

export function normalizeMuxPlaybackId(
  input: string | null | undefined,
): string | null {
  if (input == null) return null

  let value = input.replace(/\uFEFF/g, "").replace(/\r/g, "")
  value = stripWrappingQuotes(value)
  if (!value) return null

  const fromUrl = extractFromMuxUrl(value)
  if (fromUrl) value = fromUrl

  value = value.trim()
  if (!value) return null

  if (!MUX_PLAYBACK_ID_PATTERN.test(value)) return null
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) return null

  return value
}

export function isConfiguredMuxPlaybackId(
  input: string | null | undefined,
): boolean {
  return normalizeMuxPlaybackId(input) != null
}

export function sanitizeVideoPlaybackSource(
  media?: { provider?: string; playbackId?: string } | null,
): { provider: "mux" | "unavailable"; playbackId?: string } {
  if (media?.provider === "mux") {
    const playbackId = normalizeMuxPlaybackId(media.playbackId)
    if (playbackId) return { provider: "mux", playbackId }
  }
  return { provider: "unavailable" }
}
