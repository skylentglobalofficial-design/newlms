import { createContext, useContext, useState, useEffect } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'faculty' | 'organisation' | 'recruiter' | 'superadmin'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  program?: string
  progress?: number
  course?: string
  students?: number
  institution?: string
  totalUsers?: number
}

type AuthContextValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'skylent_user'

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored) as AuthUser)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  function login(newUser: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
const SAFE_DEFAULT: AuthContextValue = { user: null, login: () => {}, logout: () => {} }

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  return ctx ?? SAFE_DEFAULT
}
