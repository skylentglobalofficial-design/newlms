/**
 * Skylent Virtual Labs — product catalogue, not a dump of legacy HTML.
 *
 * Interactive labs are first-class workspaces (controls → run → observe → reset).
 * A lab is attached only when its subject domain matches the course, module or
 * lesson in front of the learner. Python never opens an HTML lab.
 *
 * Legacy labSubjects in data.ts are exercise briefs: they are not degree
 * programmes and they do not execute real Python/SQL on a server.
 *
 * Live Classroom is a separate future capability. This repository has no
 * meeting, waiting-room, attendance or recording infrastructure — do not
 * surface Join / Live / Recording claims from this module.
 */

import { labSubjects, type LabSubject } from '../data'
import { notYetAvailable, type Availability } from './catalogue-status'
import {
  domainsForCourse,
  domainsForLesson,
  domainsForProgram,
  domainsOverlap,
  emptySubjectLabCopy,
  findCatalogueCourse,
  findCatalogueProgram,
  inferDomains,
  type LabDomain,
} from './lab-domains'

export type { LabDomain }
export { emptySubjectLabCopy, LAB_DOMAIN_LABEL } from './lab-domains'

export type LabKind = 'simulation' | 'playground' | 'visualisation' | 'scenario' | 'brief'
export type LabMigration = 'pilot' | 'ready' | 'needs-adaptation' | 'archived'
export type LabPublishStatus = 'available' | 'interest-open' | 'archived'
export type LabWorkspace = 'knn' | 'sql' | 'excel' | 'python' | 'css'

export type VirtualLab = {
  id: string
  title: string
  subject: string
  kind: LabKind
  migration: LabMigration
  publish: LabPublishStatus
  objective: string
  concept: string
  howToUse: string[]
  observe: string[]
  duration: string
  domains: LabDomain[]
  workspace?: LabWorkspace
  legacySubjectId?: string
}

export const INTERACTIVE_LABS: VirtualLab[] = [
  {
    id: 'python-filter',
    title: 'Filter a Python list',
    subject: 'Python',
    kind: 'playground',
    migration: 'pilot',
    publish: 'available',
    objective:
      'See how a list comprehension keeps only the rows that pass a score and city check.',
    concept:
      'A filter walks each record and keeps it when the condition is true. The comprehension shown here is the same idea as a Python list comprehension — it is not executed as Python.',
    howToUse: [
      'Set a minimum score and optionally a city.',
      'Run the filter to see which rows remain.',
      'Read the equivalent list comprehension. It is an explanation, not a runtime.',
      'Reset and try a stricter score.',
    ],
    observe: [
      'Raising the minimum score drops rows. That is the condition working, not a bug.',
      'Choosing a city adds a second condition with `and`.',
      'This is not a Python interpreter. It will not run your own code.',
    ],
    duration: '8–12 min',
    domains: ['python'],
    workspace: 'python',
  },
  {
    id: 'excel-group',
    title: 'Group a spreadsheet table',
    subject: 'Excel',
    kind: 'playground',
    migration: 'pilot',
    publish: 'available',
    objective: 'Group sample sales rows by region or product and read SUM, COUNT or AVERAGE.',
    concept:
      'Grouping collects rows that share a key, then reduces the amounts. Pivot tables in Excel do this; this exercise shows the same idea on a tiny table.',
    howToUse: [
      'Choose a column to group by.',
      'Choose SUM, COUNT or AVERAGE.',
      'Run grouping and check the totals against the original rows.',
      'Reset and group by the other column.',
    ],
    observe: [
      'SUM of amount should equal the original amounts for that group.',
      'COUNT is the number of rows, not the sum.',
      'This is not Microsoft Excel and it does not open a spreadsheet file.',
    ],
    duration: '8–12 min',
    domains: ['excel'],
    workspace: 'excel',
  },
  {
    id: 'sql-filter',
    title: 'Filter a SQL result',
    subject: 'SQL',
    kind: 'playground',
    migration: 'pilot',
    publish: 'available',
    objective: 'Apply WHERE and ORDER BY to a sample staff table and read the result set.',
    concept:
      'WHERE keeps matching rows. ORDER BY sorts what remains. The SQL snippet is generated from your controls so you can see the statement — it is not sent to a database.',
    howToUse: [
      'Pick a department (or all rows).',
      'Pick an order.',
      'Run the query and compare the result with the full table.',
      'Reset and try another department.',
    ],
    observe: [
      'Engineering-only results never include Sales rows.',
      'ORDER BY salary DESC puts the highest salary first.',
      'This filters a sample table in your browser. It is not a SQL database.',
    ],
    duration: '8–12 min',
    domains: ['sql'],
    workspace: 'sql',
  },
  {
    id: 'css-box',
    title: 'CSS box model',
    subject: 'HTML & CSS',
    kind: 'visualisation',
    migration: 'pilot',
    publish: 'available',
    objective: 'See how padding, border and margin add to the width of a box.',
    concept:
      'In CSS, the content box is only the inner width. Padding and border sit around it. Margin sits outside. The totals here use the default content-box model.',
    howToUse: [
      'Move width, padding, border and margin.',
      'Read the totals to see content, border box and outer width.',
      'Reset and change only padding, then only margin, and compare.',
    ],
    observe: [
      'Padding and border increase the border box. Margin increases the space outside it.',
      'Two boxes with the same content width can occupy very different space.',
      'This is a diagram, not a webpage editor and not a CSS file runtime.',
    ],
    duration: '8–12 min',
    domains: ['html', 'css'],
    workspace: 'css',
  },
  {
    id: 'knn-classifier',
    title: 'k-NN classifier',
    subject: 'Machine learning',
    kind: 'simulation',
    migration: 'pilot',
    publish: 'available',
    objective:
      'See how a nearest-neighbour classifier draws a decision boundary when you change the data and the value of k.',
    concept:
      'k-nearest neighbours classifies a point by looking at its k closest labelled neighbours and taking a majority vote. Noise and k both change how smooth the boundary is.',
    howToUse: [
      'Adjust sample size, noise and k.',
      'Run the experiment to classify a grid and score leave-one-out accuracy.',
      'Reset to generate a new dataset.',
      'Try a noisy set with k = 1, then raise k and compare the boundary.',
    ],
    observe: [
      'k = 1 hugs every training point, including outliers.',
      'Larger k smooths the boundary and is usually more stable on noisy data.',
      'Accuracy here is computed in your browser. It is not a published research result.',
    ],
    duration: '10–15 min',
    domains: ['ml'],
    workspace: 'knn',
  },
]

const ARCHIVED_GROUPINGS = new Set([
  'MBA',
  'BBA',
  'BCA Full Stack Development',
  'MCA',
  'M.Com Fintech',
  'SSU Semester 3',
  'SSU Semester 5',
])

export function isArchivedLabGrouping(program: string): boolean {
  return ARCHIVED_GROUPINGS.has(program)
}

export function labGroupingLabel(program: string): string {
  if (program === 'Data Centric AI') return 'Data & AI practice'
  if (ARCHIVED_GROUPINGS.has(program)) return 'Archived academic brief'
  return program
}

export function getInteractiveLab(id: string): VirtualLab | undefined {
  return INTERACTIVE_LABS.find(lab => lab.id === id)
}

export function labsMatchingDomains(contextDomains: LabDomain[]): VirtualLab[] {
  if (contextDomains.length === 0) return []
  return INTERACTIVE_LABS.filter(lab => domainsOverlap(lab.domains, contextDomains))
}

export function labsForCourse(courseSlug: string): VirtualLab[] {
  const course = findCatalogueCourse(courseSlug)
  if (!course) return []
  return labsMatchingDomains(domainsForCourse(course))
}

export function labsForProgram(programSlug: string): VirtualLab[] {
  const program = findCatalogueProgram(programSlug)
  if (!program) return []
  return labsMatchingDomains(domainsForProgram(program))
}

export function labsForLearningContext(input: {
  moduleTitle?: string | null
  lessonTitle?: string | null
}): VirtualLab[] {
  return labsMatchingDomains(domainsForLesson({
    moduleTitle: input.moduleTitle,
    lessonTitle: input.lessonTitle,
  }))
}

export function labsForDomain(domain: LabDomain): VirtualLab[] {
  return INTERACTIVE_LABS.filter(lab => lab.domains.includes(domain))
}

export function interactiveLabAvailability(lab: VirtualLab): Availability {
  if (lab.publish === 'available') {
    return {
      id: 'available',
      label: 'Available now',
      tone: 'positive',
      ctaLabel: 'Open experiment',
      canStartLearning: true,
      explanation: 'Runs in your browser. Nothing is sent to a server.',
    }
  }
  if (lab.publish === 'interest-open') {
    return {
      id: 'interest-open',
      label: 'Interest open',
      tone: 'neutral',
      ctaLabel: 'Register interest',
      canStartLearning: false,
      explanation: 'This experiment is not interactive yet.',
    }
  }
  return notYetAvailable('This brief is archived. It is not part of a live Skylent degree.')
}

export function practiceBriefSubjects() {
  return labSubjects.filter(subject => !isArchivedLabGrouping(subject.program))
}

export function archivedBriefSubjects() {
  return labSubjects.filter(subject => isArchivedLabGrouping(subject.program))
}

export function domainsForPracticeBrief(subject: LabSubject): LabDomain[] {
  return inferDomains([subject.program, subject.subject, subject.title, subject.desc])
}

export function practiceBriefsMatchingDomains(contextDomains: LabDomain[]): LabSubject[] {
  if (contextDomains.length === 0) return []
  return practiceBriefSubjects().filter(subject =>
    domainsOverlap(domainsForPracticeBrief(subject), contextDomains),
  )
}

export const INTERACTIVE_LAB_DOMAINS: LabDomain[] = Array.from(
  new Set(INTERACTIVE_LABS.flatMap(lab => lab.domains)),
)

const COMPLETE_KEY = 'skylent.lab.complete'

export function readLabCompletion(labId: string): boolean {
  try {
    const raw = localStorage.getItem(COMPLETE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed[labId] === true
  } catch {
    return false
  }
}

export function writeLabCompletion(labId: string, complete: boolean) {
  try {
    const raw = localStorage.getItem(COMPLETE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    parsed[labId] = complete
    localStorage.setItem(COMPLETE_KEY, JSON.stringify(parsed))
  } catch {
    /* localStorage may be unavailable */
  }
}
