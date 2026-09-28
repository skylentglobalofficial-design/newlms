import { buildRoadmap } from "./buildRoadmap"
import type { PathDiagnosis, PathRecommendationService, PersonalRoadmap } from "./types"

/** Local, deterministic implementation — swap for a remote AI service later without changing UI code. */
export const localPathRecommendationService: PathRecommendationService = {
  buildRoadmap(diagnosis: PathDiagnosis): PersonalRoadmap {
    return buildRoadmap(diagnosis)
  },
}
