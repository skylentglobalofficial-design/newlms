import { Link, useParams } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { DEGREE_SAMPLE_NOTE, degreeBySlug, degreeLevelLabel } from "../../data/education"
import { degreeImage } from "../../data/educationImages"
import "../../components/public-home/PublicHome.css"

export default function DegreeSamplePage() {
  const { slug } = useParams()
  const degree = degreeBySlug(slug)
  const image = degree ? degreeImage(degree.slug) : null

  return (
    <PageShell aurora={false}>
      <div className="public-home">
        <section className="ph-section">
          <div className="ph-container ph-degree">
            {degree && image ? (
              <>
                <p className="ph-kicker">Degree area</p>
                <h1>{degree.field} degrees</h1>
                <p className="ph-lead">{degree.title}</p>
                <img src={image.src} alt={image.alt} width={1600} height={900} />
                <ul>
                  <li>{degreeLevelLabel(degree.level)}</li>
                  <li>{degree.studyMode === "online" ? "Online" : "On-campus"}</li>
                  <li>Coming soon</li>
                  <li>Sample listing</li>
                </ul>
                <p className="ph-note">{DEGREE_SAMPLE_NOTE}</p>
              </>
            ) : (
              <>
                <h1>Degree route not listed</h1>
                <p className="ph-lead">This page only shows the published sample degree areas.</p>
              </>
            )}
            <Link className="ph-btn ph-btn-secondary" to="/education#degrees">
              Back to education
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
