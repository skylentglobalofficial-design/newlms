import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import './product.css'

/**
 * Light product surface: sticky header, main content, footer.
 * Pages opt in by rendering inside this shell; the near-black marketing shell
 * (PageShell) still serves the pages that have not been converted.
 */
export default function ProductShell({
  children,
  footer = true,
  className,
}: {
  children: ReactNode
  footer?: boolean
  className?: string
}) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      })
      return
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <div className={`sk-surface${className ? ` ${className}` : ''}`}>
      <SiteHeader />
      <main id="main-content">{children}</main>
      {footer && <SiteFooter />}
    </div>
  )
}
