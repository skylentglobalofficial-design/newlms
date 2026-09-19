import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from '../lib/authored-courses'
import { courseProductProfile } from '../lib/course-product'
import './Catalog.css'

const analytics = courseProductProfile(FLAGSHIP_COURSE_SLUG)
const product = courseProductProfile(PRODUCT_MANAGEMENT_SLUG)

export default function LabsPage() {
  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Skylent Labs</p>
            <h1>Labs live inside the learning path.</h1>
            <p className="cat-lead">
              A lab is not a separate destination. It appears where the work needs it: after a lesson, before a
              named project. There is no catalogue of disconnected experiments here.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Open Data Analytics</Link>
              <Link className="cat-btn cat-btn-ghost" to="/os">See the workspace</Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title">
          <div className="cat-rail">
            <p className="cat-label">Where a lab exists today</p>
            <h2 id="labs-live-title">One live lab, attached to one course.</h2>
            <div className="cat-facts" style={{ marginTop: 20 }}>
              <div className="cat-fact">
                <span>Data Analytics</span>
                <strong>SQL lab</strong>
              </div>
              <div className="cat-fact">
                <span>Product Management</span>
                <strong>No coding lab</strong>
              </div>
            </div>
            <p className="cat-fine" style={{ marginTop: 16 }}>
              {analytics?.lab ? analytics.lab.note : 'Practice with northwind_sales.csv.'} You open it from a lesson
              in Skylent OS, not from this page. {product?.labOmission ?? 'Product Management is a written case, not a sandbox.'}
            </p>
            <p className="cat-fine">
              Sign in, enrol, then the lab chip appears on the relevant lesson. Progress belongs to the course.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
