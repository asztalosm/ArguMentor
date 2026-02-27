import { useState } from 'react'
import { useChatStore } from '../contexts/store'
import SettingsPanel from './SettingsPanel'

const MODES = [
  { id: 'debate',         label: 'Debate',  icon: '⚔️',  color: 'var(--debate)' },
  { id: 'teach',          label: 'Teach',   icon: '🎓',  color: 'var(--teach)' },
  { id: 'mistake_hunter', label: 'Hunt',    icon: '🔍',  color: 'var(--hunter)' },
]

export default function Header() {
  const { mode, setMode, clearHistory } = useChatStore()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.logo}>⚡</div>
          <span style={s.name}>ArguMentor</span>
        </div>

        <nav style={s.nav}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                ...s.modeBtn,
                background: mode === m.id ? m.color : 'transparent',
                borderColor: mode === m.id ? m.color : 'var(--border)',
                color: mode === m.id ? '#fff' : 'var(--muted)',
                boxShadow: mode === m.id ? `0 0 18px color-mix(in srgb, ${m.color} 40%, transparent)` : 'none',
              }}
            >
              <span>{m.icon}</span>
              <span style={s.modeLbl}>{m.label}</span>
            </button>
          ))}
        </nav>

        <div style={s.actions}>
          <button style={s.iconBtn} onClick={clearHistory} title="Clear chat">
            🗑️
          </button>
          <button style={s.iconBtn} onClick={() => setShowSettings(true)} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  )
}

const s = {
  header: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '11px 20px',
    background: 'rgba(8,8,14,0.88)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
    flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 },
  logo: {
    width: 34, height: 34, borderRadius: 8,
    background: 'var(--accent-dim)', border: '1px solid var(--border-lit)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17,
  },
  name: {
    fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em',
    background: 'linear-gradient(90deg, var(--text), var(--accent))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  nav: { display: 'flex', gap: 6, flex: 1, justifyContent: 'center' },
  modeBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 99,
    border: '1px solid', cursor: 'pointer',
    fontFamily: 'var(--font)', fontSize: '0.82rem', fontWeight: 600,
    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  },
  modeLbl: {},
  actions: { display: 'flex', gap: 6, flexShrink: 0 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 8,
    background: 'transparent', border: '1px solid var(--border)',
    cursor: 'pointer', fontSize: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
}
