import { createContext, useContext, useState, useEffect, useCallback, useMemo, startTransition } from "react"
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  signupRequest,
  clearAuthClientState,
  type ApiRole,
} from "../lib/auth-api"

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type UserRole = ApiRole

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
  roles: UserRole[]
  ready: boolean
  login: (email: string, password: string) => Promise<UserRole>
  signup: (name: string, email: string, password: string) => Promise<UserRole>
  loginDemo: (user: AuthUser) => void
  logout: () => Promise<void>
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

function toAuthUser(response: {
  user: { id: string; name: string; displayName?: string; email: string; avatar: string }
  role: UserRole
}): AuthUser {
  const name = response.user.displayName ?? response.user.name
  return {
    id: response.user.id,
    name,
    email: response.user.email,
    avatar: response.user.avatar,
    role: response.role,
  }
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const session = await fetchCurrentUser()
        if (cancelled) return
        if (session) {
          setUser(toAuthUser(session))
          setRoles(session.roles)
          // Authenticated routes gate on `ready` (Career OS, LMS, dashboards).
          // Promote ready immediately so those shells are not blank while React
          // would otherwise defer the transition behind public paint work.
          setReady(true)
          return
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setRoles([])
        }
      }
      // Anonymous session: keep ready off the urgent path so public first paint
      // is not blocked by auth bookkeeping.
      if (!cancelled) startTransition(() => setReady(true))
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest({ email, password })
    const nextUser = toAuthUser(session)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const session = await signupRequest({ name, email, password })
    const nextUser = toAuthUser(session)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginDemo = useCallback((demoUser: AuthUser) => {
    if (!isDemoMode) {
      throw new Error("Demo login is disabled outside VITE_DEMO_MODE")
    }
    setUser(demoUser)
    setRoles([demoUser.role])
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Clear local state even if the server session is already gone.
    } finally {
      clearAuthClientState()
      setUser(null)
      setRoles([])
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, roles, ready, login, signup, loginDemo, logout }),
    [user, roles, ready, login, signup, loginDemo, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
const SAFE_DEFAULT: AuthContextValue = {
  user: null,
  roles: [],
  ready: true,
  login: async () => "student",
  signup: async () => "student",
  loginDemo: () => {},
  logout: async () => {},
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  return ctx ?? SAFE_DEFAULT
}

export function isAuthDemoMode(): boolean {
  return isDemoMode
}
