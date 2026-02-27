// src/services/api.js
// Talks to the FastAPI backend at /api/chat

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/**
 * Send a message to the ArguMentor backend.
 *
 * @param {object} params
 * @param {string} params.message   - The user's latest message text
 * @param {'debate'|'teach'|'mistake_hunter'} params.mode
 * @param {Array<{role:'user'|'assistant', content:string}>} params.history
 *   - Full conversation history EXCLUDING the current message
 * @returns {Promise<string>} - The assistant reply text
 */
export async function sendChat({ message, mode, history = [] }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, history }),
  })

  if (!res.ok) {
    // Surface the server error message if available
    let detail = `Server error ${res.status}`
    try {
      const body = await res.json()
      if (body?.detail) detail = body.detail
    } catch (_) {}
    throw new Error(detail)
  }

  const data = await res.json()
  return data.content
}
