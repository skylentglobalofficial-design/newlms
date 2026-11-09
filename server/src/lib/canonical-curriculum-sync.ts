import { getServerAuthoredQuiz } from "./authored-quiz-banks.js"
import { CurriculumNodeType } from "@prisma/client"
import { prisma } from "./prisma.js"

type CanonicalLesson = {
  id: string
  title: string
  nodeType: CurriculumNodeType
  duration: string
}

type CanonicalModule = {
  id: string
  title: string
  lessons: CanonicalLesson[]
}

export const CANONICAL_COURSE_MODULES: Record<string, CanonicalModule[]> = {
  "data-analytics": [
    {
      id: "m1",
      title: "Foundations of Data",
      lessons: [
        { id: "l1", title: "What is Data Analytics?", nodeType: CurriculumNodeType.NOTES, duration: "40 min" },
        { id: "l2", title: "Asking a question the data can answer", nodeType: CurriculumNodeType.NOTES, duration: "35 min" },
        { id: "l3", title: "Foundations check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "Spreadsheet analysis",
      lessons: [
        { id: "l4", title: "Spreadsheet tables, types, and filters", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Pivots, charts, and month-over-month", nodeType: CurriculumNodeType.NOTES, duration: "50 min" },
        { id: "l6", title: "Spreadsheet analysis — Northwind Q1–Q2", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "SQL for Analysis",
      lessons: [
        { id: "l7", title: "SQL SELECT, WHERE, and aggregates", nodeType: CurriculumNodeType.NOTES, duration: "50 min" },
        { id: "l8", title: "SQL joins and data-quality checks", nodeType: CurriculumNodeType.NOTES, duration: "50 min" },
        { id: "l9", title: "SQL check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Dashboards",
      lessons: [
        { id: "l10", title: "Dashboards that answer one question", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Measures, dimensions, and calculated fields", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Dashboard — one question Northwind can act on", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "4 hr" },
      ],
    },
    {
      id: "m5",
      title: "Applied projects and capstone",
      lessons: [
        { id: "l13", title: "SQL analysis — Northwind sales", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
        { id: "l14", title: "Capstone — Northwind commercial review", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "8 hr" },
        { id: "l15", title: "Final check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
  "product-management": [
    {
      id: "m1",
      title: "Product thinking",
      lessons: [
        { id: "l1", title: "What product management is for", nodeType: CurriculumNodeType.NOTES, duration: "40 min" },
        { id: "l2", title: "Problems, users, and outcomes", nodeType: CurriculumNodeType.NOTES, duration: "40 min" },
        { id: "l3", title: "Product thinking check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "Users and evidence",
      lessons: [
        { id: "l4", title: "Talking to users without leading them", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Evidence, not opinions", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l6", title: "Research note — Harbor Desk interviews", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "Framing",
      lessons: [
        { id: "l7", title: "Problem statements that can be tested", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l8", title: "Jobs, constraints, and non-goals", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l9", title: "Framing check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Prioritisation",
      lessons: [
        { id: "l10", title: "Opportunity versus solution", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Choosing one bet", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Priority memo — Harbor Desk", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m5",
      title: "Specification and product case",
      lessons: [
        { id: "l13", title: "Writing a specification someone can build", nodeType: CurriculumNodeType.NOTES, duration: "50 min" },
        { id: "l14", title: "Capstone — Harbor Desk product case", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "6 hr" },
        { id: "l15", title: "Final check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
  "python-programming": [
    {
      id: "m1",
      title: "Foundations & Data Structures",
      lessons: [
        { id: "l1", title: "Immutable Records, Dictionaries & Complexity Guarantees", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l2", title: "Control Flow, Guard Clauses & Explicit Exception Boundaries", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l3", title: "Foundations & Complexity Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "File Ingestion & Schema Quarantine",
      lessons: [
        { id: "l4", title: "Streaming JSONL & CSV Readers with Constant Memory", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Integer-Paise Arithmetic & Deterministic FX Normalisation", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l6", title: "Assignment — Quarantine Sink & Deduplication Spec", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "Modular Architecture & CLI Tooling",
      lessons: [
        { id: "l7", title: "Pure Transformations vs I/O Boundaries", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l8", title: "Idempotent Batch Reruns & Checkpointing", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l9", title: "Pipeline Architecture & Idempotency Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Automated Testing with Pytest",
      lessons: [
        { id: "l10", title: "Pytest Fixtures, Parametrize & Edge-Case Matrices", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Structured Logging, Exit Codes & Alerting", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Assignment — Pytest Regression Matrix & CLI Runbook", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m5",
      title: "Production Packaging & Capstone",
      lessons: [
        { id: "l13", title: "Packaging, Type Checking (`mypy`/`pyright`) & CI Gates", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l14", title: "Capstone — Python Transaction Pipeline & Anomaly Audit", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "6 hr" },
        { id: "l15", title: "Final Python Engineering Check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
  "data-science-ai": [
    {
      id: "m1",
      title: "Point-in-Time Data & Leakage Auditing",
      lessons: [
        { id: "l1", title: "Framing Prediction Windows & Observation Cutoffs", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l2", title: "Detecting Post-Event Target Leakage in Tabular Cohorts", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l3", title: "Temporal Split & Leakage Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "Feature Engineering & Cohort Signal",
      lessons: [
        { id: "l4", title: "Rolling Engagement Ratios & Behavioural Velocity Features", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Handling Missingness, Censored Observations & Class Imbalance", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l6", title: "Assignment — Point-in-Time Feature & Leakage Audit Memo", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "Model Benchmarking & Decision Thresholds",
      lessons: [
        { id: "l7", title: "Regularized Linear Baselines vs Gradient Boosted Trees", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l8", title: "Precision@Top-K Under Constrained Operational Capacity", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l9", title: "Ranking Metrics & Threshold Economics Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Probability Calibration & Subgroup Fairness",
      lessons: [
        { id: "l10", title: "Reliability Diagrams, Brier Score & Platt/Isotonic Calibration", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Subgroup Error Slicing Across SMB & Enterprise Tiers", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Assignment — Retention ROI & Calibration Specification", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m5",
      title: "Production Drift Monitoring & Capstone",
      lessons: [
        { id: "l13", title: "Population Stability Index (PSI) & Shadow Deployment", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l14", title: "Capstone — Customer Churn Cohort & Out-of-Time Validation Case", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "6 hr" },
        { id: "l15", title: "Final Data Science & Validation Check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
  "generative-ai": [
    {
      id: "m1",
      title: "Structured Prompt Contracts & Determinism",
      lessons: [
        { id: "l1", title: "System Instructions, JSON Schema Outputs & Abstention Rules", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l2", title: "Temperature, Token Budgets & Failure Recovery", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l3", title: "Prompt Contracts & Schema Grounding Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "Document Chunking & Hybrid Retrieval",
      lessons: [
        { id: "l4", title: "Section-Aware Chunking & Metadata Preservation", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Hybrid BM25 Lexical + Dense Vector Retrieval & Reranking", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l6", title: "Assignment — Section-Aware Indexing & Hybrid Retrieval Spec", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "Citation Verification & Prompt Security",
      lessons: [
        { id: "l7", title: "Deterministic Citation Verification & Hallucination Blocking", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l8", title: "Defending Against Indirect Prompt Injection & Tool Abuse", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l9", title: "Grounding Verifiers & Prompt Security Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Evaluation Harnesses & CI Gates",
      lessons: [
        { id: "l10", title: "Golden Evaluation Datasets: Recall@K, Faithfulness & Relevance", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Adversarial Red-Teaming & Regression Gating in CI", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Assignment — Golden 100-Query Evaluation Harness & CI Gate", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m5",
      title: "Latency, Token FinOps & Capstone",
      lessons: [
        { id: "l13", title: "Semantic Caching, Model Routing & Token Unit Economics", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l14", title: "Capstone — Enterprise Policy RAG Grounding & Citation Audit", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "6 hr" },
        { id: "l15", title: "Final Generative AI Systems Check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
  "full-stack-web": [
    {
      id: "m1",
      title: "Relational Data Modelling & Transactional Invariants",
      lessons: [
        { id: "l1", title: "Append-Only Ledgers vs Mutable Balance Columns", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l2", title: "Composite Unique Constraints & Idempotency Keys (P2002)", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l3", title: "Transactional Schema & Concurrency Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m2",
      title: "Typed REST APIs & Boundary Validation",
      lessons: [
        { id: "l4", title: "Zod Request Contracts & Structured Error Envelopes", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l5", title: "Graceful Degradation & HTTP 503 Schema Readiness Guards", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l6", title: "Assignment — Transactional Ledger Schema & Zod API Contract", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m3",
      title: "Authentication, RBAC & Webhook Security",
      lessons: [
        { id: "l7", title: "HTTP-Only Sessions, CSRF Tokens & Password Reset Rotation", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l8", title: "Preventing IDOR via Server-Side Ownership & Tenant Scoping", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l9", title: "Session Security, CSRF & RBAC Check", nodeType: CurriculumNodeType.QUIZ, duration: "20 min" },
      ],
    },
    {
      id: "m4",
      title: "Resilient React Architecture & State Management",
      lessons: [
        { id: "l10", title: "Explicit Loading, Empty, Error & Stale-Request Abort States", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l11", title: "Local Draft Persistence & Server Reconciliation", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l12", title: "Assignment — Webhook Replay Handler & React Rollback Spec", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "3 hr" },
      ],
    },
    {
      id: "m5",
      title: "Health Checks, CI Verification & Capstone",
      lessons: [
        { id: "l13", title: "Liveness (`/health/live`) vs Readiness (`/health/ready`) & Zero-Downtime Deploys", nodeType: CurriculumNodeType.NOTES, duration: "45 min" },
        { id: "l14", title: "Capstone — Full-Stack Idempotent Wallet & Webhook Spec", nodeType: CurriculumNodeType.ASSIGNMENT, duration: "6 hr" },
        { id: "l15", title: "Final Full-Stack Engineering Check", nodeType: CurriculumNodeType.QUIZ, duration: "25 min" },
      ],
    },
  ],
}

const syncedSlugs = new Set<string>()
let inFlightSyncPromise: Promise<void> | null = null

async function runCanonicalSyncBatch(pendingSlugs: string[]): Promise<void> {
  const courses = await prisma.course.findMany({
    where: { slug: { in: pendingSlugs } },
    include: {
      curriculum: {
        orderBy: { order: "asc" },
        include: { nodes: { orderBy: { order: "asc" } } },
      },
    },
  }).catch(() => [])

  const courseBySlug = new Map(courses.map((c) => [c.slug, c]))

  for (const slug of pendingSlugs) {
    const canonical = CANONICAL_COURSE_MODULES[slug]
    if (!canonical) continue
    const course = courseBySlug.get(slug)
    if (!course) continue
    syncedSlugs.add(slug)

    if ((course as { authoredInApp?: boolean }).authoredInApp) continue

    const currentMods = course.curriculum
    const needsSync =
      currentMods.length < canonical.length ||
      currentMods[0]?.title !== canonical[0].title ||
      currentMods.some((m, idx) => canonical[idx] && m.nodes.length < canonical[idx].lessons.length)

    if (!needsSync) {
      for (const mod of currentMods) {
        for (const node of mod.nodes) {
          if (node.nodeType === CurriculumNodeType.QUIZ && node.sourceId) {
            const qCount = await prisma.quizQuestion.count({ where: { nodeId: node.id } }).catch(() => 0)
            if (qCount === 0) {
              const bank = getServerAuthoredQuiz(slug, node.sourceId)
              if (bank && bank.length > 0) {
                await prisma.quizQuestion.createMany({
                  data: bank.map((q, qIdx) => ({
                    nodeId: node.id,
                    sortOrder: qIdx,
                    question: q.question,
                    options: [...q.options],
                    correctIndex: q.correctIndex,
                  })),
                }).catch(() => undefined)
              }
            }
          }
        }
      }
      continue
    }

    for (let mIdx = 0; mIdx < canonical.length; mIdx++) {
      const specMod = canonical[mIdx]
      const existingMod = currentMods.find((m) => m.sourceId === specMod.id) ?? currentMods[mIdx]
      let modId: string
      if (existingMod) {
        await prisma.curriculumModule.update({
          where: { id: existingMod.id },
          data: {
            sourceId: specMod.id,
            order: mIdx,
            title: specMod.title,
          },
        }).catch(() => undefined)
        modId = existingMod.id
      } else {
        const createdMod = await prisma.curriculumModule.create({
          data: {
            courseId: course.id,
            sourceId: specMod.id,
            order: mIdx,
            title: specMod.title,
            topics: [],
          },
        })
        modId = createdMod.id
      }

      const existingNodes = existingMod?.nodes ?? []
      for (let lIdx = 0; lIdx < specMod.lessons.length; lIdx++) {
        const specLec = specMod.lessons[lIdx]
        const existingNode = existingNodes.find((n) => n.sourceId === specLec.id) ?? existingNodes[lIdx]
        let nodeId: string | undefined = existingNode?.id
        if (existingNode) {
          await prisma.curriculumNode.update({
            where: { id: existingNode.id },
            data: {
              moduleId: modId,
              sourceId: specLec.id,
              order: lIdx,
              title: specLec.title,
              nodeType: specLec.nodeType,
              duration: specLec.duration,
            },
          }).catch(() => undefined)
        } else {
          const createdNode = await prisma.curriculumNode.create({
            data: {
              moduleId: modId,
              sourceId: specLec.id,
              order: lIdx,
              title: specLec.title,
              nodeType: specLec.nodeType,
              duration: specLec.duration,
            },
          }).catch(() => undefined)
          nodeId = createdNode?.id
        }
        if (nodeId && specLec.nodeType === CurriculumNodeType.QUIZ) {
          const qCount = await prisma.quizQuestion.count({ where: { nodeId } }).catch(() => 0)
          if (qCount === 0) {
            const bank = getServerAuthoredQuiz(slug, specLec.id)
            if (bank && bank.length > 0) {
              await prisma.quizQuestion.createMany({
                data: bank.map((q, qIdx) => ({
                  nodeId,
                  sortOrder: qIdx,
                  question: q.question,
                  options: [...q.options],
                  correctIndex: q.correctIndex,
                })),
              }).catch(() => undefined)
            }
          }
        }
      }
    }

    await prisma.course.update({
      where: { id: course.id },
      data: { lessonCount: 15 },
    }).catch(() => undefined)
  }
}

export async function ensureCanonicalCourseCurriculumSynced(targetSlug?: string): Promise<void> {
  if (process.env.NODE_ENV === "test") return
  try {
    const slugs = targetSlug
      ? CANONICAL_COURSE_MODULES[targetSlug]
        ? [targetSlug]
        : []
      : Object.keys(CANONICAL_COURSE_MODULES)
    const pendingSlugs = slugs.filter((s) => !syncedSlugs.has(s))
    if (pendingSlugs.length === 0) return

    if (inFlightSyncPromise) {
      await inFlightSyncPromise
      const stillPending = pendingSlugs.filter((s) => !syncedSlugs.has(s))
      if (stillPending.length === 0) return
    }

    inFlightSyncPromise = runCanonicalSyncBatch(pendingSlugs).finally(() => {
      inFlightSyncPromise = null
    })
    await inFlightSyncPromise
  } catch {
    // Non-fatal in offline/mock environments
  }
}
