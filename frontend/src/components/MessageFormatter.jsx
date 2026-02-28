// components/MessageFormatter.jsx
// Parses AI markdown-ish output into rich, readable JSX.
// Handles: headers, bold, italic, inline code, code blocks,
// ordered/unordered lists, blockquotes, horizontal rules,
// and semantic highlighting (quoted text, tier labels, definitions).

import { useMemo } from 'react'

// ── Inline parser ─────────────────────────────────────────────────────────────
// Processes a string into an array of React nodes, handling:
// **bold**, *italic*, `code`, "quoted text", TIER LABELS, Key: definitions
function parseInline(text, keyPrefix = '') {
  const segments = []
  // Combined regex for all inline tokens
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)|("([^"]{2,80})")|(\b(CRITICAL|MODERATE|MINOR|ERROR|WARNING|NOTE|IMPORTANT|DEFINITION|SUMMARY|RESULT):\s*)/g
  let last = 0
  let match
  let idx = 0

  while ((match = re.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > last) {
      segments.push(
        <span key={`${keyPrefix}-t${idx++}`}>{text.slice(last, match.index)}</span>
      )
    }

    if (match[1]) {
      // **bold**
      segments.push(
        <strong key={`${keyPrefix}-b${idx++}`} className="fmt-bold">{match[2]}</strong>
      )
    } else if (match[3]) {
      // *italic*
      segments.push(
        <em key={`${keyPrefix}-i${idx++}`} className="fmt-italic">{match[4]}</em>
      )
    } else if (match[5]) {
      // `inline code`
      segments.push(
        <code key={`${keyPrefix}-c${idx++}`} className="fmt-code-inline">{match[6]}</code>
      )
    } else if (match[7]) {
      // "quoted text"
      segments.push(
        <span key={`${keyPrefix}-q${idx++}`} className="fmt-quote">"{match[8]}"</span>
      )
    } else if (match[9]) {
      // TIER LABEL: (CRITICAL:, MINOR:, etc.)
      const tier = match[10].replace(':', '').trim().toLowerCase()
      segments.push(
        <span key={`${keyPrefix}-tier${idx++}`} className={`fmt-tier fmt-tier-${tier}`}>
          {match[9]}
        </span>
      )
    }

    last = match.index + match[0].length
  }

  // Remaining plain text
  if (last < text.length) {
    segments.push(
      <span key={`${keyPrefix}-tail${idx++}`}>{text.slice(last)}</span>
    )
  }

  return segments.length > 0 ? segments : [text]
}

// ── Block-level tokeniser ─────────────────────────────────────────────────────
function tokenise(raw) {
  const lines = raw.split('\n')
  const tokens = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // ── Fenced code block (``` or ~~~)
    if (/^```|^~~~/.test(line)) {
      const lang = line.replace(/^```|^~~~/, '').trim()
      const codeLines = []
      i++
      while (i < lines.length && !/^```|^~~~/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      tokens.push({ type: 'code_block', lang, code: codeLines.join('\n') })
      i++
      continue
    }

    // ── ATX headings: # ## ###
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      tokens.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      i++
      continue
    }

    // ── Setext headings (underlined with === or ---)
    if (i + 1 < lines.length) {
      if (/^={3,}$/.test(lines[i + 1])) {
        tokens.push({ type: 'heading', level: 1, text: line })
        i += 2; continue
      }
      if (/^-{3,}$/.test(lines[i + 1]) && line.trim()) {
        tokens.push({ type: 'heading', level: 2, text: line })
        i += 2; continue
      }
    }

    // ── Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      tokens.push({ type: 'hr' })
      i++; continue
    }

    // ── Blockquote
    if (/^>\s?/.test(line)) {
      const quoteLines = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      tokens.push({ type: 'blockquote', lines: quoteLines })
      continue
    }

    // ── Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ''))
        i++
      }
      tokens.push({ type: 'ul', items })
      continue
    }

    // ── Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      tokens.push({ type: 'ol', items })
      continue
    }

    // ── Blank line
    if (line.trim() === '') {
      tokens.push({ type: 'blank' })
      i++; continue
    }

    // ── Plain paragraph (merge consecutive non-special lines)
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^```|^~~~/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      tokens.push({ type: 'paragraph', text: paraLines.join(' ') })
    }
  }

  return tokens
}

// ── Renderer ──────────────────────────────────────────────────────────────────
function renderTokens(tokens) {
  const nodes = []
  let key = 0

  for (const tok of tokens) {
    switch (tok.type) {
      case 'heading': {
        const Tag = `h${Math.min(tok.level + 1, 5)}` // h2–h5, offset by 1 since h1 = page title
        const cls = `fmt-heading fmt-h${tok.level}`
        nodes.push(
          <Tag key={key++} className={cls}>
            {parseInline(tok.text, String(key))}
          </Tag>
        )
        break
      }

      case 'paragraph': {
        nodes.push(
          <p key={key++} className="fmt-para">
            {parseInline(tok.text, String(key))}
          </p>
        )
        break
      }

      case 'ul': {
        nodes.push(
          <ul key={key++} className="fmt-ul">
            {tok.items.map((item, i) => (
              <li key={i} className="fmt-li">
                {parseInline(item, `ul-${key}-${i}`)}
              </li>
            ))}
          </ul>
        )
        break
      }

      case 'ol': {
        nodes.push(
          <ol key={key++} className="fmt-ol">
            {tok.items.map((item, i) => (
              <li key={i} className="fmt-li">
                {parseInline(item, `ol-${key}-${i}`)}
              </li>
            ))}
          </ol>
        )
        break
      }

      case 'blockquote': {
        nodes.push(
          <blockquote key={key++} className="fmt-blockquote">
            {tok.lines.map((l, i) => (
              <p key={i} className="fmt-para" style={{ margin: 0 }}>
                {parseInline(l, `bq-${key}-${i}`)}
              </p>
            ))}
          </blockquote>
        )
        break
      }

      case 'code_block': {
        nodes.push(
          <div key={key++} className="fmt-code-block">
            {tok.lang && <span className="fmt-code-lang">{tok.lang}</span>}
            <pre><code>{tok.code}</code></pre>
          </div>
        )
        break
      }

      case 'hr': {
        nodes.push(<hr key={key++} className="fmt-hr" />)
        break
      }

      case 'blank':
        break // swallow — spacing handled by CSS gap

      default:
        break
    }
  }

  return nodes
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MessageFormatter({ content }) {
  const nodes = useMemo(() => {
    const tokens = tokenise(content)
    return renderTokens(tokens)
  }, [content])

  return <div className="fmt-root">{nodes}</div>
}
