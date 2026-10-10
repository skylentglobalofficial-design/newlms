/**
 * <input type="datetime-local"> works in the viewer's local time with no zone ("2026-10-10T14:30").
 * The API stores UTC ISO strings ("2026-10-10T09:00:00.000Z"). Slicing the ISO string shows UTC as if it
 * were local, and saving it back shifts the time by the viewer's offset on every save. Convert both ways.
 */
export function toDateTimeLocalInput(value: string | Date | null | undefined): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** The local input value back to a UTC ISO string for the API, or null when empty or invalid. */
export function fromDateTimeLocalInput(value: string): string | null {
  if (!value) return null
  const date = new Date(value) // a zone-less date-time string is parsed as local time
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
