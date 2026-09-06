import { useCallback, useEffect, useState } from "react"
import {
  listInterviewRounds,
  listInterviewQuestions,
  listPracticeRecords,
  type InterviewRound,
  type InterviewQuestion,
  type InterviewPractice,
  type InterviewQuestionDifficulty,
} from "../lib/career-api"

export function useInterviews() {
  const [rounds, setRounds] = useState<InterviewRound[]>([])
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [practice, setPractice] = useState<InterviewPractice[]>([])
  const [questionMeta, setQuestionMeta] = useState({ total: 0, limit: 20, offset: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<InterviewQuestionDifficulty | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [roundData, questionResult, practiceData] = await Promise.all([
        listInterviewRounds(),
        listInterviewQuestions({ limit: "50" }),
        listPracticeRecords(),
      ])
      setRounds(roundData)
      setQuestions(questionResult.questions)
      setQuestionMeta(questionResult.meta)
      setPractice(practiceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview workspace")
      setRounds([])
      setQuestions([])
      setPractice([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const categories = Array.from(new Set(questions.map(q => q.category))).sort()

  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false
    if (categoryFilter !== "ALL" && q.category !== categoryFilter) return false
    return true
  })

  return {
    rounds,
    setRounds,
    questions,
    practice,
    setPractice,
    questionMeta,
    loading,
    error,
    reload,
    difficultyFilter,
    setDifficultyFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredQuestions,
  }
}
