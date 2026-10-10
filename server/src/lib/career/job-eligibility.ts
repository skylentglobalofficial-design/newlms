import { JobStatus } from "@prisma/client"

export function isJobOpenForApplications(status: JobStatus): boolean {
  return status === JobStatus.OPEN
}