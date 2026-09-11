import { useId, useMemo, useState, type FormEvent } from 'react'
import type {
  AssignmentBriefContent,
  AssignmentBriefPayload,
  AssignmentAttachmentMeta,
} from '../../lib/lms-api'
import { submitProjectAssignment, uploadAssignmentArtifact } from '../../lib/lms-api'

type Accent = { primary: string; subtle: string; border: string; text: string }

const ACCEPT_ATTR = '.xlsx,.xls,.pbix,.pdf,.sql'

function wordCount(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectExperience({
  courseSlug,
  lessonKey,
  brief,
  accent,
  status,
  initialResponseText,
  initialAttachments,
  onSubmitted,
}: {
  courseSlug: string
  lessonKey: string
  brief: AssignmentBriefPayload
  accent: Accent
  status: string
  initialResponseText?: string | null
  initialAttachments?: AssignmentAttachmentMeta[]
  onSubmitted: () => Promise<void>
}) {
  const content = (brief.content ?? {}) as AssignmentBriefContent
  const formId = useId()
  const submitted = status === 'submitted'
  const uploadConfig = brief.artifactUpload
  const maxBytes = uploadConfig?.maxBytes ?? 25 * 1024 * 1024
  const allowedExtensions = uploadConfig?.allowedExtensions ?? ['.xlsx', '.xls', '.pbix', '.pdf', '.sql']

  const [responseText, setResponseText] = useState(initialResponseText ?? '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedArtifact, setUploadedArtifact] = useState<AssignmentAttachmentMeta | null>(
    initialAttachments?.find((item) => item.stored) ?? initialAttachments?.[0] ?? null,
  )
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>(
    initialAttachments?.some((item) => item.stored) ? 'uploaded' : 'idle',
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const words = useMemo(() => wordCount(responseText), [responseText])
  const scenario = content.scenario
  const dataset = brief.dataset
  const hasStoredArtifact = Boolean(uploadedArtifact?.stored || uploadedArtifact?.storageProvider === 'local')
  const showCurrency = Boolean(content.dataset?.netRevenueFormula && content.dataset?.currency)

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

  function handleFileChosen(file: File | null) {
    setError(null)
    setSelectedFile(file)
    if (!file) {
      setUploadState(hasStoredArtifact ? 'uploaded' : 'idle')
      return
    }
    const lower = file.name.toLowerCase()
    const allowed = allowedExtensions.some((ext) => lower.endsWith(ext))
    if (!allowed) {
      setSelectedFile(null)
      setUploadState('error')
      setError(`Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`)
      return
    }
    if (file.size > maxBytes) {
      setSelectedFile(null)
      setUploadState('error')
      setError(`File is too large. Maximum size is ${formatBytes(maxBytes)}.`)
      return
    }
    setUploadState('idle')
  }

  async function handleArtifactUpload() {
    if (!selectedFile) {
      setError('Choose an analytical artifact file before uploading.')
      return
    }
    setError(null)
    setUploadState('uploading')
    try {
      const result = await uploadAssignmentArtifact(courseSlug, lessonKey, selectedFile)
      setUploadedArtifact(result.attachment)
      setUploadState('uploaded')
      setSelectedFile(null)
    } catch (err) {
      setUploadState('error')
      setError(err instanceof Error ? err.message : 'Artifact upload failed')
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
    if (!hasStoredArtifact) {
      setError('Upload your analytical artifact file before submitting. Filename-only metadata is not accepted.')
      return
    }

    setSubmitting(true)
    try {
      await submitProjectAssignment(courseSlug, lessonKey, trimmed)
      await onSubmitted()
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

      <section className="lms-project-section" aria-labelledby={`${formId}-objective`}>
        <h3 id={`${formId}-objective`}>Objective</h3>
        <p>{content.objective}</p>
      </section>

      {(content.learningObjectives?.length ?? 0) > 0 ? (
        <section className="lms-project-section" aria-labelledby={`${formId}-learning-objectives`}>
          <h3 id={`${formId}-learning-objectives`}>Learning objectives</h3>
          <ol className="lms-project-list">
            {(content.learningObjectives ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      ) : null}

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

      {(content.dashboardRequirements?.length ?? 0) > 0 ? (
        <section className="lms-project-section" aria-labelledby={`${formId}-dashboard`}>
          <h3 id={`${formId}-dashboard`}>Dashboard requirements</h3>
          <p className="lms-project-note">
            Build a coherent set of views that answer these questions. Chart type can vary if the metric is clear.
          </p>
          <ul className="lms-project-list lms-project-dashboard-list">
            {(content.dashboardRequirements ?? []).map((item) => (
              <li key={item.id}>
                <p className="lms-project-dashboard-title">
                  <strong>
                    {item.id} — {item.view}
                  </strong>
                </p>
                <p>
                  <span className="lms-project-meta-label">Question.</span> {item.questionAnswered}
                </p>
                <p>
                  <span className="lms-project-meta-label">Metric.</span> {item.metric}
                </p>
                <p>
                  <span className="lms-project-meta-label">Acceptable form.</span> {item.acceptableVisualForm}
                </p>
                <p>
                  <span className="lms-project-meta-label">Interpretation.</span> {item.interpretationExpectation}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(content.optionalAnalysis?.length ?? 0) > 0 ? (
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
      ) : null}

      <section className="lms-project-section" aria-labelledby={`${formId}-milestones`}>
        <h3 id={`${formId}-milestones`}>Workflow</h3>
        <ol className="lms-project-milestones">
          {(content.milestones ?? []).map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.purpose}</span>
              {item.evidenceBeforeNext ? (
                <span className="lms-project-note">Before moving on: {item.evidenceBeforeNext}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="lms-project-section" aria-labelledby={`${formId}-dataset`}>
        <h3 id={`${formId}-dataset`}>Dataset</h3>
        {dataset ? (
          <>
            <p>
              <strong>{dataset.name}</strong>
              {dataset.fileName ? (
                <>
                  {' '}
                  — <span className="lms-project-filename">{dataset.fileName}</span>
                </>
              ) : null}
            </p>
            {dataset.disclaimer ? (
              <p className="lms-project-honesty" role="note">
                {dataset.disclaimer}
              </p>
            ) : null}
            {content.dataset?.analysisWindow ? (
              <p>
                Analysis window: {content.dataset.analysisWindow.start} through{' '}
                {content.dataset.analysisWindow.end}
                {content.dataset.analysisWindow.asOfDate
                  ? ` (as-of ${content.dataset.analysisWindow.asOfDate})`
                  : ''}
                {showCurrency ? `. Currency: ${content.dataset.currency}.` : '.'}
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
                {downloading ? 'Preparing download…' : 'Download dataset'}
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

      <section className="lms-project-section" aria-labelledby={`${formId}-work`}>
        <h3 id={`${formId}-work`}>Your submission</h3>
        {submitted ? (
          <div className="lms-project-submitted" role="status">
            <p>
              <strong>Submission recorded</strong>
            </p>
            <p>
              Written analysis and analytical artifact are stored with this assignment. No automatic score is
              generated, and faculty review tooling is not part of this submission flow yet.
            </p>
            {uploadedArtifact ? (
              <p>
                Stored artifact: <span className="lms-project-filename">{uploadedArtifact.fileName}</span> (
                {formatBytes(uploadedArtifact.byteSize)})
                {uploadedArtifact.stored || uploadedArtifact.storageProvider === 'local'
                  ? ' — binary stored on LMS server'
                  : ''}
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
                placeholder="Document filters and metric definitions, headline metrics, evidence-backed findings, and limitations. Separate observation from interpretation."
              />
              <p id={`${formId}-wordcount`} className="lms-project-note">
                Word count: {words} (target{' '}
                {content.deliverables?.writtenAnalysis?.wordCount ?? '400–800 words'})
              </p>
              {content.deliverables?.writtenAnalysis?.mustInclude?.length ? (
                <p className="lms-project-note">
                  Must include: {content.deliverables.writtenAnalysis.mustInclude.join('; ')}.
                </p>
              ) : null}
            </div>

            <fieldset className="lms-project-fieldset">
              <legend>Analytical artifact (required upload)</legend>
              <p className="lms-project-note">
                Upload your Excel, Power BI, PDF, or SQL artifact. The server validates extension and file signature,
                then stores the binary on the LMS filesystem. Filename-only metadata is not accepted for completion.
              </p>
              {uploadConfig?.honesty ? <p className="lms-project-note">{uploadConfig.honesty}</p> : null}
              <p className="lms-project-note">
                Allowed: {allowedExtensions.join(', ')}. Max size: {formatBytes(maxBytes)}.
              </p>

              <div className="lms-project-field">
                <label htmlFor={`${formId}-file`}>Choose file</label>
                <input
                  id={`${formId}-file`}
                  type="file"
                  accept={ACCEPT_ATTR}
                  onChange={(event) => handleFileChosen(event.target.files?.[0] ?? null)}
                />
              </div>

              {selectedFile ? (
                <p className="lms-project-note" role="status">
                  Selected: <strong className="lms-project-filename">{selectedFile.name}</strong> (
                  {formatBytes(selectedFile.size)}) — not uploaded yet
                </p>
              ) : null}

              {hasStoredArtifact && uploadedArtifact ? (
                <p className="lms-project-note" role="status">
                  Uploaded artifact confirmed:{' '}
                  <strong className="lms-project-filename">{uploadedArtifact.fileName}</strong> (
                  {formatBytes(uploadedArtifact.byteSize)}). You may replace it by uploading another file.
                </p>
              ) : (
                <p className="lms-project-note" role="status">
                  No stored artifact yet. Upload is required before submit.
                </p>
              )}

              <button
                type="button"
                className="lms-project-upload"
                style={{ borderColor: accent.border, color: accent.text }}
                onClick={() => void handleArtifactUpload()}
                disabled={!selectedFile || uploadState === 'uploading'}
              >
                {uploadState === 'uploading' ? 'Uploading…' : 'Upload artifact'}
              </button>
            </fieldset>

            {error ? (
              <p className="lms-project-error" role="alert">
                {error}
              </p>
            ) : null}

            {!hasStoredArtifact ? (
              <p className="lms-project-note" id={`${formId}-submit-hint`}>
                Submit stays disabled until a stored analytical artifact upload is confirmed.
              </p>
            ) : null}

            <button
              type="submit"
              className="lms-project-submit"
              style={{ background: accent.primary }}
              disabled={submitting || !hasStoredArtifact}
              aria-describedby={!hasStoredArtifact ? `${formId}-submit-hint` : undefined}
            >
              {submitting ? 'Submitting…' : 'Submit project'}
            </button>
          </form>
        )}
      </section>
    </article>
  )
}
