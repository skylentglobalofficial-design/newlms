import { Link } from "react-router-dom"
import { C, PageShell } from "../components/shared"

export default function NotFoundPage() {
  return (
    <PageShell aurora={false}>
      <div
        className="skylent-container"
        style={{ textAlign: "center", minHeight: "50vh", paddingBlock: 28 }}
      >
        <h1 className="skylent-display-md" style={{ color: C.ink }}>
          Page not found
        </h1>
        <Link to="/" style={{ color: 'var(--skylent-color-accent)' }}>
          ← Back to home
        </Link>
      </div>
    </PageShell>
  )
}
