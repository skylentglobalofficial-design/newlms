// ─── AUTH PROVIDER ABSTRACTION ─────────────────────────────────────────────────
//
// `AuthContext` (see AuthContext.tsx) is the only thing pages import — its
// public API (`useAuth()` returning `{ user, login, logout }`) does not
// change here. This file exists so the *implementation* backing that API can
// be swapped later (e.g. for Supabase/Firebase/a real session API) without
// touching any page.
//
// Today, `demoAuthProvider` is the only implementation: it persists the
// signed-in user to localStorage, exactly as AuthContext did before this
// refactor. A future real provider would implement the same `AuthProvider`
// interface (e.g. calling a real API for `getSession`/`login`/`logout`) and
// `AuthContext` would construct that provider instead — no other file needs
// to change.
//
// NOTE: This is still demo authentication. No real sign-in, tokens, or
// server-side session are implemented in Phase 1.

import type { AuthUser } from './AuthContext'

export interface AuthProvider {
  /** Reads the currently persisted session, if any. */
  getSession(): AuthUser | null
  /** Persists a session for the given user. */
  login(user: AuthUser): void
  /** Clears the current session. */
  logout(): void
}

const STORAGE_KEY = 'skylent_user'

export const demoAuthProvider: AuthProvider = {
  getSession() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      // ignore corrupt storage
      return null
    }
  },
  login(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  },
  logout() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
