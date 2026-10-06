import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/event`

export const eventService = {
  async getAll() {
    const res = await fetch(BASE, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load events')
    return res.json()
  },
}