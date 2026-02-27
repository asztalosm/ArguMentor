import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useChatStore } from './contexts/store'
import Header from './components/Header'
import Message from './components/Message'
import TypingIndicator from './components/TypingIndicator'
import ChatInput from './components/ChatInput'
import WelcomeScreen from './components/WelcomeScreen'
import SettingsPanel from './components/SettingsPanel'

const MODE_ROUTES = { debate: '/debate', teach: '/teach', mistake_hunter: '/hunt' }

// ── Settings hook
// fontSize + animSpeed live in Zustand (store already has them).
// theme is DOM-only (data-theme on <html>) + localStorage.
function useSettings() {
  const { fontSize, setFontSize, animSpeed, setAnimSpeed } = useChatStore()

  const [theme, setThemeState] = useState(
    () => localStorage.getItem('am-theme') || 'light'
  )

  // theme → <html data-theme> + localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('am-theme', theme)
  }, [theme])

  // fontSize → CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
  }, [fontSize])

  // animSpeed → CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--anim-speed', String(animSpeed))
  }, [animSpeed])

  // Restore persisted fontSize / animSpeed on mount
  useEffect(() => {
    const f = localStorage.getItem('am-font-size')
    const a = localStorage.getItem('am-anim-speed')
    if (f) setFontSize(Number(f))
    if (a) setAnimSpeed(Number(a))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (t) => setThemeState(t)

  const handleSetFontSize = (v) => {
    setFontSize(Number(v))
    localStorage.setItem('am-font-size', v)
  }

  const handleSetAnimSpeed = (v) => {
    setAnimSpeed(Number(v))
    localStorage.setItem('am-anim-speed', v)
  }

  return {
    theme,
    setTheme,
    fontSize,
    setFontSize: handleSetFontSize,
    animSpeed,
    setAnimSpeed: handleSetAnimSpeed,
  }
}

// ── Chat Page ─────────────────────────────────────────────────────────────────
function ChatPage({ routeMode }) {
  const { mode, setMode, messages, loading, error } = useChatStore()
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { if (mode !== routeMode) setMode(routeMode) }, [routeMode]) // eslint-disable-line
  useEffect(() => { navigate(MODE_ROUTES[mode], { replace: true }) }, [mode])  // eslint-disable-line
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const lastAiId =
    messages.length > 0 && messages.at(-1).role === 'assistant'
      ? messages.at(-1).id
      : null

  return (
    <div data-mode={mode} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && !loading
          ? <WelcomeScreen mode={mode} />
          : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 18,
              padding: '28px 24px', maxWidth: 840, margin: '0 auto', width: '100%',
            }}>
              {messages.map(msg => (
                <Message key={msg.id} msg={msg} animate={msg.id === lastAiId} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )
        }
      </div>

      {error && (
        <div role="alert" style={{
          margin: '0 24px 12px', maxWidth: 840, alignSelf: 'center',
          width: 'calc(100% - 48px)', padding: '10px 15px',
          background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)',
          borderRadius: 'var(--r)', color: 'var(--accent)',
          fontSize: '0.8rem', fontFamily: 'var(--mono)', letterSpacing: '0.02em',
        }}>
          ⚠ {error}
        </div>
      )}

      <ChatInput />
    </div>
  )
}

// ── App Layout ────────────────────────────────────────────────────────────────
function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settings = useSettings()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header
        onSettingsClick={() => setSettingsOpen(v => !v)}
        settingsOpen={settingsOpen}
      />

      {settingsOpen && (
        <>
          <div className="settings-overlay" onClick={() => setSettingsOpen(false)} />
          <SettingsPanel settings={settings} onClose={() => setSettingsOpen(false)} />
        </>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Routes>
          <Route path="/"       element={<Navigate to="/debate" replace />} />
          <Route path="/debate" element={<ChatPage routeMode="debate" />} />
          <Route path="/teach"  element={<ChatPage routeMode="teach" />} />
          <Route path="/hunt"   element={<ChatPage routeMode="mistake_hunter" />} />
          <Route path="*"       element={<Navigate to="/debate" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>
}
