import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/message`

export const messageService = {
  // For the left sidebar (exhibitor Messages page) — all chat threads, latest first
  async getConversations() {
    const res = await fetch(`${BASE}/conversations`, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load conversations')
    return res.json()
  },

  // Full chat history with one specific user (attendee or exhibitor)
  async getConversation(userId) {
    const res = await fetch(`${BASE}/${userId}`, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load conversation')
    return res.json()
  },

  // Socket.io handles live delivery — this is just a fallback (so the message
  // still reaches the backend even if the socket fails to connect for some reason)
  async sendMessage(receiverId, text) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ receiverId, text }),
    })
    if (!res.ok) throw new Error('Failed to send message')
    return res.json()
  },
}
