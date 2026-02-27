import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useChatStore } from './contexts/store'
import Header from './components/Header'
import Message from './components/Message'
import TypingIndicator from './components/TypingIndicator'
import ChatInput from './components/ChatInput'
import WelcomeScreen from './components/WelcomeScreen'

// Mode → route sync
const MODE_ROUTES = { debate: '/debate', teach: '/teach', mistake_hunter: '/hunt' }
const ROUTE_MODES = { '/debate': 'debate', '/teach': 'teach', '/hunt': 'mistake_hunter' }

function ChatPage({ routeMode }) {
  const { mode, setMode, messages, loading, error, fontSize } = useChatStore()
  const bottomRef = useRef(null)

  // Sync mode from route
  useEffect(() => { if (mode !== routeMode) setMode(routeMode) }, [routeMode])

  // Sync route from mode switcher in header
  const navigate = useNavigate()
  useEffect(() => { navigate(MODE_ROUTES[mode], { replace: true }) }, [mode])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const lastAiId = messages.length > 0 && messages.at(-1).role === 'assistant' ? messages.at(-1).id : null

  return (
    <div data-mode={mode} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontSize }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && !loading
          ? <WelcomeScreen mode={mode} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 20px', maxWidth: 840, margin: '0 auto', width: '100%' }}>
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
          margin: '0 20px 10px', maxWidth: 840, alignSelf: 'center', width: 'calc(100% - 40px)',
          padding: '11px 15px', background: 'rgba(255,61,61,0.1)',
          border: '1px solid rgba(255,61,61,0.25)', borderRadius: 12,
          color: '#fca5a5', fontSize: '0.84rem', fontFamily: 'var(--mono)',
        }}>
          ⚠️ {error}
        </div>
      )}
      <ChatInput />
    </div>
  )
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/debate" replace />} />
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
