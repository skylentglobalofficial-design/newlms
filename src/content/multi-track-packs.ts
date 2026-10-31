import type { AssignmentBrief } from "./data-analytics/assignments"
import type { WrittenLessonMeta } from "./data-analytics/lessons"
import type { DaQuizBank } from "./data-analytics/quizzes"

export const MULTI_TRACK_COURSE_SLUGS = [
  "python-programming",
  "data-science-ai",
  "generative-ai",
  "full-stack-web",
] as const

export type MultiTrackCourseSlug = (typeof MULTI_TRACK_COURSE_SLUGS)[number]

export function isMultiTrackAuthoredCourse(slug: string | undefined): slug is MultiTrackCourseSlug {
  return Boolean(slug && (MULTI_TRACK_COURSE_SLUGS as readonly string[]).includes(slug))
}

type TrackPackSpec = {
  slug: MultiTrackCourseSlug
  title: string
  datasetFilename: string
  datasetHref: string
  practicePromptL3: string
  capstoneArtifact: string
  capstoneSummary: string
  capstoneSkillTags: string[]
  lessons: Array<{
    id: string
    moduleTitle: string
    title: string
    kind: "reading" | "quiz" | "assignment" | "capstone"
    objective: string
    body: string
  }>
}

const TRACK_SPECS: Record<MultiTrackCourseSlug, TrackPackSpec> = {
  "python-programming": {
    slug: "python-programming",
    title: "Python Programming & Automation",
    datasetFilename: "settlement_feed_2026_q2.jsonl",
    datasetHref: "/os/projects/python-programming/python-pipeline-audit",
    practicePromptL3:
      "A nightly payment feed contains duplicate webhook retries and negative fee rows. Why is a plain list append without a composite deduplication key dangerous for finance ledgers?",
    capstoneArtifact: "Python Transaction Pipeline & Anomaly Audit Specification",
    capstoneSummary:
      "Designed an idempotent Python settlement ingestion pipeline with composite deduplication keys, dead-letter quarantine logging, integer-paise FX normalisation, and pytest regression coverage.",
    capstoneSkillTags: ["Python ETL", "Schema Validation", "Pytest Automation", "Idempotent Pipelines"],
    lessons: [
      {
        id: "l1",
        moduleTitle: "Foundations & Data Structures",
        title: "Immutable Records, Dictionaries & Complexity Guarantees",
        kind: "reading",
        objective: "Select O(1) hash-backed sets and dictionaries over nested list scans when deduplicating high-volume transaction streams.",
        body: "Production Python pipelines fail when engineers use O(n²) list lookups on tens of thousands of settlement rows. In this lesson you model transaction records with typed dictionaries and dataclasses, use composite tuple keys `(gateway_tx_id, settlement_epoch)` in sets for O(1) deduplication, and avoid mutable default arguments.",
      },
      {
        id: "l2",
        moduleTitle: "Foundations & Data Structures",
        title: "Control Flow, Guard Clauses & Explicit Exception Boundaries",
        kind: "reading",
        objective: "Replace bare `except:` blocks with structured validation exceptions and dead-letter quarantine routing.",
        body: "Silent `except Exception: pass` blocks hide corrupt financial rows until month-end close. Learn to separate recoverable row-level schema errors from fatal infrastructure failures, attach machine-readable reason codes (`NEGATIVE_FEE`, `MISSING_CURRENCY`), and keep batch ingestion deterministic.",
      },
      {
        id: "l3",
        moduleTitle: "Foundations & Data Structures",
        title: "Foundations & Complexity Check",
        kind: "quiz",
        objective: "Verify mastery of O(1) composite-key lookup, guard clauses, and integer minor-unit arithmetic.",
        body: "Complete this checkpoint to verify your understanding of Python data structure complexity, decimal/paise precision, and structured exception handling.",
      },
      {
        id: "l4",
        moduleTitle: "File Ingestion & Schema Quarantine",
        title: "Streaming JSONL & CSV Readers with Constant Memory",
        kind: "reading",
        objective: "Process multi-gigabyte JSONL and CSV extracts line-by-line using generators without exhausting process RAM.",
        body: "Loading an entire nightly dump into memory with `json.load()` crashes container workers when batch sizes spike. Here you build generator-based streaming readers (`yield`), track line numbers for audit logs, and flush validated batches predictably.",
      },
      {
        id: "l5",
        moduleTitle: "File Ingestion & Schema Quarantine",
        title: "Integer-Paise Arithmetic & Deterministic FX Normalisation",
        kind: "reading",
        objective: "Eliminate IEEE-754 floating-point drift by representing currency values in integer minor units (paise/cents).",
        body: "In Python, `0.1 + 0.2 != 0.3`. Financial pipelines never store rupee or dollar amounts as `float`. You will convert incoming strings via `Decimal` with `ROUND_HALF_EVEN` into integer paise and apply deterministic FX lookup tables.",
      },
      {
        id: "l6",
        moduleTitle: "File Ingestion & Schema Quarantine",
        title: "Assignment — Quarantine Sink & Deduplication Spec",
        kind: "assignment",
        objective: "Write the validation contract and quarantine reason-code specification for `settlement_feed_2026_q2.jsonl`.",
        body: "Specify the exact validation rules, composite deduplication key, and dead-letter quarantine schema for the regional gateway settlement feed.",
      },
      {
        id: "l7",
        moduleTitle: "Modular Architecture & CLI Tooling",
        title: "Pure Transformations vs I/O Boundaries",
        kind: "reading",
        objective: "Decouple core business transformation functions from filesystem and database I/O so every rule is unit-testable.",
        body: "When file reading, validation, and database writes are tangled inside one 300-line script, testing requires fragile mocks. You will structure Python modules using the Functional Core / Imperative Shell pattern.",
      },
      {
        id: "l8",
        moduleTitle: "Modular Architecture & CLI Tooling",
        title: "Idempotent Batch Reruns & Checkpointing",
        kind: "reading",
        objective: "Design CLI batch jobs that produce identical ledger state whether executed once or re-run five times after a network timeout.",
        body: "Cron jobs and workflow orchestrators retry failed tasks automatically. Learn how idempotency keys and atomic staging swaps prevent duplicate downstream postings.",
      },
      {
        id: "l9",
        moduleTitle: "Modular Architecture & CLI Tooling",
        title: "Pipeline Architecture & Idempotency Check",
        kind: "quiz",
        objective: "Test your understanding of generator pipelines, integer minor units, and idempotent batch design.",
        body: "Verify how streaming ingestion, FX normalisation, and idempotent retries behave under production edge cases.",
      },
      {
        id: "l10",
        moduleTitle: "Automated Testing with Pytest",
        title: "Pytest Fixtures, Parametrize & Edge-Case Matrices",
        kind: "reading",
        objective: "Write compact `@pytest.mark.parametrize` suites covering malformed JSON, duplicate retries, and boundary amounts.",
        body: "One parametrized pytest function can verify 12 schema edge cases in 30 lines of readable code. Learn how to build hermetic fixtures using `tmp_path`.",
      },
      {
        id: "l11",
        moduleTitle: "Automated Testing with Pytest",
        title: "Structured Logging, Exit Codes & Alerting",
        kind: "reading",
        objective: "Emit JSON-structured operational telemetry and non-zero POSIX exit codes when quarantine thresholds are breached.",
        body: "Production pipelines must tell operators when quarantine rates exceed 1% of batch volume. You will configure structured JSON log records and strict CLI exit codes.",
      },
      {
        id: "l12",
        moduleTitle: "Automated Testing with Pytest",
        title: "Assignment — Pytest Regression Matrix & CLI Runbook",
        kind: "assignment",
        objective: "Design the 6-case pytest regression matrix and operational runbook for nightly settlement ingestion.",
        body: "Document the exact pytest fixtures, assertions, and on-call remediation steps for quarantined settlement rows.",
      },
      {
        id: "l13",
        moduleTitle: "Production Packaging & Capstone",
        title: "Packaging, Type Checking (`mypy`/`pyright`) & CI Gates",
        kind: "reading",
        objective: "Enforce strict static type annotations and automated CI quality gates before any pipeline change deploys.",
        body: "Combine `pyproject.toml`, strict type hints, and CI test gates so schema mismatches are caught before code reaches production.",
      },
      {
        id: "l14",
        moduleTitle: "Production Packaging & Capstone",
        title: "Capstone — Python Transaction Pipeline & Anomaly Audit",
        kind: "capstone",
        objective: "Deliver a complete engineering audit and idempotent pipeline specification for the multi-gateway settlement feed.",
        body: "Synthesize your schema validation rules, composite deduplication key, quarantine sink, and pytest coverage into an executive engineering specification.",
      },
      {
        id: "l15",
        moduleTitle: "Production Packaging & Capstone",
        title: "Final Python Engineering Check",
        kind: "quiz",
        objective: "Confirm end-to-end mastery of Python ETL engineering, testing, and operational reliability.",
        body: "Complete the final comprehensive assessment covering Python data structures, idempotency, financial precision, and pytest verification.",
      },
    ],
  },
  "data-science-ai": {
    slug: "data-science-ai",
    title: "Data Science & AI",
    datasetFilename: "subscription_cohorts_2026.csv",
    datasetHref: "/os/projects/data-science-ai/churn-cohort-validation",
    practicePromptL3:
      "A churn model achieves 0.96 ROC-AUC on a random 80/20 split but fails in production. Which post-event feature leakage and temporal split flaw should you audit first?",
    capstoneArtifact: "Customer Churn Cohort & Out-of-Time Validation Playbook",
    capstoneSummary:
      "Audited a B2B SaaS churn classifier for target leakage, enforced a point-in-time temporal validation split, optimized Precision@Top-500 for retention capacity, and specified PSI drift monitoring.",
    capstoneSkillTags: ["Out-of-Time Validation", "Target Leakage Audit", "Model Calibration", "Precision@K Economics"],
    lessons: [
      {
        id: "l1",
        moduleTitle: "Point-in-Time Data & Leakage Auditing",
        title: "Framing Prediction Windows & Observation Cutoffs",
        kind: "reading",
        objective: "Define a strict prediction cutoff timestamp `T` so features use only events observed on or before `T`.",
        body: "Most enterprise ML failures stem from time-travel leakage rather than algorithm choice. Learn to separate the historical feature observation window `(T - 30d, T]` from the future outcome window `(T, T + 30d]`.",
      },
      {
        id: "l2",
        moduleTitle: "Point-in-Time Data & Leakage Auditing",
        title: "Detecting Post-Event Target Leakage in Tabular Cohorts",
        kind: "reading",
        objective: "Audit feature importance spikes to uncover post-cancellation or post-default columns masquerading as predictors.",
        body: "When a single feature like `days_since_cancellation_request` or `last_collection_call_status` drives 85% of split gain, the model is reading the label in disguise. Learn systematic leakage audits.",
      },
      {
        id: "l3",
        moduleTitle: "Point-in-Time Data & Leakage Auditing",
        title: "Temporal Split & Leakage Check",
        kind: "quiz",
        objective: "Verify your ability to spot target leakage and design out-of-time validation splits.",
        body: "Test your understanding of point-in-time feature engineering and random-split vs temporal-split evaluation.",
      },
      {
        id: "l4",
        moduleTitle: "Feature Engineering & Cohort Signal",
        title: "Rolling Engagement Ratios & Behavioural Velocity Features",
        kind: "reading",
        objective: "Construct ratio features (7d vs 30d active seat velocity) that capture trajectory rather than raw company size.",
        body: "Raw login counts favour large enterprise accounts over healthy SMBs. Ratio features such as `active_users_7d / active_users_30d` normalize across account tiers and surface early disengagement.",
      },
      {
        id: "l5",
        moduleTitle: "Feature Engineering & Cohort Signal",
        title: "Handling Missingness, Censored Observations & Class Imbalance",
        kind: "reading",
        objective: "Preserve informative missingness indicators without imputing future cohort statistics into training folds.",
        body: "Fitting an imputer or scaler on the full dataset before splitting leaks test distribution statistics. Learn fold-safe preprocessing and survival/censoring awareness.",
      },
      {
        id: "l6",
        moduleTitle: "Feature Engineering & Cohort Signal",
        title: "Assignment — Point-in-Time Feature & Leakage Audit Memo",
        kind: "assignment",
        objective: "Audit the candidate SaaS churn feature table, strip leaky columns, and define the temporal train/validation/test calendar.",
        body: "Write a technical audit identifying which candidate features violate the cutoff boundary and specifying the exact temporal split.",
      },
      {
        id: "l7",
        moduleTitle: "Model Benchmarking & Decision Thresholds",
        title: "Regularized Linear Baselines vs Gradient Boosted Trees",
        kind: "reading",
        objective: "Benchmark L2-regularized logistic regression against HistGradientBoosting before adding model complexity.",
        body: "A calibrated linear baseline exposes data bugs immediately and establishes the minimum acceptable lift for tree ensembles.",
      },
      {
        id: "l8",
        moduleTitle: "Model Benchmarking & Decision Thresholds",
        title: "Precision@Top-K Under Constrained Operational Capacity",
        kind: "reading",
        objective: "Optimize Precision@Top-500 and net retention ROI when human outreach capacity is capped.",
        body: "Global ROC-AUC weights false positives at the bottom of the score distribution equally with the top decile. When a retention team can call only 500 accounts per week, Precision@Top-500 governs business ROI.",
      },
      {
        id: "l9",
        moduleTitle: "Model Benchmarking & Decision Thresholds",
        title: "Ranking Metrics & Threshold Economics Check",
        kind: "quiz",
        objective: "Confirm mastery of Precision@K, lift curves, and cost-benefit threshold selection.",
        body: "Evaluate how capacity constraints and intervention costs determine the optimal classification threshold.",
      },
      {
        id: "l10",
        moduleTitle: "Probability Calibration & Subgroup Fairness",
        title: "Reliability Diagrams, Brier Score & Platt/Isotonic Calibration",
        kind: "reading",
        objective: "Calibrate raw model scores so a predicted 0.70 churn probability corresponds to a 70% empirical churn rate.",
        body: "Boosted trees push probabilities toward 0 and 1. When multiplying predicted churn probability by contract value (`E[LTV at risk] = P(churn) × ACV`), uncalibrated scores distort budget allocation.",
      },
      {
        id: "l11",
        moduleTitle: "Probability Calibration & Subgroup Fairness",
        title: "Subgroup Error Slicing Across SMB & Enterprise Tiers",
        kind: "reading",
        objective: "Audit false-positive and false-negative rates across customer segments so high-ACV cohorts are not systematically mis-scored.",
        body: "Aggregate metrics can hide severe underperformance on enterprise accounts. Learn disaggregated calibration and slice-level evaluation.",
      },
      {
        id: "l12",
        moduleTitle: "Probability Calibration & Subgroup Fairness",
        title: "Assignment — Retention ROI & Calibration Specification",
        kind: "assignment",
        objective: "Compute expected ARR saved at Top-500 outreach capacity and specify the segment calibration checks.",
        body: "Formulate the retention unit-economics table and calibration acceptance criteria for the SaaS churn model.",
      },
      {
        id: "l13",
        moduleTitle: "Production Drift Monitoring & Capstone",
        title: "Population Stability Index (PSI) & Shadow Deployment",
        kind: "reading",
        objective: "Configure PSI feature drift alerts and shadow-mode evaluation before enabling automated retention triggers.",
        body: "Pricing changes and seasonal renewals shift feature distributions. Learn how PSI thresholds (`PSI > 0.20`) and delayed-label monitoring protect production models.",
      },
      {
        id: "l14",
        moduleTitle: "Production Drift Monitoring & Capstone",
        title: "Capstone — Customer Churn Cohort & Out-of-Time Validation Case",
        kind: "capstone",
        objective: "Produce the complete out-of-time validation, Precision@Top-500 ROI analysis, and drift governance memo.",
        body: "Deliver an executive-ready validation case covering target leakage removal, temporal split metrics, calibration, and PSI drift playbooks.",
      },
      {
        id: "l15",
        moduleTitle: "Production Drift Monitoring & Capstone",
        title: "Final Data Science & Validation Check",
        kind: "quiz",
        objective: "Verify comprehensive mastery of leakage-free validation, calibration, and production ML monitoring.",
        body: "Complete the final assessment on temporal validation, Precision@K economics, probability calibration, and drift governance.",
      },
    ],
  },
  "generative-ai": {
    slug: "generative-ai",
    title: "Generative AI & LLM Systems",
    datasetFilename: "enterprise_policy_corpus_v2.json",
    datasetHref: "/os/projects/generative-ai/enterprise-rag-evaluation",
    practicePromptL3:
      "An internal policy RAG bot fabricates a 60-day refund exception because a markdown table was split across two fixed-size token chunks. How do you fix the chunking and grounding contract?",
    capstoneArtifact: "Enterprise Policy RAG Grounding & Citation Evaluation Harness",
    capstoneSummary:
      "Architected a hybrid BM25 + dense vector RAG pipeline with section-aware chunking, deterministic citation verification, indirect prompt-injection guardrails, and tiered token FinOps.",
    capstoneSkillTags: ["Hybrid RAG", "Citation Grounding", "LLM Evaluation", "Prompt Security & FinOps"],
    lessons: [
      {
        id: "l1",
        moduleTitle: "Structured Prompt Contracts & Determinism",
        title: "System Instructions, JSON Schema Outputs & Abstention Rules",
        kind: "reading",
        objective: "Constrain LLM outputs to strict JSON schemas with explicit `abstain: true` fields when evidence is insufficient.",
        body: "Free-text chat completions are brittle in enterprise workflows. Learn to design deterministic JSON schema contracts that separate extracted evidence, citation IDs, and confidence flags.",
      },
      {
        id: "l2",
        moduleTitle: "Structured Prompt Contracts & Determinism",
        title: "Temperature, Token Budgets & Failure Recovery",
        kind: "reading",
        objective: "Configure low-temperature decoding, bounded `max_tokens`, and schema-repair fallbacks for production APIs.",
        body: "High temperature increases creative variance at the cost of factual consistency. Learn how decoding parameters and structured output validators guarantee reliable downstream parsing.",
      },
      {
        id: "l3",
        moduleTitle: "Structured Prompt Contracts & Determinism",
        title: "Prompt Contracts & Schema Grounding Check",
        kind: "quiz",
        objective: "Verify mastery of JSON schema contracts, abstention rules, and deterministic decoding.",
        body: "Test your understanding of structured LLM outputs, citation requirements, and fallback handling.",
      },
      {
        id: "l4",
        moduleTitle: "Document Chunking & Hybrid Retrieval",
        title: "Section-Aware Chunking & Metadata Preservation",
        kind: "reading",
        objective: "Split policy documents along markdown headings and table boundaries while attaching `doc_id`, `section_id`, and `effective_date` metadata.",
        body: "Naive 500-token sliding windows slice policy tables in half, separating conditions from exceptions. Learn hierarchical section-aware chunking.",
      },
      {
        id: "l5",
        moduleTitle: "Document Chunking & Hybrid Retrieval",
        title: "Hybrid BM25 Lexical + Dense Vector Retrieval & Reranking",
        kind: "reading",
        objective: "Combine BM25 exact keyword matching with dense embeddings and reciprocal rank fusion (`RRF`).",
        body: "Dense embeddings capture semantic paraphrases but miss exact clause codes like `SOP-REF-2026 §4.2`. Hybrid BM25 + vector retrieval with cross-encoder reranking maximizes Recall@5.",
      },
      {
        id: "l6",
        moduleTitle: "Document Chunking & Hybrid Retrieval",
        title: "Assignment — Section-Aware Indexing & Hybrid Retrieval Spec",
        kind: "assignment",
        objective: "Specify the chunking strategy, metadata schema, and hybrid retrieval pipeline for the 1,400-document policy corpus.",
        body: "Write the indexing and retrieval specification that prevents table-splitting and boosts exact policy-code Recall@5.",
      },
      {
        id: "l7",
        moduleTitle: "Citation Verification & Prompt Security",
        title: "Deterministic Citation Verification & Hallucination Blocking",
        kind: "reading",
        objective: "Validate that every `[doc_id, section_id]` citation in a generated answer exists in the retrieved context window.",
        body: "Post-generation verifiers check that cited document IDs were actually retrieved and that chunk relevance exceeds the minimum threshold before showing an answer.",
      },
      {
        id: "l8",
        moduleTitle: "Citation Verification & Prompt Security",
        title: "Defending Against Indirect Prompt Injection & Tool Abuse",
        kind: "reading",
        objective: "Isolate untrusted retrieved document text from system instructions and enforce allow-listed tool schemas.",
        body: "Retrieved documents can contain adversarial strings (`Ignore previous instructions...`). Learn delimiter isolation, input sanitization, and least-privilege tool guards.",
      },
      {
        id: "l9",
        moduleTitle: "Citation Verification & Prompt Security",
        title: "Grounding Verifiers & Prompt Security Check",
        kind: "quiz",
        objective: "Confirm mastery of citation verification, abstention thresholds, and indirect prompt-injection defenses.",
        body: "Verify how RAG security guards and post-generation citation checks prevent ungrounded or hijacked responses.",
      },
      {
        id: "l10",
        moduleTitle: "Evaluation Harnesses & CI Gates",
        title: "Golden Evaluation Datasets: Recall@K, Faithfulness & Relevance",
        kind: "reading",
        objective: "Measure retrieval Recall@5 independently from generation Faithfulness on a 100-question golden test suite.",
        body: "When a RAG answer is wrong, you must know whether retrieval missed the chunk or generation misread it. Learn triad evaluation metrics.",
      },
      {
        id: "l11",
        moduleTitle: "Evaluation Harnesses & CI Gates",
        title: "Adversarial Red-Teaming & Regression Gating in CI",
        kind: "reading",
        objective: "Block prompt or model upgrades in CI whenever faithfulness or abstention accuracy regresses on golden test vectors.",
        body: "Treat prompt templates and model versions like code: every change runs against deterministic golden fixtures before deployment.",
      },
      {
        id: "l12",
        moduleTitle: "Evaluation Harnesses & CI Gates",
        title: "Assignment — Golden 100-Query Evaluation Harness & CI Gate",
        kind: "assignment",
        objective: "Design the evaluation rubric, golden test categories, and release gates for the enterprise policy assistant.",
        body: "Specify the exact Recall@5, Faithfulness, and Abstention Accuracy thresholds required to ship a RAG update.",
      },
      {
        id: "l13",
        moduleTitle: "Latency, Token FinOps & Capstone",
        title: "Semantic Caching, Model Routing & Token Unit Economics",
        kind: "reading",
        objective: "Route routine queries to compact flash models while reserving frontier reasoning models for complex synthesis.",
        body: "Unbounded frontier-model calls destroy gross margin. Learn tiered model routing, prompt caching, and p95 latency budgets.",
      },
      {
        id: "l14",
        moduleTitle: "Latency, Token FinOps & Capstone",
        title: "Capstone — Enterprise Policy RAG Grounding & Citation Audit",
        kind: "capstone",
        objective: "Deliver the end-to-end RAG architecture, citation verification contract, evaluation harness, and FinOps specification.",
        body: "Synthesize your chunking, hybrid retrieval, grounding verifier, security guardrails, and token budget into a production AI systems memo.",
      },
      {
        id: "l15",
        moduleTitle: "Latency, Token FinOps & Capstone",
        title: "Final Generative AI Systems Check",
        kind: "quiz",
        objective: "Verify end-to-end mastery of production RAG architecture, evaluation harnesses, security, and FinOps.",
        body: "Complete the final assessment covering structured outputs, hybrid retrieval, citation verification, and LLM unit economics.",
      },
    ],
  },
  "full-stack-web": {
    slug: "full-stack-web",
    title: "Full Stack Web Engineering",
    datasetFilename: "wallet_ledger_spec_v1.sql",
    datasetHref: "/os/projects/full-stack-web/idempotent-ledger-architecture",
    practicePromptL3:
      "Two concurrent payment webhooks arrive 4 milliseconds apart for the same ₹99 workshop registration. Why does `SELECT balance` followed by `UPDATE balance = balance + 99` without a unique idempotency constraint double-credit the wallet?",
    capstoneArtifact: "Full-Stack Idempotent Wallet & Webhook Architecture Specification",
    capstoneSummary:
      "Specified and verified an end-to-end transactional wallet and webhook architecture using PostgreSQL/Prisma unique idempotency keys, Zod request contracts, RBAC/CSRF middleware, and resilient React state transitions.",
    capstoneSkillTags: ["PostgreSQL Transactions", "Express & Zod APIs", "RBAC & CSRF Security", "React State Resilience"],
    lessons: [
      {
        id: "l1",
        moduleTitle: "Relational Data Modelling & Transactional Invariants",
        title: "Append-Only Ledgers vs Mutable Balance Columns",
        kind: "reading",
        objective: "Pair every cached account balance with an immutable append-only transaction ledger enforced inside a database transaction.",
        body: "Updating a single `balance` integer without an audit ledger makes financial reconciliation impossible. Learn how `ElixirAccount` and `ElixirTransaction` maintain strict invariants inside `prisma.$transaction`.",
      },
      {
        id: "l2",
        moduleTitle: "Relational Data Modelling & Transactional Invariants",
        title: "Composite Unique Constraints & Idempotency Keys (`P2002`)",
        kind: "reading",
        objective: "Use `@@unique([userId, idempotencyKey])` at the PostgreSQL level to neutralize concurrent duplicate requests.",
        body: "Application-level `if (!existing)` checks lose under concurrent race conditions. Database unique constraints guarantee that parallel retries result in exactly one committed row and a clean `P2002` catch path.",
      },
      {
        id: "l3",
        moduleTitle: "Relational Data Modelling & Transactional Invariants",
        title: "Transactional Schema & Concurrency Check",
        kind: "quiz",
        objective: "Verify mastery of database transactions, race conditions, and composite unique idempotency keys.",
        body: "Test your understanding of PostgreSQL concurrency invariants, append-only ledgers, and Prisma `P2002` handling.",
      },
      {
        id: "l4",
        moduleTitle: "Typed REST APIs & Boundary Validation",
        title: "Zod Request Contracts & Structured Error Envelopes",
        kind: "reading",
        objective: "Validate URL params, query strings, and JSON bodies with Zod before executing any database query.",
        body: "Never trust `req.body` or `req.params`. Learn to enforce strict Zod schemas at the Express router boundary and return consistent `400`/`422` JSON payloads.",
      },
      {
        id: "l5",
        moduleTitle: "Typed REST APIs & Boundary Validation",
        title: "Graceful Degradation & HTTP 503 Schema Readiness Guards",
        kind: "reading",
        objective: "Catch transient database connectivity and pending-migration errors as clean HTTP `503` JSON without leaking stack traces.",
        body: "Production APIs must never dump raw Prisma connection strings or HTML 500 pages to clients. Learn structured error classification and secret redaction.",
      },
      {
        id: "l6",
        moduleTitle: "Typed REST APIs & Boundary Validation",
        title: "Assignment — Transactional Ledger Schema & Zod API Contract",
        kind: "assignment",
        objective: "Write the Prisma ledger schema constraints and Express + Zod endpoint specification for wallet redemptions.",
        body: "Specify the exact database constraints, transaction steps, and HTTP status codes for idempotent resource purchases.",
      },
      {
        id: "l7",
        moduleTitle: "Authentication, RBAC & Webhook Security",
        title: "HTTP-Only Sessions, CSRF Tokens & Password Reset Rotation",
        kind: "reading",
        objective: "Protect cookie-authenticated state mutations with `requireCsrf` and invalidate active sessions on password change.",
        body: "Cookie-based sessions require synchronized CSRF token verification on `POST`/`PATCH`/`DELETE` routes. Learn how session rotation prevents replay attacks.",
      },
      {
        id: "l8",
        moduleTitle: "Authentication, RBAC & Webhook Security",
        title: "Preventing IDOR via Server-Side Ownership & Tenant Scoping",
        kind: "reading",
        objective: "Scope every database query by `req.auth.user.id` or verified tenant membership rather than client-supplied IDs.",
        body: "Hiding a button in React is not security. Learn how server-side ownership checks and role guards block Insecure Direct Object Reference (`IDOR`) vulnerabilities.",
      },
      {
        id: "l9",
        moduleTitle: "Authentication, RBAC & Webhook Security",
        title: "Session Security, CSRF & RBAC Check",
        kind: "quiz",
        objective: "Confirm mastery of HTTP-only session cookies, CSRF protection, and server-side tenant isolation.",
        body: "Verify how authentication middleware, CSRF tokens, and ownership scoping protect multi-role web applications.",
      },
      {
        id: "l10",
        moduleTitle: "Resilient React Architecture & State Management",
        title: "Explicit Loading, Empty, Error & Stale-Request Abort States",
        kind: "reading",
        objective: "Use `AbortController` and discriminated union state (`loading | ready | error`) in React data-fetching hooks.",
        body: "Fast route switching causes out-of-order fetch responses unless in-flight requests are aborted on unmount. Learn race-condition-free React state patterns.",
      },
      {
        id: "l11",
        moduleTitle: "Resilient React Architecture & State Management",
        title: "Local Draft Persistence & Server Reconciliation",
        kind: "reading",
        objective: "Preserve unsaved learner input in `sessionStorage` and reconcile cleanly against server `updatedAt` timestamps.",
        body: "Network drops should never erase a user's written work. Learn how local draft keys and timestamp reconciliation protect form state.",
      },
      {
        id: "l12",
        moduleTitle: "Resilient React Architecture & State Management",
        title: "Assignment — Webhook Replay Handler & React Rollback Spec",
        kind: "assignment",
        objective: "Specify the HMAC-verified webhook handler and React optimistic-state rollback behavior.",
        body: "Document the end-to-end flow from concurrent payment webhook delivery to accessible React UI state updates.",
      },
      {
        id: "l13",
        moduleTitle: "Health Checks, CI Verification & Capstone",
        title: "Liveness (`/health/live`) vs Readiness (`/health/ready`) & Zero-Downtime Deploys",
        kind: "reading",
        objective: "Separate process liveness probes from database/migration readiness checks for container orchestrators.",
        body: "Load balancers need `/health/live` to check process health and `/health/ready` to verify Postgres and migration state before routing traffic.",
      },
      {
        id: "l14",
        moduleTitle: "Health Checks, CI Verification & Capstone",
        title: "Capstone — Full-Stack Idempotent Wallet & Webhook Spec",
        kind: "capstone",
        objective: "Deliver the complete full-stack architecture specification spanning PostgreSQL transactions, Zod contracts, security middleware, and React UI states.",
        body: "Synthesize your database schema, webhook idempotency handler, RBAC/CSRF controls, and React state recovery into a production engineering spec.",
      },
      {
        id: "l15",
        moduleTitle: "Health Checks, CI Verification & Capstone",
        title: "Final Full-Stack Engineering Check",
        kind: "quiz",
        objective: "Verify end-to-end mastery of transactional schemas, API security, and resilient React engineering.",
        body: "Complete the final comprehensive assessment covering PostgreSQL concurrency, Zod contracts, CSRF/IDOR prevention, and React state resilience.",
      },
    ],
  },
}

export function getMultiTrackLessonMeta(courseSlug: string, lessonId: string): WrittenLessonMeta | undefined {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return undefined
  const spec = TRACK_SPECS[courseSlug]
  const idx = spec.lessons.findIndex((l) => l.id === lessonId)
  if (idx === -1) return undefined
  const lesson = spec.lessons[idx]
  const next = spec.lessons[idx + 1]
  return {
    id: lesson.id,
    number: idx + 1,
    moduleId: `m${Math.floor(idx / 3) + 1}`,
    moduleNumber: Math.floor(idx / 3) + 1,
    moduleTitle: lesson.moduleTitle,
    title: lesson.title,
    kind: lesson.kind,
    duration: lesson.kind === "quiz" ? "20 min" : lesson.kind === "capstone" ? "6 hr" : lesson.kind === "assignment" ? "3 hr" : "45 min",
    objective: lesson.objective,
    nextAction: next ? `Continue to ${next.title}` : "Claim your verified course certificate and link your Capstone Project Studio to Career OS.",
    WhyThisMatters: `Part of the ${spec.title} production verification path.`,
  }
}

export function getMultiTrackLessonBody(courseSlug: string, lessonId: string): string | undefined {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return undefined
  return TRACK_SPECS[courseSlug].lessons.find((l) => l.id === lessonId)?.body
}

export function getMultiTrackAssignment(courseSlug: string, lessonId: string): AssignmentBrief | undefined {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return undefined
  const spec = TRACK_SPECS[courseSlug]
  const lesson = spec.lessons.find((l) => l.id === lessonId)
  if (!lesson || (lesson.kind !== "assignment" && lesson.kind !== "capstone")) return undefined
  return {
    lessonId: lesson.id,
    title: lesson.title,
    scenario: lesson.body,
    deliverable: `A structured engineering specification (150–400 words) addressing ${lesson.title} on ${spec.datasetFilename}.`,
    steps: [
      `Inspect the scenario constraints and test vectors in ${spec.datasetFilename}.`,
      "State the primary failure mode or architectural risk and why naive implementations fail.",
      "Specify the concrete production design, validation rules, and verification checks.",
    ],
    rubric: [
      { criterion: "Technical accuracy & invariant design", detail: "Identifies the exact concurrency, leakage, grounding, or schema invariant required." },
      { criterion: "Verification & edge-case coverage", detail: "Includes concrete test assertions, thresholds, or failure recovery rules." },
      { criterion: "Executive clarity", detail: "Written clearly with actionable trade-offs and zero unverified claims." },
    ],
  }
}

export function getMultiTrackCareerEvidence(courseSlug: string, lessonId: string) {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return undefined
  const spec = TRACK_SPECS[courseSlug]
  if (lessonId !== "l6" && lessonId !== "l12" && lessonId !== "l14") return undefined
  const lesson = spec.lessons.find((l) => l.id === lessonId)
  if (!lesson) return undefined
  return {
    lessonId,
    artifact: lessonId === "l14" ? spec.capstoneArtifact : lesson.title,
    summary: lessonId === "l14" ? spec.capstoneSummary : lesson.objective,
    skillTags: spec.capstoneSkillTags,
  }
}

export function getMultiTrackDataset(courseSlug: string) {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return []
  const spec = TRACK_SPECS[courseSlug]
  return [{ filename: spec.datasetFilename, href: spec.datasetHref }]
}

export function getMultiTrackPracticePrompt(courseSlug: string, lessonId: string): string | null {
  if (!isMultiTrackAuthoredCourse(courseSlug) || lessonId !== "l3") return null
  return TRACK_SPECS[courseSlug].practicePromptL3
}

export function getMultiTrackQuiz(courseSlug: string, lessonId: string): DaQuizBank | undefined {
  if (!isMultiTrackAuthoredCourse(courseSlug)) return undefined
  if (lessonId !== "l3" && lessonId !== "l9" && lessonId !== "l15") return undefined
  const spec = TRACK_SPECS[courseSlug]
  const lesson = spec.lessons.find((l) => l.id === lessonId)!
  return {
    lessonId,
    title: lesson.title,
    passPercent: 75,
    questions: [
      {
        id: `${courseSlug}-${lessonId}-q1`,
        prompt: spec.practicePromptL3,
        options: [
          "Enforce a deterministic invariant (composite idempotency key / temporal cutoff / citation check) before committing output",
          "Rely on manual end-of-month spreadsheet inspection after the batch finishes",
          "Suppress all validation warnings so the job exits with code 0",
          "Skip schema validation to reduce CPU latency",
        ],
        correctIndex: 0,
        explanation: "Production systems enforce deterministic invariants at the boundary so corrupt or duplicate inputs never pollute downstream state.",
      },
      {
        id: `${courseSlug}-${lessonId}-q2`,
        prompt: `When verifying ${spec.title} changes in CI before deployment, which check provides the strongest release guarantee?`,
        options: [
          "Automated regression fixtures covering malformed inputs, boundary thresholds, and idempotent replays",
          "Visual inspection of a single happy-path console log",
          "Disabling strict type and schema checks in production builds",
          "Testing only against synthetic rows with zero edge cases",
        ],
        correctIndex: 0,
        explanation: "Automated regression fixtures covering malformed inputs and replay edge cases catch regressions before deployment.",
      },
    ],
  }
}
