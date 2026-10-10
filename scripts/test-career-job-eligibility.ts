import { JobStatus } from "@prisma/client"
import { isJobOpenForApplications } from "../server/src/lib/career/job-eligibility.ts"

if (!isJobOpenForApplications(JobStatus.OPEN)) {
  throw new Error("Open jobs should accept applications")
}

for (const status of [JobStatus.DRAFT, JobStatus.CLOSED, JobStatus.ARCHIVED]) {
  if (isJobOpenForApplications(status)) {
    throw new Error(`${status} jobs must not accept applications`)
  }
}

console.log("career-job-eligibility ok")