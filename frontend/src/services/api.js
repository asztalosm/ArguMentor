// src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL

// Catch missing env var at startup so it fails loudly in the console
if (!BASE_URL) {
  console.error(
    '[api] VITE_API_URL is not defined. ' +
    'Set it in .env.local for dev, or as a GitHub Actions variable for production.'
  )
}

/**
 * @param {object} params
 * @param {string} params.message
 * @param {'debate'|'teach'|'mistake_hunter'} params.mode
 * @param {Array<{role:'user'|'assistant', content:string}>} params.history
 * @returns {Promise<string>}
 */
export async function sendChat({ message, mode, history = [] }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, history }),
  })

  if (!res.ok) {
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
