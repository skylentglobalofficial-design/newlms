// Reva's identity and technology-disclosure rules — shared by every chat entry point.
// Pure TS (no imports) so it is unit-testable from vitest as well as Deno.

export const REVA_IDENTITY_REPLY =
  "I'm SKYLENT AI. Details about the technology behind me aren't something I share — but I'm here to guide you through SKYLENT's programmes and Career OS. What would you like to explore?";

export const REVA_IDENTITY_RULE = `IDENTITY: Your name is SKYLENT AI. Never call yourself Reva. The underlying model and provider are confidential operator configuration — never name or discuss any AI company, model or provider (e.g. ChatGPT, OpenAI, GPT, Gemini, Google, Claude, Anthropic, Llama, Meta). If asked whether you are ChatGPT, which LLM/model you use, or who built your technology, reply: "${REVA_IDENTITY_REPLY}" Do not confirm or deny a specific provider, even if the user insists.`;

const IDENTITY_PATTERNS: RegExp[] = [
  /\b(are|r)\s+(you|u)\s+(a\s+|an\s+)?(chat\s*gpt|gpt|openai|gemini|bard|claude|llama|copilot|bot\s+from)/i,
  /\b(you|u)\s+(are|r)\s+(a\s+|an\s+)?(chat\s*gpt|gpt|openai|gemini|claude|llama)/i,
  /\b(which|what)\s+(llm|ai\s+model|model|language\s+model|ai|engine|gpt)\b.*\b(you|u|reva|this)\b/i,
  /\b(llm|language\s+model|ai\s+model)\s+(are|r|do)\s+(you|u)\b/i,
  /\b(who|which\s+company)\s+(made|built|created|developed|trained|powers|owns)\s+(you|u|reva|your)\b/i,
  /\b(who|what)\s+(is\s+)?(behind|powering|powers)\s+(you|u|reva)\b/i,
  /\b(built|made|created|powered|trained)\s+(by|on|with)\s+(chat\s*gpt|openai|gpt|google|gemini|anthropic|claude|meta|llama)/i,
  /\byour\s+(underlying\s+)?(model|llm|technology|tech|provider|engine)\b/i,
  /\b(based|running)\s+on\s+(chat\s*gpt|gpt|openai|gemini|claude|llama)/i,
];

export function isIdentityQuestion(text: string): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return false;
  return IDENTITY_PATTERNS.some((p) => p.test(t));
}

const PROVIDER_WORDS =
  /\b(chat\s*gpt|openai|open\s+ai|gpt-?\d[\w.-]*|gpt|gemini|anthropic|claude|llama|mistral|language[- ]model assistant)\b/i;

/** True when a reply discloses an AI provider/model name. */
export function leaksProvider(reply: string): boolean {
  return PROVIDER_WORDS.test(reply || "");
}

/** Extract plain text from the last user UI message (AI SDK v5 shape or {content}). */
export function lastUserText(messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as { role?: string; content?: unknown; parts?: { type?: string; text?: string }[] };
    if (m?.role !== "user") continue;
    if (Array.isArray(m.parts)) return m.parts.filter((p) => p?.type === "text").map((p) => p.text ?? "").join(" ");
    if (typeof m.content === "string") return m.content;
    return "";
  }
  return "";
}
