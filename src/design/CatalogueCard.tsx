import { Link } from 'react-router-dom'
import { R, S, TY } from './tokens'
import { getSurfaceAccent } from './accent'
import { MetaRow, StatusPill, Tag } from './primitives'
import { getProgrammeAvailability, publishedModuleCount } from '../lib/catalogue-status'
import { resolveAuroraTheme, type AuroraThemeId } from '../aurora-themes'
import type { Course, Program, ProgramType } from '../data'

export const PROGRAM_TYPE_LABEL: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional programme',
  CERTIFICATE: 'Certificate programme',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

export function formatInr(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

/**
 * Abstract accent mark. Skylent does not licence photography of learners it
 * does not have, so catalogue cards use a generated mark rather than stock
 * imagery that implies cohorts, campuses or people that do not exist.
 */
export function AccentMark({ themeId, label, size = 42 }: { themeId: AuroraThemeId; label: string; size?: number }) {
  const accent = getSurfaceAccent(themeId)
  const initials = label
    .split(/\s+/)
    .filter(word => /[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 11,
        background: `linear-gradient(140deg, ${accent.solid} 0%, ${accent.glowSecondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontSize: size * 0.34,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
      }}
    >
      {initials || 'S'}
    </div>
  )
}

// ── Programme card ───────────────────────────────────────────────────────────
export function ProgrammeCard({ program, compact }: { program: Program; compact?: boolean }) {
  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const accent = getSurfaceAccent(themeId)
  const availability = getProgrammeAvailability(program)
  const modules = publishedModuleCount(program)
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null

  return (
    <Link
      to={`/programs/${program.slug}`}
      className="sk-card sk-card-interactive sk-cat-card"
      style={{
        background: S.surface,
        border: `1px solid ${S.line}`,
        borderRadius: R.card,
        padding: compact ? 16 : 20,
        textDecoration: 'none',
        color: S.ink,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <AccentMark themeId={themeId} label={program.name} size={compact ? 36 : 42} />
        <StatusPill availability={availability} size="sm" />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ ...TY.meta, color: accent.text, fontWeight: 600, marginBottom: 5 }}>
          {PROGRAM_TYPE_LABEL[program.programType]}
        </div>
        <h3 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{program.name}</h3>
      </div>

      <MetaRow
        items={[
          modules > 0 ? `${modules} module${modules === 1 ? '' : 's'}` : null,
          program.duration,
          program.level,
        ]}
      />

      {!compact && (
        <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0 }}>{availability.explanation}</p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: `1px solid ${S.line}`,
        }}
      >
        <span style={{ ...TY.bodySm, color: S.inkMuted }}>
          {lowestPrice === null ? 'Fee on request' : <>From <strong style={{ color: S.ink, fontWeight: 600 }}>{formatInr(lowestPrice)}</strong></>}
        </span>
        <span style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {availability.canStartLearning ? 'View programme' : 'View details'} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  )
}

/**
 * Dark featured variant. Reserved for a programme that is genuinely open in the
 * learning platform, so the strongest visual treatment always points at real
 * inventory.
 */
export function FeaturedProgrammeCard({ program }: { program: Program }) {
  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const accent = getSurfaceAccent(themeId)
  const availability = getProgrammeAvailability(program)
  const modules = publishedModuleCount(program)
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null

  return (
    <Link
      to={`/programs/${program.slug}`}
      className="sk-featured-card"
      style={{
        backgroundImage: `radial-gradient(520px 220px at 82% 0%, ${accent.glow}3D, transparent 68%)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <AccentMark themeId={themeId} label={program.name} size={44} />
        <StatusPill availability={availability} size="sm" />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ ...TY.meta, color: S.inkOnDarkMuted, fontWeight: 600, marginBottom: 6 }}>
          {PROGRAM_TYPE_LABEL[program.programType]}
        </div>
        <h3 style={{ ...TY.h2, color: S.inkOnDark, margin: 0, fontFamily: 'var(--font-display)' }}>{program.name}</h3>
        <p style={{ ...TY.bodySm, color: S.inkOnDarkSecondary, margin: '10px 0 0' }}>{availability.explanation}</p>
      </div>

      <MetaRow
        tone="dark"
        items={[
          modules > 0 ? `${modules} modules` : null,
          program.duration,
          program.level,
          lowestPrice === null ? null : `From ${formatInr(lowestPrice)}`,
        ]}
      />

      <span className="sk-featured-cta">
        {availability.ctaLabel} <span aria-hidden>→</span>
      </span>
    </Link>
  )
}

// ── Course card ──────────────────────────────────────────────────────────────
export function CourseCard({ course, compact }: { course: Course; compact?: boolean }) {
  const themeId = resolveAuroraTheme('/courses')
  const accent = getSurfaceAccent(themeId)
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0)

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="sk-card sk-card-interactive sk-cat-card"
      style={{
        background: S.surface,
        border: `1px solid ${S.line}`,
        borderRadius: R.card,
        padding: compact ? 16 : 20,
        textDecoration: 'none',
        color: S.ink,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <AccentMark themeId={themeId} label={course.title} size={compact ? 36 : 42} />
        <Tag>{course.category}</Tag>
      </div>

      <div style={{ minWidth: 0 }}>
        <h3 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{course.title}</h3>
      </div>

      <MetaRow
        items={[
          lessonCount > 0 ? `${lessonCount} lesson${lessonCount === 1 ? '' : 's'} published` : 'No lessons published yet',
          course.duration,
          course.level,
        ]}
      />

      {!compact && <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0 }}>{course.desc}</p>}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: `1px solid ${S.line}`,
        }}
      >
        <span style={{ ...TY.bodySm, color: S.ink, fontWeight: 600 }}>{formatInr(course.price)}</span>
        <span style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
          View course <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  )
}
