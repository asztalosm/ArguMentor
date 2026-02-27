import { useChatStore } from '../contexts/store'

export function useChat() {
  const { mode, messages, addMessage, setLoading, setError } = useChatStore()

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed) return

    addMessage({ role: 'user', content: trimmed, mode })
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          mode,
          history: messages.slice(-20).map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Error ${res.status}`)
      }

      const data = await res.json()
      addMessage({ role: 'assistant', content: data.reply, mode })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return { send }
}
