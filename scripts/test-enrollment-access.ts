import { canOpenEnrollment } from "../src/lib/lms-api.ts"

if (!canOpenEnrollment("active")) {
  throw new Error("Active enrolments should remain openable")
}

if (!canOpenEnrollment("completed")) {
  throw new Error("Completed enrolments should remain reviewable")
}

if (canOpenEnrollment("withdrawn")) {
  throw new Error("Withdrawn enrolments must not link to a protected course")
}

console.log("enrollment-access ok")