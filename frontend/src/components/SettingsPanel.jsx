// components/SettingsPanel.jsx
// settings prop shape: { theme, setTheme, fontSize, setFontSize, animSpeed, setAnimSpeed }
// All setters are already wired to both Zustand store and CSS vars in App.jsx's useSettings().

export default function SettingsPanel({ settings, onClose }) {
  const { theme, setTheme, fontSize, setFontSize, animSpeed, setAnimSpeed } = settings

  const animLabel =
    animSpeed === 0 ? 'Off' : animSpeed === 1 ? 'Normal' : `${animSpeed}×`

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span className="settings-title">Preferences</span>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close settings"
          style={{ width: 24, height: 24, fontSize: '0.75rem', border: 'none' }}
        >
          ✕
        </button>
      </div>

      <div className="settings-body">

        {/* ── Appearance ── */}
        <div className="setting-group">
          <label>Appearance</label>
          <div className="theme-toggle">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </div>

        {/* ── Font Size ── */}
        <div className="setting-group">
          <label>
            Font Size
            <span className="value-display">{fontSize}px</span>
          </label>
          <input
            type="range"
            className="setting-slider"
            min={13}
            max={20}
            step={1}
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--mono)', fontSize: '0.6rem',
            color: 'var(--dim)', marginTop: 6,
          }}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* ── Animation Speed ── */}
        <div className="setting-group">
          <label>
            Animation Speed
            <span className="value-display">{animLabel}</span>
          </label>
          <input
            type="range"
            className="setting-slider"
            min={0}
            max={3}
            step={0.5}
            value={animSpeed}
            onChange={e => setAnimSpeed(Number(e.target.value))}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--mono)', fontSize: '0.6rem',
            color: 'var(--dim)', marginTop: 6,
          }}>
            <span>Off</span>
            <span>Fast</span>
          </div>
        </div>

        {/* ── Reset ── */}
        <button
          onClick={() => { setFontSize(16); setAnimSpeed(1); setTheme('light') }}
          style={{
            fontFamily: 'var(--mono)', fontSize: '0.65rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--muted)', background: 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--r)',
            padding: '7px 14px', cursor: 'pointer', width: '100%',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)' }}
        >
          Reset to defaults
        </button>

      </div>
    </div>
  )
}
