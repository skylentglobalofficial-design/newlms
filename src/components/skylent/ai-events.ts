/** Opens the site-wide Skylent AI panel from anywhere on the page (SiteAssistant listens). */
export type SkylentAiMode = "finder" | "chat"

export const SKYLENT_AI_OPEN_EVENT = "skylent-ai:open"

export function openSkylentAi(mode: SkylentAiMode = "chat"): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<SkylentAiMode>(SKYLENT_AI_OPEN_EVENT, { detail: mode }))
}
