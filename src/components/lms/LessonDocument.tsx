import type { ReactNode } from 'react'

type Accent = { primary: string; subtle: string; border: string; text: string }

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-b-${i}`}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={`${keyPrefix}-i-${i}`}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      parts.push(<code key={`${keyPrefix}-c-${i}`}>{token.slice(1, -1)}</code>)
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        const href = link[2]
        const external = href.startsWith('http')
        const file = href.endsWith('.csv') || href.endsWith('.xlsx')
        parts.push(
          <a
            key={`${keyPrefix}-a-${i}`}
            className={file ? 'lx-file' : undefined}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            download={!external && file ? '' : undefined}
          >
            {file ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ) : null}
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

const CALLOUT_LABELS: Record<string, string> = {
  objective: 'Objective',
  'why this matters': 'Why this matters',
  answer: 'Answer',
}

const META_LABELS: Record<string, string> = {
  prerequisite: 'Prerequisite',
  'estimated time': 'Time',
  dataset: 'Dataset',
  datasets: 'Datasets',
}

function labeledLine(line: string): { key: string; rest: string } | null {
  const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/)
  if (!match) return null
  return { key: match[1].trim().toLowerCase(), rest: match[2] }
}

function sectionFromHeading(heading: string): { kind: string; label: string } | null {
  const text = heading.trim()
  const lower = text.toLowerCase()
  if (lower.startsWith('worked example') || lower.startsWith('example')) return { kind: 'example', label: 'Example' }
  if (lower === 'practice' || lower.startsWith('try')) return { kind: 'practice', label: 'Try it' }
  if (lower.includes('knowledge check') || lower.includes('check your')) return { kind: 'check', label: 'Check your understanding' }
  if (lower.includes('common mistake')) return { kind: 'note', label: 'Watch for' }
  if (lower.includes('step-by-step') || lower.includes('procedure')) return { kind: 'procedure', label: 'Procedure' }
  if (lower === 'expected result') return { kind: 'note', label: 'Expected result' }
  return null
}

function nextSectionStart(lines: string[], from: number) {
  for (let i = from; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ') || lines[i].startsWith('# ')) return i
  }
  return lines.length
}

export default function LessonDocument({
  markdown,
  skipHeading,
}: {
  markdown: string
  accent: Accent
  skipHeading?: string
}) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []

  function parseRange(start: number, end: number, keyPrefix: string): ReactNode[] {
    const out: ReactNode[] = []
    let i = start
    let fence: string[] | null = null

    while (i < end) {
      const line = lines[i]

      if (fence) {
        if (line.trim().startsWith('```')) {
          out.push(<pre key={`${keyPrefix}-pre-${i}`}><code>{fence.join('\n')}</code></pre>)
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
        while (i < end && isTableRow(lines[i])) {
          if (!isTableDivider(lines[i])) rows.push(splitRow(lines[i]))
          i += 1
        }
        if (rows.length) {
          const header = rows[0]
          const body = rows.slice(1)
          out.push(
            <div key={`${keyPrefix}-tbl-${i}`} className="lx-table-wrap">
              <table>
                <thead>
                  <tr>
                    {header.map((cell, ci) => (
                      <th key={ci}>{renderInline(cell, `${keyPrefix}-th-${i}-${ci}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{renderInline(cell, `${keyPrefix}-td-${i}-${ri}-${ci}`)}</td>
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
        const heading = line.slice(2).trim()
        if (skipHeading && heading.toLowerCase() === skipHeading.trim().toLowerCase()) {
          i += 1
          continue
        }
        out.push(<h2 key={`${keyPrefix}-h1-${i}`}>{heading}</h2>)
        i += 1
        continue
      }
      if (line.startsWith('## ')) {
        out.push(<h3 key={`${keyPrefix}-h2-${i}`}>{line.slice(3)}</h3>)
        i += 1
        continue
      }
      if (line.startsWith('### ')) {
        out.push(<h4 key={`${keyPrefix}-h3-${i}`}>{line.slice(4)}</h4>)
        i += 1
        continue
      }

      if (line.startsWith('> ')) {
        const quote: string[] = []
        while (i < end && lines[i].startsWith('> ')) {
          quote.push(lines[i].slice(2))
          i += 1
        }
        out.push(
          <blockquote key={`${keyPrefix}-q-${i}`}>
            {quote.map((q, qi) => <div key={qi}>{renderInline(q, `${keyPrefix}-q-${i}-${qi}`)}</div>)}
          </blockquote>,
        )
        continue
      }

      const labeled = labeledLine(line)
      if (labeled && CALLOUT_LABELS[labeled.key]) {
        out.push(
          <aside key={`${keyPrefix}-c-${i}`} className={`lx-callout ${labeled.key === 'why this matters' ? 'lx-callout-why' : ''}`}>
            <p className="lx-callout-label">{CALLOUT_LABELS[labeled.key]}</p>
            <p>{renderInline(labeled.rest, `${keyPrefix}-cl-${i}`)}</p>
          </aside>,
        )
        i += 1
        continue
      }

      const listMatch = line.match(/^(\d+)\.\s+(.*)$/)
      if (line.startsWith('- ') || listMatch) {
        const ordered = Boolean(listMatch)
        const items: string[] = []
        while (i < end) {
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
        out.push(
          <Tag key={`${keyPrefix}-list-${i}`}>
            {items.map((item, ii) => (
              <li key={ii}>{renderInline(item, `${keyPrefix}-li-${i}-${ii}`)}</li>
            ))}
          </Tag>,
        )
        continue
      }

      if (line.trim() === '') {
        i += 1
        continue
      }

      out.push(
        <p key={`${keyPrefix}-p-${i}`}>
          {renderInline(line, `${keyPrefix}-p-${i}`)}
        </p>,
      )
      i += 1
    }

    if (fence) {
      out.push(<pre key={`${keyPrefix}-pre-open`}><code>{fence.join('\n')}</code></pre>)
    }
    return out
  }

  let i = 0
  const leading: Array<{ kind: 'meta' | 'callout'; key: string; rest: string }> = []
  while (i < lines.length) {
    if (lines[i].trim() === '') {
      i += 1
      continue
    }
    if (lines[i].startsWith('# ')) {
      const heading = lines[i].slice(2).trim()
      if (skipHeading && heading.toLowerCase() === skipHeading.trim().toLowerCase()) {
        i += 1
        continue
      }
      break
    }
    const labeled = labeledLine(lines[i])
    if (labeled && META_LABELS[labeled.key]) {
      leading.push({ kind: 'meta', key: labeled.key, rest: labeled.rest })
      i += 1
      continue
    }
    if (labeled && CALLOUT_LABELS[labeled.key]) {
      leading.push({ kind: 'callout', key: labeled.key, rest: labeled.rest })
      i += 1
      continue
    }
    break
  }

  const meta = leading.filter((item) => item.kind === 'meta')
  if (meta.length) {
    blocks.push(
      <div key="meta" className="lx-meta">
        {meta.map((item) => (
          <span key={item.key} className="lx-meta-item">
            <strong>{META_LABELS[item.key]}</strong>
            <span>{renderInline(item.rest, `meta-${item.key}`)}</span>
          </span>
        ))}
      </div>,
    )
  }
  leading.filter((item) => item.kind === 'callout').forEach((item, index) => {
    blocks.push(
      <aside key={`lead-c-${index}`} className={`lx-callout ${item.key === 'why this matters' ? 'lx-callout-why' : ''}`}>
        <p className="lx-callout-label">{CALLOUT_LABELS[item.key]}</p>
        <p>{renderInline(item.rest, `lead-c-${index}`)}</p>
      </aside>,
    )
  })

  while (i < lines.length) {
    if (lines[i].trim() === '') {
      i += 1
      continue
    }

    if (lines[i].startsWith('## ')) {
      const heading = lines[i].slice(3)
      const section = sectionFromHeading(heading)
      if (section) {
        const end = nextSectionStart(lines, i + 1)
        const remainder = heading
          .replace(/^(worked example|example|practice|try it|knowledge check|check your understanding|common mistakes|step-by-step procedure|procedure|expected result)\s*[—–:-]?\s*/i, '')
          .trim()
        const inner = parseRange(i + 1, end, `sec-${i}`)
        blocks.push(
          <section key={`sec-${i}`} className={`lx-section lx-section-${section.kind}`}>
            <p className="lx-section-label">{section.label}</p>
            {remainder && remainder.toLowerCase() !== section.label.toLowerCase() ? <h3>{remainder}</h3> : null}
            {inner}
          </section>,
        )
        i = end
        continue
      }
      const end = nextSectionStart(lines, i + 1)
      blocks.push(...parseRange(i, end, `body-${i}`))
      i = end
      continue
    }

    if (lines[i].startsWith('# ')) {
      const end = nextSectionStart(lines, i + 1)
      blocks.push(...parseRange(i, end, `h-${i}`))
      i = end
      continue
    }

    let run = i
    while (run < lines.length && !lines[run].startsWith('# ') && !lines[run].startsWith('## ')) {
      run += 1
    }
    blocks.push(...parseRange(i, run, `run-${i}`))
    i = run
  }

  return <div className="lms-lesson-document lx-doc">{blocks}</div>
}
