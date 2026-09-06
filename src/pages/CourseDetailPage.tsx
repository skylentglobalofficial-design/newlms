import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, T, MarketingHero } from '../components/ui'
import { MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { courses } from '../data'
import { coursePhoto } from '../media'
import { useCatalogEnrollment } from '../hooks/useCatalogEnrollment'

const accent = getDomainAccent('professional')

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = courses.find(c => c.slug === slug)
  const [expandedModule, setExpandedModule] = useState<string | null>(course?.modules[0]?.id ?? null)
  const { startCourseEnrollment, enrolling, enrollError, clearEnrollError } = useCatalogEnrollment()

  if (!course) {
    return (
      <PageShell auroraTheme="professional">
        <Section tone="canvas" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="skylent-display-md" style={{ color: C.white }}>Course not found</h2>
            <Button variant="secondary" onClick={() => navigate('/courses')} style={{ marginTop: 16 }}>← Back to courses</Button>
          </div>
        </Section>
      </PageShell>
    )
  }

  const discount = Math.round((1 - course.price / course.originalPrice) * 100)
  const visual = coursePhoto(course.slug)

  return (
    <PageShell auroraTheme="professional">
      <MarketingHero
        auroraTheme="professional"
        visualMaxWidth={880}
        back={
          <button
            type="button"
            onClick={() => navigate('/courses')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}
          >
            ← Back to courses
          </button>
        }
        badges={
          <>
            <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 6, padding: '4px 12px', color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.category}</span>
            <span style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.lineDark}`, borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.level}</span>
          </>
        }
        title={course.title}
        lead={
          <span style={{ color: accent.text, fontWeight: 500 }}>
            {course.outcomes[0]}
          </span>
        }
        visual={
          <MediaImage
            src={visual}
            alt={course.title}
            className="skylent-hero-visual"
            style={{ minHeight: 280, borderRadius: 12, border: `1px solid ${T.lineDark}` }}
            aspect="21/9"
            overlay="bottom"
          />
        }
      >
        <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.58)', margin: '24px auto 0', maxWidth: 560, lineHeight: 1.75 }}>
          {course.longDesc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', String(course.lessons)], ['Projects', String(course.projects)]].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{l}</div>
              <div style={{ color: C.white, fontSize: 15, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </MarketingHero>

      <Section tone="canvas" divider>
        <div className="course-detail-stack">
          <FadeIn>
            <div style={{ padding: '28px 0', borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`, marginBottom: 40 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 8 }}>Enrollment</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.white }}>₹{course.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹{course.originalPrice.toLocaleString('en-IN')}</span>
                    <span style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: 11, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-mono)' }}>{discount}% off</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>Including GST · Lifetime access · Skylent certificate</div>
                </div>
                <div style={{ minWidth: 200 }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      if (enrolling) return
                      clearEnrollError()
                      startCourseEnrollment(course.slug)
                    }}
                    style={{ width: '100%', opacity: enrolling ? 0.7 : 1, cursor: enrolling ? 'wait' : 'pointer' }}
                  >
                    {enrolling ? 'Enrolling…' : 'Enroll now'}
                  </Button>
                  {enrollError && (
                    <div role="alert" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>
                      {enrollError} Please try again.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div style={{ marginBottom: 48 }}>
              <Eyebrow tone="dark" accent>Outcomes</Eyebrow>
              <h2 className="skylent-display-sm" style={{ color: C.white, margin: '14px 0 20px' }}>What you will learn</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {course.outcomes.map(o => (
                  <div key={o} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.6 }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={60}>
            <div style={{ marginBottom: 48 }}>
              <Eyebrow tone="dark">Curriculum</Eyebrow>
              <h2 className="skylent-display-sm" style={{ color: C.white, margin: '14px 0 20px' }}>Modules and lessons</h2>
              {course.modules.map((mod, mi) => (
                <div key={mod.id} style={{ borderBottom: mi < course.modules.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)' }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left' }}>
                      <span style={{ color: accent.text, fontFamily: 'var(--font-mono)', fontSize: 12, width: 28 }}>0{mi + 1}</span>
                      <span style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{mod.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{mod.lessons.length} lessons</span>
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="rgba(255,255,255,0.4)" style={{ transform: expandedModule === mod.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M0 0l6 8 6-8z"/></svg>
                    </div>
                  </button>
                  {expandedModule === mod.id && (
                    <div style={{ paddingBottom: 16, paddingLeft: 42 }}>
                      {mod.lessons.map(lesson => (
                        <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${T.lineDark}`, flexWrap: 'wrap' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, flex: '1 1 160px' }}>{lesson.title}</span>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 8px' }}>{lesson.type.toUpperCase()}</span>
                          {lesson.duration && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{lesson.duration}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ marginBottom: 24 }}>
              <Eyebrow tone="dark">Audience</Eyebrow>
              <h2 className="skylent-display-sm" style={{ color: C.white, margin: '14px 0 16px' }}>Who this is for</h2>
              {course.forWhom.map(fw => (
                <div key={fw} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent.primary, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.6 }}>{fw}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div style={{ padding: '28px 0', borderTop: `1px solid ${T.lineDark}`, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 20px' }}>
                {course.mode} · {course.duration} · {course.lessons} lessons · {course.projects} projects
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (enrolling) return
                  clearEnrollError()
                  startCourseEnrollment(course.slug)
                }}
                style={{ opacity: enrolling ? 0.7 : 1 }}
              >
                {enrolling ? 'Enrolling…' : 'Enroll in this course'}
              </Button>
            </div>
          </FadeIn>
        </div>
      </Section>

    </PageShell>
  )
}
