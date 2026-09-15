import type { CSSProperties, ReactNode } from 'react'
import { C, T } from '../../tokens'

type Accent = { primary: string; subtle: string; border: string; text: string }

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-b-${i}`} style={{ color: C.ink, fontWeight: 600 }}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={`${keyPrefix}-c-${i}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: C.ink, background: C.sand, padding: '1px 6px', borderRadius: 4 }}>
          {token.slice(1, -1)}
        </code>,
      )
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        const href = link[2]
        const external = href.startsWith('http')
        parts.push(
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            download={!external && href.endsWith('.csv') ? '' : undefined}
            style={{ color: C.blue, textDecoration: 'underline' }}
          >
            {link[1]}
          </a>,
        )
      }
    }
    last = match.index + token.length
    i += 1
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|')
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}/.test(line)
}

function splitRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

export default function LessonDocument({
  markdown,
  accent,
}: {
  markdown: string
  accent: Accent
}) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let fence: string[] | null = null

  const paraStyle: CSSProperties = { color: C.slate, fontSize: 14.5, lineHeight: 1.75, margin: '0 0 12px' }

  while (i < lines.length) {
    const line = lines[i]

    if (fence) {
      if (line.trim().startsWith('```')) {
        blocks.push(
          <pre
            key={`pre-${i}`}
            style={{
              background: C.cream,
              border: `1px solid ${T.lineDark}`,
              borderRadius: T.rControl,
              padding: '14px 16px',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              lineHeight: 1.6,
              color: C.ink,
              margin: '0 0 16px',
            }}
          >
            {fence.join('\n')}
          </pre>,
        )
        fence = null
      } else {
        fence.push(line)
      }
      i += 1
      continue
    }

    if (line.trim().startsWith('```')) {
      fence = []
      i += 1
      continue
    }

    if (isTableRow(line)) {
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isTableDivider(lines[i])) rows.push(splitRow(lines[i]))
        i += 1
      }
      if (rows.length) {
        const header = rows[0]
        const body = rows.slice(1)
        blocks.push(
          <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '0 0 16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {header.map((cell, ci) => (
                    <th key={ci} style={{ textAlign: 'left', color: C.ink, fontWeight: 600, padding: '8px 10px', borderBottom: `1px solid ${accent.border}` }}>
                      {renderInline(cell, `th-${i}-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ color: C.slate, padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top' }}>
                        {renderInline(cell, `td-${i}-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} style={{ color: C.ink, fontSize: 22, fontWeight: 700, margin: '0 0 16px', fontFamily: 'var(--font-display)', lineHeight: 1.25 }}>
          {line.slice(2)}
        </h2>,
      )
      i += 1
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} style={{ color: C.ink, fontSize: 16, fontWeight: 600, margin: '22px 0 10px' }}>
          {line.slice(3)}
        </h3>,
      )
      i += 1
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} style={{ color: accent.text, fontSize: 14, fontWeight: 600, margin: '18px 0 8px' }}>
          {line.slice(4)}
        </h4>,
      )
      i += 1
      continue
    }

    if (line.startsWith('> ')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote.push(lines[i].slice(2))
        i += 1
      }
      blocks.push(
        <blockquote key={`q-${i}`} style={{ margin: '0 0 16px', padding: '12px 16px', borderLeft: `3px solid ${accent.primary}`, background: accent.subtle, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
          {quote.map((q, qi) => <div key={qi}>{renderInline(q, `q-${i}-${qi}`)}</div>)}
        </blockquote>,
      )
      continue
    }

    const listMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (line.startsWith('- ') || listMatch) {
      const ordered = Boolean(listMatch)
      const items: string[] = []
      while (i < lines.length) {
        const current = lines[i]
        const orderedItem = current.match(/^(\d+)\.\s+(.*)$/)
        if (ordered && orderedItem) {
          items.push(orderedItem[2])
          i += 1
          continue
        }
        if (!ordered && current.startsWith('- ')) {
          items.push(current.slice(2))
          i += 1
          continue
        }
        break
      }
      const Tag = ordered ? 'ol' : 'ul'
      blocks.push(
        <Tag key={`list-${i}`} style={{ margin: '0 0 16px', paddingLeft: 20, color: C.slate, fontSize: 14.5, lineHeight: 1.7 }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ marginBottom: 6 }}>{renderInline(item, `li-${i}-${ii}`)}</li>
          ))}
        </Tag>,
      )
      continue
    }

    if (line.trim() === '') {
      i += 1
      continue
    }

    blocks.push(
      <p key={`p-${i}`} style={paraStyle}>
        {renderInline(line, `p-${i}`)}
      </p>,
    )
    i += 1
  }

  if (fence) {
    blocks.push(
      <pre key="pre-open" style={{ fontFamily: 'var(--font-mono)', color: C.ink, background: C.cream, padding: 14, borderRadius: T.rControl }}>
        {fence.join('\n')}
      </pre>,
    )
  }

  return <div className="lms-lesson-document">{blocks}</div>
}
