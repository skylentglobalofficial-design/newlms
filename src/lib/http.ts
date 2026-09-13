/** User-facing copy when an API body is missing, empty, or not JSON. Never leak parser text. */
export const WORKSPACE_LOAD_ERROR = "Unable to load this workspace. Try again."

function looksLikeParserNoise(message: string): boolean {
  return /unexpected end of json|json\.parse|not valid json|unexpected token|failed to parse/i.test(message)
}

export function workspaceErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : WORKSPACE_LOAD_ERROR
  if (!raw || looksLikeParserNoise(raw)) return WORKSPACE_LOAD_ERROR
  return raw
}

export function userFacingApiError(data: unknown, status: number): string {
  if (status === 401) return "Sign in to continue."
  if (status === 403) {
    if (typeof data === "object" && data && "error" in data) {
      const raw = String((data as { error: unknown }).error ?? "")
      if (raw === "Invalid CSRF token") return "Reload the page and try again."
      if (raw && !looksLikeParserNoise(raw) && raw.length <= 160) return raw
    }
    return "You do not have access to this workspace."
  }
  if (status === 404) return "This resource is not available."

  if (typeof data === "object" && data && "error" in data) {
    const raw = String((data as { error: unknown }).error ?? "")
    if (!raw || looksLikeParserNoise(raw) || raw.length > 160) return WORKSPACE_LOAD_ERROR
    return raw
  }

  return WORKSPACE_LOAD_ERROR
}

export async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(WORKSPACE_LOAD_ERROR)
  }
}

export async function parseApiJson<T>(response: Response): Promise<T> {
  const data = await readJsonBody(response)
  if (!response.ok) {
    throw new Error(userFacingApiError(data, response.status))
  }
  if (data === null) {
    throw new Error(WORKSPACE_LOAD_ERROR)
  }
  return data as T
}
