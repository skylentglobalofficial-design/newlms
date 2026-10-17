/**
 * Capabilities the process can actually offer.
 * A false entry is a hard stop: provisioning must not publish a workspace that needs it.
 * Python, JavaScript and model workloads are intentionally unavailable here. They must
 * not be executed inside the application server.
 */
export type PracticeCapability = {
  id: string
  available: boolean
  detail: string
}

export const PRACTICE_CAPABILITIES: readonly PracticeCapability[] = [
  {
    id: "sql.readonly",
    available: true,
    detail: "Read-only SELECT over an approved course dataset. Not a general database connection.",
  },
  {
    id: "sql.dataset.northwind_sales",
    available: true,
    detail: "northwind_sales.csv is approved for the Data Analytics course only.",
  },
  {
    id: "case.authored",
    available: true,
    detail: "Authored case notes plus the existing project save API. Nothing is executed.",
  },
  {
    id: "case.harbor-desk",
    available: true,
    detail: "Harbor Desk notes are approved for the Product Management course only.",
  },
  {
    id: "runtime.python",
    available: false,
    detail: "No isolated Python runtime is configured. This environment has no container or sandbox runtime. Notebooks stay unpublished.",
  },
  {
    id: "runtime.javascript",
    available: false,
    detail: "No isolated JavaScript runner is configured. A browser playground stays unpublished.",
  },
  {
    id: "runtime.model",
    available: false,
    detail: "No learner model provider is configured. Prompt experiments stay unpublished.",
  },
  {
    id: "assessment.timed",
    available: false,
    detail: "Authored courses have lesson quizzes. A timed exam engine is not configured.",
  },
]

export function capabilityById(id: string): PracticeCapability | null {
  return PRACTICE_CAPABILITIES.find((row) => row.id === id) ?? null
}

export function missingCapabilities(ids: readonly string[]): PracticeCapability[] {
  return ids.flatMap((id) => {
    const row = capabilityById(id)
    if (!row) return [{ id, available: false, detail: `Unknown capability ${id}.` }]
    return row.available ? [] : [row]
  })
}
