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
const CACHED_AUTH_USER_KEY = "skylent:v71:cached-auth-user"

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

function readCachedAuthUser(): { user: AuthUser; roles: UserRole[] } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CACHED_AUTH_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { user?: AuthUser; roles?: UserRole[] }
    if (!parsed?.user?.id || !parsed.user.role) return null
    return {
      user: parsed.user,
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : [parsed.user.role],
    }
  } catch {
    return null
  }
}

function writeCachedAuthUser(user: AuthUser | null, roles: UserRole[] = []) {
  if (typeof window === "undefined") return
  try {
    if (user) {
      window.localStorage.setItem(
        CACHED_AUTH_USER_KEY,
        JSON.stringify({ user, roles: roles.length ? roles : [user.role] }),
      )
    } else {
      window.localStorage.removeItem(CACHED_AUTH_USER_KEY)
    }
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialCached = readCachedAuthUser()
  const initialDemo = readStoredDemoUser()
  const [user, setUser] = useState<AuthUser | null>(() => initialDemo ?? initialCached?.user ?? null)
  const [roles, setRoles] = useState<UserRole[]>(() => {
    if (initialDemo) return [initialDemo.role]
    if (initialCached) return initialCached.roles
    return []
  })
  // If we have a cached user, mark ready=true in 0ms so Dashboard/Navbar render without waiting for network
  const [ready, setReady] = useState<boolean>(() => Boolean(initialDemo || initialCached))

  useEffect(() => {
    setUnauthorizedHandler(() => {
      writeCachedAuthUser(null)
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
          const nextUser = toAuthUser(session)
          writeStoredDemoUser(null)
          writeCachedAuthUser(nextUser, session.roles)
          setUser(nextUser)
          setRoles(session.roles)
        } else if (storedDemo) {
          setUser(storedDemo)
          setRoles([storedDemo.role])
        } else {
          writeCachedAuthUser(null)
          setUser(null)
          setRoles([])
        }
      } catch {
        if (!cancelled) {
          if (storedDemo) {
            setUser(storedDemo)
            setRoles([storedDemo.role])
          } else if (!initialCached) {
            setUser(null)
            setRoles([])
          }
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
    writeCachedAuthUser(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, acceptedTerms: boolean, emailOtp?: string) => {
    const session = await signupRequest({ name, email, password, acceptedTerms, emailOtp })
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthUser(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginWithEmailOtp = useCallback(async (input: { email: string; otp: string; name?: string; acceptedTerms?: boolean }) => {
    const session = await verifyEmailOtpRequest(input)
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthUser(nextUser, session.roles)
    setUser(nextUser)
    setRoles(session.roles)
    return nextUser.role
  }, [])

  const loginWithMobileOtp = useCallback(async (input: { phone: string; otp: string; name?: string; acceptedTerms?: boolean }) => {
    const session = await verifyMobileOtpRequest(input)
    const nextUser = toAuthUser(session)
    writeStoredDemoUser(null)
    writeCachedAuthUser(nextUser, session.roles)
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
        writeCachedAuthUser(nextUser, session.roles)
        setUser(nextUser)
        setRoles(session.roles)
        return nextUser
      }
    } catch {
      // ignore
    }
    return null
  }, [])

  const updateDisplayName = useCallback(async (displayName: string) => {
    const updated = await updateProfileRequest(displayName)
    setUser((current) => {
      if (!current) return current
      const next = {
        ...current,
        name: updated.displayName ?? updated.name,
        avatar: updated.avatar,
      }
      writeCachedAuthUser(next, roles)
      return next
    })
  }, [roles])

  const markPasswordChanged = useCallback(() => {
    setUser((current) => {
      if (!current) return current
      const next = { ...current, mustChangePassword: false }
      writeCachedAuthUser(next, roles)
      return next
    })
  }, [roles])

  const loginDemo = useCallback((demoUser: AuthUser) => {
    if (!isDemoMode) return
    writeStoredDemoUser(demoUser)
    setUser(demoUser)
    setRoles([demoUser.role])
  }, [])

  const logout = useCallback(async () => {
    const wasDemo = user?.id.startsWith("demo-")
    writeStoredDemoUser(null)
    writeCachedAuthUser(null)
    clearAuthClientState()
    setUser(null)
    setRoles([])
    if (!wasDemo) {
      await logoutRequest()
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        ready,
        login,
        signup,
        loginWithEmailOtp,
        loginWithMobileOtp,
        refreshSession,
        updateDisplayName,
        markPasswordChanged,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
