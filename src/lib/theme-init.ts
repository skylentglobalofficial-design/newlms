export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "skylent-theme"

export function resolveThemePreference(preference: ThemePreference): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") return stored
  return "system"
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.setAttribute("data-theme", theme)
  document.documentElement.style.colorScheme = theme
}

export function bootstrapTheme(): ResolvedTheme {
  const preference = readStoredThemePreference()
  const resolved = resolveThemePreference(preference)
  applyResolvedTheme(resolved)
  return resolved
}
