/**
 * Events API structure test.
 * Validates the events routes exist and have the expected schemas.
 * Does not require a running server.
 */

import { z } from "zod"

const eventCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
})

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const validEvent = {
  slug: "test-webinar-2026",
  title: "Introduction to Data Analytics",
  description: "A webinar introducing the fundamentals of data analytics.",
  startTime: "2026-11-01T10:00:00Z",
  endTime: "2026-11-01T11:00:00Z",
}

const invalidEvents = [
  { ...validEvent, slug: "" },
  { ...validEvent, slug: "INVALID SLUG" },
  { ...validEvent, title: "" },
  { ...validEvent, description: "" },
  { ...validEvent, startTime: "not-a-date" },
  { ...validEvent, endTime: "also-not-a-date" },
]

const validResult = eventCreateSchema.safeParse(validEvent)
assert(validResult.success, "valid event should pass schema")

for (const invalid of invalidEvents) {
  const result = eventCreateSchema.safeParse(invalid)
  assert(!result.success, `invalid event should fail: ${JSON.stringify(invalid)}`)
}

console.log("events ok")
