import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic2, MapPin, Clock, Users, Search, ChevronDown, Tag, ArrowRight, X } from 'lucide-react'
import { API_ORIGIN } from '../config/api'

const SESSION_PUBLIC_API = `${API_ORIGIN}/api/v1/session/public/all`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(SESSION_PUBLIC_API, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load sessions')
        setSessions(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.category).filter(Boolean))).sort(),
    [sessions],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return sessions.filter((s) => {
      const matchesCategory = !category || s.category === category
      const matchesTerm =
        !term ||
        s.title?.toLowerCase().includes(term) ||
        s.speaker?.toLowerCase().includes(term) ||
        s.event?.title?.toLowerCase().includes(term)
      return matchesCategory && matchesTerm
    })
  }, [sessions, query, category])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#050B1F] py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/30 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-4">
            <Mic2 size={13} /> Speakers &amp; Sessions
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">All Sessions</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Browse every talk, workshop and keynote across our published events, and jump straight to
            the event page to reserve your seat.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, speaker or event..."
              className="w-72 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">Loading sessions...</div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-10 text-center text-sm text-red-500">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-14 text-center text-sm text-gray-400">
            No sessions have been announced yet. Check back soon.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-14 text-center text-sm text-gray-400">
            No sessions match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => {
              const fillPct = Math.min(100, Math.round((s.bookedSeats / s.totalSeats) * 100))
              const full = s.availableSeats <= 0
              return (
                <Link
                  key={s._id}
                  to={s.event?._id ? `/events/${s.event._id}` : '/events'}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {s.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        <Tag size={10} /> {s.category}
                      </span>
                    )}
                    {full && (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">Full</span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {s.speaker}{s.speakerTitle && <span className="text-gray-400"> · {s.speakerTitle}</span>}
                  </p>

                  {s.event?.title && (
                    <p className="text-xs font-medium text-blue-600/80 mb-3 truncate">{s.event.title}</p>
                  )}

                  <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" /> {formatDate(s.date)} · {s.startTime}{s.endTime && ` - ${s.endTime}`}</p>
                    <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {s.hall} · {s.event?.venue || s.event?.location || 'TBA'}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="flex items-center gap-1"><Users size={12} /> Seats</span>
                      <span className="font-medium text-gray-700">{s.bookedSeats} / {s.totalSeats} booked</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
                      View Event
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sessions