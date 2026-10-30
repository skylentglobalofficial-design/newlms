export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

/** What a learner can actually show. Career OS connects these to verifiable proof-of-work. */
export const PYTHON_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'Constant-memory stream processing and metric extraction',
    artifact: 'Production Python log stream parser with regex error extraction',
    skill: 'Python, stream processing, generators, regex, data structures',
    evidence: 'A reviewer can verify memory bounds and aggregation accuracy on live stream data',
  },
  {
    lessonId: 'l12',
    learning: 'Robust batch ETL automation with atomic file writes',
    artifact: 'Batch ETL ingestion script with dataclass validation schemas',
    skill: 'Python, ETL automation, pathlib, dataclasses, defensive programming',
    evidence: 'A reviewer can test dirty data rejection and atomic file guarantees without corruption',
  },
  {
    lessonId: 'l14',
    learning: 'End-to-end production Python CLI utility with pytest coverage',
    artifact: 'Packaged automation CLI with custom exceptions, context managers, and test suite',
    skill: 'Software architecture, OOP, pytest, CLI design, error handling',
    evidence: 'A public GitHub work sample with passing test suite and automated CI execution',
  },
]
