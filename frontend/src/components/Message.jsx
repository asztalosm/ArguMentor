import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../contexts/store'

const MODE_ICON = { debate: '⚔️', teach: '🎓', mistake_hunter: '🔍' }

function TypingText({ text, onDone }) {
  const [shown, setShown] = useState('')
  const { animSpeed } = useChatStore()

  useEffect(() => {
    setShown('')
    let i = 0
    const delay = Math.max(8, 25 / animSpeed)
    const run = () => {
      if (i < text.length) { i++; setShown(text.slice(0, i)); setTimeout(run, delay) }
      else onDone?.()
    }
    const t = setTimeout(run, 60)
    return () => clearTimeout(t)
  }, [text]) // eslint-disable-line

  return (
    <span>
      {shown}
      <span style={{
        display: 'inline-block', width: 2, height: '1em',
        background: 'var(--accent)', marginLeft: 2,
        verticalAlign: 'text-bottom',
        animation: 'blink 0.9s step-end infinite',
      }} />
    </span>
  )
}

export default function Message({ msg, animate }) {
  const [done, setDone] = useState(!animate)
  const isUser = msg.role === 'user'

  return (
    <div style={{
      display: 'flex', gap: 10,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '80%',
      animation: `${isUser ? 'fadeRight' : 'fadeLeft'} 0.3s ease both`,
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, minWidth: 34, borderRadius: 8, marginTop: 20,
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
        }}>
          {MODE_ICON[msg.mode]}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!isUser && (
          <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, paddingLeft: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ArguMentor
          </span>
        )}
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? 'var(--accent)' : 'var(--elevated)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? '#fff' : 'var(--text)',
          fontSize: '0.92rem', lineHeight: 1.65,
          boxShadow: isUser ? '0 4px 18px var(--accent-glow)' : '0 2px 8px rgba(0,0,0,0.3)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {isUser || done ? msg.content : <TypingText text={msg.content} onDone={() => setDone(true)} />}
        </div>
      </div>
    </div>
  )
}
