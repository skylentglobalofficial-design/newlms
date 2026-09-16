import { PrismaClient, CurriculumNodeType, EnrollmentStatus, ProgramType } from '@prisma/client'

import { DA_QUIZZES, daQuizSeedKey } from '../src/content/data-analytics/quizzes.ts'
import { PM_QUIZZES, pmQuizSeedKey } from '../src/content/product-management/quizzes.ts'
import { courses, programs } from '../src/data.js'
import { PROGRAM_COURSE_LINKS } from '../src/lib/catalog-maturity.ts'

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

function quizBankFromDa(lessonId: keyof typeof DA_QUIZZES) {
  return DA_QUIZZES[lessonId].questions.map((entry) => ({
    question: entry.prompt,
    options: entry.options,
    correctIndex: entry.correctIndex,
  }))
}

function quizBankFromPm(lessonId: keyof typeof PM_QUIZZES) {
  return PM_QUIZZES[lessonId].questions.map((entry) => ({
    question: entry.prompt,
    options: entry.options,
    correctIndex: entry.correctIndex,
  }))
}

const QUIZ_BANK: Record<string, Array<{ question: string; options: string[]; correctIndex: number }>> = {
  [daQuizSeedKey('l3')]: quizBankFromDa('l3'),
  [daQuizSeedKey('l9')]: quizBankFromDa('l9'),
  [daQuizSeedKey('l15')]: quizBankFromDa('l15'),
  [pmQuizSeedKey('l3')]: quizBankFromPm('l3'),
  [pmQuizSeedKey('l9')]: quizBankFromPm('l9'),
  [pmQuizSeedKey('l15')]: quizBankFromPm('l15'),
  'python-programming:l3': [
    { question: 'Which type is mutable in Python?', options: ['tuple', 'list', 'str', 'int'], correctIndex: 1 },
    { question: 'How do you start a comment?', options: ['//', '#', '--', '/*'], correctIndex: 1 },
    { question: 'What keyword defines a function?', options: ['func', 'def', 'fn', 'lambda only'], correctIndex: 1 },
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

  for (const node of quizNodes) {
    const slug = node.module.course?.slug
    const key = slug && node.sourceId ? `${slug}:${node.sourceId}` : ''
    const bank = QUIZ_BANK[key]
    if (!bank) {
      console.warn(`No quiz bank for node ${key || node.sourceId} (${node.title}) — skipping`)
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

async function seedProgramCourses() {
  const links = PROGRAM_COURSE_LINKS

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
  const isProduction = process.env.NODE_ENV === "production"
  const allowDestructive = process.env.SKYLENT_ALLOW_DESTRUCTIVE_SEED === "1"
  if (isProduction && !allowDestructive) {
    const existingCourses = await prisma.course.count()
    if (existingCourses > 0) {
      throw new Error(
        "Refusing production seed: catalog already exists. Re-seeding deletes curriculum nodes and learner progress (CASCADE). For a first-time empty database, this guard does not apply. To rebuild catalog on purpose, set SKYLENT_ALLOW_DESTRUCTIVE_SEED=1.",
      )
    }
  }

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