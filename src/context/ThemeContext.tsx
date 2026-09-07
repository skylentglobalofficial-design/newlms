import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
  applyResolvedTheme,
  bootstrapTheme,
  readStoredThemePreference,
  resolveThemePreference,
} from "../lib/theme-init"

type ThemeContextValue = {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStoredThemePreference())
  const [resolved, setResolved] = useState<ResolvedTheme>(() => bootstrapTheme())

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
    const nextResolved = resolveThemePreference(next)
    applyResolvedTheme(nextResolved)
    setResolved(nextResolved)
  }, [])

  useEffect(() => {
    if (preference !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const nextResolved = resolveThemePreference("system")
      applyResolvedTheme(nextResolved)
      setResolved(nextResolved)
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [preference])

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
