import type { AssignmentBrief } from '../data-analytics/assignments'

const pasteNote =
  'This LMS records a text/code submission. Paste your complete, runnable Python script along with sample execution outputs and evaluation metrics. Follow production AI safety standards.'

export const GENAI_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Semantic Search Service — Knowledge Base Retrieval',
    scenario: 'Skylent Engineering operates an internal documentation wiki with hundreds of architecture decision records (ADRs). Standard keyword search fails when developers search conceptually (e.g. searching "how to handle server errors" fails to find "503 retry circuit breaker pattern").',
    objective: 'Build an end-to-end Python semantic search service using embedding models, vector indexing, and cosine similarity.',
    instructions: [
      'Implement a text chunker segmenting Markdown documents into 300-word chunks with 30-word overlap.',
      'Generate dense vector embeddings using an embedding model.',
      'Index chunks with metadata (doc_title, section, last_updated) into an in-memory or vector store.',
      'Implement top-k query retrieval with cosine similarity ranking.',
      'Provide search query evaluation tests verifying conceptual recall across 5 sample queries.',
    ],
    requiredOutput: [
      'Complete runnable Python source code.',
      'Chunking and vector indexing implementation.',
      'Query execution results comparing semantic matches against keyword baselines.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Chunking & Embeddings', weight: '35%', description: 'Document chunking preserves semantic boundaries with appropriate overlap.' },
      { criterion: 'Retrieval Accuracy', weight: '35%', description: 'Cosine ranking accurately returns relevant chunks for conceptual queries.' },
      { criterion: 'Code Quality', weight: '30%', description: 'Clean, type-annotated Python code with proper error handling.' },
    ],
  },
  l12: {
    id: 'l12',
    title: 'Autonomous Agent — Customer Support Triage Engine',
    scenario: 'Skylent Student Services receives thousands of daily student enquiries regarding course access, refund policies, and workshop schedules. You are tasked with building a safe, autonomous support triage agent equipped with deterministic tool calling.',
    objective: 'Build a multi-turn ReAct agent equipped with structured tool definitions (get_order_status, calculate_refund, escalate_to_faculty).',
    instructions: [
      'Define function calling tool schemas using Pydantic models.',
      'Implement tool execution handlers with validation and error catching.',
      'Build a ReAct agent loop that inspects tool calls, executes them, and feeds observations back to the LLM.',
      'Enforce a strict maximum iteration guard (max_steps=5) to prevent infinite loops.',
      'Demonstrate multi-turn resolution of a student enquiry involving checking eligibility and executing a refund.',
    ],
    requiredOutput: [
      'Complete runnable agent script with tool definitions.',
      'Execution trace log demonstrating reasoning, tool calling, and final synthesis.',
      'Safety guardrail implementation for invalid inputs and API timeouts.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Tool Schemas & Function Calling', weight: '30%', description: 'Tool schemas are strictly typed and handle unexpected parameters safely.' },
      { criterion: 'ReAct Agent Loop & Safety', weight: '40%', description: 'Agent executes reasoning loops cleanly with loop limits and state preservation.' },
      { criterion: 'Multi-turn Demonstration', weight: '30%', description: 'Clear trace output showing realistic problem resolution.' },
    ],
  },
  l14: {
    id: 'l14',
    title: 'Capstone — Enterprise Grounded RAG Assistant',
    scenario: 'You are delivering the capstone AI engineering deliverable: an enterprise RAG assistant that answers questions from company policy documents with mandatory citation grounding and automated RAGAS benchmark scores.',
    objective: 'Author a complete, production-grade RAG pipeline featuring hybrid retrieval, cross-encoder re-ranking, and automated evaluation metrics.',
    instructions: [
      'Build a two-stage retrieval pipeline: stage 1 retrieves top-20 candidates via hybrid search; stage 2 re-ranks to top-3 using a cross-encoder.',
      'Construct a hardened synthesis prompt injecting retrieved context with explicit XML delimiters and strict citation requirements.',
      'Implement an automated evaluation suite checking Faithfulness and Answer Relevance across at least 5 test cases.',
      'Provide a complete Markdown README documenting architecture, latency, and evaluation results.',
    ],
    requiredOutput: [
      'Complete modular Python code repository.',
      'Hybrid retrieval and re-ranking implementation.',
      'Automated evaluation scorecard demonstrating high faithfulness (>0.85).',
      'Technical architecture memo and deployment recommendations.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Retrieval Pipeline Depth', weight: '35%', description: 'Implementation of hybrid search and re-ranking for high-precision retrieval.' },
      { criterion: 'Grounding & Citations', weight: '35%', description: 'Strict citation adherence with zero ungrounded hallucinations.' },
      { criterion: 'Evaluation & Benchmarking', weight: '30%', description: 'Quantitative evaluation of pipeline performance using standard metrics.' },
    ],
  },
}

export function getGenAiAssignment(lessonId: string): AssignmentBrief | undefined {
  return GENAI_ASSIGNMENTS[lessonId]
}
