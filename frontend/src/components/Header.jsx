// components/Header.jsx
import { useChatStore } from '../contexts/store'

const MODES = [
  { key: 'debate',         label: 'Debate',  route: '/debate' },
  { key: 'teach',          label: 'Teach',   route: '/teach'  },
  { key: 'mistake_hunter', label: 'Hunt',    route: '/hunt'   },
]

export default function Header({ onSettingsClick, settingsOpen }) {
  const { mode, setMode } = useChatStore()

  return (
    <header className="header">
      {/* Wordmark */}
      <div className="header-wordmark" aria-label="ArguMentor">
        ArguMentor
      </div>

      {/* Mode tabs */}
      <nav className="header-nav" role="tablist" aria-label="Mode selection">
        {MODES.map(m => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            className={`nav-tab ${mode === m.key ? 'active' : ''}`}
            onClick={() => setMode(m.key)}
            data-mode={m.key}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={onSettingsClick}
          aria-label="Settings"
          aria-expanded={settingsOpen}
          title="Settings"
          style={settingsOpen ? {
            color: 'var(--text)',
            borderColor: 'var(--border-lit)',
            background: 'var(--bg-alt)'
          } : {}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
