import { PrismaClient, CurriculumNodeType, EnrollmentStatus, ProgramType } from '@prisma/client'

import { courses, programs } from '../src/data.js'

const prisma = new PrismaClient()

function enrollmentStatus(value: string | undefined): EnrollmentStatus | undefined {
  return value ? (value.toUpperCase() as EnrollmentStatus) : undefined
}

async function seedProgram(program: (typeof programs)[number]) {
  const record = await prisma.program.upsert({
    where: { slug: program.slug },
    update: {
      name: program.name,
      duration: program.duration,
      moduleCount: program.modules,
      projectCount: program.projects,
      format: program.format,
      cert: program.cert,
      outcome: program.outcome,
      desc: program.desc,
      upcomingBatch: program.upcomingBatch,
      programType: program.programType as ProgramType,
      level: program.level,
      whoIsItFor: program.whoIsItFor ?? [],
      whatYouWillLearn: program.whatYouWillLearn ?? [],
      learningExperience: program.learningExperience ?? [],
      careerSupport: program.careerSupport,
      enrollmentStatus: enrollmentStatus(program.enrollmentStatus),
      examPattern: program.examPattern,
      examSections: program.examSections ?? [],
    },
    create: {
      slug: program.slug,
      name: program.name,
      duration: program.duration,
      moduleCount: program.modules,
      projectCount: program.projects,
      format: program.format,
      cert: program.cert,
      outcome: program.outcome,
      desc: program.desc,
      upcomingBatch: program.upcomingBatch,
      programType: program.programType as ProgramType,
      level: program.level,
      whoIsItFor: program.whoIsItFor ?? [],
      whatYouWillLearn: program.whatYouWillLearn ?? [],
      learningExperience: program.learningExperience ?? [],
      careerSupport: program.careerSupport,
      enrollmentStatus: enrollmentStatus(program.enrollmentStatus),
      examPattern: program.examPattern,
      examSections: program.examSections ?? [],
    },
  })

  await prisma.pricingTier.deleteMany({ where: { programId: record.id } })
  await prisma.curriculumModule.deleteMany({ where: { programId: record.id } })
  if (program.pricing.length > 0) {
    await prisma.pricingTier.createMany({
      data: program.pricing.map((tier) => ({
        programId: record.id,
        name: tier.name,
        price: tier.price,
        originalPrice: tier.originalPrice,
        features: tier.features,
        highlight: tier.highlight ?? false,
      })),
    })
  }
  if (program.curriculumDetail) {
    for (const [order, module] of program.curriculumDetail.entries()) {
      await prisma.curriculumModule.create({
        data: {
          programId: record.id,
          number: module.number,
          order,
          title: module.title,
          description: module.description,
          duration: module.duration,
          topics: module.topics ?? [],
          nodes: {
            create: (module.topics ?? []).map((topic, topicOrder) => ({
              sourceId: `${module.number}-${topicOrder + 1}`,
              order: topicOrder,
              title: topic,
              nodeType: CurriculumNodeType.TOPIC,
            })),
          },
        },
      })
    }
  }
}

async function seedCourse(course: (typeof courses)[number]) {
  const record = await prisma.course.upsert({
    where: { slug: course.slug },
    update: {
      title: course.title,
      category: course.category,
      level: course.level,
      duration: course.duration,
      mode: course.mode,
      lessonCount: course.lessons,
      projectCount: course.projects,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      originalPrice: course.originalPrice,
      desc: course.desc,
      longDesc: course.longDesc,
      outcomes: course.outcomes,
      forWhom: course.forWhom,
    },
    create: {
      slug: course.slug,
      title: course.title,
      category: course.category,
      level: course.level,
      duration: course.duration,
      mode: course.mode,
      lessonCount: course.lessons,
      projectCount: course.projects,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      originalPrice: course.originalPrice,
      desc: course.desc,
      longDesc: course.longDesc,
      outcomes: course.outcomes,
      forWhom: course.forWhom,
    },
  })

  await prisma.curriculumModule.deleteMany({ where: { courseId: record.id } })
  for (const [order, module] of course.modules.entries()) {
    await prisma.curriculumModule.create({
      data: {
        courseId: record.id,
        sourceId: module.id,
        order,
        title: module.title,
        topics: [],
        nodes: {
          create: module.lessons.map((lesson, lessonOrder) => ({
            sourceId: lesson.id,
            order: lessonOrder,
            title: lesson.title,
            nodeType: lesson.type.toUpperCase() as CurriculumNodeType,
            duration: lesson.duration,
            completed: lesson.completed,
          })),
        },
      },
    })
  }
}

const QUIZ_BANK: Record<string, Array<{ question: string; options: string[]; correctIndex: number }>> = {
  l3: [
    { question: "What is the primary goal of data analytics?", options: ["Store data", "Turn data into insights", "Delete duplicates", "Encrypt files"], correctIndex: 1 },
    { question: "Which role commonly uses dashboards?", options: ["Data analyst", "Chef", "Pilot", "Architect"], correctIndex: 0 },
    { question: "Analytics starts with a clear:", options: ["Logo", "Business question", "Font choice", "Server rack"], correctIndex: 1 },
  ],
  l9: [
    { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Logic", "Structured Queue List", "Standard Query Link"], correctIndex: 0 },
    { question: "Which SQL clause filters rows after grouping?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctIndex: 1 },
    { question: "What type of JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctIndex: 3 },
  ],
  l15: [
    { question: "A KPI should be:", options: ["Vague", "Measurable", "Secret", "Optional"], correctIndex: 1 },
    { question: "Power BI uses which language for calculated columns?", options: ["Python", "DAX", "HTML", "Bash"], correctIndex: 1 },
    { question: "The final step in analytics is often:", options: ["Data deletion", "Storytelling", "Hardware upgrade", "Random sampling only"], correctIndex: 1 },
  ],
  "python-l3": [
    { question: "Which type is mutable in Python?", options: ["tuple", "list", "str", "int"], correctIndex: 1 },
    { question: "How do you start a comment?", options: ["//", "#", "--", "/*"], correctIndex: 1 },
    { question: "What keyword defines a function?", options: ["func", "def", "fn", "lambda only"], correctIndex: 1 },
  ],
}

async function seedQuizQuestions() {
  const quizNodes = await prisma.curriculumNode.findMany({
    where: { nodeType: CurriculumNodeType.QUIZ },
    select: { id: true, sourceId: true, title: true },
  })

  for (const node of quizNodes) {
    const key = node.sourceId ?? ""
    const bank = QUIZ_BANK[key]
    if (!bank) {
      console.warn(`No quiz bank for node ${key} (${node.title}) — skipping`)
      continue
    }

    await prisma.quizQuestion.deleteMany({ where: { nodeId: node.id } })
    await prisma.quizQuestion.createMany({
      data: bank.map((entry, index) => ({
        nodeId: node.id,
        sortOrder: index,
        question: entry.question,
        options: entry.options,
        correctIndex: entry.correctIndex,
      })),
    })
  }

  console.log(`Seeded quiz questions for ${quizNodes.length} quiz nodes`)
}

/**
 * ONE lesson-scoped Practice object for LMS Practice content foundation.
 *
 * Selected chain:
 *   course: data-analytics (Data Analytics)
 *   module: m1 Foundations of Data
 *   lesson: l2 The Analytics Mindset
 *
 * Curriculum sources (NOT Skills Scroll 3; NOT trivia conversion of l3/l9/l15):
 * - Course longDesc / outcomes: analytics → insights / business decisions
 *   (src/data.ts courses[data-analytics])
 * - Module title: Foundations of Data
 * - Lesson title: The Analytics Mindset
 * - Linked program data-analytics-pro curriculumDetail[01] Analytics Foundations:
 *   "The analyst mindset … and the analytics workflow from question to insight."
 * - Existing Foundations Quiz bank concept (sibling l3, not converted):
 *   "Analytics starts with a clear: Business question"
 *   "primary goal of data analytics: Turn data into insights"
 *
 * Interaction: choose — apply the mindset by selecting the first move.
 */
async function seedLessonPractice() {
  const course = await prisma.course.findUnique({
    where: { slug: "data-analytics" },
    select: { id: true },
  })
  if (!course) {
    console.warn("data-analytics course missing — skipping lesson practice seed")
    return
  }

  const node = await prisma.curriculumNode.findFirst({
    where: {
      sourceId: "l2",
      module: { courseId: course.id, sourceId: "m1" },
    },
    select: { id: true, title: true },
  })
  if (!node) {
    console.warn("data-analytics m1/l2 node missing — skipping lesson practice seed")
    return
  }

  const options = [
    {
      optionKey: "clarify-question",
      sortOrder: 0,
      label: "Clarify the business question the analysis must answer",
      teachingFeedback:
        "Strongest first move. Foundations frames analytics as a workflow from question to insight — without a clear business question, later charts and tools have nothing to decide against.",
    },
    {
      optionKey: "build-charts",
      sortOrder: 1,
      label: "Open the spreadsheet and start building charts immediately",
      teachingFeedback:
        "Reasonable impulse, but premature. Charts without a question produce decoration, not insight — the Foundations Quiz concept is that analytics starts with a business question, then evidence.",
    },
    {
      optionKey: "pick-tool",
      sortOrder: 2,
      label: "Pick a dashboard tool before defining what decision is needed",
      teachingFeedback:
        "Tools matter later. Choosing Power BI or Excel first skips the analyst mindset: decide what question and decision the work must support, then choose the medium.",
    },
  ] as const

  await prisma.lessonPracticeOption.deleteMany({
    where: { practice: { nodeId: node.id } },
  })
  await prisma.lessonPractice.deleteMany({ where: { nodeId: node.id } })

  await prisma.lessonPractice.create({
    data: {
      nodeId: node.id,
      interactionType: "choose",
      context:
        "In Foundations of Data, the analytics mindset is the workflow from a business question to insight — not opening a file and hoping charts explain themselves.",
      task: "A stakeholder asks you to \"look at the data.\" What should you do first?",
      preferredOptionKey: "clarify-question",
      options: {
        create: options.map((option) => ({
          optionKey: option.optionKey,
          sortOrder: option.sortOrder,
          label: option.label,
          teachingFeedback: option.teachingFeedback,
        })),
      },
    },
  })

  console.log(`Seeded LessonPractice for data-analytics / ${node.title} (l2)`)
}

async function seedProgramCourses() {
  const links: Array<{ programSlug: string; courseSlug: string; sortOrder: number }> = [
    { programSlug: "data-analytics-pro", courseSlug: "data-analytics", sortOrder: 0 },
    { programSlug: "data-science-ai", courseSlug: "data-analytics", sortOrder: 0 },
    { programSlug: "data-science-ai", courseSlug: "python-programming", sortOrder: 1 },
  ]

  for (const link of links) {
    const program = await prisma.program.findUnique({ where: { slug: link.programSlug }, select: { id: true } })
    const course = await prisma.course.findUnique({ where: { slug: link.courseSlug }, select: { id: true } })
    if (!program || !course) continue

    await prisma.programCourse.upsert({
      where: { programId_courseId: { programId: program.id, courseId: course.id } },
      update: { sortOrder: link.sortOrder },
      create: { programId: program.id, courseId: course.id, sortOrder: link.sortOrder },
    })
  }

  console.log(`Linked ${links.length} program-course relationships`)
}

async function main() {
  for (const program of programs) await seedProgram(program)
  for (const course of courses) await seedCourse(course)
  console.log(`Seeded ${programs.length} programs and ${courses.length} courses.`)

  console.log("Seeding quiz questions...")
  await seedQuizQuestions()

  console.log("Seeding lesson practice content...")
  await seedLessonPractice()

  console.log("Seeding program-course links...")
  await seedProgramCourses()

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())