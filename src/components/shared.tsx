import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { Job } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import type { UserRole } from '../context/AuthContext'
import { C, T } from '../tokens'
import { S } from '../theme'
import ThemeToggle from './ThemeToggle'
import { PublicCanvas, useAuroraTheme } from './foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

const navAccent = getDomainAccent('general')

// Re-export color tokens for backward compatibility
export { C } from '../tokens'

// ─── PRODUCT VISUAL REFS (no remote URLs) ─────────────────────────────────────
export const IMG = {
  studentsLecture: 'skylent:schooling-classroom',
  groupTech: 'skylent:fullstack-workspace',
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
export function useFadeIn(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reveal = () => setVisible(true)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.98 && rect.bottom > 0) {
      reveal()
      return
    }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { reveal(); obs.disconnect() } }, { threshold, rootMargin: '80px 0px' })
    obs.observe(el)
    const fallback = window.setTimeout(reveal, 700)
    return () => { obs.disconnect(); window.clearTimeout(fallback) }
  }, [threshold])
  return { ref, visible }
}

export function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

export function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start: number | null = null
    let raf: number
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return val
}

// ─── FADE IN COMPONENT ────────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={className} style={{ animation: `fadeUp 0.5s ${delay}ms ease both` }}>
      {children}
    </div>
  )
}

// ─── ENROLLMENT MODAL (courses, programs, workshops) ───────────────────────────
type EnrollItem = { id: string; title: string; price: number; type: 'course' | 'program' | 'workshop' }

export function EnrollmentModal({ item, onClose, themeId }: { item: EnrollItem; onClose: () => void; themeId?: AuroraThemeId }) {
  const { user } = useAuth()
  const demo = useDemoState()
  const accent = getDomainAccent(themeId ?? (item.type === 'program' ? 'professional' : 'data-science'))
  const [plan, setPlan] = useState(0)
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking' | 'emi'>('upi')
  const navigate = useNavigate()
  const previewOrderId = `PREVIEW-${item.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}`

  const plans = item.type === 'program'
    ? [{ name: 'Self-paced', price: item.price }, { name: 'Pro', price: Math.round(item.price * 1.5) }, { name: 'Career', price: Math.round(item.price * 2) }]
    : [{ name: 'Standard', price: item.price }]

  const selectedPrice = plans[plan]?.price ?? item.price
  const allSteps = ['Plan', 'Account', 'Details', 'Order', 'Payment', 'Success']
  const steps = user ? allSteps.filter(s => s !== 'Account') : allSteps
  const [step, setStep] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  function advanceStep() {
    if (steps[step] === 'Payment') {
      demo.enroll({ itemId: item.id, type: item.type, title: item.title })
      setStep(s => s + 1)
      return
    }
    setStep(s => s + 1)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,15,0.6)', zIndex: 500, backdropFilter: 'blur(6px)' }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="enrollment-modal-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.white, borderRadius: 18, padding: '36px 40px', width: 540, maxWidth: '94vw', zIndex: 501, boxShadow: '0 40px 120px rgba(0,0,0,0.32)', overflowY: 'auto', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 3 }}>Enrollment</div>
            <div id="enrollment-modal-title" style={{ color: C.ink, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close enrollment dialog" style={{ background: C.sand, border: 'none', borderRadius: 7, padding: '7px 13px', cursor: 'pointer', color: C.slate, fontSize: 14 }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s} aria-hidden style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? accent.primary : 'rgba(11,13,15,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 20 }}>Step {step + 1} of {steps.length} — {steps[step]}</div>

        {steps[step] === 'Plan' && (
          <div>
            <div style={{ marginBottom: 20 }} role="radiogroup" aria-label="Choose an enrollment plan">
              {plans.map((p, i) => (
                <button key={p.name} type="button" role="radio" aria-checked={plan === i} onClick={() => setPlan(i)} style={{ width: '100%', textAlign: 'left', border: `1px solid ${plan === i ? accent.primary : 'rgba(11,13,15,0.12)'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 8, cursor: 'pointer', background: plan === i ? accent.subtle : 'transparent', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ color: C.ink, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>{item.type === 'program' && i === 1 ? 'Most popular' : item.type === 'program' && i === 2 ? 'Includes Career OS' : 'Access all content'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: C.ink, fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</div>
                      {plan === i && <div aria-hidden style={{ width: 18, height: 18, borderRadius: '50%', background: accent.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.black }}>✓</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {steps[step] === 'Account' && (
          <div>
            <div style={{ padding: '14px 16px', background: C.sand, borderRadius: 10, color: C.slate, fontSize: 13, lineHeight: 1.6 }}>
              Continue to create your Skylent account. The production checkout will collect your email and password here; no sample identity is pre-filled.
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 7, color: C.slate, fontSize: 12 }}>
              Demo mode — no real account is created.
            </div>
          </div>
        )}
        {steps[step] === 'Details' && (
          <div style={{ padding: '14px 16px', background: C.sand, borderRadius: 10, color: C.slate, fontSize: 13, lineHeight: 1.6 }}>
            {user?.name ? `Your signed-in profile: ${user.name}.` : 'Your details will be collected at checkout.'} This preview does not invent a name, phone number, city, or qualification.
          </div>
        )}
        {steps[step] === 'Order' && (
          <div>
            <div style={{ background: C.sand, borderRadius: 10, padding: 18, marginBottom: 14 }}>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>ORDER SUMMARY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 16 }}>
                <span style={{ color: C.ink, fontSize: 14 }}>{item.title} — {plans[plan].name}</span>
              </div>
              {[['GST (18%)', `₹${Math.round(selectedPrice * 0.18).toLocaleString('en-IN')}`], ['Total', `₹${Math.round(selectedPrice * 1.18).toLocaleString('en-IN')}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(11,13,15,0.08)' }}>
                  <span style={{ color: C.slate, fontSize: 13 }}>{l}</span>
                  <span style={{ color: l === 'Total' ? C.ink : C.slate, fontSize: 13, fontWeight: l === 'Total' ? 600 : 400, fontFamily: 'var(--font-mono)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ color: C.slate, fontSize: 11 }}>Preview reference: {previewOrderId}</div>
          </div>
        )}
        {steps[step] === 'Payment' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }} role="tablist" aria-label="Payment method preview">
              {(['upi', 'card', 'netbanking', 'emi'] as const).map(m => (
                <button key={m} type="button" role="tab" aria-selected={payMethod === m} onClick={() => setPayMethod(m)} style={{ flex: 1, padding: '9px 4px', borderRadius: 7, border: `1px solid ${payMethod === m ? C.ink : 'rgba(11,13,15,0.15)'}`, background: payMethod === m ? C.ink : 'transparent', color: payMethod === m ? C.white : C.slate, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.2s', textTransform: 'uppercase' }}>{m}</button>
              ))}
            </div>
            <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ color: C.slate, fontSize: 11, marginBottom: 6 }}>Checkout preview — no real payment is processed in this demo.</div>
              <div style={{ color: C.ink, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>₹{Math.round(selectedPrice * 1.18).toLocaleString('en-IN')}</div>
            </div>
            <p style={{ color: C.slate, fontSize: 12, lineHeight: 1.6, margin: '12px 0 0' }}>
              {payMethod === 'upi' ? 'Connect a supported UPI provider at production checkout.' : payMethod === 'card' ? 'Connect the production card processor before accepting card details.' : payMethod === 'netbanking' ? 'Connect a production payment gateway before enabling bank selection.' : 'Connect a production EMI provider before offering EMI at checkout.'}
            </p>
          </div>
        )}
        {steps[step] === 'Success' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: C.black, fontWeight: 700 }}>✓</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: C.ink, fontWeight: 700, marginBottom: 8 }}>Enrollment Successful</div>
            <div style={{ color: C.slate, fontSize: 14, marginBottom: 24 }}>{item.title} has been added to your learning dashboard.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: C.sand, borderRadius: 10, padding: 14, marginBottom: 24, fontSize: 12 }}>
              {[['Reference', previewOrderId], ['Payment', 'Demo only'], ['Amount', `₹${Math.round(selectedPrice * 1.18).toLocaleString('en-IN')}`], ['Status', 'Preview']].map(([l, v]) => (
                <div key={l}><div style={{ color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 2, fontSize: 9 }}>{l.toUpperCase()}</div><div style={{ color: C.ink, fontWeight: 500, fontSize: 12 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ background: 'rgba(11,13,15,0.04)', borderRadius: 8, padding: 10, color: C.slate, fontSize: 11, marginBottom: 20 }}>Demo enrollment — no real payment was processed.</div>
            <button type="button" onClick={() => { onClose(); navigate('/dashboard/student') }} style={{ width: '100%', background: accent.primary, border: 'none', color: C.black, borderRadius: 9, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Go to student dashboard</button>
          </div>
        )}

        {steps[step] !== 'Success' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && <button type="button" onClick={() => setStep(s => s - 1)} style={{ flex: 1, background: C.sand, border: 'none', color: C.ink, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← Back</button>}
            <button type="button" onClick={advanceStep} style={{ flex: 2, background: steps[step] === 'Payment' ? '#16a34a' : accent.primary, border: 'none', color: steps[step] === 'Payment' ? C.white : C.black, borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}>{steps[step] === 'Payment' ? 'Preview payment (demo)' : steps[step] === 'Plan' ? `Enroll — ₹${selectedPrice.toLocaleString('en-IN')}` : 'Continue'}</button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── APPLY MODAL (job application — separate from enrollment) ─────────────────
export function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const { user } = useAuth()
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
          {step === 0 && (
            <div>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>YOUR PROFILE</div>
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 12px' }}>
                {user?.name
                  ? `Signed in as ${user.name}. Production applications will use your Career OS profile.`
                  : 'Production applications will collect your profile from Career OS. No sample identity is pre-filled in this preview.'}
              </p>
              <div style={{ padding: '10px 12px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 7, color: C.slate, fontSize: 12 }}>
                Demo preview — profile fields are not invented here.
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>RESUME</div>
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Connect your uploaded resume from Career OS at production checkout. This preview does not attach a fabricated resume file.
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>SCREENING QUESTION</div>
              <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.65, marginBottom: 10 }}>Why are you interested in this role?</div>
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Your answer will be collected in the live application flow. This preview does not invent screening responses.
              </p>
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ color: C.ink, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ready to submit</div>
              <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.6 }}>Your profile and screening answers will be saved locally as a demo application. No employer communication occurs.</div>
            </div>
          )}
          {step === 4 && (
            <div style={{ textAlign: 'center', paddingTop: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20, color: C.white, fontWeight: 700 }}>✓</div>
              <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Demo application saved</div>
              <div style={{ color: C.slate, fontSize: 13 }}>Status: Preview only — view in the Application Tracker below.</div>
            </div>
          )}
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

// ─── NAV (with mega menu) ─────────────────────────────────────────────────────
const megaMenu = [
  {
    label: 'Education',
    to: '/education',
    tagline: 'From schooling to postgraduate & exams',
    items: [
      { label: 'Schooling', sub: 'Foundational academic learning', to: '/education#schooling' },
      { label: 'Undergraduate', sub: 'Degree-aligned programs', to: '/education#undergraduate' },
      { label: 'Postgraduate', sub: 'Advanced specialisation', to: '/education#postgraduate' },
      { label: 'Competitive Exams', sub: 'JEE · NEET · CAT & more', to: '/education#competitive-exams' },
    ],
  },
  {
    label: 'Skills',
    to: '/skills',
    tagline: 'From learning to employability',
    items: [
      { label: 'Webinars', sub: 'Live expert-led sessions', to: '/workshops' },
      { label: 'Certificate Programs', sub: 'Focused, credentialed skills', to: '/programs' },
      { label: 'Professional Programs', sub: 'Career-ready — includes Career OS', to: '/programs' },
      { label: 'Job Assistance', sub: 'Placement & readiness support', to: '/skills#job-assistance' },
    ],
  },
  {
    label: 'Career OS',
    to: '/career-os',
    tagline: 'Profile, jobs, and applications',
    items: [
      { label: 'Interview Preparation', sub: 'Mock interviews & practice', to: '/career-os#interview' },
      { label: 'Job Board', sub: 'Curated opportunities', to: '/career-os#jobs' },
    ],
  },
  {
    label: 'For Institutions',
    to: '/institutions',
    tagline: 'Dashboards for schools and colleges',
    items: [
      { label: 'Schools', sub: 'Student learning & teacher tools', to: '/institutions' },
      { label: 'Colleges', sub: 'Academic programs & career readiness', to: '/institutions' },
      { label: 'Universities', sub: 'Curriculum, LMS & student lifecycle', to: '/institutions' },
      { label: 'Skill Institutions', sub: 'Programs, batches & certification', to: '/institutions' },
    ],
  },
]

function dashRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/courses?q=${encodeURIComponent(q)}`)
  }
  const { user, logout } = useAuth()

  useEffect(() => {
    const h = () => { setScrolled(window.scrollY > 40); setActiveMenu(null) }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { setMenuOpen(false); setActiveMenu(null) }, [location.pathname])

  useEffect(() => {
    if (!activeMenu) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveMenu(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeMenu])

  const showDark = scrolled || !isHome

  const navBg = showDark ? 'var(--skylent-nav-bg)' : 'transparent'
  const navBlur = showDark ? 'blur(12px)' : 'none'
  const navBorder = showDark ? `1px solid ${S.borderSubtle}` : 'none'
  const navShadow = 'none'

  const handleMenuEnter = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(label)
  }, [])

  const handleMenuLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }, [])

  const simpleLinks = [
    { label: 'Stories', to: '/stories' },
    { label: 'About', to: '/about' },
  ]

  return (
    <nav aria-label="Main navigation" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: navBg, backdropFilter: navBlur, WebkitBackdropFilter: navBlur, borderBottom: navBorder, boxShadow: navShadow, transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s, box-shadow 0.4s' }}>
      <a href="#main-content" className="skylent-skip-link">Skip to content</a>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `0 ${T.gutter}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: T.navH }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: S.text, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.02em', padding: 0, flexShrink: 0 }}>
          Skylent<span style={{ color: C.orange }}>.</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {megaMenu.map(group => (
            <div key={group.label} style={{ position: 'relative' }} onMouseEnter={() => handleMenuEnter(group.label)} onMouseLeave={handleMenuLeave}>
              <button
                type="button"
                aria-expanded={activeMenu === group.label}
                aria-haspopup="true"
                onClick={() => navigate(group.to)}
                style={{ background: 'none', border: 'none', color: activeMenu === group.label ? S.text : S.textSecondary, fontSize: 13.5, cursor: 'pointer', padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', transition: 'color 0.2s', letterSpacing: '-0.01em' }}
              >
                {group.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" style={{ opacity: 0.5, transform: activeMenu === group.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M0 0l5 6 5-6z"/></svg>
              </button>
              {activeMenu === group.label && (
                <div className="nav-mega-dropdown skylent-nav-dropdown" onMouseEnter={() => handleMenuEnter(group.label)} onMouseLeave={handleMenuLeave} style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, borderRadius: 14, padding: 8, minWidth: 288, zIndex: 300, animation: 'fadeUp 0.18s ease' }}>
                  <Link to={group.to} className="skylent-nav-dropdown-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px 13px', borderRadius: 10, textDecoration: 'none', marginBottom: 4 }}
                  >
                    <div>
                      <div style={{ color: S.text, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{group.label}</div>
                      <div style={{ color: S.textMuted, fontSize: 11, marginTop: 2 }}>{group.tagline}</div>
                    </div>
                    <span style={{ color: navAccent.text, fontSize: 15 }}>→</span>
                  </Link>
                  {group.items.map(item => (
                    <Link key={item.to + item.label} to={item.to} style={{ display: 'block', padding: '9px 14px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1 }}>{item.sub}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {simpleLinks.map(l => (
            <Link key={l.to} to={l.to} style={{ color: location.pathname === l.to ? C.white : 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none', padding: '8px 12px', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.white)}
              onMouseLeave={e => (e.currentTarget.style.color = location.pathname === l.to ? C.white : 'rgba(255,255,255,0.55)')}
            >{l.label}</Link>
          ))}
        </div>

        {/* Global search */}
        <div className="nav-links" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 7, overflow: 'hidden' }}>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search courses, programs, jobs..."
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: C.white, fontSize: 13, padding: '7px 12px', width: 220, fontFamily: 'var(--font-body)' }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', color: navAccent.text, padding: '7px 10px', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 7, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.white)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          )}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="nav-links">
            <ThemeToggle compact />
          </div>
          {user ? (
            <>
              {/* Avatar chip */}
              <div className="nav-links" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '5px 10px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: navAccent.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.white, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{user.avatar}</div>
                <span style={{ color: C.white, fontSize: 12, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.length > 14 ? user.name.slice(0, 14) + '...' : user.name}</span>
                <span style={{ background: navAccent.subtle, border: `1px solid ${navAccent.border}`, borderRadius: 4, padding: '1px 6px', fontSize: 9, color: navAccent.text, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', flexShrink: 0 }}>{user.role}</span>
              </div>
              <Link to={dashRoute(user.role)} className="nav-links" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: C.white, borderRadius: 7, padding: '7px 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              >Dashboard</Link>
              <button className="nav-links" onClick={() => { logout(); navigate('/') }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
              >Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-links" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: C.white, borderRadius: 7, padding: '7px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              >Sign In</Link>
              <Link to="/signup" style={{ background: navAccent.primary, border: 'none', color: C.white, borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = navAccent.secondary }}
                onMouseLeave={e => { e.currentTarget.style.background = navAccent.primary }}
              >Get Started</Link>
            </>
          )}
          <button className="show-mobile" onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', color: C.white, cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'block', width: 20, height: 2, background: C.white, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.white, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.white, borderRadius: 1 }} />
          </button>
        </div>
      </div>

      {/* Mobile menu — full-screen overlay so page content does not bleed through */}
      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          style={{
            position: 'fixed',
            inset: `${T.navH}px 0 0 0`,
            zIndex: 250,
            background: 'rgba(5, 5, 5, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '12px 24px 28px',
            overflowY: 'auto',
          }}
        >
          {megaMenu.map(group => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <Link to={group.to} onClick={() => setMenuOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: navAccent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', padding: '12px 0 6px', textDecoration: 'none' }}>{group.label.toUpperCase()}<span style={{ opacity: 0.7 }}>→</span></Link>
              {group.items.map(item => (
                <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '9px 0', color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{item.label}</Link>
              ))}
            </div>
          ))}
          {simpleLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{l.label}</Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {user ? (
              <>
                <Link to={dashRoute(user.role)} onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, color: C.white, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Dashboard</Link>
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} style={{ width: '100%', textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, color: C.white, background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, color: C.white, textDecoration: 'none', fontSize: 13 }}>Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', background: navAccent.primary, borderRadius: 7, color: C.white, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export function Footer() {
  const cols = [
    { heading: 'Education', links: [['Overview', '/education'], ['Schooling', '/education#schooling'], ['Undergraduate', '/education#undergraduate'], ['Postgraduate', '/education#postgraduate']] },
    { heading: 'Skills', links: [['Overview', '/skills'], ['Webinars', '/workshops'], ['Certificate Programs', '/programs'], ['Professional Programs', '/programs'], ['Job Assistance', '/skills#job-assistance']] },
    { heading: 'Career OS', links: [['Overview', '/career-os'], ['Interview Prep', '/career-os#interview'], ['Job Board', '/career-os#jobs'], ['Sign in to workspace', '/login']] },
    { heading: 'Company', links: [['About', '/about'], ['For Institutions', '/institutions'], ['Stories', '/stories'], ['Blog', '/blog'], ['Contact', '/contact']] },
  ]
  return (
    <footer style={{ background: S.footerBg, padding: `${T.sectionSm} ${T.gutter} 32px`, position: 'relative', borderTop: `1px solid ${S.borderSubtle}` }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr repeat(4, 1fr)', gap: 40, marginBottom: 56 }} className="footer-grid">
          <div>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: S.text, letterSpacing: '-0.02em', textDecoration: 'none', display: 'block', marginBottom: 16 }}>Skylent<span style={{ color: C.orange }}>.</span></Link>
            <p style={{ color: S.textMuted, fontSize: 13, lineHeight: 1.75, maxWidth: 240, margin: '0 0 22px' }}>Education, skills, and career workflows on one platform — for learners and institutions.</p>
            <div style={{ display: 'flex', gap: 10 }} aria-hidden="true">
              {['in', 'tw', 'yt', 'ig'].map(s => (<div key={s} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{s}</div>))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>{col.heading.toUpperCase()}</div>
              {col.links.map(([label, to]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
                  >{label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>© 2026 Skylent Global. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>{['Privacy', 'Terms', 'Cookies'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{l}</span>)}</div>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────
export function PageShell({
  children,
  aurora,
  auroraTheme,
}: {
  children: React.ReactNode
  aurora?: boolean
  auroraTheme?: AuroraThemeId
}) {
  const location = useLocation()
  const autoTheme = useAuroraTheme()
  const theme = auroraTheme ?? autoTheme
  const showAurora = aurora ?? false

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - (T.navH + 8)
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  return (
    <PublicCanvas themeId={theme} aurora={showAurora}>
      <div style={{ paddingTop: T.navH }}>
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </div>
    </PublicCanvas>
  )
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const globalCSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
  @keyframes spin { to { transform: rotate(360deg) } }

  * { box-sizing: border-box; }

  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.85);
    outline-offset: 2px;
  }

  .skylent-skip-link {
    position: absolute;
    left: -9999px;
    top: 12px;
    z-index: 1000;
    padding: 10px 16px;
    background: var(--glass-01-bg);
    border: 1px solid var(--glass-01-border);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    font-family: var(--font-body);
    text-decoration: none;
  }

  .skylent-skip-link:focus {
    left: 16px;
  }

  .nav-links { display: flex !important; }
  .show-mobile { display: none !important; }

  .skylent-section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent 100%);
    max-width: var(--max-w);
    margin: 0 auto;
  }

  .contextual-nav-panel { display: block; }
  .contextual-nav-bar { display: none; }
  .contextual-nav-bar-scroll::-webkit-scrollbar { display: none; }

  @media (max-width: 1100px) {
    .nav-links { display: none !important; }
    .show-mobile { display: flex !important; }
    .contextual-nav-panel { display: none !important; }
    .contextual-nav-bar { display: block !important; }
    .career-hero-visual-wrap { display: block !important; }
    .hero-grid, .two-col, .two-col-sm, .skylent-page-hero { grid-template-columns: 1fr !important; gap: 32px !important; }
    .program-detail-grid { grid-template-columns: 1fr !important; }
    .program-hero-layout { grid-template-columns: 1fr !important; }
    .program-curriculum-layout { grid-template-columns: 1fr !important; }
    .program-outcomes-split { grid-template-columns: 1fr !important; }
    .three-col { grid-template-columns: 1fr 1fr !important; }
    .programs-grid { grid-template-columns: 1fr 1fr !important; }
    .intent-grid { grid-template-columns: 1fr 1fr !important; }
    .process-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .career-grid { grid-template-columns: repeat(4, 1fr) !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
    .edu-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
    .dash-grid { grid-template-columns: 1fr !important; }
    .hero-float { display: none !important; }
    .hero-visual, .skylent-hero-visual { aspect-ratio: 4/3 !important; max-height: 380px !important; }
    .hero-visual img, .skylent-hero-visual img { transform: none !important; }
  }
  @media (max-width: 768px) {
    .skylent-page-hero { gap: 28px !important; }
    .skylent-display-lg { font-size: clamp(30px, 8vw, 44px) !important; }
    .education-journey { grid-template-columns: 1fr !important; gap: 40px !important; }
    .education-journey-line { display: none !important; }
    .education-journey-arrow { display: none !important; }
    .education-discovery { grid-template-columns: 1fr !important; }
    .education-ug-grid { grid-template-columns: 1fr !important; }
    .education-ug-grid > *:first-child { order: 1; }
    .education-ug-grid > *:last-child { order: 0; }
    .education-value-row { grid-template-columns: 1fr !important; gap: 12px !important; }
    .education-cat-grid { grid-template-columns: 1fr !important; }
    .education-hero-visual-wrap,
    .skills-hero-visual-wrap {
      min-height: clamp(280px, 40vh, 360px) !important;
    }
    .skills-path { overflow-x: visible; }
    .skills-path > div { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; gap: 24px 20px !important; }
    .skills-path-line { display: none !important; }
    .skills-hero-visual-wrap { min-height: clamp(280px, 40vh, 360px) !important; }
    .skills-discovery, .skills-pro-featured { grid-template-columns: 1fr !important; }
    .skills-cert-grid > *:first-child { order: 1; }
    .skills-cert-grid > *:last-child { order: 0; }
    .skills-proof-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
    .skills-proof-grid > div { border-right: none !important; padding: 0 !important; }
    .program-overview-split { grid-template-columns: 1fr !important; }
    .program-who-split { grid-template-columns: 1fr !important; }
    .program-project-featured { grid-template-columns: 1fr !important; }
    .program-reviews-grid { grid-template-columns: 1fr !important; }
    .program-workflow-panels { grid-template-columns: 1fr !important; }
    .program-artifact-panels { grid-template-columns: 1fr !important; }
    .program-cert-split { grid-template-columns: 1fr !important; }
    .program-sticky-nav-scroll { -webkit-overflow-scrolling: touch; }
  }
  @media (max-width: 900px) {
    .career-journey > div { grid-template-columns: repeat(3, 1fr) !important; gap: 24px !important; }
    .career-journey-line { display: none !important; }
    .career-ecosystem > div { grid-template-columns: repeat(3, 1fr) !important; gap: 24px !important; }
  }
  @media (max-width: 375px) {
    .program-tools-strip > div { padding: 12px 16px !important; font-size: 13px !important; }
    .program-pricing-wrap { margin-left: -4px; margin-right: -4px; }
    .skills-proof-grid { grid-template-columns: 1fr !important; }
    .skills-path > div { grid-template-columns: 1fr !important; min-width: 0 !important; }
    .career-journey > div { grid-template-columns: repeat(3, 1fr) !important; gap: 28px !important; }
    .career-journey-line { display: none !important; }
    .career-ecosystem > div { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
    .career-job-header { display: none !important; }
    .career-job-row { grid-template-columns: 1fr auto !important; gap: 12px !important; }
    .career-support-row { grid-template-columns: 1fr !important; gap: 8px !important; }
    .career-hero-visual { min-height: 340px !important; }
    .institution-type-grid { grid-template-columns: 1fr !important; }
    .institution-ecosystem-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .institution-ecosystem-grid > div { border-right: none !important; padding: 0 !important; }
    .institution-partnership-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
    .institution-partnership-line { display: none !important; }
  }
  @media (max-width: 640px) {
    .three-col { grid-template-columns: 1fr !important; }
    .programs-grid { grid-template-columns: 1fr !important; }
    .intent-grid { grid-template-columns: 1fr 1fr !important; }
    .process-grid { grid-template-columns: 1fr 1fr !important; }
    .career-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .edu-grid { grid-template-columns: 1fr !important; }
    .flow-strip { flex-direction: column !important; }
    .flow-strip > div { width: 100% !important; }
    .flow-arrow { transform: rotate(90deg); padding: 8px 0 !important; }
    .pillar-grid { grid-template-columns: 1fr !important; }
    .skills-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 900px) {
    .flow-strip { flex-wrap: wrap; }
    .pillar-grid { grid-template-columns: 1fr !important; }
    .skills-grid { grid-template-columns: 1fr !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`
