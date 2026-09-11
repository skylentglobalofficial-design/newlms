import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Job } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import {
  courseEnrollmentMessage,
  programEnrollmentMessage,
  type CatalogEnrollmentStatus,
} from '../lib/catalog-api'
import { fulfillCatalogEnrollment, learnPathForWorkspace } from '../lib/catalog-enrollment'
import { C } from '../tokens'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

export { C } from '../tokens'
export {
  IMG,
  useFadeIn,
  useInView,
  useCountUp,
  FadeIn,
  Nav,
  Footer,
  PageShell,
} from './site-shell'

// ─── ENROLLMENT MODAL (product access — no payment gateway yet) ───────────────
export type CatalogEnrollItem = {
  kind: 'course' | 'program'
  slug: string
  title: string
  price: number
  enrollmentStatus?: CatalogEnrollmentStatus
  enrollable: boolean
  linkedCourseSlugs?: string[]
}

export function EnrollmentModal({ item, onClose, themeId }: { item: CatalogEnrollItem; onClose: () => void; themeId?: AuroraThemeId }) {
  const { user } = useAuth()
  const accent = getDomainAccent(themeId ?? (item.kind === 'program' ? 'professional' : 'data-science'))
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const helperMessage = item.kind === 'program'
    ? programEnrollmentMessage({
        enrollmentStatus: item.enrollmentStatus ?? null,
        linkedCourseSlugs: item.linkedCourseSlugs ?? [],
      })
    : courseEnrollmentMessage()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  async function handlePrimaryAction() {
    if (!item.enrollable) {
      onClose()
      navigate('/contact')
      return
    }

    if (!user) {
      onClose()
      navigate('/login', { state: { enrollTarget: { kind: item.kind, slug: item.slug } } })
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const workspace = await fulfillCatalogEnrollment({ kind: item.kind, slug: item.slug })
      onClose()
      navigate(learnPathForWorkspace(workspace))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enroll right now')
    } finally {
      setSubmitting(false)
    }
  }

  const primaryLabel = !item.enrollable
    ? item.enrollmentStatus === 'waitlist'
      ? 'Talk to us about the waitlist'
      : item.enrollmentStatus === 'coming_soon'
        ? 'Register interest'
        : 'Enrollment not available yet'
    : user
      ? submitting ? 'Opening workspace…' : 'Get learning access'
      : 'Sign in to enroll'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,15,0.6)', zIndex: 500, backdropFilter: 'blur(6px)' }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="enrollment-modal-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.white, borderRadius: 18, padding: '36px 40px', width: 540, maxWidth: '94vw', zIndex: 501, boxShadow: '0 40px 120px rgba(0,0,0,0.32)', overflowY: 'auto', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 3 }}>
              {item.enrollable ? 'Product access' : 'Enrollment status'}
            </div>
            <div id="enrollment-modal-title" style={{ color: C.ink, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close enrollment dialog" style={{ background: C.sand, border: 'none', borderRadius: 7, padding: '7px 13px', cursor: 'pointer', color: C.slate, fontSize: 14 }}>✕</button>
        </div>

        <div style={{ background: C.sand, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.06em' }}>LISTED PRICE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.ink }}>₹{item.price.toLocaleString('en-IN')}</div>
          <div style={{ color: C.slate, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
            Payment is not collected here yet. {item.enrollable ? 'Enrollment grants access to the live learning workspace.' : 'We will notify you when enrollment opens.'}
          </div>
        </div>

        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>{helperMessage}</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: C.sand, border: 'none', color: C.ink, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Close</button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={submitting}
            style={{ flex: 2, background: accent.primary, border: 'none', color: C.black, borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', opacity: submitting ? 0.7 : 1 }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── APPLY MODAL (job application — separate from enrollment) ─────────────────
export function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const steps = ['Profile', 'Resume', 'Screening', 'Review', 'Result']
  const accent = getDomainAccent('career')
  const demo = useDemoState()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  function handleContinue() {
    if (step === 3) {
      if (demo.hasApplied(job.id)) {
        setStep(4)
        return
      }
      demo.applyToJob({ id: job.id, role: job.role, company: job.company })
      setStep(4)
      return
    }
    setStep(s => s + 1)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,15,0.55)', zIndex: 500, backdropFilter: 'blur(5px)' }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="apply-modal-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.white, borderRadius: 16, padding: 40, width: 520, maxWidth: '92vw', zIndex: 501, boxShadow: '0 32px 100px rgba(0,0,0,0.35)', overflowY: 'auto', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>Job application</div>
            <div id="apply-modal-title" style={{ color: C.ink, fontSize: 16, fontWeight: 600 }}>{job.role} · {job.company}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close application dialog" style={{ background: C.sand, border: 'none', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', color: C.slate, fontSize: 15 }}>✕</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: i < step ? accent.primary : i === step ? C.ink : C.sand, color: i <= step ? (i < step ? C.white : C.white) : C.slate, marginBottom: 5, transition: 'all 0.3s' }}>{i < step ? '✓' : i + 1}</div>
                <span style={{ fontSize: 9, color: i === step ? C.ink : C.slate, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? accent.primary : 'rgba(11,13,15,0.12)', marginBottom: 18, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>
        <div style={{ background: C.sand, borderRadius: 10, padding: 22, marginBottom: 20, minHeight: 130 }}>
          {step === 0 && <div><div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>YOUR PROFILE</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{[['Full Name', 'Arjun Sharma'], ['Email', 'arjun@email.com'], ['Phone', '+91 98765 43210'], ['City', 'Bengaluru']].map(([l, v]) => <div key={l}><div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{l.toUpperCase()}</div><div style={{ background: C.white, borderRadius: 6, padding: '8px 12px', fontSize: 13, color: C.ink }}>{v}</div></div>)}</div></div>}
          {step === 1 && <div><div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>Resume</div><div style={{ background: C.white, borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: 6, background: accent.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.primary, fontSize: 18 }}>⬛</div><div><div style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>Arjun_Sharma_Resume.pdf</div><div style={{ color: C.slate, fontSize: 11 }}>Sample resume · demo file</div></div><div style={{ marginLeft: 'auto', color: '#16a34a', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Ready</div></div></div>}
          {step === 2 && <div><div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>SCREENING QUESTION</div><div style={{ color: C.ink, fontSize: 14, lineHeight: 1.65, marginBottom: 10 }}>Why are you interested in this role?</div><div style={{ background: C.white, borderRadius: 6, padding: '10px 14px', color: C.slate, fontSize: 13, lineHeight: 1.6 }}>I am passionate about using data to drive decisions and have completed 4 industry projects during my Skylent program...</div></div>}
          {step === 3 && <div style={{ textAlign: 'center', paddingTop: 8 }}><div style={{ color: C.ink, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ready to submit</div><div style={{ color: C.slate, fontSize: 13, lineHeight: 1.6 }}>Your profile and screening answers will be saved locally as a demo application. No employer communication occurs.</div></div>}
          {step === 4 && <div style={{ textAlign: 'center', paddingTop: 4 }}><div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20, color: C.white, fontWeight: 700 }}>✓</div><div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Application submitted</div><div style={{ color: C.slate, fontSize: 13 }}>Status: Applied — view in Application Tracker below.</div></div>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && step < 4 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, background: C.sand, border: 'none', color: C.ink, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← Back</button>}
          {step < 4 && <button type="button" onClick={handleContinue} style={{ flex: 2, background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{step === 3 ? 'Submit application' : 'Continue'}</button>}
          {step === 4 && <button type="button" onClick={onClose} style={{ flex: 1, background: C.ink, border: 'none', color: C.white, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Close</button>}
        </div>
      </div>
    </>
  )
}

// ─── JOB DRAWER ───────────────────────────────────────────────────────────────
export function JobDrawer({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply: () => void }) {
  const careerAccent = getDomainAccent('career')
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,15,0.5)', zIndex: 400, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '95vw', background: C.white, zIndex: 401, padding: 36, overflowY: 'auto', boxShadow: '-16px 0 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h3 style={{ color: C.ink, fontSize: 21, fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 4px' }}>{job.role}</h3>
            <div style={{ color: C.slate, fontSize: 13 }}>{job.company} · {job.location}</div>
          </div>
          <button onClick={onClose} style={{ background: C.sand, border: 'none', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', color: C.slate, fontSize: 15 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {[['Salary', job.salary], ['Experience', job.exp], ['Mode', job.mode], ['Location', job.location.split('/')[0].trim()]].map(([l, v]) => (
            <div key={l} style={{ background: C.sand, borderRadius: 8, padding: 13 }}><div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{l.toUpperCase()}</div><div style={{ color: C.ink, fontSize: 13, fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 8 }}>ABOUT THE ROLE</div>
          <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{job.desc}</p>
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>REQUIRED SKILLS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {job.skills.map(s => <span key={s} style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 6, padding: '5px 12px', color: C.ink, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{s}</span>)}
          </div>
        </div>
        <button onClick={onApply} style={{ width: '100%', background: careerAccent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Apply now</button>
      </div>
    </>
  )
}
