import { useId, useMemo, useState, type FormEvent } from 'react'
import type { AssignmentBriefContent, AssignmentBriefPayload, AssignmentAttachmentMeta } from '../../lib/lms-api'

type Accent = { primary: string; subtle: string; border: string; text: string }

const PROJECT_MIME_OPTIONS: Array<{ label: string; mimeType: string; extensions: string }> = [
  {
    label: 'Excel workbook (.xlsx)',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: '.xlsx',
  },
  {
    label: 'Excel legacy (.xls)',
    mimeType: 'application/vnd.ms-excel',
    extensions: '.xls',
  },
  {
    label: 'Power BI (.pbix)',
    mimeType: 'application/octet-stream',
    extensions: '.pbix',
  },
  {
    label: 'PDF export',
    mimeType: 'application/pdf',
    extensions: '.pdf',
  },
  {
    label: 'Markdown notes (.md)',
    mimeType: 'text/markdown',
    extensions: '.md',
  },
  {
    label: 'Plain text (.txt)',
    mimeType: 'text/plain',
    extensions: '.txt',
  },
]

function wordCount(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export default function ProjectExperience({
  brief,
  accent,
  status,
  initialResponseText,
  initialAttachments,
  onSubmit,
}: {
  brief: AssignmentBriefPayload
  accent: Accent
  status: string
  initialResponseText?: string | null
  initialAttachments?: AssignmentAttachmentMeta[]
  onSubmit: (payload: {
    responseText: string
    attachments: Array<{ fileName: string; mimeType: string; byteSize: number }>
  }) => Promise<void>
}) {
  const content = (brief.content ?? {}) as AssignmentBriefContent
  const formId = useId()
  const submitted = status === 'submitted'
  const [responseText, setResponseText] = useState(initialResponseText ?? '')
  const [fileName, setFileName] = useState(initialAttachments?.[0]?.fileName ?? '')
  const [mimeType, setMimeType] = useState(
    initialAttachments?.[0]?.mimeType ?? PROJECT_MIME_OPTIONS[0].mimeType,
  )
  const [byteSize, setByteSize] = useState(
    initialAttachments?.[0]?.byteSize ? String(initialAttachments[0].byteSize) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const words = useMemo(() => wordCount(responseText), [responseText])
  const scenario = content.scenario
  const dataset = brief.dataset

  async function handleDatasetDownload() {
    if (!dataset?.downloadPath || !dataset.available) return
    setDownloading(true)
    setError(null)
    try {
      const response = await fetch(dataset.downloadPath, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Dataset download failed. Confirm you are enrolled and this lesson is unlocked.')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = dataset.fileName || 'dataset.xlsx'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dataset download failed')
    } finally {
      setDownloading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitted) return
    setError(null)

    const trimmed = responseText.trim()
    if (!trimmed) {
      setError('Written analysis is required (400–800 words).')
      return
    }
    if (!fileName.trim()) {
      setError('Declare your analytical artifact file name (Excel, Power BI, or PDF export).')
      return
    }
    const size = Number(byteSize)
    if (!Number.isFinite(size) || size < 1) {
      setError('Enter the approximate file size in bytes for the analytical artifact.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        responseText: trimmed,
        attachments: [
          {
            fileName: fileName.trim(),
            mimeType,
            byteSize: Math.floor(size),
          },
        ],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="lms-project-experience" aria-labelledby={`${formId}-title`}>
      <header className="lms-project-hero">
        {brief.kicker ? <p className="lms-lesson-kicker">{brief.kicker}</p> : null}
        <h2 id={`${formId}-title`}>{brief.title}</h2>
        {scenario?.framing ? (
          <p className="lms-project-honesty" role="note">
            {scenario.framing}
          </p>
        ) : null}
      </header>

      <section className="lms-project-section" aria-labelledby={`${formId}-objective`}>
        <h3 id={`${formId}-objective`}>Objective</h3>
        <p>{content.objective}</p>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-scenario`}>
        <h3 id={`${formId}-scenario`}>Scenario</h3>
        {scenario?.caseName ? <p className="lms-project-case">{scenario.caseName}</p> : null}
        <p>{scenario?.narrative}</p>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-problem`}>
        <h3 id={`${formId}-problem`}>Business problem</h3>
        <p>{content.businessProblem?.primaryQuestion}</p>
        {content.businessProblem?.decisionSupported ? (
          <p>{content.businessProblem.decisionSupported}</p>
        ) : null}
        {content.businessProblem?.gradingNote ? (
          <p className="lms-project-note">{content.businessProblem.gradingNote}</p>
        ) : null}
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-task`}>
        <h3 id={`${formId}-task`}>Your task</h3>
        <ol className="lms-project-list">
          {(content.learnerTask ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-required`}>
        <h3 id={`${formId}-required`}>Required analysis</h3>
        <ul className="lms-project-list">
          {(content.requiredAnalysis ?? []).map((item) => (
            <li key={item.id}>
              <strong>{item.id}.</strong> {item.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-optional`}>
        <h3 id={`${formId}-optional`}>Optional extensions</h3>
        <ul className="lms-project-list">
          {(content.optionalAnalysis ?? []).map((item) => (
            <li key={item.id}>
              <strong>{item.id}.</strong> {item.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-dataset`}>
        <h3 id={`${formId}-dataset`}>Dataset</h3>
        {dataset ? (
          <>
            <p>
              <strong>{dataset.name}</strong>
              {dataset.fileName ? ` — ${dataset.fileName}` : null}
            </p>
            {dataset.disclaimer ? (
              <p className="lms-project-honesty" role="note">
                {dataset.disclaimer}
              </p>
            ) : null}
            {content.dataset?.analysisWindow ? (
              <p>
                Analysis window: {content.dataset.analysisWindow.start} through{' '}
                {content.dataset.analysisWindow.end}. Currency: {content.dataset.currency ?? 'INR'}.
              </p>
            ) : null}
            {content.dataset?.netRevenueFormula ? (
              <p className="lms-project-note">{content.dataset.netRevenueFormula}</p>
            ) : null}
            {dataset.available && dataset.downloadPath ? (
              <button
                type="button"
                className="lms-project-download"
                style={{ background: accent.primary }}
                onClick={() => void handleDatasetDownload()}
                disabled={downloading}
              >
                {downloading ? 'Preparing download…' : `Download ${dataset.fileName ?? 'dataset'}`}
              </button>
            ) : (
              <p className="lms-project-note" role="status">
                Dataset file is referenced in the brief but is not available for download in this environment.
              </p>
            )}
          </>
        ) : (
          <p>No dataset is attached to this project brief.</p>
        )}
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-constraints`}>
        <h3 id={`${formId}-constraints`}>Constraints</h3>
        <ul className="lms-project-list">
          {(content.constraints ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-milestones`}>
        <h3 id={`${formId}-milestones`}>Milestones</h3>
        <ol className="lms-project-milestones">
          {(content.milestones ?? []).map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.purpose}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-deliverables`}>
        <h3 id={`${formId}-deliverables`}>Deliverables</h3>
        <p>Choose one analytical path, then submit the written analysis.</p>
        <ul className="lms-project-list">
          {(content.deliverables?.analyticalArtifact?.paths ?? []).map((path) => (
            <li key={path.id}>
              <strong>{path.label}</strong> — {path.description}
            </li>
          ))}
        </ul>
        {content.deliverables?.writtenAnalysis ? (
          <p>
            Written analysis: {content.deliverables.writtenAnalysis.wordCount}. Must include:{' '}
            {(content.deliverables.writtenAnalysis.mustInclude ?? []).join('; ')}.
          </p>
        ) : null}
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-submission`}>
        <h3 id={`${formId}-submission`}>Submission requirements</h3>
        <ul className="lms-project-list">
          {(content.submissionExpectations?.requiredArtifacts ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {content.submissionExpectations?.naming ? (
          <p>Suggested naming: {content.submissionExpectations.naming}</p>
        ) : null}
        {content.submissionExpectations?.attachmentNote ? (
          <p className="lms-project-note">{content.submissionExpectations.attachmentNote}</p>
        ) : null}
        {content.completionRule ? <p className="lms-project-note">{content.completionRule}</p> : null}
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-rubric`}>
        <h3 id={`${formId}-rubric`}>Rubric / evaluation guidance</h3>
        <p className="lms-project-note">
          Faculty review uses Meets / Partial / Does not meet. This is guidance — not automatic scoring.
        </p>
        <div className="lms-project-rubric" role="table" aria-label="Project rubric">
          <div className="lms-project-rubric-row is-head" role="row">
            <span role="columnheader">Criterion</span>
            <span role="columnheader">Meets</span>
            <span role="columnheader">Partial</span>
            <span role="columnheader">Does not meet</span>
          </div>
          {(content.rubric ?? []).map((row) => (
            <div className="lms-project-rubric-row" role="row" key={row.criterion}>
              <span role="cell">
                <strong>{row.criterion}</strong>
              </span>
              <span role="cell">{row.meets}</span>
              <span role="cell">{row.partial}</span>
              <span role="cell">{row.doesNotMeet}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-work`}>
        <h3 id={`${formId}-work`}>Your submission</h3>
        {submitted ? (
          <div className="lms-project-submitted" role="status">
            <p>
              <strong>Submission recorded</strong>
            </p>
            <p>Awaiting faculty review. No automatic score is generated for this project.</p>
            {initialAttachments?.length ? (
              <p>
                Declared artifact: {initialAttachments[0].fileName} ({initialAttachments[0].mimeType})
              </p>
            ) : null}
          </div>
        ) : (
          <form className="lms-project-submit-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="lms-project-field">
              <label htmlFor={`${formId}-analysis`}>Written analysis</label>
              <textarea
                id={`${formId}-analysis`}
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                rows={14}
                required
                aria-describedby={`${formId}-wordcount`}
                placeholder="Filters used, R1 headline metrics, R6 priorities with evidence, and limitations…"
              />
              <p id={`${formId}-wordcount`} className="lms-project-note">
                Word count: {words} (target 400–800)
              </p>
            </div>

            <fieldset className="lms-project-fieldset">
              <legend>Analytical artifact (metadata)</legend>
              <p className="lms-project-note">
                Binary object storage may remain pending. Declare the file you produced so faculty can review
                the submission record. Supported types: .xlsx, .xls, .pbix, .pdf, .md, .txt.
              </p>
              <div className="lms-project-field">
                <label htmlFor={`${formId}-filename`}>File name</label>
                <input
                  id={`${formId}-filename`}
                  type="text"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  placeholder="DA_l13_SalesAnalysis_yourname.xlsx"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="lms-project-field">
                <label htmlFor={`${formId}-mime`}>File type</label>
                <select
                  id={`${formId}-mime`}
                  value={mimeType}
                  onChange={(event) => setMimeType(event.target.value)}
                >
                  {PROJECT_MIME_OPTIONS.map((option) => (
                    <option key={option.mimeType + option.extensions} value={option.mimeType}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lms-project-field">
                <label htmlFor={`${formId}-bytes`}>Approximate size (bytes)</label>
                <input
                  id={`${formId}-bytes`}
                  type="number"
                  min={1}
                  max={50_000_000}
                  value={byteSize}
                  onChange={(event) => setByteSize(event.target.value)}
                  required
                />
              </div>
            </fieldset>

            {error ? (
              <p className="lms-project-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="lms-project-submit"
              style={{ background: accent.primary }}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit project'}
            </button>
          </form>
        )}
      </section>
    </article>
  )
}
