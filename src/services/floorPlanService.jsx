import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/floorplan`

export const floorPlanService = {
  async get(eventId) {
    const res = await fetch(`${BASE}/${eventId}`, { credentials: 'include', cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to load grid')
    return data
  },
  async generateGrid(eventId, rows, cols) {
    const res = await fetch(`${BASE}/${eventId}/grid`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rows, cols }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to generate grid')
    return data
  },
}
