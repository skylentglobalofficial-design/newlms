import { useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Eyebrow, FlowStrip, Heading, Section, T } from "../ui"
import { useAuth } from "../../context/AuthContext"
import {
  CAREER_WORKFLOW_FLOW,
  CAREER_WORKFLOW_STEPS,
  getCareerWorkflowStepById,
  type CareerWorkflowStepId,
} from "../../lib/career-os-workflow"
import CareerOSWorkflowPanel from "./CareerOSWorkflowPanel"

const PANEL_ID = "career-workflow-panel"

export default function CareerOSWorkflowHero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeId, setActiveId] = useState<CareerWorkflowStepId>("profile")
  const listRef = useRef<HTMLDivElement>(null)
  const active = getCareerWorkflowStepById(activeId)

  const workspacePath = user ? "/career-os/app" : "/login"
  const workspaceState = user ? undefined : { returnTo: "/career-os/app" }

  const selectStep = useCallback((id: CareerWorkflowStepId) => {
    setActiveId(id)
  }, [])

  const openWorkspace = useCallback(() => {
    navigate(workspacePath, { state: workspaceState })
  }, [navigate, workspacePath, workspaceState])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = CAREER_WORKFLOW_STEPS.findIndex((step) => step.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % CAREER_WORKFLOW_STEPS.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + CAREER_WORKFLOW_STEPS.length) % CAREER_WORKFLOW_STEPS.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = CAREER_WORKFLOW_STEPS.length - 1
      } else {
        return
      }

      const next = CAREER_WORKFLOW_STEPS[nextIndex]
      selectStep(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-workflow-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectStep],
  )

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="career-workflow-hero">
        <header className="skills-explorer-intro">
          <Eyebrow tone="dark">Career OS</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            A career workspace — not a landing page.
          </Heading>
          <p className="skills-explorer-intro-copy">
            Profile, skills proof, opportunities, applications, interviews, and support — one workflow you enter after qualifying programs.
          </p>
          <div className="career-workflow-hero-cta">
            <Button variant="primary" size="lg" onClick={openWorkspace}>
              Open Career OS workspace
            </Button>
          </div>
        </header>

        <div className="career-workflow-flow-wrap">
          <p className="skylent-label skills-explorer-block-label">Workflow</p>
          <FlowStrip tone="dark" steps={CAREER_WORKFLOW_FLOW.map((label) => ({ label }))} />
        </div>

        <div className="pathway-explorer career-workflow-explorer">
          <nav className="pathway-explorer-nav" aria-label="Career OS workflow navigation">
            <div className="pathway-explorer-mobile">
              <label htmlFor="career-workflow-select" className="skylent-label skills-explorer-mobile-label">
                Workflow steps
              </label>
              <select
                id="career-workflow-select"
                className="pathway-explorer-select"
                value={activeId}
                onChange={(event) => selectStep(event.target.value as CareerWorkflowStepId)}
              >
                {CAREER_WORKFLOW_STEPS.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.label} — {step.sub}
                  </option>
                ))}
              </select>
            </div>

            <div
              ref={listRef}
              className="pathway-explorer-list"
              role="tablist"
              aria-label="Career OS workflow"
              aria-orientation="vertical"
              onKeyDown={handleListKeyDown}
            >
              <p className="skylent-label skills-explorer-list-label">Workflow steps</p>
              {CAREER_WORKFLOW_STEPS.map((step, index) => {
                const selected = step.id === activeId
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    data-workflow-id={step.id}
                    id={`career-workflow-tab-${step.id}`}
                    aria-selected={selected}
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectStep(step.id)}
                    className={`pathway-explorer-tab${selected ? " is-selected" : ""}`}
                  >
                    <span className="skills-explorer-tab-row">
                      <span>
                        <span className="pathway-explorer-tab-label">{step.label}</span>
                        <span className="pathway-explorer-tab-meta">{step.sub}</span>
                      </span>
                      <span className="career-workflow-tab-index" aria-hidden>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          <CareerOSWorkflowPanel
            step={active}
            panelId={PANEL_ID}
            labelledBy={`career-workflow-tab-${activeId}`}
            workspaceHref={workspacePath}
            workspaceState={workspaceState}
          />
        </div>
      </div>
    </Section>
  )
}
