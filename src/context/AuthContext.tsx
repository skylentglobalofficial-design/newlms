import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  signupRequest,
  verifyMobileOtpRequest,
  updateProfileRequest,
  clearAuthClientState,
  type ApiRole,
} from "../lib/auth-api"
import { setUnauthorizedHandler } from "../lib/http"

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type UserRole = ApiRole

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  mustChangePassword?: boolean
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
  signup: (name: string, email: string, password: string, acceptedTerms: boolean) => Promise<UserRole>
  loginWithMobileOtp: (input: { phone: string; otp: string; name?: string; acceptedTerms?: boolean }) => Promise<UserRole>
  refreshSession: () => Promise<AuthUser | null>
  updateDisplayName: (displayName: string) => Promise<void>
  markPasswordChanged: () => void
  loginDemo: (user: AuthUser) => void
  logout: () => Promise<void>
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"
const DEMO_STORAGE_KEY = "skylent:active-demo-user:v1"

function readStoredDemoUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(DEMO_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function writeStoredDemoUser(user: AuthUser | null) {
  if (typeof window === "undefined") return
  try {
    if (user) window.sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user))
    else window.sessionStorage.removeItem(DEMO_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

function toAuthUser(response: {
  user: { id: string; name: string; displayName?: string; email: string; avatar: string }
  role: UserRole
  mustChangePassword?: boolean
}): AuthUser {
  const name = response.user.displayName ?? response.user.name
  return {
    id: response.user.id,
    name,
    email: response.user.email,
    avatar: response.user.avatar,
    role: response.role,
    mustChangePassword: response.mustChangePassword === true,
  }
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredDemoUser())
  const [roles, setRoles] = useState<UserRole[]>(() => {
    const stored = readStoredDemoUser()
    return stored ? [stored.role] : []
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser((current) => {
        if (current?.id.startsWith("demo-")) return current
        return null
      })
      setRoles((currentRoles) => {
        const stored = readStoredDemoUser()
        if (stored?.id.startsWith("demo-")) return [stored.role]
        return currentRoles.length ? [] : currentRoles
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const storedDemo = readStoredDemoUser()
      try {
        const session = await fetchCurrentUser()
        if (cancelled) return
        if (session) {
          writeStoredDemoUser(null)
          setUser(toAuthUser(session))
          setRoles(session.roles)
        } else if (storedDemo) {
          setUser(storedDemo)
          setRoles([storedDemo.role])
        }
      } catch {
        if (!cancelled) {
          if (storedDemo) {
            setUser(storedDemo)
            setRoles([storedDemo.role])
          } else {
            setUser(null)
            setRoles([])
          }
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest({ email, password })
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, acceptedTerms: boolean) => {
    const session = await signupRequest({ name, email, password, acceptedTerms })
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginWithMobileOtp = useCallback(async (input: { phone: string; otp: string; name?: string; acceptedTerms?: boolean }) => {
    const session = await verifyMobileOtpRequest(input)
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const session = await fetchCurrentUser()
      if (session) {
        const nextUser = toAuthUser(session)
        writeStoredDemoUser(null)
        setUser(nextUser)
        setRoles(session.roles)
        return nextUser
      }
    } catch {
      // ignore
    }
    return null
  }, [])

  const markPasswordChanged = useCallback(() => {
    setUser((current) => current ? { ...current, mustChangePassword: false } : current)
  }, [])

  const updateDisplayName = useCallback(async (displayName: string) => {
    const session = await updateProfileRequest({ displayName })
    setUser(toAuthUser(session))
    setRoles(session.roles)
  }, [])

  const loginDemo = useCallback((demoUser: AuthUser) => {
    writeStoredDemoUser(demoUser)
    setUser(demoUser)
    setRoles([demoUser.role])
  }, [])

  const logout = useCallback(async () => {
    writeStoredDemoUser(null)
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

  return (
    <AuthContext.Provider value={{ user, roles, ready, login, signup, loginWithMobileOtp, refreshSession, updateDisplayName, markPasswordChanged, loginDemo, logout }}>
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
  updateDisplayName: async () => {},
  markPasswordChanged: () => {},
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
