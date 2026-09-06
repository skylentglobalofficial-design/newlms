import { PrismaClient, CurriculumNodeType, EnrollmentStatus, ProgramType, RoleName, JobStatus, CareerEmploymentType, CareerWorkMode, CareerSkillProficiency } from '@prisma/client'
import bcrypt from 'bcrypt'

import { courses, programs } from '../src/data.js'

const prisma = new PrismaClient()
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'DemoSkylent2026!'
const BCRYPT_ROUNDS = 12

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

async function ensureRole(name: RoleName) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

async function assignRole(userId: string, roleName: RoleName) {
  const role = await ensureRole(roleName)
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  })
}

async function seedDemoUser(config: {
  email: string
  displayName: string
  role: RoleName
  organisationSlug?: string
  organisationName?: string
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS)
  const user = await prisma.user.upsert({
    where: { email: config.email },
    update: {
      displayName: config.displayName,
      passwordHash,
    },
    create: {
      email: config.email,
      displayName: config.displayName,
      passwordHash,
    },
  })

  await assignRole(user.id, config.role)

  if (config.organisationSlug) {
    const organisation = await prisma.organisation.upsert({
      where: { slug: config.organisationSlug },
      update: { name: config.organisationName ?? config.organisationSlug },
      create: {
        slug: config.organisationSlug,
        name: config.organisationName ?? config.organisationSlug,
      },
    })

    await prisma.organisationMembership.upsert({
      where: {
        organisationId_userId: {
          organisationId: organisation.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organisationId: organisation.id,
        userId: user.id,
      },
    })
  }

  return user
}

async function seedLearnerWorkspace(userId: string) {
  const course = await prisma.course.findUnique({ where: { slug: 'data-analytics' } })
  const program = await prisma.program.findUnique({ where: { slug: 'data-science-ai' } })
  if (!course) return

  const enrollment = await prisma.userEnrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: { status: 'active' },
    create: {
      userId,
      courseId: course.id,
      status: 'active',
    },
  })

  const lessonNodes = await prisma.curriculumNode.findMany({
    where: {
      module: { courseId: course.id },
      nodeType: { not: CurriculumNodeType.TOPIC },
    },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    take: 3,
    select: { id: true },
  })

  for (const node of lessonNodes) {
    await prisma.lessonProgress.upsert({
      where: { enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: node.id } },
      update: { completedAt: new Date(), lastAccessedAt: new Date() },
      create: {
        enrollmentId: enrollment.id,
        nodeId: node.id,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    })
  }

  if (program) {
    await prisma.userEnrollment.upsert({
      where: { userId_programId: { userId, programId: program.id } },
      update: { status: 'active' },
      create: {
        userId,
        programId: program.id,
        status: 'active',
      },
    })
  }

  await prisma.careerProfile.upsert({
    where: { userId },
    update: {
      headline: 'Aspiring Data Analyst',
      summary: 'Building analytics skills through Skylent programs and projects.',
      location: 'Bengaluru, India',
      preferredRole: 'Data Analyst',
      preferredWorkMode: CareerWorkMode.HYBRID,
    },
    create: {
      userId,
      headline: 'Aspiring Data Analyst',
      summary: 'Building analytics skills through Skylent programs and projects.',
      location: 'Bengaluru, India',
      preferredRole: 'Data Analyst',
      preferredWorkMode: CareerWorkMode.HYBRID,
    },
  })

  const profile = await prisma.careerProfile.findUnique({ where: { userId } })
  if (profile) {
    const skillCount = await prisma.careerSkill.count({ where: { profileId: profile.id } })
    if (skillCount === 0) {
      await prisma.careerSkill.createMany({
        data: [
          { profileId: profile.id, name: 'SQL', proficiency: CareerSkillProficiency.INTERMEDIATE, sortOrder: 0 },
          { profileId: profile.id, name: 'Python', proficiency: CareerSkillProficiency.INTERMEDIATE, sortOrder: 1 },
          { profileId: profile.id, name: 'Power BI', proficiency: CareerSkillProficiency.BEGINNER, sortOrder: 2 },
        ],
      })
    }

    const projectCount = await prisma.careerProject.count({ where: { profileId: profile.id } })
    if (projectCount === 0) {
      await prisma.careerProject.create({
        data: {
          profileId: profile.id,
          title: 'Sales Performance Dashboard',
          description: 'Power BI dashboard built from a retail sales dataset.',
          technologies: ['Power BI', 'DAX', 'SQL'],
          sortOrder: 0,
        },
      })
    }
  }
}

async function seedDemoJobs() {
  const employer = await prisma.employer.upsert({
    where: { slug: 'skylent-demo-employer' },
    update: { name: 'Skylent Demo Employer' },
    create: {
      slug: 'skylent-demo-employer',
      name: 'Skylent Demo Employer',
      description: 'Development fixture employer for Career OS job board previews.',
      location: 'Remote',
    },
  })

  await prisma.job.upsert({
    where: { slug: 'demo-junior-data-analyst' },
    update: {
      status: JobStatus.OPEN,
      postedAt: new Date(),
    },
    create: {
      employerId: employer.id,
      title: 'Junior Data Analyst',
      slug: 'demo-junior-data-analyst',
      description: 'Development fixture role for demo job board and application flows.',
      employmentType: CareerEmploymentType.FULL_TIME,
      workMode: CareerWorkMode.HYBRID,
      location: 'Bengaluru',
      skills: ['SQL', 'Python', 'Power BI'],
      category: 'Data',
      status: JobStatus.OPEN,
      postedAt: new Date(),
    },
  })
}

async function seedDemoUsers() {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO_USERS !== 'true') {
    console.log('Skipping demo users in production (set SEED_DEMO_USERS=true to override).')
    return
  }

  console.log('Seeding development demo users...')

  const learner = await seedDemoUser({
    email: 'learner@demo.skylent.dev',
    displayName: 'Demo Learner',
    role: RoleName.STUDENT,
  })
  await seedLearnerWorkspace(learner.id)

  await seedDemoUser({
    email: 'mentor@demo.skylent.dev',
    displayName: 'Demo Mentor',
    role: RoleName.FACULTY,
  })

  await seedDemoUser({
    email: 'institution@demo.skylent.dev',
    displayName: 'Demo Institution Admin',
    role: RoleName.ORGANISATION_ADMIN,
    organisationSlug: 'skylent-demo-college',
    organisationName: 'Skylent Demo College',
  })

  await seedDemoUser({
    email: 'recruiter@demo.skylent.dev',
    displayName: 'Demo Recruiter',
    role: RoleName.RECRUITER,
  })

  await seedDemoUser({
    email: 'admin@demo.skylent.dev',
    displayName: 'Demo Admin',
    role: RoleName.ADMIN,
  })

  await seedDemoJobs()

  console.log('Demo users seeded (password via DEMO_USER_PASSWORD or DemoSkylent2026!).')
}

async function main() {
  for (const program of programs) await seedProgram(program)
  for (const course of courses) await seedCourse(course)
  console.log(`Seeded ${programs.length} programs and ${courses.length} courses.`)

  console.log("Seeding quiz questions...")
  await seedQuizQuestions()

  console.log("Seeding program-course links...")
  await seedProgramCourses()

  await seedDemoUsers()

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())