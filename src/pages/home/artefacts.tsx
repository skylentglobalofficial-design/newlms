/**
 * Domain artefacts for programme tiles: the work of the discipline, drawn in HTML.
 *
 * Real artefacts use authored course content only:
 *  - Northwind: figures from src/lib/northwind-preview.ts, SQL from Data Analytics lesson 7.
 *  - Harbor Desk: the accepted problem statement from Product Management lesson 7.
 * Programmes without authored lessons get an ILLUSTRATIVE artefact (chip set by the tile)
 * or a plain sheet of the facts the catalogue returned.
 */
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import type { ArtefactKind, HomeProgramme } from "./programme-model"

/** Same grouping as NORTHWIND_PREVIEW.netRevenueLabel, so the two figures in one sentence match. */
export function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-US")}`
}

/** The category query from Data Analytics lesson 7, as shown in the lesson and the lab. */
export function NorthwindSql({ className = "" }: { className?: string }) {
  return (
    <pre className={`sky-workbench ${className}`.trim()}>
      <span className="kw">SELECT CASE</span> … <span className="kw">END AS</span> category_std,{"\n"}
      {"  "}ROUND(SUM(units * unit_price{"\n"}
      {"    "}* (1.0 - discount_pct / 100.0)), 0){"\n"}
      {"    "}<span className="kw">AS</span> net_revenue{"\n"}
      <span className="kw">FROM</span> sales{"\n"}
      <span className="kw">WHERE</span> units &gt; 0 <span className="kw">AND</span> unit_price &gt; 0{"\n"}
      {"  "}<span className="kw">AND</span> returned = <span className="str">'no'</span>{"\n"}
      <span className="kw">GROUP BY</span> 1{"\n"}
      <span className="kw">ORDER BY</span> net_revenue <span className="kw">DESC</span>;
    </pre>
  )
}

/** Data Analytics: the category query beside its result. */
export function NorthwindArtefact() {
  const { categories, netRevenue, netRevenueLabel, validRows, rows, window: period } = NORTHWIND_PREVIEW
  const top = categories[0]
  const share = Math.round((top.value / netRevenue) * 100)
  const summary = categories.map((c) => `${c.name} ${formatInr(c.value)}`).join(", ")
  return (
    <div className="hm-nw">
      <div className="hm-nw__code">
        <div className="hm-art-label hm-art-label--navy">Lesson 7 SQL · excerpt</div>
        <NorthwindSql className="hm-nw__pre" />
      </div>
      <div className="hm-nw__result">
        <div className="hm-nw__title">Net revenue by category, {period}</div>
        <div className="hm-nw__chart" role="img" aria-label={`Bar chart of net revenue by category. ${summary}.`}>
          {categories.map((c, i) => (
            <div key={c.name} className="hm-nw__bar-row">
              <span className={i === 0 ? "hm-nw__cat hm-nw__cat--on" : "hm-nw__cat"}>{c.name}</span>
              <span className="hm-nw__track">
                <span className={i === 0 ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${((c.value / top.value) * 100).toFixed(1)}%` }} />
              </span>
            </div>
          ))}
        </div>
        <div className="hm-nw__finding">
          <span className="hm-nw__key" aria-hidden="true" />
          <span>
            <strong>
              {top.name}, {formatInr(top.value)}.
            </strong>{" "}
            {share}% of {netRevenueLabel} valid net revenue.
          </span>
        </div>
        <div className="hm-nw__meta">
          {categories.length} rows · {validRows} of {rows} source rows valid
        </div>
      </div>
    </div>
  )
}

/** Product Management: the accepted problem statement from the Harbor Desk case. */
export function HarborDeskArtefact() {
  const rows = [
    ["When", "a weekend delivery fails"],
    ["Who", "Meena, and cashiers like her"],
    ["Pain", "no written place to put it"],
  ] as const
  return (
    <div className="hm-card hm-hd">
      <div className="hm-art-label hm-hd__head">
        <span>Problem statement</span>
        <span>Harbor Desk case</span>
      </div>
      <dl className="hm-hd__rows">
        {rows.map(([label, value]) => (
          <div key={label} className="hm-hd__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className="hm-hd__row hm-hd__row--check">
          <dt>Check</dt>
          <dd>a written owner before Monday 10:00</dd>
        </div>
      </dl>
    </div>
  )
}

/** Illustrative: markup beside what it renders. */
function MarkupArtefact() {
  return (
    <div className="hm-card hm-mk">
      <div className="hm-mk__code">
        <div className="hm-art-label hm-art-label--navy">Markup</div>
        <pre className="sky-workbench hm-mk__pre">
          <span className="kw">&lt;form&gt;</span>{"\n"}
          {" "}<span className="kw">&lt;label&gt;</span>Email<span className="kw">&lt;/label&gt;</span>{"\n"}
          {" "}<span className="kw">&lt;input</span> type=<span className="str">"email"</span><span className="kw">&gt;</span>{"\n"}
          {" "}<span className="kw">&lt;button&gt;</span>Save<span className="kw">&lt;/button&gt;</span>{"\n"}
          <span className="kw">&lt;/form&gt;</span>
        </pre>
      </div>
      <div className="hm-mk__preview" aria-hidden="true">
        <div className="hm-art-label">Preview</div>
        <div className="hm-mk__field-label">Email</div>
        <div className="hm-mk__field" />
        <div className="hm-mk__button">Save</div>
      </div>
    </div>
  )
}

/** Illustrative: a retrieval workflow with a check step. */
function WorkflowArtefact() {
  const steps = ["input", "retrieve", "model", "check", "output"]
  return (
    <div className="hm-card hm-wf">
      <div className="hm-art-label">Workflow</div>
      <ol className="hm-wf__steps" aria-label={steps.join(", ")}>
        {steps.map((step) => (
          <li key={step} className={step === "model" ? "hm-wf__step hm-wf__step--on" : "hm-wf__step"}>
            <span className="hm-wf__node" aria-hidden="true" />
            <span className="hm-wf__name">{step}</span>
          </li>
        ))}
      </ol>
      <div className="hm-wf__note">check fails › retrieve again</div>
    </div>
  )
}

/** No drawn artefact: the facts the catalogue returned for this programme, as a ruled sheet. */
function FactsArtefact({ programme }: { programme: HomeProgramme }) {
  const rows = [
    ["Type", programme.category],
    ["Level", programme.level],
    ["Format", programme.deliveryMode],
  ].filter(([, value]) => Boolean(value))
  return (
    <div className="hm-card hm-hd">
      <div className="hm-art-label hm-hd__head">
        <span>Catalogue listing</span>
      </div>
      {rows.length > 0 ? (
        <dl className="hm-hd__rows">
          {rows.map(([label, value]) => (
            <div key={label} className="hm-hd__row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}

/** True when the artefact is a drawing for the discipline, not this programme's own work. */
export function isIllustrative(kind: ArtefactKind): boolean {
  return kind === "markup" || kind === "workflow"
}

export function TileArtefact({ programme }: { programme: HomeProgramme }) {
  switch (programme.artefact) {
    case "northwind":
      return (
        <div className="hm-card hm-card--flush">
          <NorthwindArtefact />
        </div>
      )
    case "harbor-desk":
      return <HarborDeskArtefact />
    case "markup":
      return <MarkupArtefact />
    case "workflow":
      return <WorkflowArtefact />
    default:
      return <FactsArtefact programme={programme} />
  }
}
