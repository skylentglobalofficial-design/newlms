import { useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import ProfessionalProgrammeTemplate from "../components/programme/ProfessionalProgrammeTemplate"
import ProgrammeListing from "../components/programme/ProgrammeListing"
import { ProgrammeMessage, ProgrammeSkeleton } from "../components/programme/ProgrammeStates"
import CatalogueNotice, { STATUS_NOT_CONFIRMED } from "../components/programme/CatalogueNotice"
import { authoredProgrammeContent } from "../components/programme/programme-content"
import { programmeTruth } from "../components/programme/programme-truth"
import { programs } from "../data"
import { lowestProgramPrice, type CatalogEnrollmentStatus } from "../lib/catalog-api"
import { programmeAfterEnrolCopy, programmePublicView, type LinkedLearning } from "../lib/catalog-maturity"
import { useCatalogProgram } from "../hooks/useCatalog"

function Shell({ children }: { children: ReactNode }) {
  return (
    <PageShell aurora={false}>
      <div className="site-light">
        {children}
      </div>
    </PageShell>
  )
}

export default function ProgramPage() {
  const { slug } = useParams()
  const catalog = useCatalogProgram(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (catalog.loading) {
    return (
      <Shell>
        <ProgrammeSkeleton />
      </Shell>
    )
  }

  if (catalog.error) {
    return (
      <Shell>
        <ProgrammeMessage
          alert
          title="This programme could not be loaded."
          actions={
            <>
              <button type="button" className="sk-btn sk-btn-primary" onClick={() => { void catalog.reload() }}>
                Try again
              </button>
              <Link className="sk-btn sk-btn-secondary" to="/programmes">
                Back to programmes
              </Link>
            </>
          }
        >
          The catalogue request failed. That is a problem on our side, not a missing programme.
        </ProgrammeMessage>
      </Shell>
    )
  }

  const program = catalog.data
  if (!program) {
    return (
      <Shell>
        <ProgrammeMessage
          title="This programme is not in the catalogue."
          actions={
            <Link className="sk-btn sk-btn-primary" to="/programmes">
              Back to programmes
            </Link>
          }
        >
          Nothing is published at this address. It may have been renamed or withdrawn.
        </ProgrammeMessage>
      </Shell>
    )
  }

  // Enrolment decision: unchanged. The API must say OPEN, link a course, and one linked course must be authored.
  const authoredRecord = programs.find((item) => item.slug === program.slug)
  const overlayView = authoredRecord ? programmePublicView(authoredRecord) : null
  const truth = programmeTruth(program)
  const { linked, comingLater, enrollable } = truth
  const maturity = comingLater ? "coming_later" as const : "listing" as const
  const enrolSummary = programmeAfterEnrolCopy({ maturity, linked })
  const authoredLinked = linked.filter((item) => item.authored)
  const cta = comingLater
    ? "Coming later"
    : enrollable
      ? authoredLinked.length > 0 && authoredLinked.length === linked.length
        ? overlayView?.ctaLabel ?? "Start this programme"
        : overlayView?.ctaLabel ?? "Open linked course"
      : "Enrolment unavailable"

  // Published record shown because the API is unreachable: nothing is claimed as open and enrolment is paused.
  const confirmed = !catalog.offline
  const afterEnrol = confirmed
    ? enrolSummary
    : `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked. ${enrolSummary}`

  function openEnrol() {
    if (!confirmed || comingLater || !enrollable) return
    setEnrollOpen(true)
  }

  // The authored template needs the programme's own material and the API link to its course.
  const content = authoredProgrammeContent(program.slug)
  const authored = content && truth.authored && program.linkedCourseSlugs.includes(content.courseSlug) ? content : null

  return (
    <Shell>
      {confirmed ? null : <CatalogueNotice what="This programme" onRetry={() => void catalog.reload()} />}
      {authored ? (
        <ProfessionalProgrammeTemplate
          program={program}
          content={authored}
          truth={truth}
          cta={cta}
          afterEnrol={afterEnrol}
          onEnrol={openEnrol}
          confirmed={confirmed}
        />
      ) : (
        <ProgrammeListing
          program={program}
          truth={truth}
          cta={cta}
          honesty={programmeListingHonesty(program.enrollmentStatus, linked, confirmed)}
          afterEnrol={afterEnrol}
          onEnrol={openEnrol}
          confirmed={confirmed}
        />
      )}

      {enrollOpen ? (
        <EnrollmentModal
          item={{
            kind: "program",
            slug: program.slug,
            title: program.name,
            price: lowestProgramPrice(program) ?? 0,
            enrollmentStatus: program.enrollmentStatus ?? undefined,
            enrollable,
            linkedCourseSlugs: program.linkedCourseSlugs,
          }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </Shell>
  )
}

function programmeListingHonesty(
  status: CatalogEnrollmentStatus | null,
  linked: LinkedLearning[],
  confirmed = true,
): string {
  const authored = linked.filter((item) => item.authored)
  if (!confirmed) {
    // Drawn from the published record: nothing about availability is stated as current.
    return authored.length
      ? `${STATUS_NOT_CONFIRMED}. This programme opens ${authored.map((item) => item.title).join(" and ")}, but its availability could not be checked just now, so enrolment is paused.`
      : `${STATUS_NOT_CONFIRMED}. This programme's availability could not be checked just now, so enrolment is paused.`
  }
  if (status === "coming_soon" || status === "waitlist") {
    return "Enrolment for this programme has not opened yet. No class schedule or batch has been set."
  }
  if (authored.length && linked.length === authored.length) {
    return `Enrolling gives you the ${authored[0].title} course, which is ready to study now. The rest of the programme is still being prepared.`
  }
  if (authored.length) {
    return `You can already study ${authored.map((item) => item.title).join(" and ")} on its own. The other courses in this programme are still being prepared.`
  }
  if (linked.length) {
    return "The course for this programme is still being prepared, so enrolment is not open yet. You can see its outline now."
  }
  return "The courses for this programme are still being prepared."
}
