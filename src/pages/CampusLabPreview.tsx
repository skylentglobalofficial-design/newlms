import { useState } from "react"

const SAMPLE_RESULTS = [
  { learner: "Learner B", status: "Passed", score: "2/2" },
  { learner: "Learner C", status: "Awaiting review", score: "" },
]

const views = [
  { id: "task", label: "Student task" },
  { id: "review", label: "Faculty review" },
  { id: "report", label: "Cohort report" },
] as const

export default function CampusLabPreview() {
  const [view, setView] = useState<(typeof views)[number]["id"]>("task")
  const [submission, setSubmission] = useState<{ category: string; explanation: string }>()
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string }>()
  const results = [
    {
      learner: "Learner A",
      status: evaluation
        ? evaluation.score === 2 ? "Passed" : "Revision requested"
        : submission ? "Awaiting review" : "Assigned",
      score: evaluation ? `${evaluation.score}/2` : "",
    },
    ...SAMPLE_RESULTS,
  ]
  const passed = results.filter((row) => row.status === "Passed").length
  const csv = [
    "Learner,Task status,Score",
    ...results.map(({ learner, status, score }) => `${learner},${status},${score}`),
  ].join("\r\n")

  return (
    <section className="abx-section abx-section--tint" id="campus-preview" aria-labelledby="campus-preview-title">
      <div className="sky-container">
        <p className="hx-eyebrow hx-eyebrow--dark">Illustrative cohort</p>
        <h2 id="campus-preview-title" className="hx-h2 hx-h2--sm">Follow one assignment through the lab.</h2>
        <p>Use fictional work to try the student, faculty and placement-cell views. Refresh the page to reset the preview.</p>
        <div className="inx-preview">
          <div className="inx-preview__nav" role="group" aria-label="Preview views">
            {views.map(({ id, label }) => (
              <button key={id} type="button" className="sk-btn sk-btn-secondary" aria-pressed={view === id} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </div>

          {view === "task" && (
            <form className="inx-preview__panel" onSubmit={(event) => {
              event.preventDefault()
              const fields = new FormData(event.currentTarget)
              setSubmission({ category: String(fields.get("category")), explanation: String(fields.get("explanation")).trim() })
              setEvaluation(undefined)
              setView("review")
            }}>
              <h3>Which category had the highest net sales?</h3>
              <div className="inx-preview__table">
                <table>
                  <thead><tr><th scope="col">Category</th><th scope="col">Sales</th><th scope="col">Refunds</th></tr></thead>
                  <tbody>
                    <tr><td>Books</td><td>₹8,000</td><td>₹500</td></tr>
                    <tr><td>Devices</td><td>₹11,000</td><td>₹4,000</td></tr>
                    <tr><td>Books</td><td>₹2,000</td><td>₹0</td></tr>
                  </tbody>
                </table>
              </div>
              <label>Category
                <select name="category" required defaultValue={submission?.category ?? ""}>
                  <option value="">Choose a category</option>
                  <option>Books</option><option>Devices</option>
                </select>
              </label>
              <label>Explain your calculation
                <input name="explanation" required pattern=".*\S.*" maxLength={400} defaultValue={submission?.explanation} />
              </label>
              <button className="sk-btn sk-btn-primary">Submit sample answer</button>
            </form>
          )}

          {view === "review" && (submission ? (
            <form className="inx-preview__panel" onSubmit={(event) => {
              event.preventDefault()
              const fields = new FormData(event.currentTarget)
              setEvaluation({ score: fields.getAll("mark").length, feedback: String(fields.get("feedback")).trim() })
              setView("report")
            }}>
              <h3>Review Learner A’s answer</h3>
              <p><strong>{submission.category}</strong> · {submission.explanation}</p>
              <p>Answer guide — Books ₹9,500 and Devices ₹7,000. Award one point for each criterion. Both points are required to pass.</p>
              <fieldset>
                <legend>Sample rubric</legend>
                <label><input type="checkbox" name="mark" value="category" /> Correct category</label>
                <label><input type="checkbox" name="mark" value="explanation" /> Correct treatment of refunds and category totals</label>
              </fieldset>
              <label>Feedback
                <input name="feedback" required pattern=".*\S.*" maxLength={400} defaultValue={evaluation?.feedback} />
              </label>
              <button className="sk-btn sk-btn-primary">Apply sample evaluation</button>
            </form>
          ) : <p className="inx-preview__panel">Submit an answer in the student view to review it here.</p>)}

          {view === "report" && (
            <div className="inx-preview__panel">
              <h3>Sample cohort report</h3>
              <p role="status"><strong>{passed} of {results.length} passed</strong> · SQL practical</p>
              <div className="inx-preview__table">
                <table>
                  <thead><tr><th scope="col">Learner</th><th scope="col">Task status</th><th scope="col">Score</th></tr></thead>
                  <tbody>{results.map(({ learner, status, score }) => (
                    <tr key={learner}><td>{learner}</td><td>{status}</td><td>{score || "—"}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              {evaluation && <p><strong>Feedback for Learner A.</strong> {evaluation.feedback}</p>}
              <a className="sk-btn sk-btn-secondary" download="skylent-sample-cohort.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}>
                Download sample CSV
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
