import {
  PrismaClient,
  CurriculumNodeType,
  EnrollmentStatus,
  ProgramType,
  RoleName,
  JobStatus,
  CareerEmploymentType,
  CareerWorkMode,
  CareerSkillProficiency,
  CareerLinkType,
  JobApplicationStatus,
  InterviewQuestionDifficulty,
  InterviewRoundType,
  InterviewRoundStatus,
  CareerSupportRequestType,
  CareerSupportRequestStatus,
  CareerSupportPriority,
  CareerProfileVisibility,
} from '@prisma/client'
import bcrypt from 'bcrypt'

import { courses, programs } from '../src/data.js'

const prisma = new PrismaClient()
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'DemoSkylent2026!'
const BCRYPT_ROUNDS = 12
const DEMO_ORG_SLUG = 'skylent-demo-college'
const DEMO_COURSE_SLUG = 'data-analytics'
const DEMO_PROGRAM_SLUG = 'data-science-ai'

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

async function findCourseNode(courseSlug: string, sourceId: string) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } })
  if (!course) return null
  return prisma.curriculumNode.findFirst({
    where: { sourceId, module: { courseId: course.id } },
    select: { id: true, title: true, nodeType: true },
  })
}

function readDemoMuxPlaybackId(): string | undefined {
  const value = process.env.MUX_DEMO_PLAYBACK_ID
  if (value == null) return undefined
  const normalized = value.replace(/\uFEFF/g, '').replace(/\r/g, '').trim()
  return normalized || undefined
}

async function seedDemoLessonMuxPlayback() {
  const node = await findCourseNode(DEMO_COURSE_SLUG, 'l1')
  if (!node) return

  const playbackId = readDemoMuxPlaybackId()
  await prisma.curriculumNode.update({
    where: { id: node.id },
    data: { muxPlaybackId: playbackId ?? null },
  })

  if (playbackId) {
    console.log(`Configured Mux playback for ${DEMO_COURSE_SLUG}/l1 (${node.title}).`)
  } else {
    console.log(`No MUX_DEMO_PLAYBACK_ID set; ${DEMO_COURSE_SLUG}/l1 video remains unavailable.`)
  }
}

async function seedDemoLessonNotes() {
  const notesByLesson: Record<string, string> = {
    l2: [
      'Data analytics is not only about tools — it is a way of thinking. Analysts start with a clear business question, identify what evidence would answer it, and only then choose spreadsheets, SQL, or dashboards.',
      'A strong analytics mindset balances curiosity with skepticism. You question data quality, define metrics carefully, and separate correlation from causation before recommending action.',
      'In this demo lesson, use the reading notes below and any instructor materials to reflect on how you would frame an analytics problem for a retail or operations team.',
    ].join('\n\n'),
    l8: [
      'SQL (Structured Query Language) is the standard way to query relational databases. SELECT retrieves columns, WHERE filters rows, and JOIN combines tables on shared keys.',
      'Common patterns for analysts include aggregations (COUNT, SUM, AVG), GROUP BY for summaries, and HAVING to filter grouped results.',
      'Practice writing queries that answer one business question at a time — for example, monthly revenue by product category or customers with repeat purchases.',
    ].join('\n\n'),
  }

  for (const [lessonKey, notesBody] of Object.entries(notesByLesson)) {
    const node = await findCourseNode(DEMO_COURSE_SLUG, lessonKey)
    if (!node) continue
    await prisma.curriculumNode.update({
      where: { id: node.id },
      data: { notesBody },
    })
  }
}

async function seedDemoLessonMaterials() {
  const node = await findCourseNode(DEMO_COURSE_SLUG, 'l8')
  if (!node) return

  const existing = await prisma.lessonMaterial.findFirst({
    where: { nodeId: node.id, fileName: 'sql-reference-sheet.pdf' },
  })
  if (existing) return

  await prisma.lessonMaterial.create({
    data: {
      nodeId: node.id,
      fileName: 'sql-reference-sheet.pdf',
      mimeType: 'application/pdf',
      byteSize: 14336,
      storageProvider: 'r2',
      storageKey: `lesson-materials/${DEMO_COURSE_SLUG}/${node.id}/demo-seed/sql-reference-sheet.pdf`,
      uploadStatus: 'PENDING',
      published: true,
    },
  })
}

async function addOrganisationMember(organisationSlug: string, userId: string) {
  const organisation = await prisma.organisation.findUnique({ where: { slug: organisationSlug } })
  if (!organisation) return

  await prisma.organisationMembership.upsert({
    where: {
      organisationId_userId: {
        organisationId: organisation.id,
        userId,
      },
    },
    update: {},
    create: {
      organisationId: organisation.id,
      userId,
    },
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
  const course = await prisma.course.findUnique({ where: { slug: DEMO_COURSE_SLUG } })
  const program = await prisma.program.findUnique({ where: { slug: DEMO_PROGRAM_SLUG } })
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
    take: 5,
    select: { id: true, sourceId: true },
  })

  for (const [index, node] of lessonNodes.entries()) {
    const completed = index < 3
    await prisma.lessonProgress.upsert({
      where: { enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: node.id } },
      update: {
        completedAt: completed ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        nodeId: node.id,
        completedAt: completed ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    })
  }

  const quizNode = await findCourseNode(DEMO_COURSE_SLUG, 'l3')
  if (quizNode) {
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, enrollmentId: enrollment.id, nodeId: quizNode.id, attemptNumber: 1 },
    })
    if (!existingAttempt) {
      await prisma.quizAttempt.create({
        data: {
          userId,
          enrollmentId: enrollment.id,
          nodeId: quizNode.id,
          attemptNumber: 1,
          score: 2,
          totalQuestions: 3,
          passed: true,
          answers: [1, 0, 1],
        },
      })
    }
  }

  const assignmentNode = await findCourseNode(DEMO_COURSE_SLUG, 'l6')
  if (assignmentNode) {
    await prisma.assignmentProgress.upsert({
      where: { enrollmentId_nodeId: { enrollmentId: enrollment.id, nodeId: assignmentNode.id } },
      update: {
        status: 'submitted',
        responseText:
          'Completed the Excel assignment using pivot tables and conditional formatting on the provided retail dataset. All required charts are included.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId,
        enrollmentId: enrollment.id,
        nodeId: assignmentNode.id,
        status: 'submitted',
        responseText:
          'Completed the Excel assignment using pivot tables and conditional formatting on the provided retail dataset. All required charts are included.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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

  await seedDemoLessonNotes()
  await seedDemoLessonMaterials()

  await prisma.careerProfile.upsert({
    where: { userId },
    update: {
      headline: 'Aspiring Data Analyst',
      summary:
        'Demo learner profile for Skylent development. Building analytics skills through coursework, projects, and Career OS workflows.',
      location: 'Bengaluru, India',
      preferredRole: 'Data Analyst',
      preferredWorkMode: CareerWorkMode.HYBRID,
      profileVisibility: CareerProfileVisibility.NETWORK,
    },
    create: {
      userId,
      headline: 'Aspiring Data Analyst',
      summary:
        'Demo learner profile for Skylent development. Building analytics skills through coursework, projects, and Career OS workflows.',
      location: 'Bengaluru, India',
      preferredRole: 'Data Analyst',
      preferredWorkMode: CareerWorkMode.HYBRID,
      profileVisibility: CareerProfileVisibility.NETWORK,
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
          { profileId: profile.id, name: 'Excel', proficiency: CareerSkillProficiency.INTERMEDIATE, sortOrder: 3 },
        ],
      })
    }

    const projectCount = await prisma.careerProject.count({ where: { profileId: profile.id } })
    if (projectCount === 0) {
      await prisma.careerProject.createMany({
        data: [
          {
            profileId: profile.id,
            title: 'Sales Performance Dashboard',
            description: 'Power BI dashboard built from a demo retail sales dataset.',
            technologies: ['Power BI', 'DAX', 'SQL'],
            sortOrder: 0,
          },
          {
            profileId: profile.id,
            title: 'Customer Churn Analysis',
            description: 'Python notebook exploring churn drivers with logistic regression.',
            technologies: ['Python', 'Pandas', 'Scikit-learn'],
            sortOrder: 1,
          },
        ],
      })
    }

    const educationCount = await prisma.careerEducation.count({ where: { profileId: profile.id } })
    if (educationCount === 0) {
      await prisma.careerEducation.create({
        data: {
          profileId: profile.id,
          institution: 'Demo Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2021-07-01'),
          endDate: new Date('2025-05-01'),
          sortOrder: 0,
        },
      })
    }

    const experienceCount = await prisma.careerExperience.count({ where: { profileId: profile.id } })
    if (experienceCount === 0) {
      await prisma.careerExperience.create({
        data: {
          profileId: profile.id,
          company: 'Demo Analytics Internship',
          role: 'Data Analyst Intern',
          employmentType: CareerEmploymentType.INTERNSHIP,
          location: 'Bengaluru',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-01'),
          description: 'Supported reporting workflows and SQL queries for a demo analytics team.',
          sortOrder: 0,
        },
      })
    }

    const linkCount = await prisma.careerLink.count({ where: { profileId: profile.id } })
    if (linkCount === 0) {
      await prisma.careerLink.create({
        data: {
          profileId: profile.id,
          type: CareerLinkType.LINKEDIN,
          label: 'LinkedIn',
          url: 'https://linkedin.com/in/demo-learner-skylent',
          sortOrder: 0,
        },
      })
    }
  }
}

async function seedLearnerCareerPipeline(userId: string, jobId: string, employerId: string) {
  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {},
    create: { userId, jobId },
  })

  const existingApplication = await prisma.jobApplication.findFirst({
    where: { userId, jobId },
  })

  const application = existingApplication
    ?? await prisma.jobApplication.create({
      data: {
        userId,
        jobId,
        employerId,
        roleTitle: 'Junior Data Analyst',
        status: JobApplicationStatus.SCREENING,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        source: 'skylent-demo',
        notes: 'Demo application for development inspection of Career OS workflows.',
      },
    })

  const eventCount = await prisma.applicationEvent.count({ where: { applicationId: application.id } })
  if (eventCount === 0) {
    await prisma.applicationEvent.createMany({
      data: [
        {
          applicationId: application.id,
          type: 'applied',
          title: 'Application submitted',
          description: 'Applied through the Skylent demo job board.',
          occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          applicationId: application.id,
          type: 'screening',
          title: 'Profile screening',
          description: 'Demo recruiter moved the application to screening.',
          occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    })
  }

  const existingRound = await prisma.interviewRound.findFirst({
    where: { userId, applicationId: application.id, type: InterviewRoundType.TECHNICAL },
  })
  if (!existingRound) {
    await prisma.interviewRound.create({
      data: {
        userId,
        applicationId: application.id,
        type: InterviewRoundType.TECHNICAL,
        title: 'Technical interview',
        status: InterviewRoundStatus.PENDING,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Demo interview round for development preview.',
      },
    })
  }

  const supportCount = await prisma.careerSupportRequest.count({ where: { userId } })
  if (supportCount === 0) {
    await prisma.careerSupportRequest.create({
      data: {
        userId,
        type: CareerSupportRequestType.RESUME_REVIEW,
        subject: 'Resume review before demo interview',
        description: 'Requesting feedback on the demo resume before the technical interview round.',
        status: CareerSupportRequestStatus.OPEN,
        priority: CareerSupportPriority.MEDIUM,
      },
    })
  }
}

async function seedInstitutionWorkspace(learnerUserId: string) {
  await addOrganisationMember(DEMO_ORG_SLUG, learnerUserId)
}

async function seedInterviewQuestionBank() {
  const bank: Array<{
    category: string
    question: string
    difficulty: InterviewQuestionDifficulty
    roleTag: string
  }> = [
    {
      category: 'SQL',
      question: 'Explain the difference between INNER JOIN and LEFT JOIN with a simple example.',
      difficulty: InterviewQuestionDifficulty.EASY,
      roleTag: 'Data Analyst',
    },
    {
      category: 'Analytics',
      question: 'How would you measure the success of a product launch using metrics?',
      difficulty: InterviewQuestionDifficulty.MEDIUM,
      roleTag: 'Data Analyst',
    },
    {
      category: 'Python',
      question: 'When would you use a pandas groupby operation in an analytics workflow?',
      difficulty: InterviewQuestionDifficulty.MEDIUM,
      roleTag: 'Data Analyst',
    },
    {
      category: 'Behavioral',
      question: 'Describe a time you translated a business question into an analysis plan.',
      difficulty: InterviewQuestionDifficulty.MEDIUM,
      roleTag: 'General',
    },
  ]

  for (const entry of bank) {
    const existing = await prisma.interviewQuestion.findFirst({
      where: { question: entry.question },
    })
    if (!existing) {
      await prisma.interviewQuestion.create({ data: entry })
    }
  }
}

async function seedLearnerInterviewPractice(userId: string) {
  const question = await prisma.interviewQuestion.findFirst({
    where: { category: 'SQL', active: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!question) return

  const existing = await prisma.interviewPractice.findFirst({
    where: { userId, questionId: question.id },
  })
  if (existing) return

  await prisma.interviewPractice.create({
    data: {
      userId,
      questionId: question.id,
      answer:
        'INNER JOIN returns only matching rows from both tables, while LEFT JOIN keeps all rows from the left table and fills unmatched right-side columns with nulls.',
      score: 4,
      feedback: 'Clear demo answer covering the core distinction.',
    },
  })
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

  const analystJob = await prisma.job.upsert({
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

  await prisma.job.upsert({
    where: { slug: 'demo-ml-engineer' },
    update: {
      status: JobStatus.OPEN,
      postedAt: new Date(),
    },
    create: {
      employerId: employer.id,
      title: 'ML Engineer (Demo)',
      slug: 'demo-ml-engineer',
      description: 'Second development fixture role for recruiter workspace previews.',
      employmentType: CareerEmploymentType.FULL_TIME,
      workMode: CareerWorkMode.REMOTE,
      location: 'Remote',
      skills: ['Python', 'TensorFlow', 'MLOps'],
      category: 'Engineering',
      status: JobStatus.OPEN,
      postedAt: new Date(),
    },
  })

  return { employer, analystJob }
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
    organisationSlug: DEMO_ORG_SLUG,
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

  const { employer, analystJob } = await seedDemoJobs()
  await seedInterviewQuestionBank()
  await seedLearnerCareerPipeline(learner.id, analystJob.id, employer.id)
  await seedLearnerInterviewPractice(learner.id)
  await seedInstitutionWorkspace(learner.id)

  console.log('Demo users seeded (password via DEMO_USER_PASSWORD or DemoSkylent2026!).')
  console.log('  learner@demo.skylent.dev      → student dashboard, LMS progress, Career OS profile')
  console.log('  mentor@demo.skylent.dev       → faculty dashboard (teaching scope limited by schema)')
  console.log('  institution@demo.skylent.dev  → organisation dashboard with member enrollments')
  console.log('  recruiter@demo.skylent.dev    → recruiter workspace (UI preview data)')
  console.log('  admin@demo.skylent.dev        → admin dashboard + superadmin faculty review access')
}

async function main() {
  for (const program of programs) await seedProgram(program)
  for (const course of courses) await seedCourse(course)
  console.log(`Seeded ${programs.length} programs and ${courses.length} courses.`)

  console.log("Seeding quiz questions...")
  await seedQuizQuestions()

  console.log("Seeding program-course links...")
  await seedProgramCourses()

  await seedDemoLessonMuxPlayback()

  await seedDemoUsers()

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())