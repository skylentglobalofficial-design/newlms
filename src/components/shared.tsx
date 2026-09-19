import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { Job } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import {
  courseEnrollmentMessage,
  programEnrollmentMessage,
  type CatalogEnrollmentStatus,
} from '../lib/catalog-api'
import { fulfillCatalogEnrollment, learnPathForWorkspace } from '../lib/catalog-enrollment'
import type { UserRole } from '../context/AuthContext'
import { buildPrimaryNav, FOOTER_COLS, MORE_NAV } from '../lib/product-architecture'
import { MaturityMark } from './product/Architecture'
import { C, T } from '../tokens'
import { PublicCanvas, useAuroraTheme } from './foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

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
  const capped = Math.min(delay, 80)
  return (
    <div className={`skylent-fade-in${className ? ` ${className}` : ''}`} style={capped ? { animationDelay: `${capped}ms` } : undefined}>
      {children}
    </div>
  )
}

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

export function EnrollmentModal({ item, onClose }: { item: CatalogEnrollItem; onClose: () => void; themeId?: AuroraThemeId }) {
  const { user } = useAuth()
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
        : 'Enrolment not available yet'
    : user
      ? submitting ? 'Opening Skylent OS…' : 'Open Skylent OS'
      : 'Sign in to enrol'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(21,23,26,0.35)', zIndex: 500 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="enrollment-modal-title" aria-describedby="enrollment-modal-copy" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.cream, border: `1px solid ${T.lineStrong}`, borderRadius: 12, padding: '28px 24px', width: 540, maxWidth: '94vw', zIndex: 501, boxShadow: T.shadowLg, overflowY: 'auto', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ color: C.slate, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              {item.enrollable ? 'Access' : 'Enrolment status'}
            </div>
            <div id="enrollment-modal-title" style={{ color: C.ink, fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close enrolment dialog" style={{ background: C.sand, border: 'none', borderRadius: 7, padding: '7px 13px', cursor: 'pointer', color: C.slate, fontSize: 14 }}>✕</button>
        </div>

        <div style={{ background: C.warmWhite, border: `1px solid ${T.lineLight}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ color: C.slate, fontSize: 13, marginBottom: 4 }}>Listed price</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.ink }}>₹{item.price.toLocaleString('en-IN')}</div>
          <div id="enrollment-modal-copy" style={{ color: C.slate, fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            Payment is not collected here yet. {item.enrollable ? 'If you are signed in, this opens Skylent OS. If you are not, you will be asked to sign in first.' : 'We will notify you when enrolment opens.'}
          </div>
        </div>

        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>{helperMessage}</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: C.cream, border: `1px solid ${T.lineStrong}`, color: C.ink, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Close</button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={submitting}
            style={{ flex: 2, background: C.indigo, border: 'none', color: C.white, borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', opacity: submitting ? 0.7 : 1 }}
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(21,23,26,0.35)', zIndex: 500 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="apply-modal-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.cream, border: `1px solid ${T.lineStrong}`, borderRadius: 12, padding: 32, width: 520, maxWidth: '92vw', zIndex: 501, boxShadow: T.shadowLg, overflowY: 'auto', maxHeight: '90vh' }}>
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(21,23,26,0.35)', zIndex: 400 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '95vw', background: C.cream, zIndex: 401, padding: 36, overflowY: 'auto', boxShadow: T.shadowLg, borderLeft: `1px solid ${T.lineLight}` }}>
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

// ─── NAV (Programs · Education · Competitive Exams) ───────────────────────────
const EXAM_PROGRAM_PATHS = ['/programs/jee-advanced-prep', '/programs/cat-prep']

function pathInGroup(label: string, to: string | undefined, pathname: string): boolean {
  const examProgram = EXAM_PROGRAM_PATHS.includes(pathname)
  if (label === 'Programs') {
    if (examProgram) return false
    return pathname === '/programs' || pathname.startsWith('/programs/') || pathname === '/workshops' || pathname.startsWith('/workshops/')
  }
  if (label === 'Education') {
    if (pathname === '/education/exams' || pathname.startsWith('/education/exams/')) return false
    return pathname === '/education' || pathname.startsWith('/education/')
  }
  if (label === 'Competitive Exams') {
    return pathname === '/education/exams' || pathname.startsWith('/exams/') || examProgram
  }
  if (!to) return false
  return pathname === to || pathname.startsWith(`${to}/`)
}

function dashRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

const navLinkHover = {
  enter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'rgba(8,9,9,0.04)' },
  leave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'transparent' },
}

const SEARCH_SUGGESTIONS = [
  { label: 'Data Analytics', to: '/courses/data-analytics' },
  { label: 'Product Management', to: '/courses/product-management' },
] as const

function searchSuggestionsFor(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return SEARCH_SUGGESTIONS
  return SEARCH_SUGGESTIONS.filter((item) => item.label.toLowerCase().includes(q))
}

function searchPathFor(query: string) {
  const q = query.trim()
  const exact = SEARCH_SUGGESTIONS.find((item) => item.label.toLowerCase() === q.toLowerCase())
  return exact ? exact.to : `/courses?q=${encodeURIComponent(q)}`
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const primaryNav = buildPrimaryNav({
    signedIn: Boolean(user),
    isStudent: user?.role === 'student',
  })

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
    setMoreOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setActiveMenu(null)
      setAccountOpen(false)
      setSearchOpen(false)
      if (menuOpen) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const navBg = C.cream
  const navBorder = `1px solid ${T.lineLight}`
  const navShadow = '0 1px 0 rgba(21,23,26,0.04)'

  const accountPath = user ? dashRoute(user.role) : '/login'

  return (
    <nav
      ref={navRef}
      className="skylent-site-nav"
      aria-label="Primary"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: navBg, borderBottom: navBorder, boxShadow: navShadow, overflow: 'visible' }}
    >
      <div className="skylent-rail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: T.navH, gap: 12, minWidth: 0 }}>
        <Link to="/" className="skylent-mark" style={{ fontSize: 22, color: C.ink, textDecoration: 'none', padding: 0, flexShrink: 0 }}>
          Skylent<span style={{ color: C.orange }}>.</span>
        </Link>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          {primaryNav.map(group => {
            const open = activeMenu === group.label
            const menuId = `nav-menu-${group.label.toLowerCase()}`
            const inGroup = pathInGroup(group.label, group.to, location.pathname)
            const isDiscoveryOnly = !group.to
            const dropdownClass = group.sections?.length
              ? 'nav-mega-dropdown is-sections'
              : isDiscoveryOnly
                ? 'nav-mega-dropdown is-discovery'
                : 'nav-mega-dropdown'
            const toggleMenu = () => {
              setAccountOpen(false)
              setActiveMenu(open ? null : group.label)
            }
            return (
              <div
                key={group.label}
                style={{ position: 'relative' }}
                onBlurCapture={(e) => {
                  const next = e.relatedTarget as Node | null
                  if (!e.currentTarget.contains(next)) setActiveMenu(null)
                }}
              >
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {isDiscoveryOnly ? (
                    <button
                      type="button"
                      className={`nav-discovery-trigger${open || inGroup ? ' is-active' : ''}`}
                      aria-expanded={open}
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={toggleMenu}
                    >
                      <span>{group.label}</span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true" className="nav-discovery-chevron"><path d="M0 0l5 6 5-6z"/></svg>
                    </button>
                  ) : (
                    <>
                      <Link
                        to={group.to!}
                        aria-current={inGroup ? 'page' : undefined}
                        style={{ background: 'none', color: open || inGroup ? C.ink : C.slate, fontSize: 14, padding: '8px 8px 8px 12px', display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-body)', letterSpacing: '-0.01em', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {group.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={menuId}
                        aria-haspopup="true"
                        aria-label={`${group.label} menu`}
                        onClick={toggleMenu}
                        style={{ background: 'none', border: 'none', color: open || inGroup ? C.ink : C.slate, cursor: 'pointer', padding: '8px 10px 8px 2px', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M0 0l5 6 5-6z"/></svg>
                      </button>
                    </>
                  )}
                </div>
                {open && (
                  <div
                    id={menuId}
                    className={dropdownClass}
                    role="group"
                    aria-label={group.label}
                    style={{ position: 'absolute', top: 'calc(100% + 6px)', left: group.sections?.length ? 'auto' : 0, right: group.sections?.length ? 0 : 'auto', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 12, padding: isDiscoveryOnly ? 8 : 6, minWidth: group.sections?.length ? 560 : isDiscoveryOnly ? 340 : 260, maxWidth: group.sections?.length ? 680 : isDiscoveryOnly ? 400 : 320, boxShadow: T.shadow, zIndex: 300 }}
                  >
                    <div className={isDiscoveryOnly ? 'nav-discovery-head' : undefined} style={isDiscoveryOnly ? undefined : { padding: '10px 12px 12px', marginBottom: 2, borderBottom: '1px solid rgba(8,9,9,0.08)' }}>
                      <div style={{ color: C.ink, fontSize: isDiscoveryOnly ? 15 : 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{group.label}</div>
                      <div style={{ color: C.slate, fontSize: isDiscoveryOnly ? 12 : 11, marginTop: isDiscoveryOnly ? 4 : 2, lineHeight: 1.45 }}>{group.tagline}</div>
                    </div>
                    {group.sections?.length ? (
                      <div className="nav-mega-sections">
                        {group.sections.map(section => (
                          <div key={section.heading}>
                            <div className="nav-mega-heading">{section.heading}</div>
                            {section.items.map(item => (
                              <Link
                                key={item.to + item.label}
                                to={item.to}
                                className="nav-mega-item"
                                style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', minHeight: 44, boxSizing: 'border-box' }}
                                onMouseEnter={navLinkHover.enter}
                                onMouseLeave={navLinkHover.leave}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                  <div style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                                  {item.mark && <MaturityMark maturity={item.mark} compact />}
                                </div>
                                <div style={{ color: C.slate, fontSize: 11, marginTop: 1 }}>{item.sub}</div>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={isDiscoveryOnly ? 'nav-discovery-items' : undefined}>
                        {group.items.map(item => (
                          <Link
                            key={item.to + item.label}
                            to={item.to}
                            className={isDiscoveryOnly ? 'nav-mega-item is-discovery' : 'nav-mega-item'}
                            style={{ display: 'block', padding: isDiscoveryOnly ? '12px 14px' : '10px 12px', borderRadius: 8, textDecoration: 'none', minHeight: 44, boxSizing: 'border-box' }}
                            onMouseEnter={navLinkHover.enter}
                            onMouseLeave={navLinkHover.leave}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ color: C.ink, fontSize: isDiscoveryOnly ? 14 : 13, fontWeight: 500 }}>{item.label}</div>
                              {item.mark && <MaturityMark maturity={item.mark} compact />}
                            </div>
                            <div style={{ color: C.slate, fontSize: isDiscoveryOnly ? 12 : 11, marginTop: isDiscoveryOnly ? 3 : 1, lineHeight: 1.4 }}>{item.sub}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="nav-search-wrap">
          <form className="nav-search-desktop" onSubmit={handleSearch}>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              placeholder="Search courses"
              aria-label="Search courses"
              aria-expanded={searchOpen}
              aria-controls="nav-search-suggest"
              autoComplete="off"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: C.ink, fontSize: 13, padding: '8px 12px', width: '100%', fontFamily: 'var(--font-body)' }}
            />
            <button type="submit" aria-label="Submit search" style={{ background: 'none', border: 'none', color: C.indigo, padding: '8px 10px', cursor: 'pointer', minHeight: 40, minWidth: 40 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
          {searchOpen && searchHints.length > 0 ? (
            <ul id="nav-search-suggest" className="nav-search-suggest" role="listbox" aria-label="Ready courses">
              {searchHints.map((item) => (
                <li key={item.to} role="option">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pickSearchSuggestion(item.to)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <div className="nav-account" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="true"
                aria-controls="nav-account-menu"
                onClick={() => { setActiveMenu(null); setAccountOpen(o => !o) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.cream, border: `1px solid ${T.lineLight}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.white, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{user.avatar}</div>
                <span className="nav-account-name" style={{ color: C.ink, fontSize: 12, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.length > 14 ? user.name.slice(0, 14) + '...' : user.name}</span>
              </button>
              {accountOpen && (
                <div
                  id="nav-account-menu"
                  role="group"
                  aria-label="Account"
                  className="nav-mega-dropdown"
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 12, padding: 6, minWidth: 200, boxShadow: T.shadow, zIndex: 300 }}
                >
                  <Link
                    to={accountPath}
                    style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: C.ink, fontSize: 13, fontWeight: 500, minHeight: 44, boxSizing: 'border-box' }}
                    onMouseEnter={navLinkHover.enter}
                    onMouseLeave={navLinkHover.leave}
                  >
                    Your account
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); navigate('/'); setAccountOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', color: C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', minHeight: 44 }}
                    onMouseEnter={navLinkHover.enter}
                    onMouseLeave={navLinkHover.leave}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-signin" style={{ background: 'transparent', border: '1px solid rgba(8,9,9,0.16)', color: C.ink, borderRadius: 7, padding: '7px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', minHeight: 36 }}>
                Sign in
              </Link>
            </>
          )}
          <button
            type="button"
            className="show-mobile"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => { setAccountOpen(false); setMenuOpen(o => !o) }}
            style={{ background: 'none', border: 'none', color: C.ink, cursor: 'pointer', padding: 10, minWidth: 44, minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}
          >
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-site-menu"
          className="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          style={{
            position: 'fixed',
            inset: `${T.navH}px 0 0 0`,
            zIndex: 250,
            background: C.cream,
            borderTop: '1px solid rgba(21,23,26,0.10)',
            padding: '8px 20px 32px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <form className="mobile-nav-search" onSubmit={handleSearch}>
            <input
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              placeholder="Search courses"
              aria-label="Search courses"
              aria-expanded={searchOpen}
              aria-controls="mobile-search-suggest"
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          {searchOpen && searchHints.length > 0 ? (
            <ul id="mobile-search-suggest" className="nav-search-suggest is-mobile" role="listbox" aria-label="Ready courses">
              {searchHints.map((item) => (
                <li key={item.to} role="option">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pickSearchSuggestion(item.to)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {primaryNav.map(group => {
            const isDiscoveryOnly = !group.to
            const expanded = mobileExpandedGroup === group.label
            if (isDiscoveryOnly) {
              return (
                <section key={group.label} className="mobile-nav-group" style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    className="mobile-nav-group-trigger"
                    aria-expanded={expanded}
                    onClick={() => setMobileExpandedGroup(expanded ? null : group.label)}
                  >
                    <span>
                      <span className="mobile-nav-group-label">{group.label}</span>
                      <span className="mobile-nav-group-tagline">{group.tagline}</span>
                    </span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}><path d="M0 0l5 6 5-6z"/></svg>
                  </button>
                  {expanded && group.items.map(item => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link is-nested"
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 44, padding: '10px 0 10px 12px', color: C.ink, fontSize: 16, textDecoration: 'none', borderBottom: '1px solid rgba(8,9,9,0.08)' }}
                    >
                      <span>{item.label}</span>
                      <span style={{ color: C.slate, fontSize: 12, fontWeight: 400 }}>{item.sub}</span>
                    </Link>
                  ))}
                </section>
              )
            }
            return (
              <section key={group.label} style={{ marginBottom: 8 }}>
                <div style={{ color: C.ink, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', padding: '16px 0 4px' }}>{group.label}</div>
                <p style={{ color: C.slate, fontSize: 12, margin: '0 0 4px', lineHeight: 1.45 }}>{group.tagline}</p>
                {group.sections?.length ? group.sections.map(section => (
                  <div key={section.heading}>
                    <div style={{ color: C.slate, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', padding: '12px 0 4px' }}>{section.heading}</div>
                    {section.items.map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="mobile-nav-link"
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 44, padding: '8px 0', color: C.ink, fontSize: 16, textDecoration: 'none', borderBottom: '1px solid rgba(8,9,9,0.08)' }}
                      >
                        <span>{item.label}</span>
                        <span style={{ color: C.slate, fontSize: 12, fontWeight: 400 }}>{item.sub}</span>
                      </Link>
                    ))}
                  </div>
                )) : group.items.map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 44, padding: '8px 0', color: C.ink, fontSize: 16, textDecoration: 'none', borderBottom: '1px solid rgba(8,9,9,0.08)' }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: C.slate, fontSize: 12, fontWeight: 400 }}>{item.sub}</span>
                  </Link>
                ))}
              </section>
            )
          })}

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: 44, padding: '8px 0', background: 'none', border: 'none', borderTop: `1px solid ${T.lineLight}`, color: C.slate, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}
            >
              More
              <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, transform: moreOpen ? 'rotate(180deg)' : 'none' }}><path d="M0 0l5 6 5-6z"/></svg>
            </button>
            {moreOpen && MORE_NAV.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="mobile-nav-link"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44, padding: '8px 0', color: C.ink, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid rgba(8,9,9,0.08)' }}
              >
                <span>
                  {item.label}
                  <span style={{ display: 'block', color: C.slate, fontSize: 12, fontWeight: 400 }}>{item.sub}</span>
                </span>
                {item.mark && <MaturityMark maturity={item.mark} compact />}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {user ? (
              <>
                <Link to={accountPath} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, textAlign: 'center', padding: '11px', border: `1px solid ${T.lineStrong}`, borderRadius: 7, color: C.ink, textDecoration: 'none', fontSize: 14 }}>
                  Your account
                </Link>
                <button type="button" onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} style={{ minHeight: 44, textAlign: 'center', padding: '11px', border: `1px solid ${T.lineLight}`, borderRadius: 7, color: C.slate, background: 'none', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, textAlign: 'center', padding: '11px', border: `1px solid ${T.lineStrong}`, borderRadius: 7, color: C.ink, textDecoration: 'none', fontSize: 14 }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export function Footer() {
  const cols = FOOTER_COLS
  return (
    <footer className="skylent-site-footer" style={{ background: C.warmWhite, padding: `${T.sectionSm} 0 32px`, position: 'relative', borderTop: `1px solid ${T.lineLight}` }}>
      <div className="skylent-rail">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.3fr) repeat(5, minmax(0, 1fr))', gap: 28, marginBottom: 56 }} className="footer-grid">
          <div>
            <Link to="/" className="skylent-mark" style={{ fontSize: 24, color: C.ink, textDecoration: 'none', display: 'block', marginBottom: 16 }}>Skylent<span style={{ color: C.orange }}>.</span></Link>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.75, maxWidth: 240, margin: '0 0 22px' }}>Skill courses, a workspace, and evidence you keep — a focused student learning product.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['in', 'tw', 'yt', 'ig'].map(s => (
                <div key={s} aria-hidden style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.lineLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{s}</div>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>{col.heading.toUpperCase()}</div>
              {col.links.map(([label, to]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <Link to={to} style={{ color: C.slate, fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
                  >{label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.lineLight}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>© 2026 Skylent Global. All rights reserved.</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy', 'Terms', 'Cookies'].map(l => (
                <span key={l} style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{l}</span>
              ))}
            </div>
            <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Legal pages will be published here.</span>
          </div>
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
        <main>{children}</main>
        <Footer />
      </div>
    </PublicCanvas>
  )
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const globalCSS = `
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
  @keyframes spin { to { transform: rotate(360deg) } }

  * { box-sizing: border-box; }

  .nav-links { display: flex !important; }
  .show-mobile { display: none !important; }
  .nav-search-wrap {
    position: relative;
    flex: 1 1 200px;
    max-width: 280px;
    min-width: 0;
  }
  .nav-search-desktop {
    display: flex !important;
    align-items: center;
    width: 100%;
    min-height: 40px;
    background: #fffdf8;
    border: 1px solid rgba(21, 23, 26, 0.14);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .nav-search-suggest {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 320;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: #ffffff;
    border: 1px solid rgba(21, 23, 26, 0.12);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-overlay);
  }
  .nav-search-suggest.is-mobile {
    position: static;
    margin: 0 0 12px;
    box-shadow: none;
  }
  .nav-search-suggest button {
    display: block;
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border: none;
    border-radius: var(--radius-md);
    background: none;
    color: #15171a;
    font: 500 13px/1.3 var(--font-body);
    text-align: left;
    cursor: pointer;
  }
  .nav-search-suggest button:hover,
  .nav-search-suggest button:focus-visible {
    background: rgba(8, 9, 9, 0.04);
  }
  .nav-mega-dropdown.is-sections {
    min-width: min(560px, calc(100vw - 32px)) !important;
    max-width: min(680px, calc(100vw - 24px)) !important;
    width: min(560px, calc(100vw - 32px));
  }
  .nav-mega-sections {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px 8px;
    padding: 6px;
  }
  .nav-mega-heading {
    color: #5c6168;
    font: 700 11px/1.3 var(--font-body);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8px 12px 4px;
  }
  @media (max-width: 720px) {
    .nav-mega-dropdown.is-sections {
      min-width: min(92vw, 560px) !important;
      width: min(92vw, 560px);
    }
    .nav-mega-sections { grid-template-columns: 1fr; }
  }
  .nav-cta-learn { min-height: 40px; }
  .mobile-nav-search {
    display: flex;
    gap: 8px;
    margin: 12px 0 8px;
  }
  .mobile-nav-search input {
    flex: 1;
    min-width: 0;
    min-height: 48px;
    padding: 0 14px;
    border: 1px solid rgba(21, 23, 26, 0.16);
    border-radius: var(--radius-md);
    background: #fffdf8;
    color: #15171a;
    font: 15px/1.3 var(--font-body);
  }
  .mobile-nav-search button {
    min-height: 48px;
    padding: 0 16px;
    border: none;
    border-radius: var(--radius-md);
    background: #15171a;
    color: #fffdf8;
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
  }

  .skylent-site-nav a:focus-visible,
  .skylent-site-nav button:focus-visible,
  .skylent-site-nav input:focus-visible {
    outline: 2px solid var(--skylent-focus-ring);
    outline-offset: 2px;
  }
  .mobile-nav-overlay .mobile-nav-link { min-height: 44px; }
  .mobile-nav-overlay .mobile-nav-cta { width: 100%; }

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
    .nav-links { display: none !important; }
    .nav-search-wrap { display: none !important; }
    .nav-search-desktop { display: none !important; }
    .show-mobile { display: flex !important; }
    .nav-account-name { display: none !important; }
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
