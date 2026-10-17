import { useMemo, useState } from "react"
import { HARBOR } from "../programme/programme-content"
import "./HarborDeskStudio.css"

type LogRow = {
  id: string
  store: string
  type: string
  lived: string
  outcome: string
  delivery: boolean
  written: boolean
}

/** Exception log copied from public/content/product-management/harbor-desk-case.md. */
const LOG: readonly LogRow[] = [
  { id: "HD-01", store: "T. Nagar", type: "Late milk truck", lived: "WhatsApp group", outcome: "Manager saw it at 07:10; fridge gaps by 09:00", delivery: false, written: true },
  { id: "HD-02", store: "Anna Nagar", type: "Missing rice SKU", lived: "Email", outcome: "Replied Monday", delivery: false, written: true },
  { id: "HD-03", store: "RS Puram", type: "Delivery failure", lived: "Walkie, then forgotten", outcome: "Customer called HQ Tuesday", delivery: true, written: false },
  { id: "HD-04", store: "KK Nagar", type: "Staff no-show", lived: "Personal WhatsApp", outcome: "Covered; not logged", delivery: false, written: true },
  { id: "HD-05", store: "Town Hall", type: "Late vegetable truck", lived: "No channel", outcome: "Discovered at open; not recorded until asked", delivery: false, written: false },
  { id: "HD-06", store: "Peelamedu", type: "Delivery failure", lived: "WhatsApp, 43 unread", outcome: "Buried", delivery: true, written: true },
  { id: "HD-07", store: "T. Nagar", type: "Missing oil SKU", lived: "Email", outcome: "Duplicate of a Friday thread", delivery: false, written: true },
  { id: "HD-08", store: "Madurai Main", type: "Cooler fault", lived: "Walkie", outcome: "Engineer called; no written trail", delivery: false, written: false },
  { id: "HD-09", store: "Anna Nagar", type: "Delivery failure", lived: "Nothing", outcome: "Customer WhatsApped the cashier", delivery: true, written: false },
]

const NOTES = [
  { who: "Priya", role: "Store lead, T. Nagar", quote: "If the milk is late I need someone at HQ who is actually looking before 7am." },
  { who: "Arun", role: "HQ operations, Chennai", quote: "I cannot tell you how many weekend exceptions we had. I can tell you how many stores complained loudly." },
  { who: "Meena", role: "Cashier, Anna Nagar", quote: "I tell them I will ask. Then I forget if it is busy." },
  { who: "Karthik", role: "Engineer", quote: "If you ask for Gmail, I will build Gmail badly." },
] as const

type FilterId = "all" | "delivery" | "unwritten"

const FILTERS: readonly { id: FilterId; label: string }[] = [
  { id: "all", label: "All 9" },
  { id: "delivery", label: "Delivery failures" },
  { id: "unwritten", label: "No written trail" },
]

export default function HarborDeskStudio() {
  const [filter, setFilter] = useState<FilterId>("all")
  const rows = useMemo(() => {
    if (filter === "delivery") return LOG.filter((row) => row.delivery)
    if (filter === "unwritten") return LOG.filter((row) => !row.written)
    return LOG
  }, [filter])

  return (
    <section className="harbor-studio" aria-labelledby="harbor-studio-title">
      <p className="os-eyebrow">Case materials</p>
      <h2 id="harbor-studio-title">Harbor Desk, weekend of {HARBOR.weekend}</h2>
      <p className="harbor-studio__note">
        These notes are the fictional Harbor Retail case. Filtering the log does not run a query, and the case has no revenue figure.
      </p>
      <dl className="harbor-studio__facts">
        <div>
          <dt>Stores</dt>
          <dd>{HARBOR.stores}</dd>
        </div>
        <div>
          <dt>Interviews</dt>
          <dd>{HARBOR.interviews}</dd>
        </div>
        <div>
          <dt>Constraint</dt>
          <dd>{HARBOR.constraint}</dd>
        </div>
      </dl>

      <div className="harbor-studio__filters" role="group" aria-label="Exception log filter">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? "is-active" : undefined}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="harbor-log" tabIndex={0} role="region" aria-label="Exception log">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Store</th>
              <th scope="col">Type</th>
              <th scope="col">Where it lived</th>
              <th scope="col">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.id}</th>
                <td>{row.store}</td>
                <td>{row.type}</td>
                <td>{row.lived}</td>
                <td>{row.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="harbor-studio__count">{rows.length} shown from the case log.</p>

      <h3>Interview notes</h3>
      <ul className="harbor-notes">
        {NOTES.map((note) => (
          <li key={note.who}>
            <strong>{note.who}</strong>
            <span>{note.role}</span>
            <q>{note.quote}</q>
          </li>
        ))}
      </ul>
    </section>
  )
}
