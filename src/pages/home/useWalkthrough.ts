/**
 * useWalkthrough: a step-by-step product walkthrough that advances on its own while on screen.
 *
 * - Advances every `interval` ms (default 2 s) only while the section is in view.
 * - Pauses while the pointer is over it or keyboard focus is inside it.
 * - Stops once the visitor picks a step or uses previous / next; the play button resumes it (and
 *   overrides the hover / focus pause until the pointer or focus moves again).
 * - Never advances on its own under prefers-reduced-motion (the controls still work).
 * The timer only depends on these flags, so ordinary re-renders do not restart the sequence.
 */
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react"

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
}

export function useWalkthrough<T extends HTMLElement>(count: number, interval = 2000) {
  const rootRef = useRef<T>(null)
  const [active, setActive] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const running = playing && inView && !hovered && !focused
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % count), interval)
    return () => window.clearInterval(timer)
  }, [running, count, interval])

  const go = useCallback(
    (index: number) => {
      setPlaying(false)
      setActive(((index % count) + count) % count)
    },
    [count],
  )
  const next = useCallback(() => {
    setPlaying(false)
    setActive((current) => (current + 1) % count)
  }, [count])
  const prev = useCallback(() => {
    setPlaying(false)
    setActive((current) => (current - 1 + count) % count)
  }, [count])
  // Pressing play is an explicit choice, so it overrides the hover and focus pause until they change again.
  const toggle = useCallback(() => {
    if (!playing) {
      setHovered(false)
      setFocused(false)
    }
    setPlaying(!playing)
  }, [playing])

  const regionProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
    },
  }

  return { rootRef, active, go, next, prev, playing, toggle, reduced, regionProps }
}
