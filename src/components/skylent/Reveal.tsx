/**
 * Scroll reveal for public pages. Content is fully visible by default; it is only held back
 * when motion is allowed AND the observer is running, so a failed script, a print, a crawler
 * or a reduced-motion setting always gets the finished page.
 *
 * With `stagger`, the wrapper itself stays put and its parts arrive in reading order
 * (eyebrow, headline, support, product, detail), each a short step after the last.
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
  /**
   * Reveal the parts in sequence instead of the block at once. `true` takes the direct
   * children, stepping into any child marked `data-reveal-group`; a string is a selector.
   */
  stagger?: boolean | string
  /** Direction the staggered parts travel: "y" rises, "x" slides in from the right. */
  axis?: "y" | "x"
  /** Gap between staggered parts, in ms. */
  step?: number
  id?: string
  style?: CSSProperties
  "aria-labelledby"?: string
  "aria-label"?: string
}

function parts(root: HTMLElement, stagger: boolean | string): HTMLElement[] {
  if (typeof stagger === "string") return Array.from(root.querySelectorAll<HTMLElement>(stagger))
  const collect = (node: Element): HTMLElement[] =>
    Array.from(node.children).flatMap((child) => (child.hasAttribute("data-reveal-group") ? collect(child) : [child as HTMLElement]))
  return collect(root)
}

export function Reveal({ children, as, className, delay = 0, variant = "up", stagger, axis = "y", step = 90, style, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    // Already on screen at load: leave it alone, no flash.
    if (rect.top < window.innerHeight * 0.92) return

    const steps = stagger ? parts(el, stagger) : []
    steps.forEach((node, i) => {
      node.classList.add("sky-reveal__step")
      node.style.transitionDelay = `${delay + i * step}ms`
    })
    el.classList.add("sky-reveal--armed")

    let cleanupTimer = 0
    const show = () => {
      el.classList.add("sky-reveal--in")
      detach()
      // Once arrived, hand hover and focus transitions back their normal timing.
      cleanupTimer = window.setTimeout(() => steps.forEach((node) => (node.style.transitionDelay = "")), delay + steps.length * step + 1200)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show()
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    // Safety net: never leave content hidden. If the observer misses, the first scroll that
    // brings the block to the viewport (or past it) shows it, and so does printing.
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight) show()
    }
    function detach() {
      observer.disconnect()
      window.removeEventListener("scroll", check)
      window.removeEventListener("beforeprint", show)
    }
    observer.observe(el)
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("beforeprint", show)
    return () => {
      detach()
      window.clearTimeout(cleanupTimer)
    }
  }, [delay, stagger, step])

  const classes = [
    "sky-reveal",
    variant === "plate" ? "sky-reveal--plate" : "",
    stagger ? "sky-reveal--stagger" : "",
    stagger && axis === "x" ? "sky-reveal--x" : "",
    className ?? "",
  ]
  return (
    <Tag
      ref={ref}
      className={classes.filter(Boolean).join(" ")}
      style={delay && !stagger ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
