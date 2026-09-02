import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, EnrollmentModal } from '../components/shared'
import { courses } from '../data'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = courses.find(c => c.slug === slug)
  const [expandedModule, setExpandedModule] = useState<string | null>(course?.modules[0]?.id ?? null)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!course) {
    return (
      <PageShell>
        <div style={{ padding: '120px 32px', textAlign: 'center', background: C.warmWhite, minHeight: '60vh' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: C.ink }}>Course not found</h2>
          <button onClick={() => navigate('/courses')} style={{ color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>← Back to Courses</button>
        </div>
      </PageShell>
    )
  }

  const discount = Math.round((1 - course.price / course.originalPrice) * 100)

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <button onClick={() => navigate('/courses')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>← Back to Courses</button>
          <FadeIn>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.category}</span>
              <span style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.level}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px' }}>{course.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.75, maxWidth: 560, margin: '0 0 36px' }}>{course.longDesc}</p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', `${course.lessons}`], ['Projects', `${course.projects}`]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
                  <div style={{ color: C.white, fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section style={{ background: C.warmWhite, padding: '64px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }} className="edu-grid">
          <div>
            {/* What you'll learn */}
            <FadeIn>
              <div style={{ background: C.white, borderRadius: 14, padding: 28, marginBottom: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 20px', letterSpacing: '-0.02em' }}>What you will learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {course.outcomes.map(o => (
                    <div key={o} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                      </div>
                      <span style={{ color: C.ink, fontSize: 13, lineHeight: 1.55 }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Curriculum */}
            <FadeIn delay={60}>
              <div style={{ background: C.white, borderRadius: 14, padding: 28, marginBottom: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Curriculum</h2>
                {course.modules.map((mod, mi) => (
                  <div key={mod.id} style={{ borderBottom: mi < course.modules.length - 1 ? '1px solid rgba(11,13,15,0.07)' : 'none' }}>
                    <button onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)} style={{ width: '100%', background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <span style={{ color: C.orange, fontFamily: 'var(--font-mono)', fontSize: 12, width: 28 }}>0{mi + 1}</span>
                        <span style={{ color: C.ink, fontSize: 15, fontWeight: 600 }}>{mod.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: C.slate, fontSize: 12 }}>{mod.lessons.length} lessons</span>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill={C.slate} style={{ transform: expandedModule === mod.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M0 0l6 8 6-8z"/></svg>
                      </div>
                    </button>
                    {expandedModule === mod.id && (
                      <div style={{ paddingBottom: 14, paddingLeft: 42 }}>
                        {mod.lessons.map(lesson => (
                          <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(11,13,15,0.05)' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: lesson.completed ? C.orange : 'transparent', border: `1.5px solid ${lesson.completed ? C.orange : 'rgba(11,13,15,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {lesson.completed && <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.white }} />}
                            </div>
                            <span style={{ color: lesson.completed ? C.slate : C.ink, fontSize: 13, flex: 1 }}>{lesson.title}</span>
                            <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', background: C.sand, borderRadius: 4, padding: '2px 8px' }}>{lesson.type.toUpperCase()}</span>
                            {lesson.duration && <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{lesson.duration}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Who this is for */}
            <FadeIn delay={100}>
              <div style={{ background: C.white, borderRadius: 14, padding: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Who this is for</h2>
                {course.forWhom.map(fw => (
                  <div key={fw} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(11,13,15,0.06)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.orange, marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: C.ink, fontSize: 14 }}>{fw}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Sticky enrollment card */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeIn>
              <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.1)', borderRadius: 16, padding: 28, boxShadow: '0 8px 40px rgba(11,13,15,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: C.ink }}>₹{course.price.toLocaleString('en-IN')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: C.slate, textDecoration: 'line-through' }}>₹{course.originalPrice.toLocaleString('en-IN')}</span>
                  <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 12, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-mono)' }}>{discount}% off</span>
                </div>
                <div style={{ color: C.slate, fontSize: 12, marginBottom: 22 }}>Including GST · Lifetime access</div>
                <button onClick={() => setEnrollOpen(true)} style={{ width: '100%', background: C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '15px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 12, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Enroll Now →</button>
                <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                  {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', `${course.lessons} lessons`], ['Projects', `${course.projects} real projects`], ['Certificate', 'Skylent Certificate']].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(11,13,15,0.06)' }}>
                      <span style={{ color: C.slate, fontSize: 13 }}>{l}</span>
                      <span style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {enrollOpen && (
        <EnrollmentModal item={{ id: course.slug, title: course.title, price: course.price, type: 'course' }} onClose={() => setEnrollOpen(false)} />
      )}
    </PageShell>
  )
}
