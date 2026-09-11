import { PrismaClient, CurriculumNodeType, EnrollmentStatus, ProgramType } from '@prisma/client'

import { courses, programs } from '../src/data.js'
import { LIVE_PROGRAM_COURSE_LINKS } from '../src/lib/program-lms-map.js'

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
  "data-analytics:l3": [
    { question: "What is the primary goal of data analytics?", options: ["Store data", "Turn data into insights", "Delete duplicates", "Encrypt files"], correctIndex: 1 },
    { question: "Which role commonly uses dashboards?", options: ["Data analyst", "Chef", "Pilot", "Architect"], correctIndex: 0 },
    { question: "Analytics starts with a clear:", options: ["Logo", "Business question", "Font choice", "Server rack"], correctIndex: 1 },
  ],
  "data-analytics:l9": [
    { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Logic", "Structured Queue List", "Standard Query Link"], correctIndex: 0 },
    { question: "Which SQL clause filters rows after grouping?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctIndex: 1 },
    { question: "What type of JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctIndex: 3 },
  ],
  "data-analytics:l15": [
    { question: "A KPI should be:", options: ["Vague", "Measurable", "Secret", "Optional"], correctIndex: 1 },
    { question: "Power BI uses which language for calculated columns?", options: ["Python", "DAX", "HTML", "Bash"], correctIndex: 1 },
    { question: "The final step in analytics is often:", options: ["Data deletion", "Storytelling", "Hardware upgrade", "Random sampling only"], correctIndex: 1 },
  ],
  "python-programming:l3": [
    { question: "Which type is mutable in Python?", options: ["tuple", "list", "str", "int"], correctIndex: 1 },
    { question: "How do you start a comment?", options: ["//", "#", "--", "/*"], correctIndex: 1 },
    { question: "What keyword defines a function?", options: ["func", "def", "fn", "lambda only"], correctIndex: 1 },
  ],
  "generative-ai:l3": [
    { question: "A prompt is mainly used to:", options: ["Compile Python", "Instruct a language model", "Index a database", "Resize an image"], correctIndex: 1 },
    { question: "Few-shot prompting means:", options: ["Using example inputs and outputs", "Training a new model from scratch", "Deleting the system prompt", "Turning the model offline"], correctIndex: 0 },
    { question: "RAG is used to:", options: ["Replace embeddings with CSS", "Ground model answers in retrieved documents", "Speed up GPU fans", "Hide the context window"], correctIndex: 1 },
  ],
  "power-bi:l3": [
    { question: "Power BI is primarily used to:", options: ["Host email", "Build interactive business reports", "Compile Java", "Design logos"], correctIndex: 1 },
    { question: "DAX is used for:", options: ["Network routing", "Calculated measures and columns", "Password hashing", "Video encoding"], correctIndex: 1 },
    { question: "A Power BI dataset typically starts with:", options: ["Importing and shaping data", "Buying a GPU", "Writing a compiler", "Registering a domain"], correctIndex: 0 },
  ],
  "product-management:l3": [
    { question: "A product manager’s first job is usually to:", options: ["Write every line of code", "Frame the problem worth solving", "Set server RAM", "Design the logo"], correctIndex: 1 },
    { question: "A PRD is:", options: ["A production runtime daemon", "A product requirements document", "A Python random draw", "A payroll rule"], correctIndex: 1 },
    { question: "User research is used to:", options: ["Replace analytics", "Learn how people actually work", "Skip stakeholder alignment", "Guarantee a launch date"], correctIndex: 1 },
  ],
  "full-stack-web:l3": [
    { question: "HTML is used to:", options: ["Style motion", "Structure page content", "Query SQL", "Train models"], correctIndex: 1 },
    { question: "CSS is used to:", options: ["Present visual layout and style", "Store rows in Postgres", "Issue JWTs", "Compile TypeScript"], correctIndex: 0 },
    { question: "JavaScript in the browser mainly:", options: ["Replaces HTML", "Makes the page interactive", "Hosts the database", "Prints invoices"], correctIndex: 1 },
  ],
}

async function seedQuizQuestions() {
  const quizNodes = await prisma.curriculumNode.findMany({
    where: { nodeType: CurriculumNodeType.QUIZ },
    select: {
      id: true,
      sourceId: true,
      title: true,
      module: { select: { course: { select: { slug: true } } } },
    },
  })

  let seeded = 0
  for (const node of quizNodes) {
    const courseSlug = node.module.course?.slug
    const key = courseSlug ? `${courseSlug}:${node.sourceId ?? ""}` : (node.sourceId ?? "")
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
    seeded += 1
  }

  console.log(`Seeded quiz questions for ${seeded}/${quizNodes.length} quiz nodes`)
}

async function seedProgramCourses() {
  const links = LIVE_PROGRAM_COURSE_LINKS

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