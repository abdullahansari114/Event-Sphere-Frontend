// Backend ka base URL — poori app yahin se leti hai.
// Priority: VITE_API_ORIGIN env  >  dev mein localhost  >  live Vercel backend
const trim = (url) => url.replace(/\/+$/, '')

export const API_ORIGIN = trim(
  import.meta.env.VITE_API_ORIGIN ||
    (import.meta.env.DEV
      ? 'http://localhost:5000'
      : 'https://eventsphere-gold.vercel.app')
)

export const API_V1 = `${API_ORIGIN}/api/v1`
