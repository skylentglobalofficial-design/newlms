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
  classroomDiscussion: "skylent:schooling-classroom",
  teacher: "skylent:schooling-classroom",
  campus: "skylent:curriculum-map",
  collab: "skylent:schooling-classroom",
  lab: "skylent:neet-lab",
  professional: "skylent:fullstack-workspace",
  research: "skylent:research-desk",
  study: "skylent:study-session",
  career: "skylent:career-pipeline",
  workshop: "skylent:workshop-session",
  schoolBuilding: "skylent:institution-dashboard",
  college: "skylent:college-lab",
  university: "skylent:institution-dashboard",
  training: "skylent:workshop-session",
  assessment: "skylent:exam-interface",
  industry: "skylent:career-pipeline",
  lecture: "skylent:schooling-classroom",
  studentLaptop: "skylent:fullstack-workspace",
  studentStudy: "skylent:exam-interface",
  campusWalk: "skylent:curriculum-map",
  libraryStudy: "skylent:exam-interface",
  graduation: "skylent:career-pipeline",
  teamMeeting: "skylent:career-pipeline",
  mentorSession: "skylent:career-pipeline",
  careerCounsel: "skylent:career-pipeline",
  interviewPrep: "skylent:career-pipeline",
  codingSession: "skylent:fullstack-workspace",
  dataAnalytics: "skylent:analytics-workspace",
  dataScience: "skylent:data-workspace",
  marketing: "skylent:campaign-funnel",
  businessSchool: "skylent:mba-case",
  examPrep: "skylent:exam-interface",
  biologyLab: "skylent:neet-lab",
  engineering: "skylent:exam-interface",
  institution: "skylent:institution-ops",
  successStory: "skylent:career-pipeline",
  aboutTeam: "skylent:ecosystem-flow",
} as const satisfies Record<string, MediaRef>;

export const PROGRAM_PHOTO: Record<string, MediaRef> = {
  "data-analytics-pro": "skylent:analytics-workspace",
  "data-science-ai": "skylent:data-workspace",
  "full-stack": "skylent:fullstack-workspace",
  "generative-ai-program": "skylent:data-workspace",
  "product-management": "skylent:mba-case",
  "sql-certificate": "skylent:analytics-workspace",
  "digital-marketing": "skylent:campaign-funnel",
  jee: "skylent:exam-interface",
  neet: "skylent:neet-lab",
  cat: "skylent:mba-case",
  schooling: "skylent:schooling-classroom",
  ug: "skylent:curriculum-map",
  pg: "skylent:mba-case",
  mba: "skylent:mba-case",
};

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
