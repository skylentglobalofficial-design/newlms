export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

export const FSW_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'Production REST API design and schema validation',
    artifact: 'Validated task management REST API service with error normalization',
    skill: 'Full Stack Web, REST APIs, Backend Architecture, Zod Validation',
    evidence: 'A reviewer can test endpoint idempotency, validation schemas, and error envelopes',
  },
  {
    lessonId: 'l12',
    learning: 'Interactive frontend state management and optimistic UI updates',
    artifact: 'Responsive task dashboard with optimistic updates and error rollback',
    skill: 'Frontend Engineering, React, TypeScript, State Management, Optimistic UI',
    evidence: 'A reviewer can inspect immutable state transitions and accessibility compliance',
  },
  {
    lessonId: 'l14',
    learning: 'End-to-end full-stack web application with relational persistence and security',
    artifact: 'Full-stack web application capstone with database migrations and auth',
    skill: 'Full Stack Engineering, PostgreSQL, Node.js, Web Security, System Integration',
    evidence: 'A complete GitHub portfolio repository with passing integration tests and deployment docs',
  },
]
