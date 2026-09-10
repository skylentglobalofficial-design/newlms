/**
 * Centralized media references for Skylent.
 * Product visuals use skylent:<visualId> refs rendered by ProductVisual.
 * No remote image URLs.
 */

import type { ProductVisualId } from "@/components/product/ProductVisuals";

export type MediaRef = string;

export const DEFAULT_PROGRAM_PHOTO: MediaRef = "skylent:catalog-browser";

export const PHOTO = {
  hero: "skylent:ecosystem-flow",
  classroomWarm: "skylent:schooling-classroom",
  classroomDiscussion: "skylent:education-journey",
  teacher: "skylent:schooling-classroom",
  campus: "skylent:curriculum-map",
  collab: "skylent:college-lab",
  lab: "skylent:neet-lab",
  professional: "skylent:fullstack-workspace",
  research: "skylent:research-desk",
  study: "skylent:study-session",
  career: "skylent:career-workspace",
  workshop: "skylent:workshop-session",
  schoolBuilding: "skylent:institution-dashboard",
  college: "skylent:college-lab",
  university: "skylent:institution-ops",
  training: "skylent:skills-workspace",
  assessment: "skylent:exam-interface",
  industry: "skylent:career-pipeline",
  lecture: "skylent:schooling-classroom",
  studentLaptop: "skylent:fullstack-workspace",
  studentStudy: "skylent:study-session",
  campusWalk: "skylent:curriculum-map",
  libraryStudy: "skylent:research-desk",
  graduation: "skylent:career-pipeline",
  teamMeeting: "skylent:institution-pipeline",
  mentorSession: "skylent:workshop-session",
  careerCounsel: "skylent:career-workspace",
  interviewPrep: "skylent:career-workspace",
  codingSession: "skylent:fullstack-workspace",
  dataAnalytics: "skylent:analytics-workspace",
  dataScience: "skylent:data-workspace",
  marketing: "skylent:campaign-funnel",
  businessSchool: "skylent:mba-case",
  examPrep: "skylent:jee-exam",
  biologyLab: "skylent:neet-lab",
  engineering: "skylent:jee-exam",
  institution: "skylent:institution-ops",
  successStory: "skylent:career-pipeline",
  aboutTeam: "skylent:about-ecosystem",
} as const satisfies Record<string, MediaRef>;

export const PROGRAM_PHOTO: Record<string, MediaRef> = {
  "data-analytics-pro": "skylent:analytics-workspace",
  "data-science-ai": "skylent:data-workspace",
  "full-stack": "skylent:fullstack-workspace",
  "generative-ai-program": "skylent:learning-loop",
  "product-management": "skylent:mba-case",
  "sql-certificate": "skylent:analytics-workspace",
  "digital-marketing": "skylent:campaign-funnel",
  "jee-advanced-prep": "skylent:jee-exam",
  "cat-prep": "skylent:cat-exam",
  jee: "skylent:jee-exam",
  neet: "skylent:neet-lab",
  cat: "skylent:cat-exam",
  schooling: "skylent:schooling-classroom",
  ug: "skylent:curriculum-map",
  pg: "skylent:mba-case",
  mba: "skylent:mba-case",
};

/** Short-course catalog visuals — domain-native, no duplicate slugs within domain. */
export const COURSE_PHOTO: Record<string, MediaRef> = {
  "data-analytics": "skylent:analytics-workspace",
  "python-programming": "skylent:skills-ladder",
  "generative-ai": "skylent:learning-loop",
  "power-bi": "skylent:analytics-workspace",
  "product-management": "skylent:mba-case",
  "full-stack-web": "skylent:fullstack-workspace",
  "digital-marketing": "skylent:campaign-funnel",
};

export function coursePhoto(slug: string): MediaRef {
  return COURSE_PHOTO[slug] ?? DEFAULT_PROGRAM_PHOTO;
}

export function programPhoto(slug: string): MediaRef {
  return PROGRAM_PHOTO[slug] ?? DEFAULT_PROGRAM_PHOTO;
}

export function isSkylentVisualRef(src: string): boolean {
  return src.startsWith("skylent:");
}

export function parseSkylentVisualRef(src: string): ProductVisualId | null {
  if (!isSkylentVisualRef(src)) return null;
  return src.slice("skylent:".length) as ProductVisualId;
}
