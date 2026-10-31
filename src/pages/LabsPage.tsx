import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { CapabilityRail, PracticePillarSubnav } from '../components/product/Architecture'
import { LAB_PATHWAY } from '../lib/product-architecture'
import { PRACTICE_ENVIRONMENTS, UNBUILT_PRACTICE } from '../lib/practice-environments'
import './Catalog.css'

export default function LabsPage() {
  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <div className="cat-pillar-bar">
          <div className="cat-rail">
            <PracticePillarSubnav current="labs" />
          </div>
        </div>
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Skylent Labs · Browser Execution Sandboxes</p>
            <h1>Practice happens inside the course workspace.</h1>
            <p className="cat-lead">
              Every Skylent lab opens directly inside the module where you need it—so you query the 166-row Northwind database or write a Harbor Desk product specification with full business context.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Open Data Analytics</Link>
              <Link className="cat-btn cat-btn-ghost" to="/os">See the workspace</Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title">
          <div className="cat-rail">
            <p className="cat-label">Active Browser Workspaces</p>
            <h2 id="labs-live-title">Dedicated execution studios for each flagship track.</h2>
            <ul className="practice-env">
              {PRACTICE_ENVIRONMENTS.map((environment) => (
                <li key={environment.id}>
                  <p className="cat-label">{environment.statusLabel}</p>
                  <h3>{environment.title}</h3>
                  <p className="cat-fine">{environment.summary}</p>
                  <p className="cat-fine">{environment.tools.join(" · ")}</p>
                  <p className="cat-fine">{environment.honesty}</p>
                </li>
              ))}
            </ul>
            <p className="cat-fine" style={{ marginTop: 16 }}>
              Each workspace launches from the specific lesson or assignment that requires it after you enrol (Free Pilot Access · No Card Required).
            </p>
            <p className="cat-label" style={{ marginTop: 28 }}>Track-Specific Practice Scope</p>
            <ul className="practice-missing">
              {UNBUILT_PRACTICE.map((row) => (
                <li key={row.slug}>
                  <strong>{row.title}.</strong> {row.note}
                </li>
              ))}
            </ul>
            <p className="cat-label" style={{ marginTop: 28 }}>How a lab fits the path</p>
            <CapabilityRail
              items={[
                { label: "Lab model", status: "live", note: LAB_PATHWAY.map((step) => step.label).join(" → ") },
                {
                  label: "Curriculum-attached studios",
                  status: "live",
                  note: "Every lab stays connected to its parent course and capstone dossier.",
                },
              ]}
            />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
