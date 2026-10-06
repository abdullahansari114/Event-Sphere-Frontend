import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/booth-request`

export const boothRequestService = {
  async create(boothIds, message) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ boothIds, message }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to send booth request')
    return data
  },
}