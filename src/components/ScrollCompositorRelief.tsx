/**
 * Phase 6 — compositor relief during scroll.
 * Toggles `html.is-scrolling` via a passive listener + rAF (no React state).
 * CSS then drops backdrop-filter on glass layers while the page is moving.
 */
import { useEffect } from 'react'

const IDLE_MS = 140

export function ScrollCompositorRelief() {
  useEffect(() => {
    const root = document.documentElement
    let scrolling = false
    let idleTimer = 0
    let raf = 0

    const onScroll = () => {
      if (!scrolling) {
        scrolling = true
        raf = requestAnimationFrame(() => {
          root.classList.add('is-scrolling')
        })
      }
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        scrolling = false
        root.classList.remove('is-scrolling')
      }, IDLE_MS)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(idleTimer)
      cancelAnimationFrame(raf)
      root.classList.remove('is-scrolling')
    }
  }, [])

  return null
}

export default ScrollCompositorRelief
