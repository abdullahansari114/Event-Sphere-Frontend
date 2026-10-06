import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import { API_ORIGIN } from '../config/api'

// This is the same EventRequest data shown on the admin "Exhibitors" (join requests)
// page — just filtered here to status: 'approved' only, shown publicly.
const API_BASE = `${API_ORIGIN}/api/v1/event-request/public`

const statusStyles = {
  approved: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  rejected: 'bg-red-50 text-red-500',
}

// Deterministic color for the initials avatar — same company always gets the same color.
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-600',
  'bg-purple-500',
  'bg-teal-500',
]

const colorFor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

// If the exhibitor hasn't filled in their company profile yet, just show
// their account name instead — the card is never left empty.
const displayName = (exhibitor) => exhibitor?.companyName || exhibitor?.name || 'Exhibitor'

const Exhibitors = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const fetchExhibitors = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Failed to load exhibitors')
        const data = await res.json()
        setRequests(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchExhibitors()
  }, [])

  const categories = ['All', ...new Set(requests.map((r) => r.exhibitor?.category).filter(Boolean))]

  const filtered = requests.filter((r) => {
    const matchesQuery = displayName(r.exhibitor).toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All' || r.exhibitor?.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Exhibitors Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Discover companies showcasing at our events</p>
        </div>

        {/* Search + category filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative w-full sm:flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exhibitors..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No exhibitors found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => {
              const name = displayName(r.exhibitor)
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`w-11 h-11 rounded-xl ${colorFor(name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {initialsFor(name)}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[r.status] || statusStyles.pending}`}>
                      {r.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 leading-snug">{name}</h3>
                  {r.exhibitor?.category && <p className="text-sm text-blue-600 font-medium mb-2">{r.exhibitor.category}</p>}
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {r.exhibitor?.description || 'No description available.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={13} />
                      {r.exhibitor?.boothNumber ? `Booth ${r.exhibitor.boothNumber}` : 'Booth TBA'}
                    </span>
                    <Link
                      to={`/exhibitors/${r._id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Exhibitors