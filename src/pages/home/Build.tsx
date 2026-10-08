/**
 * Build and Prove: the Northwind Lab (query and result) beside the evidence record that
 * the finished work becomes. Figures come from src/lib/northwind-preview.ts; states from truth.ts.
 */
import { SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import { truthOf } from "@/lib/truth"
import { NorthwindSql, formatInr } from "./artefacts"
import { courseFacts } from "./course-facts"

function LabPlate() {
  const { filename, rows, validRows, excludedRows, categories } = NORTHWIND_PREVIEW
  const top = categories[0]
  return (
    <div
      className="hm-plate hm-lab"
      role="img"
      aria-label={`Northwind Lab. A query over ${filename} returns net revenue for ${categories.length} categories: ${categories.map((c) => `${c.name} ${formatInr(c.value)}`).join(", ")}.`}
    >
      <div className="hm-lab__bar">
        <span className="hm-lab__file">
          <span className="hm-lab__dot" />
          {filename} · {rows} order lines
        </span>
        <span className="hm-lab__run">Run query</span>
      </div>
      <NorthwindSql className="hm-lab__pre" />
      <div className="hm-lab__result">
        <div className="hm-lab__resulthead">
          <span>Result · {categories.length} rows</span>
          <span>
            {validRows} of {rows} source rows valid · {excludedRows} excluded
          </span>
        </div>
        <div className="hm-lab__table">
          <div className="hm-lab__tr hm-lab__tr--head">
            <span>category_std</span>
            <span>net_revenue</span>
            <span />
          </div>
          {categories.map((c, i) => (
            <div key={c.name} className={i === 0 ? "hm-lab__tr hm-lab__tr--on" : "hm-lab__tr"}>
              <span>{c.name}</span>
              <span>{formatInr(c.value)}</span>
              <span className="hm-lab__barcell">
                <span className={i === 0 ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${((c.value / top.value) * 100).toFixed(1)}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EvidenceRecord({ title }: { title: string }) {
  const { filename, validRows, rows, netRevenue, netRevenueLabel, categories, window: period } = NORTHWIND_PREVIEW
  const top = categories[0]
  const share = Math.round((top.value / netRevenue) * 100)
  return (
    <div className="hm-record">
      <div className="hm-record__head">
        <span className="sky-label">Evidence record</span>
        <TruthChip state={truthOf("projectsAndEvidence")} />
      </div>
      <p className="hm-record__title">{title}</p>
      <SpecSheet
        className="hm-facts hm-record__spec"
        rows={[
          { label: "Source", value: filename, note: "A fictional retail extract." },
          { label: "Period", value: period },
          { label: "Rows used", value: `${validRows} of ${rows} valid` },
          { label: "Finding", value: `${top.name} leads: ${formatInr(top.value)}, ${share}% of ${netRevenueLabel} valid net revenue` },
          { label: "Certificate", value: <TruthChip state={truthOf("certificates")} />, note: "Issued for a course once every lesson is complete, with a code anyone can check." },
        ]}
      />
      <p className="hm-record__foot">Evidence is learner work on fictional cases. It is not a certificate and not employer-validated.</p>
    </div>
  )
}

export function BuildProve() {
  const facts = courseFacts()
  return (
    <section id="build" className="hm-build" aria-labelledby="hm-build-title">
      <div className="sky-container">
        <Reveal className="hm-head" stagger>
          <div className="hm-head__main" data-reveal-group>
            <SectionIndex n="06" label="Practice · Build · Prove" />
            <h2 id="hm-build-title" className="sky-display sky-display--lg hm-split">
              Build the work. <em>Keep the proof.</em>
            </h2>
          </div>
          <p className="hm-head__aside">
            Practice happens on a dataset, not a slide. The finished piece is kept with the query, the rows and the finding behind it.
          </p>
        </Reveal>

        <div className="hm-build__grid">
          <figure className="hm-build__lab">
            <Reveal variant="plate" delay={200}>
              <LabPlate />
            </Reveal>
            <figcaption className="hm-caption">
              <span>FIG. 05 · Northwind Lab, the lesson 7 query and its result</span>
              <span>Data Analytics programme</span>
            </figcaption>
          </figure>

          <div className="hm-build__prove">
            <Reveal delay={340}>
              <EvidenceRecord title={facts?.capstoneTitle || "Northwind project"} />
            </Reveal>
            <p className="hm-caption hm-caption--plain">
              <span>FIG. 06 · What an evidence record holds</span>
              <span>Illustrative</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
