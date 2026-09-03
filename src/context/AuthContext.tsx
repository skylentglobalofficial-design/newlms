import { createContext, useContext, useState, useEffect } from 'react'
import { demoAuthProvider } from './authProvider'
import type { AuthProvider } from './authProvider'

// ─── TYPES ────────────────────────────────────────────────────────────────────
// NOTE: `UserRole` intentionally lists the same 5 roles as `Role` in
// `src/types/lms.ts`. Kept separate (no shared import) so the auth layer has
// no dependency on the domain-model layer, but the values must stay in sync.
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

// The provider implementation is injected here. Swapping demo auth for a real
// backend later means constructing a different `AuthProvider` (see
// `authProvider.ts`) and passing it in — `AuthContextProvider` and every
// consumer of `useAuth()` stay unchanged.
const provider: AuthProvider = demoAuthProvider

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
// Named `AuthContextProvider` to avoid clashing with the `AuthProvider`
// interface imported above; re-exported as `AuthProvider` for existing
// call sites (`<AuthProvider>` in App.tsx).
export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(provider.getSession())
  }, [])

  function login(newUser: AuthUser) {
    provider.login(newUser)
    setUser(newUser)
  }

  function logout() {
    provider.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContextProvider as AuthProvider }

// ─── HOOK ─────────────────────────────────────────────────────────────────────
const SAFE_DEFAULT: AuthContextValue = { user: null, login: () => {}, logout: () => {} }

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  return ctx ?? SAFE_DEFAULT
}
