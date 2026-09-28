import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../authored-courses"
import { northwindLabPath } from "../labs-api"
import { harborDeskProjectPath, northwindProjectPath, NORTHWIND_PROJECT_TYPE } from "../projects-api"
import { classifyPathTrack, type PathTrack } from "./classifyTrack"
import type { PathDiagnosis, PathPhaseKey, PathPhaseExecutionAction, PathExecutionResource, PersonalRoadmap } from "./types"

function lessonResource(courseSlug: string, lessonId: string, href: string): PathExecutionResource {
  return {
    type: "lms_lesson",
    resourceId: `lms_lesson:${courseSlug}:${lessonId}`,
    href,
    courseSlug,
    lessonId,
  }
}

function manual(label: string): PathPhaseExecutionAction {
  return { label, completionMode: "manual_only" }
}

function skylent(label: string, resource: PathExecutionResource): PathPhaseExecutionAction {
  return { label, completionMode: "skylent_resource", resource }
}

function dataAnalyticsBindings(
  phase: PathPhaseKey,
  diagnosis: PathDiagnosis,
  label: string,
): PathPhaseExecutionAction {
  const da = FLAGSHIP_COURSE_SLUG
  switch (phase) {
    case "foundation":
      return skylent(label, lessonResource(da, "l2", `/learn/${da}/l2`))
    case "skills":
      return skylent(
        label,
        lessonResource(
          da,
          diagnosis.existingSkills === "starting" ? "l4" : "l7",
          `/learn/${da}/${diagnosis.existingSkills === "starting" ? "l4" : "l7"}`,
        ),
      )
    case "practice":
      return skylent(label, {
        type: "lms_lab",
        resourceId: `lms_lab:${da}:northwind`,
        href: northwindLabPath("l8"),
        courseSlug: da,
        labSlug: "northwind",
      })
    case "build":
      return skylent(label, {
        type: "learner_project",
        resourceId: `learner_project:${da}:${NORTHWIND_PROJECT_TYPE}`,
        href: northwindProjectPath(),
        courseSlug: da,
        projectType: NORTHWIND_PROJECT_TYPE,
      })
    case "proof":
      return skylent(label, lessonResource(da, "l14", `/learn/${da}/l14`))
    default:
      return manual(label)
  }
}

function productManagementBindings(phase: PathPhaseKey, label: string): PathPhaseExecutionAction {
  const pm = PRODUCT_MANAGEMENT_SLUG
  switch (phase) {
    case "foundation":
      return skylent(label, lessonResource(pm, "l2", `/learn/${pm}/l2`))
    case "skills":
      return skylent(label, lessonResource(pm, "l4", `/learn/${pm}/l4`))
    case "practice":
      return skylent(label, lessonResource(pm, "l12", `/learn/${pm}/l12`))
    case "build":
      return skylent(label, {
        type: "learner_project",
        resourceId: `learner_project:${pm}:harbor-desk-case`,
        href: harborDeskProjectPath(),
        courseSlug: pm,
        projectType: "harbor-desk-case",
      })
    case "proof":
      return skylent(label, lessonResource(pm, "l14", `/learn/${pm}/l14`))
    default:
      return manual(label)
  }
}

function generalSiteRoute(label: string, href: string, resourceId: string): PathPhaseExecutionAction {
  return {
    label,
    completionMode: "manual_only",
    resource: {
      type: "site_route",
      resourceId,
      href,
    },
  }
}

function bindingsForTrack(
  track: PathTrack,
  phase: PathPhaseKey,
  diagnosis: PathDiagnosis,
  label: string,
): PathPhaseExecutionAction {
  if (track === "data_analytics") return dataAnalyticsBindings(phase, diagnosis, label)
  if (track === "product_business") return productManagementBindings(phase, label)

  if (track === "general_undecided" && phase === "practice") {
    return generalSiteRoute(label, "/labs", "site_route:/labs")
  }
  if (track === "competitive_exams" && phase === "foundation") {
    return generalSiteRoute(label, "/education/exams", "site_route:/education/exams")
  }
  if (track === "design_creative" && phase === "skills") {
    return generalSiteRoute(label, "/skills", "site_route:/skills")
  }

  return manual(label)
}

export function primaryRoadmapActionLabel(roadmap: PersonalRoadmap, phaseKey: PathPhaseKey): string {
  const actions = roadmap[phaseKey].actions
  if (actions.length > 0) return actions[0]
  return roadmap.nextAction
}

/** Deterministic link from track + phase to real Skylent surfaces (or manual-only). */
export function resolvePhaseExecutionAction(
  diagnosis: PathDiagnosis,
  roadmap: PersonalRoadmap,
  phaseKey: PathPhaseKey,
): PathPhaseExecutionAction {
  const label = primaryRoadmapActionLabel(roadmap, phaseKey)
  const track = classifyPathTrack(diagnosis)
  return bindingsForTrack(track, phaseKey, diagnosis, label)
}
