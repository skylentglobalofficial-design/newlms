import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { CareerEmploymentType, CareerWorkMode, JobListParams } from "../../lib/career-api"
import { fieldInputStyle } from "./section-ui"

const accent = getDomainAccent("career")

const WORK_MODES: CareerWorkMode[] = ["REMOTE", "HYBRID", "ONSITE", "FLEXIBLE"]
const EMPLOYMENT_TYPES: CareerEmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "OTHER"]

type Props = {
  filters: JobListParams
  onChange: (next: JobListParams) => void
  onSearch: () => void
  disabled?: boolean
}

export default function JobSearchSurface({ filters, onChange, onSearch, disabled }: Props) {
  function setField<K extends keyof JobListParams>(key: K, value: JobListParams[K]) {
    onChange({ ...filters, [key]: value, offset: "0" })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="job-search-surface" style={{ marginBottom: 20, minWidth: 0 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 12,
        padding: "16px 18px",
        borderRadius: T.rControl,
        border: `1px solid ${T.lineDark}`,
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="search"
            value={filters.q ?? ""}
            onChange={e => setField("q", e.target.value)}
            placeholder="Search roles or keywords"
            disabled={disabled}
            style={{ ...fieldInputStyle, flex: "1 1 200px", minWidth: 0 }}
            maxLength={120}
          />
          <button
            type="submit"
            disabled={disabled}
            style={{
              padding: "10px 18px",
              borderRadius: T.rControl,
              border: "none",
              background: accent.primary,
              color: C.white,
              fontSize: 13,
              fontWeight: 600,
              cursor: disabled ? "wait" : "pointer",
              fontFamily: "var(--font-body)",
              flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>

        <div className="job-search-filters" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
          gap: 10,
        }}>
          <select
            value={filters.workMode ?? ""}
            onChange={e => setField("workMode", (e.target.value || undefined) as CareerWorkMode | undefined)}
            disabled={disabled}
            style={fieldInputStyle}
            aria-label="Work mode"
          >
            <option value="">Any work mode</option>
            {WORK_MODES.map(mode => (
              <option key={mode} value={mode}>{mode.replace("_", " ")}</option>
            ))}
          </select>

          <select
            value={filters.employmentType ?? ""}
            onChange={e => setField("employmentType", (e.target.value || undefined) as CareerEmploymentType | undefined)}
            disabled={disabled}
            style={fieldInputStyle}
            aria-label="Employment type"
          >
            <option value="">Any employment type</option>
            {EMPLOYMENT_TYPES.map(type => (
              <option key={type} value={type}>{type.replace("_", " ")}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.location ?? ""}
            onChange={e => setField("location", e.target.value)}
            placeholder="Location"
            disabled={disabled}
            style={fieldInputStyle}
            maxLength={120}
          />

          <input
            type="text"
            value={filters.category ?? ""}
            onChange={e => setField("category", e.target.value)}
            placeholder="Category"
            disabled={disabled}
            style={fieldInputStyle}
            maxLength={80}
          />
        </div>
      </div>
    </form>
  )
}
