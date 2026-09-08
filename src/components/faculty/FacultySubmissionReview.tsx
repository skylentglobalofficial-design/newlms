import { useEffect, useState } from 'react'
import { C, T } from '../../tokens'
import {
  downloadFacultySubmissionAttachment,
  fetchFacultySubmission,
  type FacultySubmission,
  type FacultySubmissionDetail,
} from '../../lib/faculty-api'

type Accent = { primary: string; subtle: string; border: string; text: string }

function formatSubmittedAt(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function attachmentStatusLabel(attachment: FacultySubmissionDetail['attachments'][number]): string {
  if (attachment.storageStatus === 'failed') return 'Failed'
  if (attachment.storageStatus === 'ready') return 'Ready'
  return 'Preparing upload…'
}

export default function FacultySubmissionReview({
  submission,
  accent,
  onClose,
}: {
  submission: FacultySubmission
  accent: Accent
  onClose: () => void
}) {
  const [detail, setDetail] = useState<FacultySubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchFacultySubmission(submission.id)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDetail(null)
          setError(err instanceof Error ? err.message : 'Failed to load submission')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [submission.id])

  const muted = 'var(--skylent-text-muted)'
  const secondary = 'var(--skylent-text-secondary)'
  const foreground = 'var(--skylent-text)'
  const surface = 'var(--skylent-card-bg)'
  const border = 'var(--skylent-border-subtle)'

  return (
    <div style={{
      marginTop: 20,
      padding: '18px 20px',
      background: surface,
      border: `1px solid ${accent.border}`,
      borderRadius: T.rCard,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div className="skylent-label" style={{ color: accent.text, fontSize: 10, letterSpacing: '0.12em', marginBottom: 6 }}>
            Submission review
          </div>
          <h4 style={{ color: foreground, fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>
            {submission.lessonTitle}
          </h4>
          <div style={{ color: secondary, fontSize: 12 }}>
            {submission.studentName}
            {submission.courseTitle ? ` · ${submission.courseTitle}` : ''}
          </div>
          <div style={{ color: muted, fontSize: 11, marginTop: 4 }}>
            Submitted {formatSubmittedAt(submission.submittedAt)}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'var(--skylent-input-bg)',
            border: `1px solid ${border}`,
            color: secondary,
            padding: '6px 10px',
            borderRadius: T.rControl,
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
          }}
        >
          Close
        </button>
      </div>

      {loading ? (
        <div style={{ color: secondary, fontSize: 13 }}>Loading submission…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>
      ) : detail ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Learner response</div>
            <div style={{
              background: 'var(--skylent-input-bg)',
              border: `1px solid ${border}`,
              borderRadius: T.rControl,
              padding: 14,
              color: secondary,
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              minHeight: 80,
            }}>
              {detail.responseText?.trim() ? detail.responseText : 'No written response provided.'}
            </div>
          </div>

          <div>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Attachments</div>
            {detail.attachments.length === 0 ? (
              <div style={{ color: secondary, fontSize: 13 }}>No files attached.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {detail.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      background: surface,
                      border: `1px solid ${border}`,
                      borderRadius: T.rControl,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: foreground, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment.fileName}
                      </div>
                      <div style={{ color: muted, fontSize: 11, marginTop: 2 }}>
                        {attachmentStatusLabel(attachment)}
                        {!detail.objectStorageConfigured && attachment.storageStatus !== 'ready'
                          ? ' · Storage unavailable'
                          : ''}
                      </div>
                    </div>
                    {attachment.downloadUrl ? (
                      <button
                        type="button"
                        onClick={() => { void downloadFacultySubmissionAttachment(attachment) }}
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
                    ) : (
                      <span style={{ color: muted, fontSize: 11, flexShrink: 0 }}>
                        Download unavailable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
