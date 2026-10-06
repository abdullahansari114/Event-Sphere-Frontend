import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/contact`

const readError = async (res, fallback) => {
  let message = fallback
  try {
    message = (await res.json())?.message || message
  } catch {
    // backend did not return JSON
  }
  return message
}

export const contactService = {
  // Public — the Contact page form uses this to send the message to the backend
  async send(payload) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readError(res, 'Failed to send message'))
    return res.json()
  },

  // Admin only — the dashboard's Contact Messages inbox
  async getAll() {
    const res = await fetch(BASE, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error(await readError(res, 'Failed to load messages'))
    return res.json() // { messages, unreadCount }
  },

  // Admin only — marks a message as read (as soon as the thread is opened)
  async markRead(id) {
    const res = await fetch(`${BASE}/${id}/read`, { method: 'PATCH', credentials: 'include' })
    if (!res.ok) throw new Error(await readError(res, 'Failed to update message'))
    return res.json()
  },

  // Admin only — deletes a message
  async remove(id) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error(await readError(res, 'Failed to delete message'))
    return res.json()
  },
}
