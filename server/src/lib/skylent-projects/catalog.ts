export const NORTHWIND_PROJECT_TYPE = "northwind-commercial-review" as const
export const NORTHWIND_PROJECT_COURSE = "data-analytics"
export const NORTHWIND_PROJECT_LAB = "northwind"

export const PROJECT_REFLECTION_MIN = 2
export const PROJECT_REFLECTION_MAX = 1500

export const PROJECT_TASK_KEYS = [
  "validate_data",
  "category_revenue",
  "monthly_trend",
  "finding",
  "why_it_matters",
  "recommendation",
] as const

export type ProjectTaskKey = string
export type ProjectStatus = "not_started" | "in_progress" | "saved" | "ready_to_review"
export type ProjectTaskStatus = "open" | "complete"
export type ProjectTool = "analysis" | "sql" | "evidence" | "reflection"
export type ReflectionField = "finding" | "whyItMatters" | "recommendation"

export type ProjectTaskDefinition = {
  key: ProjectTaskKey
  number: string
  title: string
  summary: string
  tool: ProjectTool
  toolLabel: string
  completion: "explicit" | "lab_work" | "reflection"
  reflectionField?: ReflectionField
  labMode?: "analysis" | "sql"
  exampleId?: "valid_rows" | "revenue_by_category" | "monthly_revenue"
  evidenceHint: string
}

export const NORTHWIND_PROJECT_DEF = {
  projectType: NORTHWIND_PROJECT_TYPE,
  courseSlug: NORTHWIND_PROJECT_COURSE,
  labSlug: NORTHWIND_PROJECT_LAB,
  title: "Northwind Commercial Review",
  goal: "Review the fictional Northwind sales extract and produce a concise, evidence-based commercial summary.",
  dataset: "northwind_sales.csv",
  disclaimer:
    "This is learner work on a fictional Northwind Retail extract. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Confirm the valid-row rule.",
    "Analyse revenue by category.",
    "Analyse a time trend.",
    "Identify one important finding.",
    "Explain why the finding matters.",
    "Write one recommendation supported by the data.",
  ],
  context:
    "Use the Northwind Lab to inspect the dataset and run queries. Attach the work you saved, then write the commercial summary in your own words. This brief does not contain the answer.",
  careerContext: "Data Analytics",
  careerSummary: "A practical analysis of a fictional Northwind sales extract.",
  workspaceHref: "/os/projects/data-analytics/northwind-commercial-review",
  courseTitle: "Data Analytics",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Finding",
    whyItMatters: "Why it matters",
    recommendation: "Recommendation",
  },
  reflectionHints: {
    finding: "What did the data show?",
    whyItMatters: "Why should someone care?",
    recommendation: "What action would you suggest based on the evidence?",
  },
  demonstratedWork: [
    "data validation",
    "SQL analysis",
    "category revenue analysis",
    "monthly trend analysis",
    "chart interpretation",
    "evidence-based recommendation",
  ],
  demonstratedSkills: ["SQL", "Data analysis", "Data interpretation", "Business communication"],
  careerEvidence: [
    { taskKey: "category_revenue", title: "Revenue by category" },
    { taskKey: "monthly_trend", title: "Monthly revenue" },
  ] as const,
  tasks: [
    {
      key: "validate_data",
      number: "01",
      title: "Validate the data",
      summary: "Confirm which rows count as valid sales before you interpret totals.",
      tool: "analysis",
      toolLabel: "Quick analysis / dataset",
      completion: "explicit",
      labMode: "analysis",
      evidenceHint: "Open the lab, inspect the valid-row rule, then mark this task complete.",
    },
    {
      key: "category_revenue",
      number: "02",
      title: "Analyse revenue by category",
      summary: "Run a category revenue query, inspect the table and chart, then attach the saved work.",
      tool: "sql",
      toolLabel: "Northwind SQL + Chart",
      completion: "lab_work",
      labMode: "sql",
      exampleId: "revenue_by_category",
      evidenceHint: "Attach saved Northwind SQL work that shows a category label and a numeric value.",
    },
    {
      key: "monthly_trend",
      number: "03",
      title: "Analyse monthly trend",
      summary: "Run a monthly revenue query, inspect the trend, then attach the saved work.",
      tool: "sql",
      toolLabel: "Northwind SQL + Chart",
      completion: "lab_work",
      labMode: "sql",
      exampleId: "monthly_revenue",
      evidenceHint: "Attach saved Northwind SQL work that shows a month or date label and a numeric value.",
    },
    {
      key: "finding",
      number: "04",
      title: "Identify a finding",
      summary: "What did the data show?",
      tool: "evidence",
      toolLabel: "Saved evidence",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Write one finding grounded in the work you attached.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Explain why it matters",
      summary: "Why should someone care?",
      tool: "reflection",
      toolLabel: "Reflection",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Explain the commercial implication of your finding.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Write a recommendation",
      summary: "What action would you suggest based on the evidence?",
      tool: "reflection",
      toolLabel: "Reflection",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Recommend one action a commercial lead could take next.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const HARBOR_DESK_PROJECT_TYPE = "harbor-desk-case" as const
export const HARBOR_DESK_PROJECT_COURSE = "product-management"

export const HARBOR_DESK_PROJECT_DEF = {
  projectType: HARBOR_DESK_PROJECT_TYPE,
  courseSlug: HARBOR_DESK_PROJECT_COURSE,
  labSlug: null,
  title: "Harbor Desk product case",
  goal: "Frame the Harbor Retail operations problem and recommend one constrained product bet, with a spec someone could implement.",
  dataset: "harbor-desk-case.md",
  disclaimer:
    "This is learner work on a fictional Harbor Retail operations case. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Read the Harbor Desk case notes.",
    "Frame the problem from store jobs, not from Gmail.",
    "Write the evidence-backed problem.",
    "Name the user job and outcome.",
    "Choose one bet under the six-week constraint.",
    "Write the recommendation / spec-level bet.",
  ],
  context:
    "Use the case notes in the course. There is no SQL lab on this project. Write the product case in your own words. This brief does not contain the answer.",
  careerContext: "Product Management",
  careerSummary: "A product case on a fictional Harbor Retail operations problem.",
  workspaceHref: "/os/projects/product-management/harbor-desk-case",
  courseTitle: "Product Management",
  caseHref: "/content/product-management/harbor-desk-case.md",
  reflectionLabels: {
    finding: "Problem and evidence",
    whyItMatters: "User job and outcome",
    recommendation: "The bet",
  },
  reflectionHints: {
    finding: "What problem did the case actually support?",
    whyItMatters: "Whose job gets easier, and how would you know?",
    recommendation: "Which one bet fits two engineers and six weeks — and what will you not build?",
  },
  demonstratedWork: [
    "interview synthesis",
    "problem framing",
    "prioritisation under a constraint",
    "thin specification",
    "evidence-based recommendation",
  ],
  demonstratedSkills: ["Product discovery", "Problem framing", "Prioritisation", "Business communication"],
  careerEvidence: [
    { taskKey: "finding", title: "Problem and evidence" },
    { taskKey: "recommendation", title: "Product bet" },
  ] as const,
  tasks: [
    {
      key: "read_case",
      number: "01",
      title: "Read the case",
      summary: "Open the Harbor Desk notes. Do not invent interviews.",
      tool: "evidence",
      toolLabel: "Case notes",
      completion: "explicit",
      evidenceHint: "Read harbor-desk-case.md, then mark this task complete.",
    },
    {
      key: "frame_problem",
      number: "02",
      title: "Frame the problem",
      summary: "Separate store jobs from the requested Gmail solution.",
      tool: "evidence",
      toolLabel: "Framing",
      completion: "explicit",
      evidenceHint: "Name the user and the job without saying inbox, then mark complete.",
    },
    {
      key: "finding",
      number: "03",
      title: "Write the problem and evidence",
      summary: "What did the notes and exception log actually show?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Cite quotes or exception IDs. Do not invent revenue.",
    },
    {
      key: "why_it_matters",
      number: "04",
      title: "Name the job and outcome",
      summary: "Whose work gets easier, and how would you know?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Write a job and a countable outcome.",
    },
    {
      key: "one_bet",
      number: "05",
      title: "Choose one bet",
      summary: "Pick one option under two engineers and six weeks.",
      tool: "evidence",
      toolLabel: "Prioritisation",
      completion: "explicit",
      evidenceHint: "Name the bet and a non-goal, then mark complete.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Write the recommendation",
      summary: "What should Harbor Retail do next, and what is out of scope?",
      tool: "reflection",
      toolLabel: "Product case",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Recommend one action that fits the constraint.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const PYTHON_PIPELINE_PROJECT_TYPE = "python-pipeline-audit" as const
export const PYTHON_PIPELINE_PROJECT_COURSE = "python-programming"

export const PYTHON_PIPELINE_PROJECT_DEF = {
  projectType: PYTHON_PIPELINE_PROJECT_TYPE,
  courseSlug: PYTHON_PIPELINE_PROJECT_COURSE,
  labSlug: null,
  title: "Python Transaction Pipeline & Anomaly Audit",
  goal: "Design and verify an idempotent Python settlement ingestion pipeline that quarantines malformed records and guarantees zero duplicate ledger postings.",
  dataset: "settlement_feed_2026_q2.jsonl",
  disclaimer:
    "This is learner work on a synthetic multi-gateway settlement feed scenario. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Define strict schema validators for incoming JSONL settlement rows.",
    "Design a composite idempotency key for duplicate webhook retries.",
    "Route corrupt rows to a dead-letter quarantine log with explicit reason codes.",
    "Document the failure modes and quarantine findings.",
    "Explain the financial reconciliation impact.",
    "Specify the production CLI architecture and pytest suite.",
  ],
  context:
    "A regional commerce platform ingests 45,000 nightly settlement events across four payment gateways. Write your pipeline audit and architecture specification in your own words.",
  careerContext: "Python Engineering",
  careerSummary: "An idempotent Python settlement pipeline and anomaly audit specification.",
  workspaceHref: "/os/projects/python-programming/python-pipeline-audit",
  courseTitle: "Python Programming & Automation",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Pipeline failure modes & quarantine design",
    whyItMatters: "Idempotency & reconciliation impact",
    recommendation: "Production CLI & pytest architecture",
  },
  reflectionHints: {
    finding: "Which malformed rows, duplicate retries, and FX gaps must be quarantined?",
    whyItMatters: "How do silent row drops or double-counting corrupt downstream finance ledgers?",
    recommendation: "Specify your composite deduplication key, quarantine reason codes, and pytest assertions.",
  },
  demonstratedWork: [
    "schema validation",
    "idempotent deduplication",
    "dead-letter quarantine",
    "pytest test design",
    "operational runbook writing",
  ],
  demonstratedSkills: ["Python", "ETL Pipelines", "Pytest", "Data Engineering"],
  careerEvidence: [
    { taskKey: "finding", title: "Pipeline failure modes & quarantine design" },
    { taskKey: "recommendation", title: "Production CLI & pytest architecture" },
  ] as const,
  tasks: [
    {
      key: "py_ingest_schema",
      number: "01",
      title: "Define the strict ingestion schema",
      summary: "Specify required fields, types, and decimal precision rules for incoming JSONL settlement events.",
      tool: "evidence",
      toolLabel: "Schema contract",
      completion: "explicit",
      evidenceHint: "Verify your field validation rules against Module 2, then mark complete.",
    },
    {
      key: "py_dedup_key",
      number: "02",
      title: "Design the idempotent deduplication key",
      summary: "Prevent duplicate webhook retries from double-crediting merchant balances across multi-batch runs.",
      tool: "evidence",
      toolLabel: "Idempotency design",
      completion: "explicit",
      evidenceHint: "Confirm how latest-timestamp wins and duplicate hashes are logged, then mark complete.",
    },
    {
      key: "py_quarantine_log",
      number: "03",
      title: "Build the dead-letter quarantine sink",
      summary: "Route rows with missing currency codes or negative fee amounts to quarantine_rows.jsonl.",
      tool: "evidence",
      toolLabel: "Quarantine sink",
      completion: "explicit",
      evidenceHint: "Ensure zero silent drops on corrupt rows, then mark complete.",
    },
    {
      key: "finding",
      number: "04",
      title: "Document failure modes & quarantine rules",
      summary: "Which malformed rows and duplicate webhook retries must be intercepted?",
      tool: "reflection",
      toolLabel: "Engineering audit",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Write the anomaly patterns and quarantine reason codes.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Quantify reconciliation & ledger impact",
      summary: "Why do silent drops or non-idempotent retries break finance operations?",
      tool: "reflection",
      toolLabel: "Engineering audit",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Explain the downstream ledger integrity impact.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Specify CLI runbook & pytest suite",
      summary: "What production CLI flags and pytest fixtures guarantee safe nightly execution?",
      tool: "reflection",
      toolLabel: "Engineering audit",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Detail the composite key, exit codes, and pytest regression matrix.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const CHURN_VALIDATION_PROJECT_TYPE = "churn-cohort-validation" as const
export const CHURN_VALIDATION_PROJECT_COURSE = "data-science-ai"

export const CHURN_VALIDATION_PROJECT_DEF = {
  projectType: CHURN_VALIDATION_PROJECT_TYPE,
  courseSlug: CHURN_VALIDATION_PROJECT_COURSE,
  labSlug: null,
  title: "Customer Churn Cohort & Out-of-Time Validation Case",
  goal: "Audit a leaky churn classifier, rebuild a point-in-time valid evaluation split, and align model thresholds with retention ROI.",
  dataset: "subscription_cohorts_2026.csv",
  disclaimer:
    "This is learner work on a synthetic B2B SaaS churn cohort scenario. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Establish a strict out-of-time temporal train/validation/test split.",
    "Eliminate post-cancellation target leakage features.",
    "Align the decision threshold with weekly 500-account outreach capacity.",
    "Document the target leakage audit findings.",
    "Quantify the Precision@Top-500 retention ROI impact.",
    "Specify the calibration and PSI drift monitoring playbook.",
  ],
  context:
    "A B2B SaaS growth team wants to deploy a churn model that scored 0.96 ROC-AUC on a random split, but failed in live shadow testing under a 500-call/week retention capacity limit.",
  careerContext: "Data Science & AI",
  careerSummary: "An out-of-time churn model validation, leakage audit, and calibration playbook.",
  workspaceHref: "/os/projects/data-science-ai/churn-cohort-validation",
  courseTitle: "Data Science & AI",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Target leakage audit & temporal split",
    whyItMatters: "Precision@Top-500 & retention ROI",
    recommendation: "Calibration & PSI drift playbook",
  },
  reflectionHints: {
    finding: "Which post-event features caused the fake 0.96 random-split ROC-AUC?",
    whyItMatters: "How much retention budget is wasted when uncalibrated scores target the wrong decile?",
    recommendation: "Specify the out-of-time cutoff rule, uplift threshold, and PSI drift alert SLA.",
  },
  demonstratedWork: [
    "temporal validation",
    "target leakage auditing",
    "precision-at-k optimization",
    "probability calibration",
    "drift monitoring design",
  ],
  demonstratedSkills: ["Machine Learning", "Model Validation", "Feature Engineering", "Decision Science"],
  careerEvidence: [
    { taskKey: "finding", title: "Target leakage audit & temporal split" },
    { taskKey: "recommendation", title: "Calibration & PSI drift playbook" },
  ] as const,
  tasks: [
    {
      key: "ds_cohort_split",
      number: "01",
      title: "Establish the out-of-time temporal split",
      summary: "Replace random k-fold splitting with a strict point-in-time train/validation/test calendar boundary.",
      tool: "evidence",
      toolLabel: "Temporal validation",
      completion: "explicit",
      evidenceHint: "Confirm zero overlap between training observation windows and test outcome windows, then mark complete.",
    },
    {
      key: "ds_leakage_audit",
      number: "02",
      title: "Eliminate post-event target leakage",
      summary: "Strip features updated after cancellation intent is registered and recompute rolling 7d/30d ratios.",
      tool: "evidence",
      toolLabel: "Leakage audit",
      completion: "explicit",
      evidenceHint: "Verify every feature timestamp precedes the prediction cutoff, then mark complete.",
    },
    {
      key: "ds_precision_at_k",
      number: "03",
      title: "Optimize Precision@Top-500 for retention capacity",
      summary: "Align the decision threshold with the weekly 500-account outreach capacity constraint.",
      tool: "evidence",
      toolLabel: "Decision threshold",
      completion: "explicit",
      evidenceHint: "Compute expected net retention value at Top-500 capacity, then mark complete.",
    },
    {
      key: "finding",
      number: "04",
      title: "Document leakage audit & temporal split",
      summary: "Which leaky features inflated the random split and how is the temporal cutoff defined?",
      tool: "reflection",
      toolLabel: "Validation memo",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Name the leaky features and the point-in-time feature window.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Explain Precision@Top-500 & ROI impact",
      summary: "Why does top-decile ranking precision matter more than global ROC-AUC here?",
      tool: "reflection",
      toolLabel: "Validation memo",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Connect outreach capacity and discount cost to net LTV retained.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Specify calibration & PSI drift governance",
      summary: "How should probabilities be calibrated and monitored in production?",
      tool: "reflection",
      toolLabel: "Validation memo",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "State the calibration method, PSI threshold, and retraining trigger.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const GENAI_RAG_PROJECT_TYPE = "enterprise-rag-evaluation" as const
export const GENAI_RAG_PROJECT_COURSE = "generative-ai"

export const GENAI_RAG_PROJECT_DEF = {
  projectType: GENAI_RAG_PROJECT_TYPE,
  courseSlug: GENAI_RAG_PROJECT_COURSE,
  labSlug: null,
  title: "Enterprise Policy RAG Grounding & Citation Audit",
  goal: "Architect and evaluate a citation-grounded enterprise policy RAG assistant with zero ungrounded claims and bounded p95 latency.",
  dataset: "enterprise_policy_corpus_v2.json",
  disclaimer:
    "This is learner work on a synthetic enterprise policy RAG scenario. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Design section-aware document chunking with policy metadata.",
    "Combine BM25 lexical search with dense vector retrieval and reranking.",
    "Enforce JSON-schema citation verification and deterministic abstention.",
    "Document retrieval failure modes and faithfulness findings.",
    "Explain hallucination compliance risks.",
    "Specify the hybrid RAG architecture, security guardrails, and token FinOps plan.",
  ],
  context:
    "An enterprise operations team needs an internal policy assistant over 1,400 SOP and compliance documents without fabricated SLA exceptions.",
  careerContext: "Generative AI & LLM Systems",
  careerSummary: "An enterprise RAG architecture, citation verification, and LLM evaluation specification.",
  workspaceHref: "/os/projects/generative-ai/enterprise-rag-evaluation",
  courseTitle: "Generative AI & LLM Systems",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Retrieval failure modes & faithfulness audit",
    whyItMatters: "Hallucination risk & compliance impact",
    recommendation: "Hybrid RAG architecture, guardrails & FinOps",
  },
  reflectionHints: {
    finding: "Where did naive fixed-token chunking split policy tables and cause ungrounded answers?",
    whyItMatters: "What is the compliance and operational cost of fabricated citations in enterprise workflows?",
    recommendation: "Specify your heading-aware chunking, BM25+vector reranking, abstention rule, and model routing budget.",
  },
  demonstratedWork: [
    "section-aware chunking",
    "hybrid BM25 + vector retrieval",
    "citation grounding verification",
    "prompt-injection defense",
    "LLM evaluation harness design",
  ],
  demonstratedSkills: ["RAG Architecture", "LLM Evaluation", "Prompt Engineering", "AI Security"],
  careerEvidence: [
    { taskKey: "finding", title: "Retrieval failure modes & faithfulness audit" },
    { taskKey: "recommendation", title: "Hybrid RAG architecture, guardrails & FinOps" },
  ] as const,
  tasks: [
    {
      key: "ai_chunking_policy",
      number: "01",
      title: "Design section-aware document chunking",
      summary: "Preserve markdown headings, policy clause IDs, and effective-date metadata across every indexed chunk.",
      tool: "evidence",
      toolLabel: "Indexing spec",
      completion: "explicit",
      evidenceHint: "Confirm tables and exception clauses stay intact with parent metadata, then mark complete.",
    },
    {
      key: "ai_hybrid_retrieval",
      number: "02",
      title: "Configure hybrid BM25 + dense retrieval",
      summary: "Fuse exact clause keyword matching with semantic vector search and cross-encoder reranking.",
      tool: "evidence",
      toolLabel: "Hybrid retrieval",
      completion: "explicit",
      evidenceHint: "Verify Recall@5 improvement on exact policy codes, then mark complete.",
    },
    {
      key: "ai_citation_verifier",
      number: "03",
      title: "Enforce citation verification & abstention",
      summary: "Require JSON-schema responses with [doc_id, section_id] citations and deterministic abstention.",
      tool: "evidence",
      toolLabel: "Grounding verifier",
      completion: "explicit",
      evidenceHint: "Confirm unsupported claims trigger a safe fallback response, then mark complete.",
    },
    {
      key: "finding",
      number: "04",
      title: "Document retrieval & grounding failures",
      summary: "Why did fixed-window vector retrieval fail on multi-page policy tables?",
      tool: "reflection",
      toolLabel: "AI systems audit",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Describe the chunk boundary and lexical mismatch failures.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Assess compliance & hallucination risk",
      summary: "Why are unverified citations unacceptable in enterprise policy and support tools?",
      tool: "reflection",
      toolLabel: "AI systems audit",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Explain the auditability, trust, and SLA escalation consequences.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Specify RAG eval gate & token FinOps",
      summary: "What evaluation thresholds, injection guardrails, and model routing rules govern release?",
      tool: "reflection",
      toolLabel: "AI systems audit",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Detail Recall@5/Faithfulness gates, prompt isolation, and tiered model routing.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const FULLSTACK_LEDGER_PROJECT_TYPE = "idempotent-ledger-architecture" as const
export const FULLSTACK_LEDGER_PROJECT_COURSE = "full-stack-web"

export const FULLSTACK_LEDGER_PROJECT_DEF = {
  projectType: FULLSTACK_LEDGER_PROJECT_TYPE,
  courseSlug: FULLSTACK_LEDGER_PROJECT_COURSE,
  labSlug: null,
  title: "Full-Stack Idempotent Wallet & Webhook Spec",
  goal: "Specify and verify a production full-stack wallet and payment-webhook subsystem with transactional PostgreSQL guarantees and accessible React state handling.",
  dataset: "wallet_ledger_spec_v1.sql",
  disclaimer:
    "This is learner work on a synthetic full-stack wallet architecture scenario. It is not a certificate, not employer-validated, and not published.",
  brief: [
    "Model the append-only transactional ledger with composite unique idempotency keys.",
    "Enforce Zod request/response contracts at the Express API boundary.",
    "Harden session auth, CSRF protection, and RBAC ownership checks.",
    "Document concurrency and webhook race-condition findings.",
    "Explain ledger integrity and security boundary impact.",
    "Specify the transactional schema, API contracts, and resilient React UI states.",
  ],
  context:
    "Concurrent payment webhooks and flaky mobile networks require strict idempotency from PostgreSQL/Prisma transactions up to React UI state transitions.",
  careerContext: "Full Stack Web Engineering",
  careerSummary: "A full-stack transactional wallet ledger, webhook idempotency, and security architecture specification.",
  workspaceHref: "/os/projects/full-stack-web/idempotent-ledger-architecture",
  courseTitle: "Full Stack Web Engineering",
  caseHref: null as string | null,
  reflectionLabels: {
    finding: "Concurrency & webhook race-condition audit",
    whyItMatters: "Ledger integrity & security boundary impact",
    recommendation: "Transactional schema, API contract & UI spec",
  },
  reflectionHints: {
    finding: "How do concurrent webhook retries or read-then-write balance updates cause double-credits?",
    whyItMatters: "What is the risk of missing idempotency keys, unvalidated JSON bodies, or client-only role checks?",
    recommendation: "Detail your prisma.$transaction ledger design, Zod schemas, CSRF/RBAC middleware, and React rollback states.",
  },
  demonstratedWork: [
    "transactional database modelling",
    "idempotent webhook handling",
    "Zod API contract validation",
    "RBAC and CSRF security hardening",
    "resilient React state design",
  ],
  demonstratedSkills: ["TypeScript", "React", "Express & Node.js", "PostgreSQL & Prisma"],
  careerEvidence: [
    { taskKey: "finding", title: "Concurrency & webhook race-condition audit" },
    { taskKey: "recommendation", title: "Transactional schema, API contract & UI spec" },
  ] as const,
  tasks: [
    {
      key: "fs_schema_constraints",
      number: "01",
      title: "Model the append-only transactional ledger",
      summary: "Define ElixirWallet and ElixirTransaction tables with @@unique([userId, idempotencyKey]).",
      tool: "evidence",
      toolLabel: "Database schema",
      completion: "explicit",
      evidenceHint: "Confirm balance updates and ledger inserts execute inside a single atomic DB transaction, then mark complete.",
    },
    {
      key: "fs_zod_contracts",
      number: "02",
      title: "Enforce Zod request & response contracts",
      summary: "Validate params, query filters, and JSON bodies at the Express route boundary.",
      tool: "evidence",
      toolLabel: "API contracts",
      completion: "explicit",
      evidenceHint: "Verify malformed payloads are rejected with 400/422 before touching Prisma, then mark complete.",
    },
    {
      key: "fs_rbac_csrf",
      number: "03",
      title: "Harden session auth, CSRF, and RBAC middleware",
      summary: "Protect state-mutating routes with requireAuth, requireCsrf, and server-side ownership checks.",
      tool: "evidence",
      toolLabel: "Security middleware",
      completion: "explicit",
      evidenceHint: "Confirm cross-user IDOR and missing CSRF tokens return 403, then mark complete.",
    },
    {
      key: "finding",
      number: "04",
      title: "Audit concurrency & webhook race conditions",
      summary: "Where do read-then-write balance updates and parallel webhooks fail under load?",
      tool: "reflection",
      toolLabel: "System architecture",
      completion: "reflection",
      reflectionField: "finding",
      evidenceHint: "Explain the race window and duplicate delivery failure modes.",
    },
    {
      key: "why_it_matters",
      number: "05",
      title: "Explain ledger & security boundary impact",
      summary: "Why must idempotency and authorization be enforced in PostgreSQL and Express rather than React?",
      tool: "reflection",
      toolLabel: "System architecture",
      completion: "reflection",
      reflectionField: "whyItMatters",
      evidenceHint: "Connect DB invariants and server RBAC to financial and tenant safety.",
    },
    {
      key: "recommendation",
      number: "06",
      title: "Write the full-stack architecture specification",
      summary: "How do Prisma transactions, P2002 replay handling, and React UI states work together?",
      tool: "reflection",
      toolLabel: "System architecture",
      completion: "reflection",
      reflectionField: "recommendation",
      evidenceHint: "Specify the transaction flow, webhook handler, and accessible UI error recovery.",
    },
  ] satisfies ProjectTaskDefinition[],
} as const

export const PROJECT_DEFS = [
  NORTHWIND_PROJECT_DEF,
  HARBOR_DESK_PROJECT_DEF,
  PYTHON_PIPELINE_PROJECT_DEF,
  CHURN_VALIDATION_PROJECT_DEF,
  GENAI_RAG_PROJECT_DEF,
  FULLSTACK_LEDGER_PROJECT_DEF,
] as const

export function findProjectDefinition(projectType: string) {
  return PROJECT_DEFS.find((row) => row.projectType === projectType) ?? null
}

export function findProjectByCourse(courseSlug: string) {
  return PROJECT_DEFS.find((row) => row.courseSlug === courseSlug) ?? null
}

export function findProjectTask(projectType: string, taskKey: string) {
  const definition = findProjectDefinition(projectType)
  return definition?.tasks.find((task) => task.key === taskKey) ?? null
}

export function isProjectTaskKey(value: string): boolean {
  return PROJECT_DEFS.some((definition) => definition.tasks.some((task) => task.key === value))
}

export function projectWorkspacePath(courseSlug: string, projectType: string) {
  return `/os/projects/${courseSlug}/${projectType}`
}
