import { API_ORIGIN } from '../config/api'
const BASE = `${API_ORIGIN}/api/v1/settings`

export const settingsService = {
  // Public — the home page hero banner loads through this
  async get() {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error('Failed to load settings')
    return res.json()
  },

  // Admin only — upload/replace the hero banner image
  async updateHeroImage(file) {
    const formData = new FormData()
    formData.append('heroImage', file)

    const res = await fetch(`${BASE}/hero`, {
      method: 'PUT',
      credentials: 'include', // sends the httpOnly "token" cookie automatically
      body: formData,
    })

    let data = null
    try {
      data = await res.json()
    } catch {
      // backend did not return JSON
    }

    if (!res.ok) {
      throw new Error(data?.message || `Failed to update hero image (server error ${res.status})`)
    }
    return data
  },
}
