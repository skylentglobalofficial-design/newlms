/**
 * Self-contained server-side fallback quiz banks for multi-track courses
 * (python-programming, data-science-ai, generative-ai, full-stack-web)
 * when QuizQuestion rows have not yet been seeded in PostgreSQL.
 */
export type ServerQuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const TRACK_QUIZ_BANKS: Record<string, ServerQuizQuestion[]> = {
  "python-programming": [
    {
      question: "When ingesting a nightly JSONL settlement feed that may contain duplicate webhook retries and negative fee rows, what is the safest ETL design?",
      options: [
        "Enforce a composite idempotency key (gateway_tx_id, settlement_epoch) and route negative-fee or malformed rows to a dead-letter quarantine table",
        "Drop the entire settlement batch whenever a single malformed line is encountered",
        "Mutate negative fees to zero silently without logging or quarantining the record",
        "Disable schema validation in production to maximize ingestion throughput",
      ],
      correctIndex: 0,
      explanation: "Composite idempotency keys prevent double-crediting on retries while dead-letter quarantine isolates bad rows without halting valid settlements.",
    },
    {
      question: "Which pytest verification pattern provides the strongest guarantee for a financial data cleaning pipeline?",
      options: [
        "Deterministic fixtures testing valid rows, duplicate composite keys, negative fees, and malformed JSON lines",
        "Testing only a single happy-path row in manual interactive mode",
        "Catching all exceptions with a bare except: pass block",
        "Skipping type and boundary checks on numeric minor-unit amounts",
      ],
      correctIndex: 0,
      explanation: "Testing boundary conditions, duplicate replays, and malformed records ensures the pipeline behaves deterministically under production faults.",
    },
    {
      question: "Why should monetary values in Python settlement pipelines be stored and aggregated as integer minor units (paise/cents) rather than IEEE 754 floats?",
      options: [
        "Binary floating-point representation introduces rounding drift (e.g. 0.1 + 0.2 != 0.3) that corrupts ledger reconciliation",
        "Integer arithmetic is slower but uses less network bandwidth",
        "Python does not support division on floating-point numbers",
        "Floating-point numbers cannot be serialized to JSON",
      ],
      correctIndex: 0,
      explanation: "Integer minor units (or exact Decimal types) eliminate binary floating-point rounding drift across multi-row ledger aggregations.",
    },
  ],
  "data-science-ai": [
    {
      question: "When training and evaluating a customer churn model for a weekly 500-account retention outreach queue, how do you prevent target leakage?",
      options: [
        "Enforce a strict chronological cutoff date and strip any post-cutoff or cancellation-triggered features before training",
        "Use a random 80/20 train-test split across all historical and future timestamps",
        "Include exit-survey and winback-email features to boost training accuracy to 99%",
        "Optimize global ROC-AUC instead of Precision@Top-500 capacity",
      ],
      correctIndex: 0,
      explanation: "Chronological out-of-time splits and stripping post-event features prevent future information from leaking into historical training windows.",
    },
    {
      question: "If your Customer Success team can only contact 500 accounts per week, which evaluation metric directly measures operational ROI?",
      options: [
        "Precision@500 and expected net ARR saved within the Top-500 ranked cohort",
        "Accuracy across all 50,000 non-churning accounts",
        "Training loss on the first epoch",
        "R-squared on unnormalized account IDs",
      ],
      correctIndex: 0,
      explanation: "When intervention capacity is fixed at K=500, Precision@K determines how many outreach slots reach true churners.",
    },
    {
      question: "Before joining order headers with line-item details in SQL for cohort feature engineering, what must you verify first?",
      options: [
        "Table grain and primary uniqueness so 1-to-many joins do not fan out and inflate customer spend",
        "That column names are sorted alphabetically",
        "That all text columns are converted to uppercase",
        "That foreign keys are dropped before running SELECT",
      ],
      correctIndex: 0,
      explanation: "Verifying table grain prevents join fan-out from multiplying revenue or order counts per customer.",
    },
  ],
  "generative-ai": [
    {
      question: "How should an enterprise policy RAG assistant behave when the highest retrieved chunk relevance score is below the confidence threshold (0.72)?",
      options: [
        "Abstain from guessing and state clearly that the retrieved policy documents do not contain a verified answer",
        "Hallucinate a plausible policy rule based on general pre-training knowledge",
        "Lower the relevance threshold to 0.0 automatically so every query gets an answer",
        "Return the raw database connection string to the user",
      ],
      correctIndex: 0,
      explanation: "Deterministic abstention when retrieval confidence is below threshold prevents ungrounded hallucinations on high-stakes policy questions.",
    },
    {
      question: "What is required for a candidate RAG response to pass citation grounding verification?",
      options: [
        "Every factual claim must cite an explicit [doc_id, section_id] present in the retrieved context and pass indirect prompt-injection checks",
        "The response must be longer than 500 words regardless of source documents",
        "The response must execute instructions found inside untrusted user-uploaded text",
        "Citations can reference any invented document ID as long as it looks formatted",
      ],
      correctIndex: 0,
      explanation: "Verifying that cited [doc_id, section_id] tags exist in the retrieved context guarantees traceability and blocks fabricated citations.",
    },
    {
      question: "Why must retrieved document chunks be scanned for adversarial instructions (e.g. 'ignore previous instructions') before synthesis?",
      options: [
        "Untrusted documents can carry indirect prompt injections that hijack the system prompt or exfiltrate context",
        "Scanning chunks increases token temperature",
        "Adversarial strings cause SQL syntax errors in vector indexes",
        "LLM tokenizers cannot encode the word 'ignore'",
      ],
      correctIndex: 0,
      explanation: "Indirect prompt injection embeds malicious directives inside retrieved content; input/context guardrails neutralize them before generation.",
    },
  ],
  "full-stack-web": [
    {
      question: "When a payment gateway delivers 3 concurrent webhook retries for the same transaction, how do you prevent triple-crediting the user's wallet?",
      options: [
        "Enforce a database-level composite unique constraint @@unique([userId, idempotencyKey]) inside an atomic transaction and treat P2002 as an idempotent no-op",
        "Check if the key exists in an in-memory JavaScript array before running INSERT without a transaction",
        "Use setTimeout() to delay webhook processing by 500ms",
        "Trust the client browser to send only one POST request",
      ],
      correctIndex: 0,
      explanation: "Only a database-level unique constraint inside an atomic transaction guarantees idempotency under concurrent parallel requests.",
    },
    {
      question: "How should a ledger spend endpoint handle a request that would push a user's balance below 0?",
      options: [
        "Roll back the transaction atomically and return HTTP 409 Conflict (Insufficient balance) without mutating any row",
        "Allow the balance to go negative and fix it in a weekly cron job",
        "Return HTTP 200 OK and silently ignore the spend amount",
        "Delete the user account when balance reaches zero",
      ],
      correctIndex: 0,
      explanation: "Atomic rollback with a 409 Conflict preserves the non-negative ledger invariant under concurrent spend attempts.",
    },
    {
      question: "Why must state-mutating cookie-authenticated POST/PATCH/DELETE routes verify a CSRF token?",
      options: [
        "To prevent cross-site pages from forged state-changing requests using the browser's automatically attached session cookie",
        "To compress JSON request payloads over HTTPS",
        "To replace PostgreSQL indexes on the Session table",
        "To allow unauthenticated users to bypass role checks",
      ],
      correctIndex: 0,
      explanation: "CSRF verification ensures that state-mutating requests originate from your trusted frontend origin rather than a third-party site.",
    },
  ],
}

export function getServerAuthoredQuiz(courseSlug?: string, lessonKey?: string): ServerQuizQuestion[] | null {
  if (!courseSlug || !lessonKey) return null
  if (lessonKey !== "l3" && lessonKey !== "l9" && lessonKey !== "l15") return null
  return TRACK_QUIZ_BANKS[courseSlug] ?? null
}
