import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner, CompareTable } from "../../components/product/Architecture"
import { UG_PATHWAY } from "../../lib/product-architecture"
import { C } from "../../tokens"

export default function UndergraduatePage() {
  return (
    <AcademicPageShell current="undergraduate">
      <LinePageHeader
        kicker="Education · Undergraduate"
        maturity="coming_soon"
        title="Degree-aligned study beside the academic calendar."
        lead="Undergraduate on Skylent sits with a college timetable: semester, subject, module, project. It is not a professional programme with a campus photo."
      />
      <UpcomingBanner
        title="No undergraduate degrees are listed"
        body="Skylent does not currently enroll students into B.Tech, B.Sc, BCA, or BBA programmes. The model below is the intended institutional pathway."
      />
      <section className="arch-section">
        <PathwayModel title="Intended undergraduate model" steps={UG_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>How this differs from postgraduate</div>
        <CompareTable
          leftTitle="Undergraduate"
          rightTitle="Postgraduate"
          rows={[
            { aspect: "Unit of time", left: "Semester on the degree calendar", right: "Term inside a specialisation" },
            { aspect: "Depth", left: "Breadth across a degree", right: "Chosen specialisation and cases" },
            { aspect: "Evidence", left: "Assignments and projects", right: "Case judgements and a substantial project" },
            { aspect: "Today", left: "Not an enrollable catalogue", right: "Not an enrollable catalogue" },
          ]}
        />
      </section>
    </AcademicPageShell>
  )
}
