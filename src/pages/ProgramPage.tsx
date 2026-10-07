import { useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import ProfessionalProgrammeTemplate from "../components/programme/ProfessionalProgrammeTemplate"
import ProgrammeListing from "../components/programme/ProgrammeListing"
import { ProgrammeMessage, ProgrammeSkeleton } from "../components/programme/ProgrammeStates"
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
  const afterEnrol = programmeAfterEnrolCopy({ maturity, linked })
  const authoredLinked = linked.filter((item) => item.authored)
  const cta = comingLater
    ? "Coming later"
    : enrollable
      ? authoredLinked.length > 0 && authoredLinked.length === linked.length
        ? overlayView?.ctaLabel ?? "Start this programme"
        : overlayView?.ctaLabel ?? "Open linked course"
      : "Enrolment unavailable"

  function openEnrol() {
    if (comingLater || !enrollable) return
    setEnrollOpen(true)
  }

  // The authored template needs the programme's own material and the API link to its course.
  const content = authoredProgrammeContent(program.slug)
  const authored = content && truth.authored && program.linkedCourseSlugs.includes(content.courseSlug) ? content : null

  return (
    <Shell>
      {authored ? (
        <ProfessionalProgrammeTemplate
          program={program}
          content={authored}
          truth={truth}
          cta={cta}
          afterEnrol={afterEnrol}
          onEnrol={openEnrol}
        />
      ) : (
        <ProgrammeListing
          program={program}
          truth={truth}
          cta={cta}
          honesty={programmeListingHonesty(program.enrollmentStatus, linked)}
          afterEnrol={afterEnrol}
          onEnrol={openEnrol}
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
): string {
  const authored = linked.filter((item) => item.authored)
  if (status === "coming_soon" || status === "waitlist") {
    return "This programme is not open yet. There is no classroom session or batch behind the listing."
  }
  if (authored.length && linked.length === authored.length) {
    return `Enrolment opens the ${authored[0].title} course, which is the authored learning path. Brochure modules beyond that course are not taught here yet.`
  }
  if (authored.length) {
    return `What you can study today is ${authored.map((item) => item.title).join(" and ")}. The other linked listings are outlines, and brochure topics beyond them are not taught yet.`
  }
  if (linked.length) {
    return "The linked course is a catalogue outline. Its lessons are not written yet, so there is nothing to enrol into."
  }
  return "There is no linked course for this programme yet."
}
