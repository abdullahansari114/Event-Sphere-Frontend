// Turns 'YYYY-MM-DD' into a local date (so timezones don't shift it a day forward or back)
const parseDate = (value) => {
  if (!value) return null
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return isNaN(d) ? null : d
}

// Tuesday, September 22, 2026
export const formatLongDate = (value) => {
  const d = parseDate(value)
  return d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : value || '—'
}

// Sep 22, 2026
export const formatShortDate = (value) => {
  const d = parseDate(value)
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : value || '—'
}

// Tuesday, September 22
export const formatDayHeading = (value) => {
  const d = parseDate(value)
  return d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : value || 'Date TBA'
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

// The same soft look shared by all cards
export const CARD = 'rounded-2xl bg-white shadow-[0_2px_14px_rgba(15,23,42,0.06)]'