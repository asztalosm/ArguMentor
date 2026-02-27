import { useRef, useState } from 'react'
import { useChatStore } from '../contexts/store'
import { useChat } from '../hooks/useChat'

const PLACEHOLDERS = {
  debate:         'State your position — I will argue the opposite…',
  teach:          'Teach me something — a concept, fact, or idea…',
  mistake_hunter: 'Paste your text here and I will hunt for mistakes…',
}

export default function ChatInput() {
  const { mode, loading } = useChatStore()
  const { send } = useChat()
  const [value, setValue] = useState('')
  const ref = useRef(null)

  const canSend = value.trim().length > 0 && !loading

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  async function handleSend() {
    if (!canSend) return
    const msg = value
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
    await send(msg)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={s.wrapper}>
      <div style={{ ...s.box, boxShadow: value ? '0 0 0 2px var(--accent)' : 'none' }}>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder={PLACEHOLDERS[mode]}
          onChange={e => { setValue(e.target.value); autoResize() }}
          onKeyDown={handleKey}
          disabled={loading}
          style={s.textarea}
        />
        <div style={s.footer}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--dim)' }}>
            ⏎ send &nbsp;·&nbsp; ⇧⏎ newline
          </span>
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{ ...s.send, opacity: canSend ? 1 : 0.35, cursor: canSend ? 'pointer' : 'not-allowed' }}
          >
            {loading
              ? <span style={{ width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'block',animation:'spin 0.7s linear infinite' }} />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrapper: {
    padding: '10px 20px 18px',
    borderTop: '1px solid var(--border)',
    background: 'rgba(8,8,14,0.7)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
  },
  box: {
    maxWidth: 820, margin: '0 auto',
    background: 'var(--elevated)', border: '1px solid var(--border)',
    borderRadius: 16, overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  textarea: {
    width: '100%', minHeight: 50, maxHeight: 180,
    background: 'transparent', border: 'none', outline: 'none',
    padding: '13px 16px 0', color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: '0.92rem', lineHeight: 1.6,
    resize: 'none',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '6px 10px 10px 16px',
  },
  send: {
    width: 36, height: 36, borderRadius: 9,
    background: 'var(--accent)', border: 'none', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.15s, box-shadow 0.2s',
    boxShadow: '0 4px 14px var(--accent-glow)',
  },
}
