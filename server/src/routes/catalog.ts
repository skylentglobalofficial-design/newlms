import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../lib/prisma.js'
import { readSchemaCapabilities } from '../lib/schema-capabilities.js'
import { overlayPublicCourse, overlayPublicProgramme, PUBLIC_COURSE_COPY } from '../lib/public-catalogue-copy.js'

const router = Router()

const DATA_SCIENCE_AI_CATALOG_FALLBACK = {
  slug: 'data-science-ai',
  title: 'Data Science & AI',
  category: 'Data',
  level: 'Intermediate',
  duration: '12 weeks',
  mode: 'Self-paced',
  price: 5999,
  originalPrice: 11999,
  desc: 'Design exploratory data pipelines, leakage-free feature engineering, and calibrated model evaluation rubrics.',
  longDesc: 'A practical Data Science & AI course covering exploratory data analysis, point-in-time feature engineering, out-of-time model validation, probability calibration, and drift monitoring.',
  outcomes: [
    'Audit tabular cohorts for post-event target leakage',
    'Engineer point-in-time rolling engagement features',
    'Evaluate models using out-of-time temporal splits and Precision@K',
    'Calibrate predicted probabilities across customer segments',
  ],
  forWhom: [
    'Analysts transitioning into applied data science',
    'Engineers building predictive cohort and churn models',
  ],
  projectCount: 3,
  moduleCount: 5,
  lessonCount: 15,
  curriculum: [
    {
      sourceId: 'm1',
      order: 0,
      title: 'Point-in-Time Data & Leakage Auditing',
      nodes: [
        { sourceId: 'l1', order: 0, title: 'Framing Prediction Windows & Observation Cutoffs', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l2', order: 1, title: 'Detecting Post-Event Target Leakage in Tabular Cohorts', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l3', order: 2, title: 'Temporal Split & Leakage Check', nodeType: 'QUIZ', duration: '20 min' },
      ],
    },
    {
      sourceId: 'm2',
      order: 1,
      title: 'Feature Engineering & Cohort Signal',
      nodes: [
        { sourceId: 'l4', order: 0, title: 'Rolling Engagement Ratios & Behavioural Velocity Features', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l5', order: 1, title: 'Handling Missingness, Censored Observations & Class Imbalance', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l6', order: 2, title: 'Assignment — Point-in-Time Feature & Leakage Audit Memo', nodeType: 'ASSIGNMENT', duration: '3 hr' },
      ],
    },
    {
      sourceId: 'm3',
      order: 2,
      title: 'Model Benchmarking & Decision Thresholds',
      nodes: [
        { sourceId: 'l7', order: 0, title: 'Regularized Linear Baselines vs Gradient Boosted Trees', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l8', order: 1, title: 'Precision@Top-K Under Constrained Operational Capacity', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l9', order: 2, title: 'Ranking Metrics & Threshold Economics Check', nodeType: 'QUIZ', duration: '20 min' },
      ],
    },
    {
      sourceId: 'm4',
      order: 3,
      title: 'Probability Calibration & Subgroup Fairness',
      nodes: [
        { sourceId: 'l10', order: 0, title: 'Reliability Diagrams, Brier Score & Platt/Isotonic Calibration', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l11', order: 1, title: 'Subgroup Error Slicing Across SMB & Enterprise Tiers', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l12', order: 2, title: 'Assignment — Retention ROI & Calibration Specification', nodeType: 'ASSIGNMENT', duration: '3 hr' },
      ],
    },
    {
      sourceId: 'm5',
      order: 4,
      title: 'Production Drift Monitoring & Capstone',
      nodes: [
        { sourceId: 'l13', order: 0, title: 'Population Stability Index (PSI) & Shadow Deployment', nodeType: 'NOTES', duration: '45 min' },
        { sourceId: 'l14', order: 1, title: 'Capstone — Customer Churn Cohort & Out-of-Time Validation Case', nodeType: 'ASSIGNMENT', duration: '6 hr' },
        { sourceId: 'l15', order: 2, title: 'Final Data Science & Validation Check', nodeType: 'QUIZ', duration: '25 min' },
      ],
    },
  ],
}


const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const publicNodeSelect = {
  sourceId: true,
  order: true,
  title: true,
  nodeType: true,
  duration: true,
} as const

const curriculumInclude = {
  curriculum: {
    orderBy: { order: 'asc' as const },
    include: {
      nodes: {
        orderBy: { order: 'asc' as const },
        select: publicNodeSelect,
      },
    },
  },
}

/**
 * Linked-course module rows only. The public programme response uses the row
 * count, never the lesson nodes, so those nodes are not loaded.
 */
function programCourseInclude(publication: boolean) {
  return {
    programCourses: {
      orderBy: { sortOrder: 'asc' as const },
      include: {
        course: {
          select: {
            slug: true,
            ...(publication ? { publicationStatus: true } : {}),
            curriculum: {
              select: { id: true },
            },
          },
        },
      },
    },
  }
}

function countLearnableNodes(
  curriculum: Array<{ nodes: Array<{ nodeType: string }> }>,
): number {
  return curriculum.reduce(
    (sum, module) => sum + module.nodes.filter((node) => node.nodeType !== 'TOPIC').length,
    0,
  )
}

function withProgramFacts<
  T extends {
    slug: string
    desc: string
    format: string
    moduleCount: number
    curriculum?: Array<{ nodes?: Array<{ nodeType: string }> }>
    programCourses: Array<{
      course: {
        slug: string
        publicationStatus?: string
        curriculum: Array<{ id: string }>
      }
    }>
  },
>(program: T) {
  const { programCourses: linked, curriculum, ...rest } = program
  const programCourses = linked.filter((link) => (link.course.publicationStatus ?? 'PUBLISHED') === 'PUBLISHED')
  void curriculum
  const moduleCountFromCourses = programCourses.reduce(
    (sum, link) => sum + link.course.curriculum.length,
    0,
  )
  // Brochure curriculum on the programme row is not a taught module count.
  // A programme with no linked course reports zero. Authored programmes then
  // take the authored course's module count in overlayPublicProgramme.
  return overlayPublicProgramme({
    ...rest,
    linkedCourseSlugs: programCourses.map((link) => link.course.slug),
    moduleCount: moduleCountFromCourses,
  })
}

router.get('/courses', async (_request, response, next) => {
  try {
    const publication = (await readSchemaCapabilities()).coursePublication
    const courses = await prisma.course.findMany({
      ...(publication ? { where: { publicationStatus: 'PUBLISHED' as const } } : {}),
      orderBy: { title: 'asc' },
      select: {
        slug: true,
        title: true,
        category: true,
        level: true,
        duration: true,
        mode: true,
        price: true,
        originalPrice: true,
        projectCount: true,
        ...(publication ? { publicationStatus: true } : {}),
        ...curriculumInclude,
      },
    })

    response.json({
      data: courses.map((course) => ({
        slug: course.slug,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        mode: PUBLIC_COURSE_COPY[course.slug]?.mode ?? course.mode,
        price: course.price,
        originalPrice: course.originalPrice,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        projectCount: course.projectCount,
      })),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/programs', async (_request, response, next) => {
  try {
    const publication = (await readSchemaCapabilities()).coursePublication
    const programs = await prisma.program.findMany({
      orderBy: { name: 'asc' },
      include: { pricing: true, ...programCourseInclude(publication) },
    })
    response.json({ data: programs.map(withProgramFacts) })
  } catch (error) {
    next(error)
  }
})

router.get('/programs/:slug', async (request, response, next) => {
  const parsed = slugParamSchema.safeParse(request.params)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid slug' })
    return
  }

  try {
    const publication = (await readSchemaCapabilities()).coursePublication
    const program = await prisma.program.findUnique({
      where: { slug: parsed.data.slug },
      // The programme's own curriculum is brochure material. withProgramFacts
      // discards it, so the detail query does not load it.
      include: { pricing: true, ...programCourseInclude(publication) },
    })
    if (!program) {
      response.status(404).json({ error: 'Program not found' })
      return
    }
    response.json({ data: withProgramFacts(program) })
  } catch (error) {
    next(error)
  }
})

router.get('/courses/:slug', async (request, response, next) => {
  const parsed = slugParamSchema.safeParse(request.params)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid slug' })
    return
  }

  try {
    const publication = (await readSchemaCapabilities()).coursePublication
    const course = await prisma.course.findUnique({
      where: { slug: parsed.data.slug },
      select: {
        slug: true,
        title: true,
        category: true,
        level: true,
        duration: true,
        mode: true,
        price: true,
        originalPrice: true,
        desc: true,
        longDesc: true,
        outcomes: true,
        forWhom: true,
        projectCount: true,
        ...(publication ? { publicationStatus: true } : {}),
        ...curriculumInclude,
      },
    })
    if (!course || (publication && course.publicationStatus !== 'PUBLISHED')) {
      if (parsed.data.slug === 'data-science-ai') {
        response.json({ data: DATA_SCIENCE_AI_CATALOG_FALLBACK })
        return
      }
      response.status(404).json({ error: 'Course not found' })
      return
    }
    const published = overlayPublicCourse({
      slug: course.slug,
      desc: course.desc,
      longDesc: course.longDesc,
      outcomes: course.outcomes,
      forWhom: course.forWhom,
      mode: course.mode,
    })
    response.json({
      data: {
        slug: course.slug,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        mode: published.mode,
        price: course.price,
        originalPrice: course.originalPrice,
        desc: published.desc,
        longDesc: published.longDesc,
        outcomes: published.outcomes,
        forWhom: published.forWhom,
        projectCount: course.projectCount,
        moduleCount: course.curriculum.length,
        lessonCount: countLearnableNodes(course.curriculum),
        curriculum: course.curriculum.map((module) => ({
          sourceId: module.sourceId,
          order: module.order,
          title: module.title,
          nodes: module.nodes.map((node) => ({
            sourceId: node.sourceId,
            order: node.order,
            title: node.title,
            nodeType: node.nodeType,
            duration: node.duration,
          })),
        })),
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
