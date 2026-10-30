export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

export const GENAI_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'Semantic vector retrieval and knowledge base indexing',
    artifact: 'Production semantic search engine with metadata filtering',
    skill: 'Generative AI, Vector Embeddings, Semantic Search, HNSW Indexing',
    evidence: 'A reviewer can verify top-k precision and latency across conceptual queries',
  },
  {
    lessonId: 'l12',
    learning: 'Autonomous ReAct agent workflows and structured tool calling',
    artifact: 'Multi-turn support triage agent with deterministic tool execution',
    skill: 'AI Agents, Function Calling, ReAct Loop, Pydantic Schema Validation',
    evidence: 'A reviewer can inspect tool execution traces and safety loop termination guards',
  },
  {
    lessonId: 'l14',
    learning: 'Enterprise hybrid RAG architecture and quantitative evaluation',
    artifact: 'Two-stage grounded RAG assistant with automated RAGAS benchmark scorecard',
    skill: 'RAG Architecture, Cross-Encoder Re-Ranking, Hallucination Prevention, RAGAS Evaluation',
    evidence: 'A complete GitHub repository with quantitative faithfulness scores and citation verification',
  },
]
