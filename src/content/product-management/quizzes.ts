export type PmQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  lessonId: string
  moduleId: string
}

export type PmQuizBank = {
  lessonId: string
  title: string
  questions: PmQuizQuestion[]
}

export const PM_QUIZZES: Record<string, PmQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Product thinking check',
    questions: [
      {
        id: 'pm-l3-q1',
        prompt: 'A store lead says: “Build us a shared inbox.” Why is that a weak product brief for Harbor Desk?',
        options: [
          'Because inboxes cannot be used in retail',
          'Because it is a solution, not a statement of who is struggling and what “better” would look like',
          'Because you must write SQL before you can define a product problem',
          'Because Harbor Retail has no stores',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 2: a usable brief names the user, the job, and the outcome. “Shared inbox” is one possible solution. SQL is not part of this course.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'pm-l3-q2',
        prompt: 'Which statement is an outcome rather than an output?',
        options: [
          'We shipped Harbor Desk v1 on Friday',
          'We added @mentions and file upload',
          'Weekend delivery failures are owned before the customer messages a cashier',
          'The backlog has 40 tickets',
        ],
        correctIndex: 2,
        explanation:
          'An outcome is a change in the user’s world. Shipping a version or adding features is output. Ticket count is internal activity.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'pm-l3-q3',
        prompt: 'This course trains you to make which kind of decision?',
        options: [
          'Which neural network Harbor Retail should train',
          'Which Northwind category has the highest net revenue',
          'Which problem is worth one constrained engineering bet, and what you will not build',
          'Which certificate the learner should receive',
        ],
        correctIndex: 2,
        explanation:
          'Lesson 1: product work here is choosing a problem and a bet under a constraint. ML, Northwind revenue, and certificates are out of scope.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'pm-l3-q4',
        prompt: 'Priya wants late trucks handled before 07:00. Arun wants “Gmail for stores.” What should you do first?',
        options: [
          'Start the Gmail clone because HQ asked for it',
          'Keep both as features on one roadmap so nobody is unhappy',
          'Separate the user job (late inbound before open) from the requested solution (Gmail)',
          'Delete Priya’s interview because she is not a director',
        ],
        correctIndex: 2,
        explanation:
          'Problems, users, outcomes: hold the job and treat the named solution as a candidate. Status is not evidence quality.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'pm-l3-q5',
        prompt: 'Which claim can this Harbor Desk case actually support?',
        options: [
          'Harbor Desk will increase revenue by 12%',
          'Weekend exceptions currently scatter across WhatsApp, email, walkie, and nowhere',
          'Missing SKUs are proven to be the top problem',
          'Learners who finish will be hired as PMs',
        ],
        correctIndex: 1,
        explanation:
          'The case logs nine weekend exceptions across channels. It has no revenue file, no SKU frequency count, and no hiring claim.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'Framing check',
    questions: [
      {
        id: 'pm-l9-q1',
        prompt: 'Which problem statement is testable next month?',
        options: [
          'Stores need better communication',
          'Harbor Retail should be more customer-centric',
          'On weekends, customer delivery failures at Anna Nagar have no written owner, so Meena is messaged ad hoc',
          'We should build AI into Harbor Desk',
        ],
        correctIndex: 2,
        explanation:
          'Lesson 7: a testable statement names user, context, and a pain you could count. “Better communication” and “AI” are not testable here.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'pm-l9-q2',
        prompt: 'A job story that matches this course looks like:',
        options: [
          'As a PM, I want a roadmap so that I look senior',
          'When a weekend delivery fails, Meena needs somewhere to put it so the customer is not her personal problem',
          'As a user, I want a delightful omnichannel experience',
          'When I open Jira, I want more epics',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 8: job stories start from a situation and a user, not from a career aesthetic or a tool.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'pm-l9-q3',
        prompt: 'Which is a legitimate non-goal for a six-week Harbor Desk bet?',
        options: [
          'Do not replace the warehouse system',
          'Do not talk to any store',
          'Do not write anything down',
          'Do not name a constraint',
        ],
        correctIndex: 0,
        explanation:
          'The case already forbids a warehouse/ERP replacement. Ignoring users or evidence is not a non-goal; it is skipping the work.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'pm-l9-q4',
        prompt: 'Arun sends “requirements: like Gmail but for stores.” Your framing move is:',
        options: [
          'Copy Gmail’s feature list into a PRD',
          'Treat it as the problem statement',
          'Park it as a solution candidate and rewrite the problem from store jobs and the exception log',
          'Add Northwind revenue to justify Gmail',
        ],
        correctIndex: 2,
        explanation:
          'Solution-shaped briefs get rewritten. Northwind is a different course and does not belong in this case.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'pm-l9-q5',
        prompt: 'You still lack a count of missing-SKU frequency. The honest move is:',
        options: [
          'Assume SKUs are the top problem because Arun mentioned them',
          'Drop SKUs from the headline problem and list the gap',
          'Invent a percentage so the memo looks quantitative',
          'Switch the course to Data Analytics and run SQL',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 5/8: missing evidence is a gap, not a number you invent. SQL on Northwind does not answer a Harbor Desk SKU question.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Final check',
    questions: [
      {
        id: 'pm-l15-q1',
        prompt: 'Karthik can ship a status list in six weeks, not Gmail. A spec that respects that constraint:',
        options: [
          'Mentions, file upload, offline mobile, SLA timers, and routing in v1',
          'A weekend exception list with status, store, type, and owner — and file upload listed as out of scope',
          '“Build something delightful and see”',
          'A machine-learning classifier for exception type',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 13: a thin spec matches the bet and names out-of-scope. ML and Gmail-complete are not in this course or this constraint.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'pm-l15-q2',
        prompt: 'Opportunity versus solution: the opportunity in this case is closest to:',
        options: [
          'Harbor Desk, the shared inbox brand',
          'Weekend exceptions that currently have no reliable owner',
          'WhatsApp as a platform strategy',
          'A Power BI dashboard of store sales',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 10: the opportunity is the job/pain. Harbor Desk is a solution candidate. Sales dashboards belong to Data Analytics.',
        lessonId: 'l10',
        moduleId: 'm4',
      },
      {
        id: 'pm-l15-q3',
        prompt: 'A four-week check after shipping the bet should look like:',
        options: [
          '“Are people happy?” with no count',
          'Count of weekend delivery failures that had a written owner before Monday 10:00, versus the July log',
          'A certificate issued to the learner',
          'Automatic Career OS skill rows for AI and SQL',
        ],
        correctIndex: 1,
        explanation:
          'The capstone asks for a reviewable check. Happiness with no measure, certificates, and invented skills are not this product.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
      {
        id: 'pm-l15-q4',
        prompt: 'You completed every lesson checkbox. What is still missing if you never submitted the product case?',
        options: [
          'Nothing — progress percent is competence',
          'A demonstrated work sample: evidence, frame, one bet, spec, and a four-week check on Harbor Desk',
          'A Skylent certificate',
          'Automatic Career OS project creation',
        ],
        correctIndex: 1,
        explanation:
          'This product records progress separately from competence. Career OS does not auto-create projects. Certificates are not issued yet.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
      {
        id: 'pm-l15-q5',
        prompt: 'Why does this course not open Northwind Lab?',
        options: [
          'Because labs are fake',
          'Because the subject is product judgement on an operations case, not SQL on a sales extract',
          'Because Product Management is not a real Skylent course',
          'Because learners are not allowed a second enrolment',
        ],
        correctIndex: 1,
        explanation:
          'Labs are specialised. Northwind Lab stays with Data Analytics. This course’s artifact is a written product case.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
    ],
  },
}

export function getPmQuiz(lessonId: string): PmQuizBank | undefined {
  return PM_QUIZZES[lessonId]
}

export function pmQuizSeedKey(lessonId: string): string {
  return `product-management:${lessonId}`
}
