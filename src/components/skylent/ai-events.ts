export type SkylentAiMode = "chat" | "finder"

export const SKYLENT_AI_OPEN_EVENT = "skylent:open-ai"

export function openSkylentAi(mode: SkylentAiMode = "chat"): void {
  if (typeof window === "undefined") return
  if (mode === "finder") {
    window.location.assign("/path")
    return
  }
  window.location.assign("/contact")
}
