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
  excerpt: string
}

export type ProviderChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type AiProvider = {
  id: string
  complete: (messages: ProviderChatMessage[]) => Promise<string>
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
}
