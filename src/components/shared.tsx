import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HeaderWalletAndNotifications } from './learner/HeaderWalletAndNotifications'
import {
  courseEnrollmentMessage,
  programEnrollmentMessage,
  type CatalogEnrollmentStatus,
} from '../lib/catalog-api'
import { fulfillCatalogEnrollment, learnPathForWorkspace } from '../lib/catalog-enrollment'
import type { UserRole } from '../context/AuthContext'
import {
  MATURITY_LABEL,
  type MegaNavGroup,
  type MegaNavItem,
  type NavMark,
} from '../lib/product-architecture'
import { C, T } from '../tokens'
import { PublicCanvas, useAuroraTheme } from './foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import { ArrowRight, TruthChip, type JourneyStage, type TruthState } from './skylent/primitives'
import SiteAssistant from './skylent/SiteAssistant'
import { InstallAppPrompt } from './skylent/InstallAppPrompt'
import { GoogleOneTapSuggestion } from './skylent/GoogleOneTapSuggestion'
import { TermsConsent } from './legal/TermsConsent'
import { rememberEnrolConsent } from '../lib/policy'

// Re-export color tokens for backward compatibility
export { C } from '../tokens'

// ── PRODUCT VISUAL REFS ──
export const IMG = {
  studentsLecture: 'skylent:schooling-classroom',
  groupTech: 'skylent:fullstack-workspace',
}

// ── HOOKS ──
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

// ── FADE IN COMPONENT ──
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const capped = Math.min(delay, 80)
  return (
    <div className={`skylent-fade-in${className ? ` ${className}` : ''}`} style={capped ? { animationDelay: `${capped}ms` } : undefined}>
      {children}
    </div>
  )
}

// ── ENROLLMENT MODAL ──
export type CatalogEnrollItem = {
  kind: 'course' | 'program'
  slug: string
  title: string
  price: number
  enrollmentStatus?: CatalogEnrollmentStatus
  enrollable: boolean
  linkedCourseSlugs?: string[]
}

export function EnrollmentModal({ item, onClose }: { item: CatalogEnrollItem; onClose: () => void; themeId?: AuroraThemeId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(true)
  const [triedWithoutTerms, setTriedWithoutTerms] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'scholarship'>('upi')
  const [upiId, setUpiId] = useState('')
  const [selectedBank, setSelectedBank] = useState('SBI')
  const [couponCode, setCouponCode] = useState('SKYLENTPILOT')
  const [couponApplied, setCouponApplied] = useState(true)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const basePrice = item.price > 0 ? item.price : 4999
  const mrpPrice = basePrice * 2
  const discountAmount = couponApplied ? basePrice : 0
  const payableAmount = Math.max(0, basePrice - discountAmount)

  const helperMessage = item.kind === 'program'
    ? programEnrollmentMessage({
        enrollmentStatus: item.enrollmentStatus ?? null,
        linkedCourseSlugs: item.linkedCourseSlugs ?? [],
      })
    : courseEnrollmentMessage()

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    const root = dialogRef.current
    function focusables(): HTMLElement[] {
      if (!root) return []
      return Array.from(root.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(
        (el) => !el.hasAttribute('disabled'),
      )
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !root?.contains(active)) {
          e.preventDefault()
          last.focus()
        }
        return
      }
      if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    const frame = requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
  }, [])

  async function handlePrimaryAction() {
    if (!item.enrollable) {
      onClose()
      navigate('/contact')
      return
    }

    if (!accepted) {
      setTriedWithoutTerms(true)
      termsRef.current?.focus()
      return
    }

    if (!user) {
      onClose()
      rememberEnrolConsent({ kind: item.kind, slug: item.slug })
      navigate('/login', { state: { enrollTarget: { kind: item.kind, slug: item.slug } } })
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const workspace = await fulfillCatalogEnrollment({ kind: item.kind, slug: item.slug }, accepted)
      onClose()
      navigate(learnPathForWorkspace(workspace))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete checkout right now')
    } finally {
      setSubmitting(false)
    }
  }

  const primaryLabel = !item.enrollable
    ? item.enrollmentStatus === 'waitlist'
      ? 'Talk to us about the waitlist'
      : item.enrollmentStatus === 'coming_soon'
        ? 'Register interest'
        : 'Enrolment not available yet'
    : user
      ? submitting
        ? 'Processing Enrollment…'
        : `Pay Now (₹${payableAmount.toLocaleString('en-IN')}) & Start Learning →`
      : `Proceed to Login & Pay (₹${payableAmount.toLocaleString('en-IN')}) →`

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(4px)', zIndex: 500 }} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-modal-title"
        aria-describedby="enrollment-modal-copy"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 16,
          padding: 0,
          width: 820,
          maxWidth: '95vw',
          zIndex: 501,
          boxShadow: '0 28px 70px -16px rgba(15, 23, 42, 0.38)',
          overflowY: 'auto',
          maxHeight: '92vh',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Top Checkout Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)',
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e0e7ff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              SKYLENT CHECKOUT · ORDER SUMMARY &amp; PAYMENT
            </div>
            <div id="enrollment-modal-title" style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, marginTop: 2 }}>
              {item.title}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close enrolment dialog"
            style={{
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 8,
              padding: '7px 12px',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Main 2-Column Checkout Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 20,
            padding: '20px 24px 24px',
          }}
        >
          {/* Left Column: Course Package + Coupon + Payment Methods */}
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            {/* Package Included Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ fontSize: 13.5, color: '#0f172a' }}>What is included in your enrolment</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>
                  Instant Access
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.65 }}>
                <li>Full self-paced modules, written notes &amp; concept checks</li>
                <li>Live in-browser SQL / Python / Product / AI lab workspace</li>
                <li>Graded capstone project &amp; verifiable SKL certificate (/verify)</li>
                <li>+50 Bonus Elixir Coins credited on enrolment</li>
              </ul>
            </div>

            {/* Coupon / Pilot Scholarship Box */}
            <div style={{ background: couponApplied ? '#f5f3ff' : '#ffffff', border: couponApplied ? '1.5px solid #5142b5' : '1px solid #cbd5e1', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#5142b5', display: 'block' }}>
                    COUPON &amp; SCHOLARSHIP CODE
                  </span>
                  <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                    {couponApplied ? `${couponCode} Applied (100% Open Pilot Waiver)` : 'Have a scholarship or coupon code?'}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCouponApplied((v) => !v)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: couponApplied ? '1px solid #cbd5e1' : 'none',
                    background: couponApplied ? '#ffffff' : '#5142b5',
                    color: couponApplied ? '#334155' : '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {couponApplied ? 'Remove Coupon (Pay ₹' + basePrice.toLocaleString('en-IN') + ')' : 'Apply SKYLENTPILOT (₹0)'}
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Select Payment Mode
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { id: 'upi' as const, title: 'UPI (GPay / PhonePe / Paytm)', sub: 'Instant UPI ID or QR' },
                  { id: 'card' as const, title: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking' as const, title: 'NetBanking', sub: 'SBI, HDFC, ICICI, Axis' },
                  { id: 'scholarship' as const, title: '100% Pilot Scholarship', sub: '₹0 Open Pilot Waiver' },
                ].map((pm) => {
                  const active = paymentMethod === pm.id
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(pm.id)
                        if (pm.id === 'scholarship') setCouponApplied(true)
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: active ? '2px solid #5142b5' : '1px solid #cbd5e1',
                        background: active ? '#f5f3ff' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: 12.5, color: active ? '#5142b5' : '#0f172a' }}>{pm.title}</strong>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{pm.sub}</span>
                    </button>
                  )
                })}
              </div>

              {paymentMethod === 'upi' && !couponApplied ? (
                <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Enter UPI ID (Google Pay / PhonePe / Paytm)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis or 9876543210@ybl"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              ) : null}

              {paymentMethod === 'netbanking' && !couponApplied ? (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 999,
                        border: selectedBank === b ? '1.5px solid #5142b5' : '1px solid #cbd5e1',
                        background: selectedBank === b ? '#f5f3ff' : '#ffffff',
                        color: selectedBank === b ? '#5142b5' : '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {b} Bank
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column: Detailed Price Breakdown & Pay Now CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
            <div>
              <strong style={{ fontSize: 14, color: '#0f172a', display: 'block', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                Payment Summary
              </strong>

              <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Original Programme MRP</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>₹{mrpPrice.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Listed Platform Price</span>
                  <strong>₹{basePrice.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>In-Browser Cloud Lab &amp; IDE</span>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>FREE</span>
                </div>
                {couponApplied ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 700 }}>
                    <span>Pilot Scholarship (SKYLENTPILOT)</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: '1.5px dashed #cbd5e1', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  <span>Total Payable Amount</span>
                  <span style={{ color: '#5142b5', fontSize: 22 }}>₹{payableAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div id="enrollment-modal-copy" style={{ color: '#475569', fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
                {item.enrollable
                  ? 'No payment is taken to enrol during this pilot, and there is no checkout charge when SKYLENTPILOT is applied. Clicking Pay Now & Start Learning opens your course immediately inside Skylent OS.'
                  : 'Enrolment is not open, and no payment is taken. Use the contact form to register your interest.'}
              </div>

              <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5, margin: '8px 0 12px' }}>{helperMessage}</p>

              {item.enrollable ? (
                <TermsConsent inputRef={termsRef} checked={accepted} onChange={setAccepted} action="enrolling" showError={triedWithoutTerms} />
              ) : null}

              {error ? (
                <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 12px', color: '#991b1b', fontSize: 12.5, marginTop: 10 }}>
                  {error}
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: '#5142b5',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 10,
                  padding: '13px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 8px 20px -6px rgba(81, 66, 181, 0.45)',
                }}
              >
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Public navigation ─────────────────────────────────────────────────────────
   One header for every public page: wordmark, four destinations, sign in and the
   path action. Each destination keeps its dropdown of real routes; below 1000px
   the destinations and search move into the menu sheet. */

type PublicNavGroup = MegaNavGroup & { to: string; match: readonly string[] }

/* Repolish: four destinations with short menus, plus a plain Institutions link.
   Education lists degrees only (UG and PG, online and on campus); programmes split into
   certification and professional; labs live inside programmes rather than in the menu. */
const PUBLIC_NAV: readonly PublicNavGroup[] = [
  {
    label: 'Programmes',
    to: '/programmes',
    tagline: 'Choose by career track, in-browser lab, or weekend live sprint',
    match: ['/programmes', '/programs', '/courses', '/skills', '/workshops', '/workshop', '/labs', '/events'],
    items: [],
    sections: [
      {
        heading: 'Data, AI & Software Tracks',
        items: [
          { label: 'Data Analytics', sub: 'SQL, Spreadsheets, Northwind Lab & Commercial Capstone · 5 Modules.', to: '/programmes/data-analytics-pro', mark: 'live' },
          { label: 'Data Science & AI', sub: 'SQL + Python ETL + Out-of-Time Churn Cohort Sandbox.', to: '/programmes/data-science-ai', mark: 'live' },
          { label: 'Generative AI & LLM Systems', sub: 'Grounded RAG, Vector Retrieval & Accuracy Evaluation Suite.', to: '/programmes/generative-ai-program', mark: 'live' },
          { label: 'Full-Stack Web Development', sub: 'React 18, TypeScript, Node/Express & PostgreSQL Ledger Lab.', to: '/programmes/full-stack', mark: 'live' },
        ],
      },
      {
        heading: 'Product, Coding & Live Sprints',
        items: [
          { label: 'Product Management', sub: 'User Research, PRD Scoping & Harbor Desk Studio · 5 Modules.', to: '/programmes/product-management', mark: 'live' },
          { label: 'Python Programming & Automation', sub: 'Python 3, Pandas, Pytest Validators & Pipeline Audit · 5 Modules.', to: '/courses/python-programming', mark: 'live' },
          { label: '₹99 Weekend Live Workshops', sub: '90-min weekend sprints with 100% Elixir Coin cashback (99 Coins).', to: '/workshops', mark: 'live' },
          { label: 'Explore All Programmes & Courses →', sub: 'Compare all 6 tracks, pricing plans, and career goal pathways.', to: '/programmes' },
        ],
      },
    ],
  },
  {
    label: 'Education',
    to: '/education',
    tagline: 'University & Institutional Degree Pathways',
    match: ['/education', '/exams'],
    items: [
      { label: 'Undergraduate (UG)', sub: 'BCA, BBA, B.Sc & B.Tech applied university pathways (Online & Campus).', to: '/education?level=ug' },
      { label: 'Postgraduate (PG)', sub: 'MCA, MBA & M.Sc executive and postgraduate specialisations.', to: '/education?level=pg' },
    ],
  },
  {
    label: 'Career OS',
    to: '/career-os',
    tagline: 'Merit-gated portfolio, projects, and skill-matched applications',
    match: ['/career-os'],
    items: [
      { label: 'How Career OS works', sub: 'Merit-gated readiness (60% curriculum gate) and portfolio tools.', to: '/career-os' },
      { label: 'Career profile', sub: 'Organise your target role, verified skills, and credentials.', to: '/career-os/profile' },
      { label: 'Projects & evidence', sub: 'Showcase completed capstones and SQL/case work samples.', to: '/career-os/projects' },
      { label: 'Applications & prep', sub: 'Track role applications and rehearse interview defense.', to: '/career-os/applications' },
    ],
  },
  {
    label: 'About',
    to: '/about',
    tagline: 'Who we are, verified student proof, and how to reach us',
    match: ['/about', '/stories', '/blog', '/contact', '/terms', '/privacy', '/institutions'],
    items: [
      { label: 'About Skylent', sub: 'Institutional Charter, 3 Operating Environments & Applied Work Model.', to: '/about' },
      { label: 'For Colleges & Institutions', sub: 'Autonomous Campus OS, NEP 2020 credit mapping & NAAC CSV reporting.', to: '/institutions' },
      { label: 'Verify a Certificate (/verify)', sub: 'Inspect public Proof-of-Work Dossiers and Flight Recorder logs.', to: '/verify' },
      { label: 'Contact', sub: 'Ask a question or request an institutional walkthrough.', to: '/contact' },
    ],
  },
]

function groupHasMenu(group: PublicNavGroup): boolean {
  return group.items.length > 0 || Boolean(group.sections?.length)
}

function underRoute(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`)
}

function groupIsCurrent(group: PublicNavGroup, pathname: string): boolean {
  return group.match.some((base) => underRoute(pathname, base))
}

function navLinkIsCurrent(to: string, pathname: string): boolean {
  if (pathname === to) return true
  if (to === '/') return false
  return pathname.startsWith(`${to}/`)
}

/** Stage of the public journey a route belongs to. Routes outside the journey have no current stage. */
export function journeyStageFor(pathname: string): JourneyStage | undefined {
  const under = (base: string) => underRoute(pathname, base)
  if (pathname === '/' || under('/path')) return 'Discover'
  if (['/programmes', '/programs', '/courses', '/skills', '/education', '/exams', '/school'].some(under)) return 'Choose'
  if (under('/verify')) return 'Prove'
  if (under('/career-os')) return 'Grow'
  return undefined
}

const MOBILE_MENU_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function dashRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'college': return '/dashboard/college'
    case 'recruiter': return '/dashboard/recruiter'
    case 'admin': return '/dashboard/curriculum'
    case 'superadmin': return '/dashboard/admin'
  }
}

/* Search: a small index of real destinations, grouped. "Courses" lists the two courses that can
   be enrolled today (src/lib/catalog-maturity.ts); nothing is ranked by views or popularity because
   no such data exists. */
type SearchEntry = { label: string; to: string; group: 'Courses' | 'Programmes' | 'Degrees' | 'Explore'; keywords?: string }
const SEARCH_INDEX: readonly SearchEntry[] = [
  { label: 'Data Analytics', to: '/courses/data-analytics', group: 'Courses', keywords: 'sql excel dashboards analyst data northwind' },
  { label: 'Product Management', to: '/courses/product-management', group: 'Courses', keywords: 'product pm roadmap discovery harbor desk' },
  { label: 'Python Programming & Automation', to: '/courses/python-programming', group: 'Courses', keywords: 'python coding automation scripts etl pytest' },
  { label: 'Data Science & AI (Dual Track)', to: '/programmes/data-science-ai', group: 'Programmes', keywords: 'data science machine learning python sql analytics' },
  { label: 'Generative AI & LLM Systems', to: '/courses/generative-ai', group: 'Courses', keywords: 'genai llm rag embeddings agents prompt engineering' },
  { label: 'Full Stack Web Engineering', to: '/courses/full-stack-web', group: 'Courses', keywords: 'full stack web react node express postgres typescript' },
  { label: 'Workshops & Elixir Case Store', to: '/events', group: 'Explore', keywords: 'workshop webinar elixir coins case study cashback' },
  { label: 'All programmes', to: '/programmes', group: 'Programmes', keywords: 'courses certification professional' },
  { label: 'Certification programmes', to: '/programmes#certification', group: 'Programmes', keywords: 'certificate short' },
  { label: 'Professional programmes', to: '/programmes#professional', group: 'Programmes', keywords: 'capstone career' },
  { label: 'Undergraduate degrees', to: '/education?level=ug', group: 'Degrees', keywords: 'ug bachelor degree' },
  { label: 'Postgraduate degrees', to: '/education?level=pg', group: 'Degrees', keywords: 'pg postgraduate degree' },
  { label: 'Online degrees', to: '/education?mode=online', group: 'Degrees', keywords: 'distance remote' },
  { label: 'Campus degrees', to: '/education?mode=campus', group: 'Degrees', keywords: 'offline in person college' },
  { label: 'Career OS', to: '/career-os', group: 'Explore', keywords: 'career profile resume jobs projects evidence' },
  { label: 'For institutions', to: '/institutions', group: 'Explore', keywords: 'college university partner' },
  { label: 'Check a certificate', to: '/verify', group: 'Explore', keywords: 'verify certificate' },
  { label: 'Contact', to: '/contact', group: 'Explore', keywords: 'help support call counselling' },
]
const SEARCH_DEFAULT_GROUPS: readonly SearchEntry['group'][] = ['Courses', 'Degrees']

function searchSuggestionsFor(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return SEARCH_INDEX.filter((item) => SEARCH_DEFAULT_GROUPS.includes(item.group)).slice(0, 5)
  return SEARCH_INDEX.filter((item) => `${item.label} ${item.keywords ?? ''}`.toLowerCase().includes(q)).slice(0, 8)
}

function searchPathFor(query: string) {
  const q = query.trim()
  const first = searchSuggestionsFor(q)[0]
  return first ? first.to : `/programmes?q=${encodeURIComponent(q)}`
}

function groupedHints(hints: SearchEntry[]): [string, SearchEntry[]][] {
  const out: [string, SearchEntry[]][] = []
  for (const hint of hints) {
    const last = out[out.length - 1]
    if (last && last[0] === hint.group) last[1].push(hint)
    else out.push([hint.group, [hint]])
  }
  return out
}

/** Nav availability marks use the shared truth chips, so the header stays inside the frozen palette. */
const NAV_MARK_STATE: Record<NavMark, TruthState> = {
  live: 'live',
  coming_soon: 'soon',
  direction: 'development',
  demo: 'illustrative',
}

function NavMarkChip({ mark }: { mark?: NavMark }) {
  if (!mark) return null
  return <TruthChip state={NAV_MARK_STATE[mark]} label={MATURITY_LABEL[mark]} />
}

function NavMenuItem({ item, pathname, onNavigate }: { item: MegaNavItem; pathname: string; onNavigate?: () => void }) {
  const current = navLinkIsCurrent(item.to, pathname)
  return (
    <Link to={item.to} className="skn-menu__item" aria-current={current ? 'page' : undefined} onClick={onNavigate}>
      <span className="skn-menu__row">
        <span className="skn-menu__label">{item.label}</span>
        <NavMarkChip mark={item.mark} />
      </span>
      <span className="skn-menu__sub">{item.sub}</span>
    </Link>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`skn-chevron${open ? ' is-open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 1l4 4 4-4" />
    </svg>
  )
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuWasOpenRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Primary action: sign up when signed out, back to learning when signed in. Find My Path is no
  // longer a header destination; path discovery happens inside Skylent AI.
  const pathCta = useMemo(
    () => (user ? { to: dashRoute(user.role), label: 'My learning' } : { to: '/signup', label: 'Get started' }),
    [user],
  )

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setActiveMenu(null)
    setMobileExpandedGroup(null)
    setAccountOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const activeGroup = PUBLIC_NAV.find((group) => groupIsCurrent(group, location.pathname))
    setMobileExpandedGroup(activeGroup?.label ?? null)
  }, [menuOpen, location.pathname])

  useEffect(() => {
    if (menuOpen) {
      mobileMenuWasOpenRef.current = true
      return
    }
    if (!mobileMenuWasOpenRef.current) return
    mobileMenuWasOpenRef.current = false
    requestAnimationFrame(() => menuTriggerRef.current?.focus())
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const menuRoot = mobileMenuRef.current
    if (!menuRoot) return
    const rootEl: HTMLElement = menuRoot

    function focusables(): HTMLElement[] {
      return Array.from(rootEl.querySelectorAll<HTMLElement>(MOBILE_MENU_FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
      )
    }

    requestAnimationFrame(() => {
      const closeBtn = rootEl.querySelector<HTMLElement>('.skn-sheet__close')
      ;(closeBtn ?? focusables()[0])?.focus()
    })

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !rootEl.contains(active)) {
          e.preventDefault()
          last.focus()
        }
        return
      }
      if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setActiveMenu(null)
      setAccountOpen(false)
      setSearchOpen(false)
      if (menuOpen) {
        e.preventDefault()
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setActiveMenu(null)
        setAccountOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchQuery('')
    setSearchOpen(false)
    setMenuOpen(false)
    navigate(searchPathFor(q))
  }

  function pickSearchSuggestion(to: string) {
    setSearchQuery('')
    setSearchOpen(false)
    setMenuOpen(false)
    navigate(to)
  }

  const searchHints = searchSuggestionsFor(searchQuery)
  const accountPath = user ? dashRoute(user.role) : '/login'
  const closeSheet = () => setMenuOpen(false)

  return (
    <nav ref={navRef} className="skylent-site-nav skn" aria-label="Primary">
      <div className="skn__bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {location.pathname !== '/' ? (
            <button
              type="button"
              className="skn__back-btn"
              aria-label="Go back"
              onClick={() => {
                if (window.history.length > 1) navigate(-1)
                else navigate('/')
              }}
            >
              ←
            </button>
          ) : null}
          <Link to="/" className="skn__mark" aria-label="Skylent home">
            Skylent
          </Link>
        </div>

        <ul className="skn__links">
          {PUBLIC_NAV.map((group) => {
            const open = activeMenu === group.label
            const menuId = `nav-menu-${group.label.toLowerCase().replace(/\s+/g, '-')}`
            const current = groupIsCurrent(group, location.pathname)
            return (
              <li
                key={group.label}
                className="skn__group"
                onBlurCapture={(e) => {
                  const next = e.relatedTarget as Node | null
                  if (!e.currentTarget.contains(next)) setActiveMenu((active) => (active === group.label ? null : active))
                }}
              >
                <Link to={group.to} className="skn__link" aria-current={current ? 'page' : undefined}>
                  {group.label}
                </Link>
                {groupHasMenu(group) ? (<>
                <button
                  type="button"
                  className="skn__toggle"
                  aria-expanded={open}
                  aria-controls={menuId}
                  aria-label={`${group.label} menu`}
                  onClick={() => {
                    setAccountOpen(false)
                    setSearchOpen(false)
                    setActiveMenu(open ? null : group.label)
                  }}
                >
                  <Chevron open={open} />
                </button>
                {open ? (
                  <div id={menuId} className={`skn-menu${group.sections?.length ? ' skn-menu--sections' : ''}`} role="group" aria-label={group.label}>
                    <p className="skn-menu__tagline">{group.tagline}</p>
                    {group.sections?.length ? (
                      <div className="skn-menu__sections">
                        {group.sections.map((section) => (
                          <div key={section.heading}>
                            <p className="skn-menu__heading">{section.heading}</p>
                            {section.items.map((item) => (
                              <NavMenuItem key={item.to + item.label} item={item} pathname={location.pathname} />
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      group.items.map((item) => <NavMenuItem key={item.to + item.label} item={item} pathname={location.pathname} />)
                    )}
                  </div>
                ) : null}
                </>) : null}
              </li>
            )
          })}
        </ul>

        <div className="skn__actions">
          <div className="skn__search">
            <button
              type="button"
              className="skn__icon-btn"
              aria-label="Search"
              aria-expanded={searchOpen}
              aria-controls="nav-search-panel"
              onClick={() => {
                setActiveMenu(null)
                setAccountOpen(false)
                setSearchOpen((isOpen) => !isOpen)
                window.setTimeout(() => searchRef.current?.focus(), 0)
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" /></svg>
            </button>
            {searchOpen ? (
              <form id="nav-search-panel" className="skn-search" onSubmit={handleSearch}>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search programmes, degrees, Career OS"
                  aria-label="Search Skylent"
                  autoComplete="off"
                />
                {searchHints.length > 0 ? (
                  groupedHints(searchHints).map(([group, hints]) => (
                    <div key={group} className="skn-search__group">
                      <p className="skn-search__heading">{group}</p>
                      <ul aria-label={group}>
                        {hints.map((item) => (
                          <li key={item.to}>
                            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => pickSearchSuggestion(item.to)}>
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="skn-search__empty">No match in the menu. Press Enter to search programmes.</p>
                )}
              </form>
            ) : null}
          </div>

          {user ? (
            <>
            <HeaderWalletAndNotifications variant="public" />
            <div className="skn__account">
              <button
                type="button"
                className="skn__account-btn"
                aria-expanded={accountOpen}
                aria-haspopup="true"
                aria-controls="nav-account-menu"
                aria-label={`Account menu${user.name ? `, ${user.name}` : ''}`}
                onClick={() => {
                  setActiveMenu(null)
                  setSearchOpen(false)
                  setAccountOpen((isOpen) => !isOpen)
                }}
              >
                <span className="skn__avatar" aria-hidden="true">{user.avatar}</span>
                <span className="skn__account-name">{user.name.length > 14 ? `${user.name.slice(0, 14)}...` : user.name}</span>
              </button>
              {accountOpen ? (
                <div id="nav-account-menu" className="skn-menu skn-menu--account" role="group" aria-label="Account">
                  <Link to={accountPath} className="skn-menu__item">
                    <span className="skn-menu__label">Your account</span>
                  </Link>
                  <button
                    type="button"
                    className="skn-menu__item"
                    onClick={() => {
                      logout()
                      navigate('/')
                      setAccountOpen(false)
                    }}
                  >
                    <span className="skn-menu__label">Sign out</span>
                  </button>
                </div>
              ) : null}
            </div>
            </>
          ) : (
            <>

              <Link to="/login" className="skn__signin">
                Sign in
              </Link>
            </>
          )}

          {/* Native URL bar install only */}

          <Link to={pathCta.to} className="skn__cta sk-btn sk-btn-primary">
            {pathCta.label}
            <ArrowRight />
          </Link>

          <button
            ref={menuTriggerRef}
            type="button"
            className="skn__burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => {
              setAccountOpen(false)
              setActiveMenu(null)
              setSearchOpen(false)
              setMenuOpen((isOpen) => !isOpen)
            }}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div ref={mobileMenuRef} id="mobile-site-menu" className="skn-sheet" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="skn-sheet__toolbar">
            <p className="skn-sheet__title">Menu</p>
            <button type="button" className="skn-sheet__close" onClick={closeSheet} aria-label="Close menu">
              Close
            </button>
          </div>

          <form className="skn-sheet__search" onSubmit={handleSearch}>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Skylent"
              aria-label="Search Skylent"
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          {searchQuery.trim() && searchHints.length > 0 ? (
            <ul className="skn-sheet__hints" aria-label="Suggestions">
              {searchHints.map((item) => (
                <li key={item.to}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => pickSearchSuggestion(item.to)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="skn-sheet__groups">
            {PUBLIC_NAV.map((group) => {
              const expanded = mobileExpandedGroup === group.label
              const current = groupIsCurrent(group, location.pathname)
              const panelId = `mobile-nav-panel-${group.label.toLowerCase().replace(/\s+/g, '-')}`
              const items = [...group.items, ...(group.sections ?? []).flatMap((section) => section.items.map((item) => ({ ...item, label: `${section.heading.replace(/ \(.*\)$/, '')} · ${item.label}` })))].filter((item) => item.to !== group.to)
              return (
                <li key={group.label} className="skn-sheet__group">
                  <div className="skn-sheet__row">
                    <Link to={group.to} className="skn-sheet__hub" aria-current={current ? 'page' : undefined} onClick={closeSheet}>
                      <span className="skn-sheet__label">{group.label}</span>
                      <span className="skn-sheet__tagline">{group.tagline}</span>
                    </Link>
                    {items.length ? (
                    <button
                      type="button"
                      className="skn-sheet__toggle"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      aria-label={`${group.label} pages`}
                      onClick={() => setMobileExpandedGroup(expanded ? null : group.label)}
                    >
                      <Chevron open={expanded} />
                    </button>
                    ) : null}
                  </div>
                  {expanded && items.length ? (
                    <div id={panelId} className="skn-sheet__panel">
                      {items.map((item) => (
                        <NavMenuItem key={`${group.label}-${item.label}`} item={item} pathname={location.pathname} onNavigate={closeSheet} />
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <div className="skn-sheet__actions">
            <Link to={pathCta.to} onClick={closeSheet} className="sk-btn sk-btn-primary">
              {pathCta.label}
              <ArrowRight />
            </Link>
            {user ? (
              <>
                <Link to="/dashboard/student" onClick={closeSheet} className="sk-btn sk-btn-secondary">
                  Elixir Wallet &amp; Case Store
                </Link>
                <Link to={accountPath} onClick={closeSheet} className="sk-btn sk-btn-secondary">
                  Your account
                </Link>
                <button
                  type="button"
                  className="sk-btn sk-btn-secondary"
                  onClick={() => {
                    logout()
                    navigate('/')
                    closeSheet()
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/events" onClick={closeSheet} className="sk-btn sk-btn-secondary">
                  ₹99 Workshops &amp; Webinars
                </Link>
                <Link to="/login" onClick={closeSheet} className="sk-btn sk-btn-secondary">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────────────
   Every entry is a route that exists in App.tsx. Legal pages are not published,
   so the footer says that instead of showing links that go nowhere. */

/* Footer: four short columns of real routes, then the legal line. */
const FOOTER_COLUMNS: readonly { title: string; links: readonly (readonly [string, string])[] }[] = [
  { title: 'Programmes', links: [['All programmes', '/programmes'], ['Certification', '/programmes#certification'], ['Professional', '/programmes#professional']] },
  { title: 'Degrees', links: [['Undergraduate', '/education?level=ug'], ['Postgraduate', '/education?level=pg'], ['Online and campus', '/education']] },
  { title: 'Career OS', links: [['How it works', '/career-os'], ['Check a certificate', '/verify'], ['Sign in', '/login']] },
  { title: 'Skylent', links: [['About', '/about'], ['Institutions', '/institutions'], ['Contact', '/contact']] },
]

export function Footer() {
  return (
    <footer className="skylent-site-footer skf">
      <div className="skf__top">
        <div className="skf__brand">
          <Link to="/" className="skf__mark" aria-label="Skylent home">
            Skylent
          </Link>
          <p className="skf__line">Programmes you can start, and a place to keep the work you do.</p>
        </div>
        <nav aria-label="Footer" className="skf__nav">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="skf__col">
              <h2 className="skf__title">{column.title}</h2>
              <ul className="skf__links">
                {column.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="skf__meta">
        <p>© 2026 Skylent Global. All rights reserved.</p>
        <p className="skf__legal">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  )
}

/* ── Page shell ────────────────────────────────────────────────────────────────
   Canonical public shell: PublicCanvas (surface), fixed Nav, the journey locator,
   main, Footer. The fixed-nav offset lives on the locator strip (skylent-public.css). */

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
        } else {
          // The section is missing or not rendered yet: start at the top, not at the previous page's scroll position.
          window.scrollTo(0, 0)
        }
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  return (
    <PublicCanvas themeId={theme} aurora={showAurora}>
      <Nav />
      {/* Keeps the fixed-nav offset. The old seven-stage locator strip is retired. */}
      <div className="sk-shell-locator" aria-hidden="true" />
      <main className="skylent-public-main">{children}</main>
      <Footer />
      {/* Site-wide Skylent AI: POST /api/v1/reva/chat (legacy internal route name). */}
      <GoogleOneTapSuggestion />
    </PublicCanvas>
  )
}

// ── GLOBAL CSS ──
export const globalCSS = `
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
  @keyframes spin { to { transform: rotate(360deg) } }

  * { box-sizing: border-box; }

  .skylent-section-divider {
    height: 1px;
    background: rgba(21,23,26,0.10);
    max-width: var(--max-w);
    margin: 0 auto;
  }

  .contextual-nav-panel { display: block; }
  .contextual-nav-bar { display: none; }
  .contextual-nav-bar-scroll::-webkit-scrollbar { display: none; }
  .hero-grid > *, .two-col > *, .two-col-sm > *, .institution-partnership-grid > * { min-width: 0; }

  @media (max-width: 1100px) {
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
    .institution-partnership-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; }
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
    .institution-type-grid { grid-template-columns: 1fr !important; }
    .career-hero-visual { min-height: 340px !important; }
  }
  @media (max-width: 640px) {
    .institution-partnership-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
    .institution-ecosystem-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .institution-ecosystem-grid > div { border-right: none !important; padding: 0 !important; }
    .institution-partnership-line { display: none !important; }
    .institution-type-grid { grid-template-columns: 1fr !important; }
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
