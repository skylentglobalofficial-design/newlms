import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  signupRequest,
  verifyEmailOtpRequest,
  verifyMobileOtpRequest,
  updateProfileRequest,
  clearAuthClientState,
  type ApiRole,
} from "../lib/auth-api"
import { setUnauthorizedHandler } from "../lib/http"

export type UserRole = ApiRole

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  mustChangePassword?: boolean
  nameChangeLockedUntil?: string | null
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
  signup: (name: string, email: string, password: string, acceptedTerms: boolean, emailOtp?: string) => Promise<UserRole>
  loginWithEmailOtp: (input: { email: string; otp: string; name?: string; acceptedTerms?: boolean }) => Promise<UserRole>
  loginWithMobileOtp: (input: { phone: string; otp: string; name?: string; acceptedTerms?: boolean }) => Promise<UserRole>
  refreshSession: () => Promise<AuthUser | null>
  updateDisplayName: (displayName: string) => Promise<void>
  markPasswordChanged: () => void
  loginDemo: (user: AuthUser) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"
const DEMO_STORAGE_KEY = "skylent:active-demo-user:v1"
const AUTH_CACHE_KEY = "skylent:cached-auth-user:v1"

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

function readCachedAuthSession(): { user: AuthUser; roles: UserRole[] } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { user?: AuthUser; roles?: UserRole[] }
    if (parsed?.user?.id && parsed?.user?.email) {
      return {
        user: parsed.user,
        roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : [parsed.user.role],
      }
    }
  } catch {
    // ignore
  }
  return null
}

function writeCachedAuthSession(user: AuthUser | null, roles: UserRole[]) {
  if (typeof window === "undefined") return
  try {
    if (user) {
      window.localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, roles }))
    } else {
      window.localStorage.removeItem(AUTH_CACHE_KEY)
    }
  } catch {
    // ignore
  }
}

function toAuthUser(response: {
  user: { id: string; name: string; displayName?: string; email: string; avatar: string; nameChangeLockedUntil?: string | null }
  role: UserRole
  mustChangePassword?: boolean
  nameChangeLockedUntil?: string | null
}): AuthUser {
  const name = response.user.displayName ?? response.user.name
  return {
    id: response.user.id,
    name,
    email: response.user.email,
    avatar: response.user.avatar,
    role: response.role,
    mustChangePassword: response.mustChangePassword === true,
    nameChangeLockedUntil: response.nameChangeLockedUntil ?? response.user.nameChangeLockedUntil ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialDemo = readStoredDemoUser()
  const initialCached = readCachedAuthSession()
  const [user, setUser] = useState<AuthUser | null>(() => initialDemo ?? initialCached?.user ?? null)
  const [roles, setRoles] = useState<UserRole[]>(() => {
    if (initialDemo) return [initialDemo.role]
    if (initialCached) return initialCached.roles
    return []
  })
  // Ready immediately if we have a cached session or demo user so routes render in 0ms!
  const [ready, setReady] = useState<boolean>(() => Boolean(initialDemo || initialCached))

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser((current) => {
        if (current?.id.startsWith("demo-")) return current
        writeCachedAuthSession(null, [])
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
          const nextUser = toAuthUser(session)
          writeStoredDemoUser(null)
          writeCachedAuthSession(nextUser, session.roles)
          setUser(nextUser)
          setRoles(session.roles)
        } else if (storedDemo) {
          setUser(storedDemo)
          setRoles([storedDemo.role])
        } else {
          writeCachedAuthSession(null, [])
          setUser(null)
          setRoles([])
        }
      } catch {
        if (!cancelled) {
          if (storedDemo) {
            setUser(storedDemo)
            setRoles([storedDemo.role])
          }
          // If network temporarily failed, keep cached user if available
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest({ email, password })
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthSession(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, acceptedTerms: boolean, emailOtp?: string) => {
    const session = await signupRequest({ name, email, password, acceptedTerms, emailOtp })
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthSession(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginWithEmailOtp = useCallback(async (input: { email: string; otp: string; name?: string; acceptedTerms?: boolean }) => {
    const session = await verifyEmailOtpRequest(input)
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthSession(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginWithMobileOtp = useCallback(async (input: { phone: string; otp: string; name?: string; acceptedTerms?: boolean }) => {
    const session = await verifyMobileOtpRequest(input)
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthSession(nextUser, session.roles)
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
        writeCachedAuthSession(nextUser, session.roles)
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
    const nextUser = toAuthUser(session)
    writeCachedAuthSession(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
  }, [])

  const loginDemo = useCallback((demoUser: AuthUser) => {
    writeStoredDemoUser(demoUser)
    setUser(demoUser)
    setRoles([demoUser.role])
  }, [])

  const logout = useCallback(async () => {
    writeStoredDemoUser(null)
    writeCachedAuthSession(null, [])
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
    <AuthContext.Provider value={{ user, roles, ready, login, signup, loginWithEmailOtp, loginWithMobileOtp, refreshSession, updateDisplayName, markPasswordChanged, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const SAFE_DEFAULT: AuthContextValue = {
  user: null,
  roles: [],
  ready: true,
  login: async () => "student",
  signup: async () => "student",
  loginWithEmailOtp: async () => "student",
  loginWithMobileOtp: async () => "student",
  refreshSession: async () => null,
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
