import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/chat`

export const chatService = {
  // history: [{ role: 'user' | 'assistant', content: string }, ...] — the previous conversation
  // returns { reply: string, limited?: boolean, retryAt?: string(ISO) }
  async send(message, history = []) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })

    let data = {}
    try {
      data = await res.json()
    } catch {
      // backend did not return JSON
    }

    if (!res.ok) throw new Error(data.message || 'Failed to reach the assistant')
    return data
  },

  // Checks whether the chat is currently rate-limited server-side,
  // without spending any Gemini quota. Call this on mount / on open
  // so a page refresh doesn't lose the lock countdown.
  // returns { limited: boolean, retryAt: string(ISO) | null }
  async getStatus() {
    try {
      const res = await fetch(`${BASE}/status`)
      if (!res.ok) return { limited: false, retryAt: null }
      return await res.json()
    } catch {
      return { limited: false, retryAt: null }
    }
  },
}