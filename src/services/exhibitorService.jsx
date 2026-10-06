import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/event-request/approved`

export const exhibitorService = {
  async getForEvent(eventId) {
    if (!eventId) return []
    const res = await fetch(`${BASE}/${eventId}`, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load exhibitors')
    return res.json()
  },
}