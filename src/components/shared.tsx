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

export { C } from '../tokens'

export const IMG = {
  studentsLecture: 'skylent:schooling-classroom',
  groupTech: 'skylent:fullstack-workspace',
}

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

export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={className} style={{ animation: `fadeUp 0.5s ${delay}ms ease both` }}>
      {children}
    </div>
  )
}

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

  return null
}
