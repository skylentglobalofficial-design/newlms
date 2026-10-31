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
            <p className="cat-label">Skylent Labs</p>
            <h1>Labs live inside the learning path.</h1>
            <p className="cat-lead">
              A lab is not a separate destination. It appears where the work needs it: after a lesson, before a
              named project. There is no catalogue of disconnected experiments here.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Open Data Analytics (Northwind SQL Lab)</Link>
              <Link className="cat-btn cat-btn-ghost" to="/courses/product-management">Open Product Management (Harbor Desk Case)</Link>
              <Link className="cat-btn cat-btn-ghost" to="/programmes#live-courses">All 6 live courses</Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title">
          <div className="cat-rail">
            <p className="cat-label">Where practice exists today</p>
            <h2 id="labs-live-title">Each open programme has its own workspace.</h2>
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
              You open the workspace from the lesson that uses it, after you enrol. Spreadsheet and dashboard lessons in Data Analytics do not open the SQL editor. Product Management never opens Northwind Lab.
            </p>
            <p className="cat-label" style={{ marginTop: 28 }}>Not built</p>
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
                  label: "Standalone marketplace",
                  status: "direction",
                  note: "Not offered — labs stay attached to enrolled learning.",
                },
              ]}
            />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
