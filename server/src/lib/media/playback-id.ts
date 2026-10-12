/** Public Mux playback ids. Signed tokens and asset URLs are rejected. */
const PLAYBACK_ID = /^[A-Za-z0-9]{16,64}$/

export function isMuxPlaybackId(value: string | null | undefined): value is string {
  return Boolean(value && PLAYBACK_ID.test(value))
}

export const muxPlaybackIdSchemaMessage = "Expected a public Mux playback id (16–64 letters or digits)"
