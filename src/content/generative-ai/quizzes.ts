export type GenAiQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  lessonId: string
  moduleId: string
}

export type GenAiQuizBank = {
  lessonId: string
  title: string
  questions: GenAiQuizQuestion[]
}

export const GENAI_QUIZZES: Record<string, GenAiQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Prompt Engineering Check',
    questions: [
      {
        id: 'genai-l3-q1',
        prompt: 'What happens to LLM output behavior when setting temperature=0.0?',
        options: [
          'The model generates completely random output tokens',
          'The model deterministically selects the token with the highest log-probability (greedy sampling)',
          'The model refuses to generate any text',
          'The context window limit is halved',
        ],
        correctIndex: 1,
        explanation: 'Temperature scales the logits before softmax. At temperature=0, the model acts deterministically, always picking the argmax highest-probability token.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'genai-l3-q2',
        prompt: 'Why are XML delimiters (e.g. <context>...</context>) effective in preventing indirect prompt injection in RAG prompts?',
        options: [
          'They compile the prompt into binary bytecode',
          'They provide clear structural boundaries separating system instructions from untrusted external document text',
          'They automatically encrypt the prompt payload',
          'They reduce the token count by 50%',
        ],
        correctIndex: 1,
        explanation: 'Delimiters establish unambiguous structural boundaries so the model treats retrieved text strictly as passive data rather than executable instructions.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'genai-l3-q3',
        prompt: 'What is the primary trade-off between Few-Shot in-context learning and zero-shot prompting?',
        options: [
          'Few-shot consumes more input tokens and context window space, but provides significantly higher formatting consistency and task accuracy',
          'Few-shot requires retraining the model weights',
          'Zero-shot is completely deterministic while few-shot is always random',
          'Few-shot only works with open-source models',
        ],
        correctIndex: 0,
        explanation: 'Few-shot prompts include input-output exemplars. While this increases token latency and cost, it dramatically improves compliance on complex tasks.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'genai-l3-q4',
        prompt: 'In BPE (Byte Pair Encoding) tokenization, how are common words versus rare words handled?',
        options: [
          'All words are always mapped to exactly one token',
          'Common words are single tokens, while rare words or misspellings are broken down into subword or byte-level tokens',
          'Rare words are completely discarded by the tokenizer',
          'Numbers are converted to letters',
        ],
        correctIndex: 1,
        explanation: 'BPE uses frequency-based subword merging: frequent words (like "the") are 1 token; rare or domain words are split into subword fragments.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'genai-l3-q5',
        prompt: 'What is top_p (nucleus sampling)?',
        options: [
          'Sampling exclusively from the top 5 tokens',
          'Restricting token candidates to the smallest subset whose cumulative probability exceeds probability p',
          'The maximum number of tokens allowed in the response',
          'A penalty applied to repeating words',
        ],
        correctIndex: 1,
        explanation: 'Nucleus sampling dynamically truncates the probability distribution tail, selecting only from the smallest set of tokens summing to probability p.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'RAG Architecture Check',
    questions: [
      {
        id: 'genai-l9-q1',
        prompt: 'Why is chunk overlap (e.g. 500 token chunks with 50 token overlap) critical when segmenting documents for vector search?',
        options: [
          'It doubles the speed of vector search engines',
          'It prevents critical semantic context from being sliced in half across chunk boundaries',
          'It compresses the document storage size',
          'It is required by the HNSW indexing algorithm',
        ],
        correctIndex: 1,
        explanation: 'Without overlap, key information or sentences split across a chunk boundary lose semantic coherence, causing retrieval misses.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'genai-l9-q2',
        prompt: 'Why is a two-stage retrieval pipeline (BM25 keyword search + dense vector search followed by a cross-encoder re-ranker) superior to pure vector search?',
        options: [
          'Cross-encoders evaluate the full query-document interaction simultaneously, providing substantially higher precision ranking than independent bi-encoder cosine similarity',
          'Cross-encoders run 10x faster than vector search',
          'BM25 eliminates the need for any embedding model',
          'Vector search cannot search English text',
        ],
        correctIndex: 0,
        explanation: 'Bi-encoders encode queries and documents independently for fast retrieval. Cross-encoders examine query and document tokens together, providing far more accurate relevance scoring at re-ranking time.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'genai-l9-q3',
        prompt: 'What causes the "lost in the middle" phenomenon in large context windows?',
        options: [
          'The model crashes if context exceeds 2000 tokens',
          'LLMs recall information located at the very beginning and very end of long prompts significantly better than information in the middle',
          'Vector databases sort results randomly',
          'Middle tokens are erased during attention pooling',
        ],
        correctIndex: 1,
        explanation: 'Research demonstrates models exhibit a U-shaped performance curve in long contexts: facts buried in the middle of long stuffed contexts have lower retrieval recall.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'genai-l9-q4',
        prompt: 'When should you choose RAG over Fine-Tuning an LLM?',
        options: [
          'When you need the model to learn a completely new writing tone or syntax',
          'When you need dynamic, up-to-date factual knowledge, precise source citations, and access-controlled enterprise documentation',
          'When you have zero documents available',
          'When latency must be under 5 milliseconds',
        ],
        correctIndex: 1,
        explanation: 'RAG is designed for factual knowledge retrieval and source citation without re-training costs. Fine-tuning teaches style, format, or narrow domain vocabulary.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'genai-l9-q5',
        prompt: 'What does a HNSW (Hierarchical Navigable Small World) index provide in a vector database?',
        options: [
          'Exact linear scanning of all vectors in O(N) time',
          'Sub-linear approximate nearest neighbor search by constructing multi-layer graphs of vectors',
          'Automatic text translation into 50 languages',
          'Lossless compression of text documents',
        ],
        correctIndex: 1,
        explanation: 'HNSW is the industry-standard approximate nearest neighbors (ANN) graph algorithm, delivering fast sub-linear search latency across millions of dense vectors.',
        lessonId: 'l5',
        moduleId: 'm2',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Generative AI Final Check',
    questions: [
      {
        id: 'genai-l15-q1',
        prompt: 'In RAG evaluation frameworks (such as RAGAS), what does the "Faithfulness" metric quantify?',
        options: [
          'The word count of the generated response',
          'Whether all factual claims made in the LLM response can be directly inferred from the retrieved context without hallucination',
          'How fast the embedding API returned results',
          'Whether the user clicked the thumbs-up button',
        ],
        correctIndex: 1,
        explanation: 'Faithfulness measures grounding: dividing the number of claims supported by the retrieved context by total claims made. A score of 1.0 means zero ungrounded hallucinations.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'genai-l15-q2',
        prompt: 'In an autonomous ReAct agent loop, what safety guardrail prevents infinite loops when an external API tool keeps returning errors?',
        options: [
          'A maximum iteration limit (e.g. max_steps=5) and a hard execution timeout',
          'Retrying indefinitely until the API recovers',
          'Increasing model temperature to 1.5',
          'Disabling JSON schema validation',
        ],
        correctIndex: 0,
        explanation: 'Production agent loops must have strict loop boundary conditions (max iterations and timeouts) to avoid infinite loops and runaway API costs.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'genai-l15-q3',
        prompt: 'Why is structured output mode (Function Calling / JSON schema constraints) essential for LLM agents interacting with backend databases?',
        options: [
          'It forces the model to write SQL queries in lowercase',
          'It guarantees the LLM outputs strictly parseable, schema-compliant arguments matching expected API function signatures',
          'It prevents the model from generating numbers',
          'It doubles context window memory',
        ],
        correctIndex: 1,
        explanation: 'Unconstrained text often includes conversational preamble or markdown backticks that break downstream parsers. Structured outputs guarantee valid arguments.',
        lessonId: 'l10',
        moduleId: 'm4',
      },
      {
        id: 'genai-l15-q4',
        prompt: 'What is the role of Context Recall in RAG evaluation?',
        options: [
          'Measuring whether all relevant ground-truth facts needed to answer the user query were successfully retrieved into the context window',
          'Measuring the speed of RAM read operations',
          'Counting the number of vector dimensions in the embedding model',
          'Checking spelling mistakes in user queries',
        ],
        correctIndex: 0,
        explanation: 'Context Recall evaluates the retriever: checking whether all necessary information required to answer the reference answer was fetched.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'genai-l15-q5',
        prompt: 'In production systems, what is the primary risk of letting an agent execute arbitrary shell commands without a strict whitelist of tools?',
        options: [
          'Prompt injection leading to remote code execution (RCE) and infrastructure takeover',
          'The model running out of memory tokens',
          'Increased CSS file sizes',
          'Slower database index creation',
        ],
        correctIndex: 0,
        explanation: 'Unrestricted execution allows adversarial prompts to execute malicious bash commands, exfiltrate environment variables, or delete files. Agents must use narrow, sandboxed tools.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
    ],
  },
}

export function getGenAiQuiz(lessonId: string): GenAiQuizBank | undefined {
  return GENAI_QUIZZES[lessonId]
}
