import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/booth`

export const boothService = {
  async assign(id, exhibitorId) {
    const res = await fetch(`${BASE}/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ exhibitorId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to assign booth')
    return data
  },
  async unassign(id) {
    const res = await fetch(`${BASE}/${id}/unassign`, {
      method: 'PUT',
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to release booth')
    return data
  },
}