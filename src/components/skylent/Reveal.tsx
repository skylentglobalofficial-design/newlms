/**
 * Scroll reveal for public pages. Content is fully visible by default; it is only held back
 * when motion is allowed AND the observer is running, so a failed script, a print, a crawler
 * or a reduced-motion setting always gets the finished page.
 */
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  /** Element to render. Defaults to div. */
  as?: ElementType
  className?: string
  /** Delay in ms, for staggering siblings. */
  delay?: number
  /** "up" fades and rises; "plate" also settles a slight scale, for product plates. */
  variant?: "up" | "plate"
  id?: string
  style?: CSSProperties
  "aria-labelledby"?: string
  "aria-label"?: string
}

export function Reveal({ children, as, className, delay = 0, variant = "up", style, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    // Already on screen at load: leave it alone, no flash.
    if (rect.top < window.innerHeight * 0.92) return
    el.classList.add("sky-reveal--armed")
    const show = () => el.classList.add("sky-reveal--in")
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          show()
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    observer.observe(el)
    // Safety net: never leave content hidden.
    const timer = window.setTimeout(show, 4000)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      className={["sky-reveal", variant === "plate" ? "sky-reveal--plate" : "", className ?? ""].filter(Boolean).join(" ")}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
