import { useTheme } from "../context/ThemeContext"
import type { ThemePreference } from "../lib/theme-init"

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference } = useTheme()

  return (
    <div
      className="skylent-theme-toggle"
      role="group"
      aria-label="Color theme"
      data-compact={compact ? "true" : "false"}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="skylent-theme-toggle-btn"
          aria-pressed={preference === option.value}
          onClick={() => setPreference(option.value)}
        >
          {compact ? option.label.charAt(0) : option.label}
        </button>
      ))}
    </div>
  )
}
