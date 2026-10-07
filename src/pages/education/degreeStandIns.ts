/**
 * Stand-in photographs for degree pages.
 *
 * No institution is confirmed, so no degree record carries its own `heroAsset` or `gallery`
 * (see src/lib/degrees.ts). Until one does, the pages fall back to licensed photographs that are
 * already in the repository. Each one is rendered with a caption that says "Stand-in photograph".
 * When a record carries its own assets, those are used and the stand-in wording is dropped.
 */
import lectureHall from "../../assets/site/hero-classroom.jpg"
import computerLab from "../../assets/site/degree-technology.jpg"
import campusGrounds from "../../assets/site/degree-management.jpg"
import library from "../../assets/site/program-library.jpg"
import videoCall from "../../assets/site/degree-computing.jpg"
import { degreeImage } from "../../data/educationImages"
import type { Degree, DegreeAsset } from "../../lib/degrees"

const CAMPUS_HERO_FALLBACK: DegreeAsset = {
  src: computerLab,
  alt: "An empty computer lab with rows of workstations",
  caption: "Computer lab",
  standIn: true,
}

const CAMPUS_GALLERY: DegreeAsset[] = [
  {
    src: lectureHall,
    alt: "Students working at long wooden benches in a tiered lecture hall",
    caption: "Lecture hall",
    standIn: true,
  },
  {
    src: library,
    alt: "A student working at a table in front of library bookshelves",
    caption: "Library",
    standIn: true,
  },
  {
    src: campusGrounds,
    alt: "Two students reading a notebook on a lawn in front of a brick building",
    caption: "Campus grounds",
    standIn: true,
  },
]

/**
 * Lead photograph for a campus listing: the record's own hero, else the lecture hall stand-in.
 * A campus page opens on people in a room, so the area photograph (often an empty lab) moves
 * into the gallery instead of leading the page.
 */
export function campusHeroFor(degree: Degree): DegreeAsset {
  if (degree.heroAsset) return degree.heroAsset
  return CAMPUS_GALLERY[0]
}

/** Card photograph on listings: the photograph the repository maps to that degree area. */
export function campusCardPhotoFor(degree: Degree): DegreeAsset {
  if (degree.heroAsset) return degree.heroAsset
  const mapped = degreeImage(degree.slug)
  if (mapped) return { src: mapped.src, alt: mapped.alt, caption: mapped.alt, standIn: true }
  return CAMPUS_HERO_FALLBACK
}

/**
 * Campus gallery: the record's own, else the area photograph followed by stand-ins.
 * The library photograph is left out because the homepage already uses it.
 */
export function campusGalleryFor(degree: Degree, hero: DegreeAsset): DegreeAsset[] {
  if (degree.gallery && degree.gallery.length > 0) return degree.gallery
  const area = campusCardPhotoFor(degree)
  return [area, ...CAMPUS_GALLERY.filter((asset) => asset.src !== library)].filter(
    (asset, i, all) => asset.src !== hero.src && all.findIndex((other) => other.src === asset.src) === i,
  )
}

/** The one photograph on an online degree page: study at a screen, never a campus. */
export const ONLINE_STAND_IN: DegreeAsset = {
  src: videoCall,
  alt: "Seen from behind, a learner at a desk on a video call with a tutor on a laptop",
  caption: "A learner in a live online session",
  standIn: true,
}

/** Alt text for a photograph. Stand-ins say so, for readers who never see the caption. */
export function assetAlt(asset: DegreeAsset): string {
  return asset.standIn ? `Stand-in photograph. ${asset.alt}.` : asset.alt
}
