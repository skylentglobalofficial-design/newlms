export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

/** What a learner can actually show. Career OS does not auto-create these. */
export const PM_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'User evidence from a fictional operations case',
    artifact: 'Research note with quotes, jobs, and unknowns',
    skill: 'Product discovery, interview synthesis',
    evidence: 'A reviewer can see what you heard versus what you inferred',
  },
  {
    lessonId: 'l12',
    learning: 'Prioritisation under a stated constraint',
    artifact: 'Priority memo with one bet and named non-goals',
    skill: 'Prioritisation, problem framing',
    evidence: 'A one-page decision a lead could accept or reject',
  },
  {
    lessonId: 'l14',
    learning: 'End-to-end product case',
    artifact: 'Product-case memo + thin spec + four-week check',
    skill: 'Product discovery, problem framing, prioritisation, business communication',
    evidence: 'A public work sample — not a certificate and not a placement',
  },
]
