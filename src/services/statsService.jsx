import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/stats`

export const statsService = {
  // Public — the home page's Live Analytics section (no login required)
  async getPublic() {
    const res = await fetch(`${BASE}/public`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load analytics')
    return res.json()
  },

  // Admin only — the admin Analytics page (httpOnly cookie is sent automatically)
  async getAdmin() {
    const res = await fetch(`${BASE}/admin`, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) {
      let message = 'Failed to load analytics'
      try {
        message = (await res.json())?.message || message
      } catch {
        // did not get JSON
      }
      throw new Error(message)
    }
    return res.json()
  },
}
