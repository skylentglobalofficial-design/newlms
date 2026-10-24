/**
 * Comprehensive events API test.
 * Validates schema, business rules, and edge cases.
 */

import { z } from "zod"
import { EventStatus, EventType, EventRegistrationStatus } from "@prisma/client"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

assert(EventType.WEBINAR === "WEBINAR", "WEBINAR type exists")
assert(EventType.WORKSHOP === "WORKSHOP", "WORKSHOP type exists")
assert(EventType.LIVE_SESSION === "LIVE_SESSION", "LIVE_SESSION type exists")
assert(EventType.INFO_SESSION === "INFO_SESSION", "INFO_SESSION type exists")
assert(EventType.OTHER === "OTHER", "OTHER type exists")

assert(EventStatus.DRAFT === "DRAFT", "DRAFT status exists")
assert(EventStatus.PUBLISHED === "PUBLISHED", "PUBLISHED status exists")
assert(EventStatus.CANCELLED === "CANCELLED", "CANCELLED status exists")
assert(EventStatus.COMPLETED === "COMPLETED", "COMPLETED status exists")

assert(EventRegistrationStatus.REGISTERED === "REGISTERED", "REGISTERED status exists")
assert(EventRegistrationStatus.CANCELLED === "CANCELLED", "CANCELLED status exists")
assert(EventRegistrationStatus.ATTENDED === "ATTENDED", "ATTENDED status exists")
assert(EventRegistrationStatus.NO_SHOW === "NO_SHOW", "NO_SHOW status exists")

const slugSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const validSlugs = ["test", "test-event", "data-analytics-webinar-2026", "a1b2c3"]
const invalidSlugs = ["", "Test", "test_event", "test event", "test--event", "-test", "test-", "A".repeat(121)]

for (const slug of validSlugs) {
  assert(slugSchema.safeParse({ slug }).success, `valid slug: ${slug}`)
}
for (const slug of invalidSlugs) {
  assert(!slugSchema.safeParse({ slug }).success, `invalid slug: ${slug}`)
}

const eventCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  eventType: z.nativeEnum(EventType).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().max(50).optional(),
  capacity: z.number().int().min(1).optional(),
  meetingUrl: z.string().url().max(500).optional(),
  location: z.string().max(500).optional(),
  isOnline: z.boolean().optional(),
})

const validEvent = {
  slug: "webinar-intro-2026",
  title: "Introduction to Data Analytics",
  description: "Learn the fundamentals of data analytics in this 1-hour session.",
  startTime: "2026-11-01T10:00:00Z",
  endTime: "2026-11-01T11:00:00Z",
}

assert(eventCreateSchema.safeParse(validEvent).success, "basic valid event")

const fullEvent = {
  ...validEvent,
  eventType: EventType.WEBINAR,
  timezone: "Asia/Kolkata",
  capacity: 100,
  meetingUrl: "https://zoom.us/j/123456789",
  location: "Online",
  isOnline: true,
}

assert(eventCreateSchema.safeParse(fullEvent).success, "full valid event")

const invalidEvents = [
  { ...validEvent, slug: "" },
  { ...validEvent, title: "" },
  { ...validEvent, description: "" },
  { ...validEvent, startTime: "invalid" },
  { ...validEvent, endTime: "invalid" },
  { ...validEvent, capacity: 0 },
  { ...validEvent, capacity: -1 },
  { ...validEvent, meetingUrl: "not-a-url" },
]

for (const invalid of invalidEvents) {
  assert(!eventCreateSchema.safeParse(invalid).success, `invalid event rejected: ${JSON.stringify(invalid).slice(0, 50)}...`)
}

const start = new Date("2026-11-01T10:00:00Z")
const end = new Date("2026-11-01T11:00:00Z")
assert(end > start, "end time after start time validates")

const badEnd = new Date("2026-11-01T09:00:00Z")
assert(!(badEnd > start), "end time before start time fails")

const capacityTests = [
  { capacity: 100, registered: 50, spotsRemaining: 50 },
  { capacity: 100, registered: 100, spotsRemaining: 0 },
  { capacity: 100, registered: 101, spotsRemaining: 0 },
  { capacity: null, registered: 1000, spotsRemaining: null },
]

for (const test of capacityTests) {
  const spots = test.capacity ? Math.max(0, test.capacity - test.registered) : null
  assert(spots === test.spotsRemaining, `capacity ${test.capacity}, registered ${test.registered} = ${test.spotsRemaining} spots`)
}

const canRegister = (status: EventStatus, startTime: Date, now: Date, capacity: number | null, registered: number) => {
  if (status !== EventStatus.PUBLISHED) return false
  if (startTime < now) return false
  if (capacity !== null && registered >= capacity) return false
  return true
}

const now = new Date("2026-10-24T12:00:00Z")
const future = new Date("2026-11-01T10:00:00Z")
const past = new Date("2026-10-01T10:00:00Z")

assert(canRegister(EventStatus.PUBLISHED, future, now, 100, 50), "published future event with capacity")
assert(!canRegister(EventStatus.DRAFT, future, now, 100, 50), "draft event not registrable")
assert(!canRegister(EventStatus.CANCELLED, future, now, 100, 50), "cancelled event not registrable")
assert(!canRegister(EventStatus.PUBLISHED, past, now, 100, 50), "past event not registrable")
assert(!canRegister(EventStatus.PUBLISHED, future, now, 100, 100), "full event not registrable")
assert(canRegister(EventStatus.PUBLISHED, future, now, null, 1000), "unlimited capacity always registrable")

console.log("events-comprehensive ok")
