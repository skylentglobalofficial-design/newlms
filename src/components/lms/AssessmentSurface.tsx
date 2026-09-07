import { useEffect, useRef, useState } from 'react'
import { C, T } from '../../tokens'
import type { AssignmentAttachment } from '../../lib/assignment-attachments-api'
import {
  downloadAssignmentAttachment,
  fetchAssignmentAttachments,
  requestAssignmentAttachmentUpload,
} from '../../lib/assignment-attachments-api'

export type QuizQuestion = { q: string; options: string[]; correct?: number }

type Accent = { primary: string; subtle: string; border: string; text: string }

type LocalAttachment = AssignmentAttachment & {
  localPhase?: 'preparing' | 'uploading' | 'verifying' | 'failed'
  localError?: string
}

function attachmentStatusLabel(attachment: LocalAttachment): string {
  if (attachment.localPhase === 'preparing') return 'Preparing upload…'
  if (attachment.localPhase === 'uploading') return 'Uploading file…'
  if (attachment.localPhase === 'verifying') return 'Verifying storage…'
  if (attachment.localPhase === 'failed' || attachment.storageStatus === 'failed') return 'Failed'
  if (attachment.storageStatus === 'ready' || attachment.uploadStatus === 'READY') return 'Ready'
  return 'Preparing upload…'
}

export function AssessmentSurface({
  mode,
  title,
  subtitle,
  questions,
  accent,
  passed,
  onPass,
  onSubmitAssignment,
  onSubmitAnswers,
  courseSlug,
  lessonKey,
}: {
  mode: 'mcq' | 'timed' | 'assignment'
  title: string
  subtitle?: string
  questions?: QuizQuestion[]
  accent: Accent
  passed?: boolean
  onPass?: () => void
  onSubmitAssignment?: (input: { text: string; attachmentIds: string[] }) => Promise<void>
  onSubmitAnswers?: (answers: Record<number, number>) => Promise<boolean>
  courseSlug?: string
  lessonKey?: string
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [text, setText] = useState('')
  const [assignmentDone, setAssignmentDone] = useState(false)
  const [serverPassed, setServerPassed] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<LocalAttachment[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const qs = questions ?? []
  const answeredCount = Object.keys(answers).length
  const usesServerGrading = Boolean(onSubmitAnswers)
  const correct = usesServerGrading
    ? (serverPassed ? qs.length : 0)
    : qs.filter((q, i) => q.correct !== undefined && answers[i] === q.correct).length
  const allCorrect = usesServerGrading ? serverPassed === true : correct === qs.length
  const timed = mode === 'timed'
  const readyAttachmentIds = attachments
    .filter((item) => item.storageStatus === 'ready' || item.uploadStatus === 'READY')
    .map((item) => item.id)
  const hasReadyAttachments = readyAttachmentIds.length > 0
  const uploadInProgress = attachments.some((item) => Boolean(item.localPhase))
  const canSubmitAssignment = Boolean(text.trim() || hasReadyAttachments) && !uploadInProgress && !submitting

  useEffect(() => {
    if (mode === 'assignment' || passed) return
    const id = window.setInterval(() => setElapsed(s => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [mode, passed])

  useEffect(() => {
    if (mode !== 'assignment' || !courseSlug || !lessonKey || passed || assignmentDone) return
    let cancelled = false
    setLoadingAttachments(true)
    void fetchAssignmentAttachments(courseSlug, lessonKey)
      .then((items) => {
        if (!cancelled) setAttachments(items)
      })
      .catch(() => {
        if (!cancelled) setAttachments([])
      })
      .finally(() => {
        if (!cancelled) setLoadingAttachments(false)
      })
    return () => { cancelled = true }
  }, [mode, courseSlug, lessonKey, passed, assignmentDone])

  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  async function handleAttachmentSelect(fileList: FileList | null) {
    if (!fileList?.length || !courseSlug || !lessonKey) return
    const file = fileList[0]
    setUploadError(null)

    const tempId = `temp-${Date.now()}`
    setAttachments((prev) => [
      ...prev,
      {
        id: tempId,
        fileName: file.name,
        mimeType: file.type,
        byteSize: file.size,
        storageStatus: 'pending',
        downloadAvailable: false,
        localPhase: 'preparing',
      },
    ])

    try {
      const uploaded = await requestAssignmentAttachmentUpload({
        courseSlug,
        lessonKey,
        file,
        onPhaseChange: (phase) => {
          const localPhase = phase === 'creating' ? 'preparing' : phase
          setAttachments((prev) => prev.map((item) => (
            item.id === tempId
              ? { ...item, localPhase }
              : item
          )))
        },
      })
      setAttachments((prev) => prev.map((item) => (
        item.id === tempId ? { ...uploaded, localPhase: undefined } : item
      )))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(message)
      setAttachments((prev) => prev.map((item) => (
        item.id === tempId
          ? { ...item, localPhase: 'failed', localError: message, storageStatus: 'failed' }
          : item
      )))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleAssignmentSubmitClick() {
    if (!canSubmitAssignment) return
    setSubmitting(true)
    try {
      await onSubmitAssignment?.({ text, attachmentIds: readyAttachmentIds })
      setAssignmentDone(true)
    } catch {
      setSubmitting(false)
    }
  }

  if (mode === 'assignment') {
    if (assignmentDone || passed) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Submission recorded</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Awaiting faculty review</div>
        </div>
      )
    }
    return (
      <div>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
        {subtitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{subtitle}</div>}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 16, marginBottom: 16 }}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Submission workspace</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7 }}>
            Document your approach, include queries or calculations, and attach supporting files when needed.
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your response..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: 14, color: C.white, fontSize: 13, lineHeight: 1.7, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
        />
        <div style={{ marginBottom: 16 }}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Attachments</div>
          {loadingAttachments ? (
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Loading attachments…</div>
          ) : attachments.length > 0 ? (
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${T.lineDark}`,
                    borderRadius: T.rControl,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: C.white, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attachment.fileName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>
                      {attachmentStatusLabel(attachment)}
                      {attachment.localError ? ` — ${attachment.localError}` : ''}
                    </div>
                  </div>
                  {attachment.downloadUrl ? (
                    <button
                      type="button"
                      onClick={() => { void downloadAssignmentAttachment(attachment) }}
                      style={{
                        background: accent.subtle,
                        border: `1px solid ${accent.border}`,
                        color: accent.text,
                        borderRadius: T.rControl,
                        padding: '6px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        flexShrink: 0,
                      }}
                    >
                      Download
                    </button>
                  ) : attachment.storageStatus === 'ready' || attachment.uploadStatus === 'READY' ? (
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, flexShrink: 0 }}>Download unavailable</span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 12 }}>No files attached yet.</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.csv,.zip"
            style={{ display: 'none' }}
            onChange={(event) => { void handleAttachmentSelect(event.target.files) }}
          />
          <button
            type="button"
            disabled={uploadInProgress || attachments.length >= 5 || !courseSlug || !lessonKey}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${T.lineDark}`,
              color: uploadInProgress ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.72)',
              padding: '10px 14px',
              borderRadius: T.rControl,
              fontSize: 13,
              cursor: uploadInProgress ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Add file
          </button>
          {uploadError && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{uploadError}</div>
          )}
        </div>
        <button
          type="button"
          disabled={!canSubmitAssignment}
          onClick={() => { void handleAssignmentSubmitClick() }}
          style={{
            background: !canSubmitAssignment ? 'rgba(255,255,255,0.05)' : accent.primary,
            border: 'none', color: !canSubmitAssignment ? 'rgba(255,255,255,0.25)' : C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: !canSubmitAssignment ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit assignment →'}
        </button>
      </div>
    )
  }

  if (passed) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Assessment passed</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Continue to the next lesson</div>
      </div>
    )
  }

  async function handleSubmitAsync() {
    setSubmitting(true)
    setSubmitted(true)
    if (onSubmitAnswers) {
      const passedResult = await onSubmitAnswers(answers)
      setServerPassed(passedResult)
      setSubmitting(false)
      if (passedResult) onPass?.()
      return
    }
    setSubmitting(false)
    if (correct === qs.length) onPass?.()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{title}</div>
          {subtitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
        </div>
        {timed && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text, background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rPill, padding: '5px 12px' }}>
            {timerLabel}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, maxWidth: 280 }}>
          <div style={{ width: `${qs.length ? (answeredCount / qs.length) * 100 : 0}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{answeredCount}/{qs.length}</span>
      </div>
      {submitted && !submitting && (
        <div style={{ background: allCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${allCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: T.rControl, padding: '12px 18px', marginBottom: 16, color: allCorrect ? '#22c55e' : '#ef4444', fontSize: 13 }}>
          {allCorrect
            ? `All ${qs.length} correct`
            : usesServerGrading
              ? 'Not all answers were correct. Try again.'
              : `${correct} of ${qs.length} correct. Try again.`}
        </div>
      )}
      {qs.filter((_, qi) => qi === currentQ).map((q) => {
        const qi = currentQ
        return (
          <div key={qi} style={{ marginBottom: 20 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>Question {qi + 1} of {qs.length}</div>
            <div style={{ color: C.white, fontSize: 16, fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const isCorrect = !usesServerGrading && submitted && oi === q.correct
                const isWrong = !usesServerGrading && submitted && selected && oi !== q.correct
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
                      background: isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : selected ? accent.subtle : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : selected ? accent.border : T.lineDark}`,
                      borderRadius: T.rControl, color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : selected ? accent.text : 'rgba(255,255,255,0.6)',
                      fontSize: 13, cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={() => { void handleSubmitAsync() }}
          disabled={answeredCount < qs.length || submitting}
          style={{
            background: answeredCount < qs.length ? 'rgba(255,255,255,0.05)' : accent.primary,
            border: 'none', color: answeredCount < qs.length ? 'rgba(255,255,255,0.25)' : C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: answeredCount < qs.length ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Submit
        </button>
      ) : !allCorrect ? (
        <button type="button" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setServerPassed(null) }} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, color: C.white, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try again</button>
      ) : null}
    </div>
  )
}
