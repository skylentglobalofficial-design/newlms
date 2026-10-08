import degreeBusiness from "../assets/site/degree-business.jpg"
import degreeComputing from "../assets/site/degree-computing.jpg"
import degreeManagement from "../assets/site/degree-management.jpg"
import degreeTechnology from "../assets/site/degree-technology.jpg"

export type DegreeImage = {
  src: string
  alt: string
}

const DEGREE_IMAGES: Record<string, DegreeImage> = {
  "sample-ug-technology": {
    src: degreeTechnology,
    alt: "A computer lab with rows of workstations",
  },
  "sample-ug-business": {
    src: degreeBusiness,
    alt: "Two people working through notes beside a laptop",
  },
  "sample-pg-management": {
    src: degreeManagement,
    alt: "Two students studying together on a campus lawn",
  },
  "sample-pg-computing": {
    src: degreeComputing,
    alt: "A student in an online class on a laptop",
  },
}

export function degreeImage(slug: string): DegreeImage | null {
  return DEGREE_IMAGES[slug] ?? null
}
