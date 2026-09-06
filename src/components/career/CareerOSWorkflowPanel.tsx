import { Link } from "react-router-dom"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import { FlowStrip } from "../ui"
import {
  CAREER_PREVIEW_APPLICATION_STATUSES,
  CAREER_PREVIEW_INTERVIEW_ROUNDS,
  CAREER_PREVIEW_OPPORTUNITY,
  CAREER_PREVIEW_PROFILE,
  CAREER_PREVIEW_SKILLS,
  CAREER_PREVIEW_SUPPORT_TYPES,
  type CareerWorkflowStepDef,
} from "../../lib/career-os-workflow"

const accent = getDomainAccent("career")

function PreviewBadge() {
  return (
    <span className="career-workflow-preview-badge" aria-label="Preview data">
      Preview
    </span>
  )
}

function ProfilePreview() {
  const profile = CAREER_PREVIEW_PROFILE
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Profile state</p>
        <PreviewBadge />
      </div>
      <div className="career-workflow-profile-row">
        <div>
          <p className="career-workflow-preview-name">Your name</p>
          <p className="career-workflow-preview-meta">{profile.headline}</p>
        </div>
        <div className="career-workflow-profile-score">
          <span className="career-workflow-profile-percent">{profile.completeness}%</span>
          <span className="career-workflow-profile-label">Profile completeness</span>
        </div>
      </div>
      <div className="career-workflow-progress" aria-hidden>
        <div className="career-workflow-progress-fill" style={{ width: `${profile.completeness}%` }} />
      </div>
      <div className="career-workflow-section-grid">
        {profile.sections.map((section) => (
          <div key={section.label} className="career-workflow-section-tile">
            <span className="career-workflow-section-label">{section.label}</span>
            <span className="career-workflow-section-value">{section.value}</span>
          </div>
        ))}
      </div>
      <p className="career-workflow-next-action">
        <span className="skylent-label" style={{ color: accent.textMuted, marginRight: 8 }}>Next action</span>
        {profile.nextAction}
      </p>
    </GlassSurface>
  )
}

function SkillsPreview() {
  const skills = CAREER_PREVIEW_SKILLS
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Skills & proof</p>
        <PreviewBadge />
      </div>
      <p className="career-workflow-preview-copy">Skills linked from programs and projects appear here.</p>
      <div className="skills-explorer-chips" role="list" aria-label="Preview skill areas">
        {skills.areas.map((area) => (
          <span key={area} className="skills-explorer-chip" role="listitem">{area}</span>
        ))}
      </div>
      <div className="career-workflow-proof-list">
        {skills.proof.map((item) => (
          <div key={item} className="career-workflow-proof-item">
            <span className="career-workflow-proof-dot" aria-hidden />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

function OpportunitiesPreview() {
  const opportunity = CAREER_PREVIEW_OPPORTUNITY
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Job board</p>
        <PreviewBadge />
      </div>
      <div className="skills-explorer-chips career-workflow-filter-chips" role="list" aria-label="Preview filters">
        {opportunity.filters.map((filter) => (
          <span key={filter} className="skills-explorer-chip" role="listitem">{filter}</span>
        ))}
      </div>
      <div className="career-workflow-job-list">
        {opportunity.rows.map((row, index) => (
          <div key={index} className="career-workflow-job-row">
            <div>
              <p className="career-workflow-job-role">{row.role}</p>
              <p className="career-workflow-job-meta">{row.meta}</p>
              <div className="career-workflow-job-skills">
                {row.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
            <span className="career-workflow-job-action">Inspect</span>
          </div>
        ))}
      </div>
      <p className="career-workflow-preview-footnote">Sample listing layout — not live roles or employers.</p>
    </GlassSurface>
  )
}

function ApplicationsPreview() {
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Application pipeline</p>
        <PreviewBadge />
      </div>
      <div className="career-workflow-status-strip" role="list" aria-label="Application statuses">
        {CAREER_PREVIEW_APPLICATION_STATUSES.map((status) => (
          <span key={status} className="career-workflow-status-chip" role="listitem">
            {status}
          </span>
        ))}
      </div>
      <div className="career-workflow-empty-state">
        <p className="career-workflow-empty-title">No applications yet</p>
        <p className="career-workflow-empty-copy">
          Applications you submit from the job board appear here with status history and next actions.
        </p>
      </div>
    </GlassSurface>
  )
}

function InterviewsPreview() {
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Interview rounds</p>
        <PreviewBadge />
      </div>
      <div className="career-workflow-interview-list">
        {CAREER_PREVIEW_INTERVIEW_ROUNDS.map((round) => (
          <div key={round.type} className="career-workflow-interview-row">
            <div>
              <p className="career-workflow-interview-type">{round.type} round</p>
              <p className="career-workflow-interview-meta">Linked to an application</p>
            </div>
            <span className="career-workflow-status-chip is-muted">{round.status}</span>
          </div>
        ))}
      </div>
      <p className="career-workflow-preview-footnote">Round structure preview — scheduling connects to your applications.</p>
    </GlassSurface>
  )
}

function SupportPreview() {
  return (
    <GlassSurface level={2} padding="22px" className="career-workflow-preview-card">
      <div className="career-workflow-preview-card-head">
        <p className="skylent-label" style={{ color: accent.text, margin: 0 }}>Career support</p>
        <PreviewBadge />
      </div>
      <ul className="education-prep-list career-workflow-support-list">
        {CAREER_PREVIEW_SUPPORT_TYPES.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
      <div className="career-workflow-empty-state is-compact">
        <p className="career-workflow-empty-title">No open requests</p>
        <p className="career-workflow-empty-copy">
          Support requests and tasks appear here after you enroll in a qualifying program.
        </p>
      </div>
    </GlassSurface>
  )
}

function StepPreview({ stepId }: { stepId: CareerWorkflowStepDef["id"] }) {
  switch (stepId) {
    case "profile":
      return <ProfilePreview />
    case "skills":
      return <SkillsPreview />
    case "opportunities":
      return <OpportunitiesPreview />
    case "applications":
      return <ApplicationsPreview />
    case "interviews":
      return <InterviewsPreview />
    case "support":
      return <SupportPreview />
    default:
      return null
  }
}

type CareerOSWorkflowPanelProps = {
  step: CareerWorkflowStepDef
  panelId: string
  labelledBy: string
  workspaceHref: string
  workspaceState?: { returnTo: string }
}

export default function CareerOSWorkflowPanel({
  step,
  panelId,
  labelledBy,
  workspaceHref,
  workspaceState,
}: CareerOSWorkflowPanelProps) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="pathway-explorer-panel career-workflow-panel"
    >
      <div key={step.id} className="skills-explorer-panel-inner skills-explorer-panel-fade">
        <div className="skills-explorer-panel-head">
          <p className="skylent-label skills-explorer-panel-eyebrow">{step.sub}</p>
          <h2 className="skylent-display-sm skills-explorer-panel-title">{step.label}</h2>
          <p className="skills-explorer-panel-tagline">{step.tagline}</p>
          <p className="education-pathway-description">{step.description}</p>
        </div>

        <StepPreview stepId={step.id} />

        <div className="skills-explorer-cta">
          <Link
            to={workspaceHref}
            state={workspaceState}
            className="skills-explorer-primary-link"
          >
            Open Career OS workspace →
          </Link>
        </div>
      </div>
    </div>
  )
}
