import type { AssignmentBrief } from '../data-analytics/assignments'

const pasteNote =
  'This LMS records a text/code submission. Paste your complete, runnable full-stack source code, API schemas, and deployment instructions. Ensure code adheres to production security standards.'

export const FSW_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Production REST API — Task Management Service',
    scenario: 'You are a backend engineer developing the core API for Skylent Workflow Services. The application requires authenticated CRUD endpoints for task management with schema validation, idempotency guards, and normalized error responses.',
    objective: 'Build an Express or Fastify RESTful backend service with schema validation (Zod), authentication middleware, and consistent JSON error envelopes.',
    instructions: [
      'Implement routes: GET /tasks, POST /tasks, GET /tasks/:id, PATCH /tasks/:id, DELETE /tasks/:id.',
      'Validate incoming request bodies using Zod schemas with descriptive error messages.',
      'Implement authentication middleware verifying session or bearer tokens.',
      'Normalize all errors into a standard envelope ({ error: string, code: string, requestId: string }).',
      'Provide curl command tests demonstrating successful creation and validation rejection.',
    ],
    requiredOutput: [
      'Complete runnable backend API source code.',
      'Zod request validation schemas.',
      'Error handling middleware implementation.',
      'Sample API responses demonstrating validation errors (400) and success (201/200).',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'API Design & Status Codes', weight: '35%', description: 'Proper HTTP verbs, idempotency, and semantic status codes.' },
      { criterion: 'Schema Validation & Security', weight: '35%', description: 'Strict validation schemas and normalized error envelopes.' },
      { criterion: 'Code Quality & Modularity', weight: '30%', description: 'Clean architecture separating routes, controllers, and middleware.' },
    ],
  },
  l12: {
    id: 'l12',
    title: 'Interactive Dashboard — Analytics & Task Interface',
    scenario: 'The product team requires a responsive frontend web interface for the Task Management API. The dashboard must handle loading states, optimistic task completion toggles, filter controls, and accessible forms.',
    objective: 'Build a responsive React/TypeScript frontend component dashboard with optimistic UI updates and robust error boundaries.',
    instructions: [
      'Implement task listing with filter controls (all, active, completed).',
      'Implement optimistic UI: clicking complete immediately updates the UI while dispatching the background PATCH request.',
      'Handle network failures: if the server responds with an error, revert the optimistic change and display a toast alert.',
      'Ensure form inputs adhere to accessibility standards (labels, aria attributes).',
      'Demonstrate responsive mobile and desktop layout styling.',
    ],
    requiredOutput: [
      'Complete frontend component source code.',
      'Optimistic state management logic.',
      'Error rollback and loading state handlers.',
      'Screenshots or text trace demonstrating state transitions.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'State Management & Optimistic UI', weight: '40%', description: 'Smooth optimistic state updates with clean rollback on error.' },
      { criterion: 'UX States & Accessibility', weight: '30%', description: 'Clear loading, error, and empty states with semantic accessible HTML.' },
      { criterion: 'Code Structure', weight: '30%', description: 'Clean component decomposition with immutable state patterns.' },
    ],
  },
  l14: {
    id: 'l14',
    title: 'Capstone — Full-Stack Web Application',
    scenario: 'You are submitting your final enterprise capstone for the Full-Stack Web Development track: a complete, production-ready web application integrating a relational database, authenticated REST API backend, and responsive frontend UI.',
    objective: 'Deliver an end-to-end full-stack repository demonstrating production-ready architecture, security hardening, and deployment readiness.',
    instructions: [
      'Model relational entities with PostgreSQL migrations (users, resources, audit_logs).',
      'Build secure REST API endpoints with CSRF protection, rate limiting, and HttpOnly cookies.',
      'Implement responsive frontend client with authentication, state management, and error boundaries.',
      'Include automated API integration tests verifying core user flows.',
      'Provide a complete Markdown README documenting architecture, database setup, environment variables, and deployment instructions.',
    ],
    requiredOutput: [
      'Complete full-stack application code repository (backend + frontend).',
      'Database migration scripts or Prisma schema.',
      'Security audit report detailing CORS, CSRF, and authentication safeguards.',
      'Documentation README with local reproduction steps.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Full-Stack Architecture & Integration', weight: '35%', description: 'Seamless end-to-end integration between database, backend API, and frontend.' },
      { criterion: 'Security & Data Integrity', weight: '35%', description: 'Strict authentication, CSRF defense, relational constraints, and input validation.' },
      { criterion: 'Production Readiness & Docs', weight: '30%', description: 'Complete test suite, migration scripts, and deployment documentation.' },
    ],
  },
}

export function getFswAssignment(lessonId: string): AssignmentBrief | undefined {
  return FSW_ASSIGNMENTS[lessonId]
}
