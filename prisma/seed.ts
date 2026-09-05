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

async function main() {
  for (const program of programs) await seedProgram(program)
  for (const course of courses) await seedCourse(course)
  console.log(`Seeded ${programs.length} programs and ${courses.length} courses.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())