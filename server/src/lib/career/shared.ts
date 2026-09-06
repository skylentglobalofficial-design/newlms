import type { Response } from "express"
import type { ZodError } from "zod"

export function validationError(res: Response, error: ZodError) {
  return res.status(400).json({
    error: "Validation failed",
    details: error.flatten().fieldErrors,
  })
}

export function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export function isoDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null
}

export function isoDateTime(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null
}

export function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

export const slugSchema = (value: string) =>
  value.length >= 1 &&
  value.length <= 120 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
