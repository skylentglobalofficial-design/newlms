export type AiAction = "ask" | "explain" | "example" | "quiz" | "practice"

export type ChatTurn = {
  role: "user" | "assistant"
  content: string
}

export type LessonAiContext = {
  courseSlug: string
  courseTitle: string
  moduleTitle: string
  lessonId: string
  lessonTitle: string
  lessonKind: string
  authored: boolean
  objective: string
  whyItMatters: string
  concepts: string[]
  practicalOutput: string
  assessment: string
  datasets: Array<{
    filename: string
    rows: number
    notes: string
  }>
  northwind: {
    filename: string
    rows: number
    validRows: number
    excludedRows: number
    netRevenueLabel: string
    window: string
    topCategory: string
    weakestMonth: string
    sql: string
  } | null
  harbor: {
    filename: string
    company: string
    stores: number
    interviews: number
    weekendExceptions: number
    unlogged: number
    constraint: string
    note: string
  } | null
  caseLabel: string | null
  excerpt: string
}

export type ProviderChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type ProviderCompleteOptions = {
  signal?: AbortSignal
}

export type ProviderCompleteResult = {
  answer: string
}

/**
 * Provider-agnostic contract. Selection happens in the factory, not the route.
 * Preview providers may implement answerLesson; production providers use complete().
 */
export type AiProvider = {
  id: string
  complete: (
    messages: ProviderChatMessage[],
    options?: ProviderCompleteOptions,
  ) => Promise<ProviderCompleteResult>
  answerLesson?: (input: AiAskInput) => Promise<ProviderCompleteResult>
}

export type AiAskInput = {
  action: AiAction
  question: string
  history: ChatTurn[]
  context: LessonAiContext
}

export type AiAskResult = {
  answer: string
  basedOn: string
  provider: string
  related: string | null
  caseLabel: string | null
}
