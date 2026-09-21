import { useEffect, type ReactNode } from "react"
import { PageShell } from "../components/shared"
import "./public-editorial.css"

/** Shared light editorial canvas for remaining public surfaces. */
export function PublicEditorialShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollPaddingTop
    root.style.scrollPaddingTop = "calc(var(--nav-h) + 20px)"
    return () => {
      root.style.scrollPaddingTop = previous
    }
  }, [])

  return (
    <PageShell aurora={false}>
      <div className="pe-page">{children}</div>
    </PageShell>
  )
}
