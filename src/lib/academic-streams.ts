import { programs, type Program, type ProgramType } from '../data'
import { getProgrammeAvailability, notYetAvailable, type Availability } from './catalogue-status'
import type { AuroraThemeId } from '../aurora-themes'

/**
 * The academic information architecture behind /education.
 *
 * Skylent's catalogue is currently professional/skills inventory: there are no
 * SCHOOLING, UNDERGRADUATE or POSTGRADUATE programmes in `programs`. This module
 * describes the academic structure the product is organised around and then
 * resolves each stage and stream against the real catalogue, so a stream with
 * nothing behind it can only ever render as "Not yet available".
 *
 * Adding a programme with the matching `programType` (and listing its slug on a
 * stream) is all it takes for these sections to start showing real inventory.
 */

export type AcademicStageId = 'schooling' | 'undergraduate' | 'postgraduate' | 'competitive-exams'

export type AcademicStream = {
  id: string
  /** Short form used as the card title, e.g. "B.Tech". */
  abbr: string
  /** Expanded name, e.g. "Bachelor of Technology". */
  name: string
  /** Who the stream is for. Describes the audience, never Skylent inventory. */
  audience: string
  /** Programme slugs that belong to this stream. Empty until inventory exists. */
  slugs: string[]
}

export type AcademicStage = {
  id: AcademicStageId
  numeral: string
  label: string
  sub: string
  themeId: AuroraThemeId
  intro: string
  programType: ProgramType
  streams: AcademicStream[]
}

export const ACADEMIC_STAGES: AcademicStage[] = [
  {
    id: 'schooling',
    numeral: 'I',
    label: 'Schooling',
    sub: 'Grades 1–12',
    themeId: 'schooling',
    intro:
      'School study is organised by grade band, then subject, then chapter. Progress is tracked per lesson rather than per term.',
    programType: 'SCHOOLING',
    streams: [
      { id: 'primary', abbr: 'Primary', name: 'Grades 1–5', audience: 'Early learners building reading, numeracy and study habits.', slugs: [] },
      { id: 'middle', abbr: 'Middle', name: 'Grades 6–8', audience: 'Students moving from general subjects into specialised ones.', slugs: [] },
      { id: 'secondary', abbr: 'Secondary', name: 'Grades 9–10', audience: 'Students working towards board examinations.', slugs: [] },
      { id: 'senior-secondary', abbr: 'Senior secondary', name: 'Grades 11–12', audience: 'Students choosing a stream and preparing for entrance exams.', slugs: [] },
    ],
  },
  {
    id: 'undergraduate',
    numeral: 'II',
    label: 'Undergraduate',
    sub: 'Bachelor’s degree study',
    themeId: 'undergraduate',
    intro:
      'Undergraduate study is organised by degree, then semester, then subject — with coursework that sits alongside the university syllabus rather than replacing it.',
    programType: 'UNDERGRADUATE',
    streams: [
      { id: 'btech', abbr: 'B.Tech', name: 'Bachelor of Technology', audience: 'Engineering undergraduates looking for coursework alongside their degree.', slugs: [] },
      { id: 'bca', abbr: 'BCA', name: 'Bachelor of Computer Applications', audience: 'Computer applications undergraduates building programming and application skills.', slugs: [] },
    ],
  },
  {
    id: 'postgraduate',
    numeral: 'III',
    label: 'Postgraduate',
    sub: 'Master’s degree study',
    themeId: 'postgraduate',
    intro:
      'Postgraduate study is organised by degree, then specialisation, then advanced module — closer to case work and applied projects than to lecture series.',
    programType: 'POSTGRADUATE',
    streams: [
      { id: 'mba', abbr: 'MBA', name: 'Master of Business Administration', audience: 'Management postgraduates working through business, strategy and operations material.', slugs: [] },
      { id: 'mca', abbr: 'MCA', name: 'Master of Computer Applications', audience: 'Computer applications postgraduates going deeper into software and systems.', slugs: [] },
    ],
  },
  {
    id: 'competitive-exams',
    numeral: 'IV',
    label: 'Entrance exams',
    sub: 'Competitive exam preparation',
    themeId: 'jee',
    intro:
      'Entrance exam preparation is organised by exam pattern and syllabus rather than by semester. These are the two exams Skylent has programmes for.',
    programType: 'EXAM_PREP',
    streams: [
      { id: 'jee', abbr: 'JEE Advanced', name: 'Engineering entrance', audience: 'Students preparing for engineering admission.', slugs: ['jee-advanced-prep'] },
      { id: 'cat', abbr: 'CAT', name: 'Management entrance', audience: 'Graduates preparing for management admission.', slugs: ['cat-prep'] },
    ],
  },
]

export type ResolvedStream = AcademicStream & {
  programmes: Program[]
  availability: Availability
  /** Route for the stream's primary action. */
  href: string
}

export type ResolvedStage = Omit<AcademicStage, 'streams'> & {
  streams: ResolvedStream[]
  /** Every catalogue programme carrying this stage's programType. */
  programmes: Program[]
  /** Programmes a learner can open in the learning platform today. */
  openCount: number
}

function programmesForSlugs(slugs: string[]): Program[] {
  return slugs
    .map(slug => programs.find(program => program.slug === slug))
    .filter((program): program is Program => Boolean(program))
}

function resolveStream(stream: AcademicStream, stage: AcademicStage): ResolvedStream {
  const matched = programmesForSlugs(stream.slugs)

  if (matched.length === 0) {
    return {
      ...stream,
      programmes: [],
      availability: notYetAvailable(
        stage.id === 'schooling'
          ? 'No lessons have been published for this grade band yet.'
          : `No ${stream.abbr} coursework has been published yet.`,
      ),
      href: '/contact',
    }
  }

  // Surface the strongest availability across the stream's programmes so a
  // stream with one live programme is not buried by a coming-soon sibling.
  const availabilities = matched.map(getProgrammeAvailability)
  const best =
    availabilities.find(item => item.canStartLearning) ??
    availabilities.find(item => item.id === 'enrolling') ??
    availabilities.find(item => item.id === 'interest-open') ??
    availabilities[0]

  return {
    ...stream,
    programmes: matched,
    availability: best,
    href: matched.length === 1 ? `/programs/${matched[0].slug}` : '/programs',
  }
}

export function resolveAcademicStages(): ResolvedStage[] {
  return ACADEMIC_STAGES.map(stage => {
    const streams = stage.streams.map(stream => resolveStream(stream, stage))
    const programmes = programs.filter(program => program.programType === stage.programType)
    return {
      ...stage,
      streams,
      programmes,
      openCount: programmes.filter(program => getProgrammeAvailability(program).canStartLearning).length,
    }
  })
}

/** True when no academic stage has anything a learner can open today. */
export function hasOpenAcademicInventory(stages: ResolvedStage[]): boolean {
  return stages.some(stage => stage.openCount > 0)
}
