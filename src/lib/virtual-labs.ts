/**
 * Skylent Virtual Labs — product catalogue, not a dump of legacy HTML.
 *
 * Interactive labs are first-class workspaces (controls → run → observe → reset).
 * Legacy labSubjects in data.ts are exercise briefs: they are not degree
 * programmes and they do not execute real Python/SQL on a server.
 *
 * Live Classroom is a separate future capability. This repository has no
 * meeting, waiting-room, attendance or recording infrastructure — do not
 * surface Join / Live / Recording claims from this module.
 */

import { labSubjects } from '../data'
import { notYetAvailable, type Availability } from './catalogue-status'

export type LabKind = 'simulation' | 'playground' | 'visualisation' | 'scenario' | 'brief'
export type LabMigration = 'pilot' | 'ready' | 'needs-adaptation' | 'archived'
export type LabPublishStatus = 'available' | 'interest-open' | 'archived'

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
  relatedCourseSlugs: string[]
  relatedProgramSlugs: string[]
  /** Client-side workspace component key. Only set for migrated labs. */
  workspace?: 'knn'
  /** Legacy exercise-brief subject id in data.ts */
  legacySubjectId?: string
}

export const INTERACTIVE_LABS: VirtualLab[] = [
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
    relatedCourseSlugs: ['python-programming', 'data-analytics'],
    relatedProgramSlugs: ['data-science-ai', 'data-analytics-pro'],
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

export function labsForCourse(courseSlug: string): VirtualLab[] {
  return INTERACTIVE_LABS.filter(lab => lab.relatedCourseSlugs.includes(courseSlug))
}

export function labsForProgram(programSlug: string): VirtualLab[] {
  return INTERACTIVE_LABS.filter(lab => lab.relatedProgramSlugs.includes(programSlug))
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
