import { useEffect } from 'react'
import { useChatStore } from '../contexts/store'

export default function SettingsPanel({ onClose }) {
  const { fontSize, setFontSize, animSpeed, setAnimSpeed } = useChatStore()

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={onClose} style={s.overlay}>
      <div onClick={e => e.stopPropagation()} style={s.panel}>
        <div style={s.head}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Settings</h2>
          <button onClick={onClose} style={s.close}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <label style={s.label}>
            <span>Font Size <span style={s.val}>{fontSize}px</span></span>
            <input type="range" min={13} max={20} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={s.range} />
            <div style={s.hints}><span>Small</span><span>Large</span></div>
          </label>

          <label style={s.label}>
            <span>Animation Speed <span style={s.val}>{animSpeed === 0.5 ? 'Slow' : animSpeed === 1 ? 'Normal' : 'Fast'}</span></span>
            <input type="range" min={0.5} max={2} step={0.5} value={animSpeed} onChange={e => setAnimSpeed(+e.target.value)} style={s.range} />
            <div style={s.hints}><span>Slow</span><span>Fast</span></div>
          </label>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    padding: '64px 16px 0',
    animation: 'fadeUp 0.2s ease both',
  },
  panel: {
    width: 300, background: 'var(--elevated)',
    border: '1px solid var(--border-lit)', borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    animation: 'slideIn 0.3s ease both', overflow: 'hidden',
  },
  head: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 18px', borderBottom: '1px solid var(--border)',
  },
  close: {
    background: 'none', border: 'none', color: 'var(--muted)',
    cursor: 'pointer', fontSize: 13, padding: 4,
  },
  label: {
    display: 'flex', flexDirection: 'column', gap: 10,
    fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted)', cursor: 'pointer',
  },
  val: {
    fontFamily: 'var(--mono)', fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 400,
  },
  range: { width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 4 },
  hints: {
    display: 'flex', justifyContent: 'space-between',
    fontFamily: 'var(--mono)', fontSize: '0.66rem', color: 'var(--dim)',
  },
}
