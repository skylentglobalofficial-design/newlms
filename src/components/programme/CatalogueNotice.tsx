/**
 * Shown when a catalogue request failed and the page is drawing on the published catalogue
 * records instead (src/lib/catalogue-fallback.ts), or could not load part of its data.
 * It says the status is not confirmed, that enrolment is paused, and offers a retry.
 */
export const STATUS_NOT_CONFIRMED = "Status not confirmed"

export default function CatalogueNotice({
  onRetry,
  what = "This page",
  bare = false,
}: {
  onRetry: () => void
  what?: string
  /** Render without its own container, for pages that already sit inside a content rail. */
  bare?: boolean
}) {
  const notice = (
    <p className="cat-notice" role="status">
      <strong>{STATUS_NOT_CONFIRMED}.</strong> {what} could not be checked with the Skylent catalogue just now, so
      availability is not confirmed and enrolment is paused.{" "}
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </p>
  )
  return bare ? notice : <div className="sky-container">{notice}</div>
}
