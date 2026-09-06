import type { CareerEmploymentType, CareerWorkMode, JobListing } from "../../lib/career-api"

export function formatWorkMode(mode: CareerWorkMode | null): string | null {
  if (!mode) return null
  return mode.replace("_", " ")
}

export function formatEmploymentType(type: CareerEmploymentType | null): string | null {
  if (!type) return null
  return type.replace("_", " ")
}

export function formatExperience(job: JobListing): string | null {
  const { experienceMin, experienceMax } = job
  if (experienceMin !== null && experienceMax !== null) {
    return `${experienceMin}–${experienceMax} years`
  }
  if (experienceMin !== null) return `${experienceMin}+ years`
  if (experienceMax !== null) return `Up to ${experienceMax} years`
  return null
}

export function formatSalary(job: JobListing): string | null {
  const { salaryMin, salaryMax } = job
  if (salaryMin !== null && salaryMax !== null) {
    return `${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()}`
  }
  if (salaryMin !== null) return `From ${salaryMin.toLocaleString()}`
  if (salaryMax !== null) return `Up to ${salaryMax.toLocaleString()}`
  return null
}

export function formatPostedDate(postedAt: string | null): string | null {
  if (!postedAt) return null
  try {
    return new Date(postedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return null
  }
}

export function jobMetaLine(job: JobListing): string {
  return [
    job.employer?.name,
    job.location,
    formatWorkMode(job.workMode),
    formatEmploymentType(job.employmentType),
    job.category,
  ].filter(Boolean).join(" · ")
}

export function jobSecondaryLine(job: JobListing): string | null {
  const parts = [formatExperience(job), formatSalary(job), formatPostedDate(job.postedAt)].filter(Boolean)
  return parts.length ? parts.join(" · ") : null
}
