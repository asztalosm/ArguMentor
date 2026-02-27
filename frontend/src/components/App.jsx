// components/ChatInput.jsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { useChatStore } from '../contexts/store'

export default function ChatInput() {
  const { addMessage, setLoading, setError, loading, mode } = useChatStore()
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Listen for prompt pre-fills from WelcomeScreen
  useEffect(() => {
    const handler = (e) => {
      setValue(e.detail)
      textareaRef.current?.focus()
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height =
          `${Math.min(textareaRef.current.scrollHeight, 160)}px`
      }
    }
    window.addEventListener('am:prefill', handler)
    return () => window.removeEventListener('am:prefill', handler)
  }, [])

  const submit = useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed || loading) return

    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }

    // Add user message to store
    addMessage({ role: 'user', content: trimmed, mode })


    const reply = await api.chat({ mode, messages: [...get().messages] })
    addMessage({ role: 'assistant', content: reply, mode })
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: trimmed,
          mode,
          history: messages.slice(-20).map(({role, content}) => ({role, content})),
        }),
      })
    } catch (err) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [value, loading, mode, addMessage, setLoading, setError])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="chat-input-wrap">
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Enter your argument, question, or text to review…"
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Message input"
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={loading || !value.trim()}
          aria-label="Send message"
          title="Send (Enter)"
        >
          {loading
            ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 0.7s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )
          }
        </button>
      </div>
      <div className="chat-meta">
        <span className="chat-hint">↵ send · ⇧↵ newline</span>
        {loading && (
          <span className="chat-hint" style={{ color: 'var(--accent)' }}>Thinking…</span>
        )}
      </div>
    </div>
  )
}
