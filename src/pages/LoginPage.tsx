import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'

// ─── COLOUR TOKENS (local, no import from shared to avoid circular dep) ───────
const C = {
  ink: '#0B0D0F',
  orange: '#F36B21',
  warmWhite: '#F8F6F2',
  slate: '#667078',
  white: '#FFFFFF',
}

// ─── DEMO USERS ───────────────────────────────────────────────────────────────
type DemoEntry = AuthUser & { desc: string }

const DEMO_USERS: DemoEntry[] = [
  { id: 'demo-student', role: 'student', name: 'Arjun Sharma', email: 'arjun@demo.skylent.in', avatar: 'AS', program: 'Data Science & AI', progress: 72, desc: 'Learning dashboard' },
  { id: 'demo-faculty', role: 'faculty', name: 'Dr. Priya Nair', email: 'priya@demo.skylent.in', avatar: 'PN', course: 'Data Science & AI', students: 128, desc: 'Faculty tools' },
  { id: 'demo-org', role: 'organisation', name: 'Apex College', email: 'admin@apex.edu.in', avatar: 'AC', students: 1240, institution: 'Apex College', desc: 'Admin & analytics' },
  { id: 'demo-recruiter', role: 'recruiter', name: 'Riya Menon', email: 'riya@recruit.in', avatar: 'RM', desc: 'Talent pipeline' },
  { id: 'demo-admin', role: 'superadmin', name: 'Skylent Admin', email: 'admin@skylent.in', avatar: 'SA', totalUsers: 12450, desc: 'System overview' },
]

function roleRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  organisation: 'Organisation',
  recruiter: 'Recruiter',
  superadmin: 'Super Admin',
}

// ─── SHARED INPUT STYLE ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '12px 14px',
  color: C.white,
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // Sign-in state
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign-up state
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPhone, setSuPhone] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suGoal, setSuGoal] = useState<string | null>(null)

  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function handleDemoSelect(demo: DemoEntry) {
    setActiveRole(demo.id)
    setSiEmail(demo.email)
    setSiPassword('demo1234')
    if (tab !== 'signin') setTab('signin')

    // Auto-submit after a short tick so state settles
    setTimeout(() => {
      const { desc: _d, ...user } = demo
      login(user)
      navigate(roleRoute(demo.role))
    }, 80)
  }

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    // Demo: match email to a demo user
    const found = DEMO_USERS.find(d => d.email === siEmail.trim().toLowerCase())
    if (found) {
      const { desc: _d, ...user } = found
      login(user)
      navigate(roleRoute(found.role))
    } else {
      // Generic student fallback for any unknown email
      const user: AuthUser = { id: `u-${Date.now()}`, name: siEmail.split('@')[0], email: siEmail, role: 'student', avatar: siEmail.slice(0, 2).toUpperCase() }
      login(user)
      navigate('/dashboard/student')
    }
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    const user: AuthUser = {
      id: `u-${Date.now()}`,
      name: suName || 'New User',
      email: suEmail,
      role: 'student',
      avatar: (suName || 'NU').slice(0, 2).toUpperCase(),
      program: suGoal ?? undefined,
      progress: 0,
    }
    login(user)
    navigate('/dashboard/student')
  }

  const goals = ['Get a job', 'Build skills', 'Switch career', 'Professional growth']

  return (
    <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      {/* Grid texture overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        style={{ position: 'absolute', top: 24, left: 28, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6, padding: 0, transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = C.white)}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
      >
        &larr; Back to Skylent
      </button>

      {/* Wordmark + badge */}
      <div style={{ marginBottom: 28, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: C.white, letterSpacing: '-0.02em' }}>
          Skylent<span style={{ color: C.orange }}>.</span>
        </span>
        <span style={{ marginLeft: 8, background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.35)', borderRadius: 5, padding: '2px 8px', fontSize: 10, color: C.orange, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', verticalAlign: 'middle' }}>OS</span>
      </div>

      {/* Glass card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18, padding: '32px 36px', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 9, padding: 3, marginBottom: 28, gap: 3 }}>
          {(['signin', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ flex: 1, background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent', border: 'none', borderRadius: 7, padding: '9px 0', color: tab === t ? C.white : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* ── SIGN IN ── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>EMAIL</label>
              <input
                type="email"
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ ...inputStyle, borderColor: focusedField === 'si-email' ? C.orange : 'rgba(255,255,255,0.12)' }}
                onFocus={() => setFocusedField('si-email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>PASSWORD</label>
              <input
                type="password"
                value={siPassword}
                onChange={e => setSiPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, borderColor: focusedField === 'si-pw' ? C.orange : 'rgba(255,255,255,0.12)' }}
                onFocus={() => setFocusedField('si-pw')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <span style={{ color: C.slate, fontSize: 12, cursor: 'pointer' }}>Forgot password?</span>
            </div>
            <button type="submit" style={{ width: '100%', background: C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >Continue</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <button
              type="button"
              onClick={() => alert('Google auth coming soon')}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: C.white, borderRadius: 9, padding: '12px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
            >
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              New to Skylent?{' '}
              <button type="button" onClick={() => setTab('signup')} style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
                Sign up &rarr;
              </button>
            </p>
          </form>
        )}

        {/* ── SIGN UP ── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp}>
            {[
              { id: 'su-name', label: 'FULL NAME', type: 'text', value: suName, set: setSuName, placeholder: 'Your name' },
              { id: 'su-email', label: 'EMAIL', type: 'email', value: suEmail, set: setSuEmail, placeholder: 'you@example.com' },
              { id: 'su-phone', label: 'PHONE', type: 'tel', value: suPhone, set: setSuPhone, placeholder: '+91 98765 43210' },
              { id: 'su-pw', label: 'PASSWORD', type: 'password', value: suPassword, set: setSuPassword, placeholder: '••••••••' },
            ].map(field => (
              <div key={field.id} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  style={{ ...inputStyle, borderColor: focusedField === field.id ? C.orange : 'rgba(255,255,255,0.12)' }}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            ))}

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.06em' }}>YOUR GOAL</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {goals.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSuGoal(g === suGoal ? null : g)}
                    style={{ background: suGoal === g ? 'rgba(243,107,33,0.18)' : 'rgba(255,255,255,0.06)', border: `1px solid ${suGoal === g ? C.orange : 'rgba(255,255,255,0.12)'}`, borderRadius: 20, padding: '7px 14px', color: suGoal === g ? C.orange : 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                  >{g}</button>
                ))}
              </div>
            </div>

            <button type="submit" style={{ width: '100%', background: C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >Create Account</button>

            <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('signin')} style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
                Sign in &rarr;
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Demo mode role selector */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, marginTop: 24 }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.22)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>DEMO MODE — select a role to explore</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DEMO_USERS.map(demo => {
            const isActive = activeRole === demo.id
            return (
              <button
                key={demo.id}
                onClick={() => handleDemoSelect(demo)}
                style={{ flex: 1, background: isActive ? 'rgba(243,107,33,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? 'rgba(243,107,33,0.55)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isActive ? C.orange : 'rgba(255,255,255,0.1)', color: isActive ? C.white : 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontFamily: 'var(--font-mono)', transition: 'all 0.2s' }}>{demo.avatar}</div>
                <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 2 }}>{ROLE_LABELS[demo.role]}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{demo.desc}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
