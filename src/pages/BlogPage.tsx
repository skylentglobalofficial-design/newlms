import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, EmptyState, Tag } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { blogPosts } from '../data'

const accent = getSurfaceAccent('general')

export default function BlogPage() {
  const [category, setCategory] = useState('All')
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))],
    [],
  )
  const filtered = blogPosts.filter(post => category === 'All' || post.category === category)

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Editorial"
          title="Notes on learning and work."
          lead="Writing about programmes, portfolios and hiring. These are essays, not product claims — if a sentence describes the platform, it has to be true of the platform."
        />

        <div style={{ paddingBottom: 72 }}>
          <div className="sk-chip-row" style={{ marginBottom: 28 }}>
            {categories.map(item => (
              <button
                key={item}
                type="button"
                className={`sk-chip${category === item ? ' is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No articles in that topic" body="Try another filter." />
          ) : (
            <div className="sk-grid sk-grid-2">
              {filtered.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card interactive padding={22} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Tag>{post.category}</Tag>
                      <span style={{ ...TY.meta, color: S.inkMuted }}>{post.readTime}</span>
                    </div>
                    <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{post.title}</h2>
                    <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{post.excerpt}</p>
                    <span style={{ ...TY.bodySm, color: accent.text, fontWeight: 600 }}>Read →</span>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Rail>
    </ProductShell>
  )
}
