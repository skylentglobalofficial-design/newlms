import { useEffect, useRef, useState } from 'react'
import { Rail } from './primitives'
import { getSurfaceAccent } from './accent'
import { S } from './tokens'
import type { AuroraThemeId } from '../aurora-themes'

export type AnchorSection = {
  id: string
  label: string
  /** Overrides the nav accent for this entry, for pages where each section has its own colour. */
  themeId?: AuroraThemeId
}

/** Keeps an anchored heading clear of the sticky header plus this nav. */
const SCROLL_OFFSET = 124

export function scrollToSection(id: string, offset = SCROLL_OFFSET) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
}

/**
 * Reports which section is currently in view. The asymmetric rootMargin keeps a
 * section active from the moment its heading clears the sticky chrome until it
 * has scrolled most of the way out, which matches how a reader perceives it.
 */
export function useActiveSection(ids: string[], initial?: string) {
  const [active, setActive] = useState(initial ?? ids[0] ?? '')
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 },
    )
    for (const id of idsRef.current) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

/**
 * Full-bleed sticky section nav. The band spans the viewport so the blurred
 * backdrop reaches the edges, while the links stay aligned to the content rail.
 * Entries are real anchors so they can be opened in place or linked to directly;
 * the click handler only replaces the jump with an offset smooth scroll.
 */
export default function AnchorNav({
  sections,
  active,
  themeId = 'general',
  label = 'Sections on this page',
  offset,
}: {
  sections: AnchorSection[]
  active?: string
  themeId?: AuroraThemeId
  label?: string
  offset?: number
}) {
  return (
    <nav className="sk-anchor-nav" aria-label={label}>
      <Rail>
        {sections.map(section => {
          const isActive = active === section.id
          const accent = getSurfaceAccent(section.themeId ?? themeId)
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`sk-anchor${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              style={{
                textDecoration: 'none',
                color: isActive ? S.ink : undefined,
                borderBottomColor: isActive ? accent.solid : 'transparent',
              }}
              onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return
                event.preventDefault()
                scrollToSection(section.id, offset)
                window.history.replaceState(null, '', `#${section.id}`)
              }}
            >
              {section.label}
            </a>
          )
        })}
      </Rail>
    </nav>
  )
}
