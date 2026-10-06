import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic2, Clock, MapPin, Users, Search, X, LogIn, Sparkles, CheckCircle2,
  Calendar, Bookmark,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { API_ORIGIN } from '../../config/api'

const SESSION_PUBLIC_API = `${API_ORIGIN}/api/v1/session/public/all`
const SESSION_REQUEST_API = `${API_ORIGIN}/api/v1/session-registration`
const BOOKMARK_KEY = 'eventsphere_bookmarked_sessions'

const seatStatusStyle = {
  approved: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-yellow-50 text-yellow-600',
  rejected: 'bg-red-50 text-red-500',
}

const formatDayHeading = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const Schedule = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(false)

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []
    } catch {
      return []
    }
  })

  const [mySeatRequests, setMySeatRequests] = useState({})
  const [selectedSession, setSelectedSession] = useState(null)
  const [seatForm, setSeatForm] = useState({ name: '', email: '', phone: '' })
  const [seatSubmitting, setSeatSubmitting] = useState(false)
  const [seatError, setSeatError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(SESSION_PUBLIC_API)
        if (!res.ok) throw new Error('Failed to load schedule')
        setSessions(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (currentUser) {
      setSeatForm((prev) => ({ ...prev, name: currentUser.name || '', email: currentUser.email || '' }))
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const loadMine = async () => {
      try {
        const res = await fetch(`${SESSION_REQUEST_API}/mine`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const map = {}
        data.forEach((r) => { if (r.session?._id) map[r.session._id] = r })
        setMySeatRequests(map)
      } catch {
        // ignore
      }
    }
    loadMine()
  }, [currentUser])

  // Bookmarks are persisted in localStorage — no login required
  useEffect(() => {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  const toggleBookmark = (e, session) => {
    e.stopPropagation()

    const exists = bookmarks.includes(session._id)

    setBookmarks((prev) =>
      exists ? prev.filter((id) => id !== session._id) : [...prev, session._id],
    )

    toast(
      exists
        ? `Removed "${session.title}" from bookmarks`
        : `Bookmarked "${session.title}"`,
    )
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return sessions.filter((s) => {
      return !term || s.speaker.toLowerCase().includes(term) || s.title.toLowerCase().includes(term)
    })
  }, [sessions, query])

  const groupedByDate = useMemo(() => {
    const map = new Map()
    filtered.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, [])
      map.get(s.date).push(s)
    })
    return Array.from(map.entries()).sort(([a], [b]) => new Date(a) - new Date(b))
  }, [filtered])

  // Only the sessions that have been bookmarked (sorted by date + time)
  const bookmarkedSessions = useMemo(
    () =>
      sessions
        .filter((s) => bookmarks.includes(s._id))
        .sort(
          (a, b) =>
            new Date(a.date) - new Date(b.date) ||
            (a.startTime || '').localeCompare(b.startTime || ''),
        ),
    [sessions, bookmarks],
  )

  const handleSeatFormChange = (e) => {
    const { name, value } = e.target
    setSeatForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRequestSeat = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      navigate('/login', { state: { from: '/schedule' } })
      return
    }
    if (!seatForm.name || !seatForm.email) {
      setSeatError('Please fill in your name and email.')
      return
    }

    setSeatSubmitting(true)
    setSeatError('')
    try {
      const res = await fetch(SESSION_REQUEST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selectedSession._id, ...seatForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to request seat')

      setMySeatRequests((prev) => ({ ...prev, [selectedSession._id]: data }))
    } catch (err) {
      setSeatError(err.message)
    } finally {
      setSeatSubmitting(false)
    }
  }

  const openSession = (s) => {
    setSelectedSession(s)
    setSeatError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Event Schedule</h1>
        <p className="text-gray-500 mt-1">Browse all sessions across upcoming events</p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-6 mb-10">
          <button
            onClick={() => setShowBookmarks(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-colors"
          >
            <Bookmark size={16} className={bookmarks.length > 0 ? 'fill-blue-600 text-blue-600' : ''} />
            Your Bookmarks
            {bookmarks.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                {bookmarks.length}
              </span>
            )}
          </button>

          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, speaker or event..."
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-16">Loading schedule...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-16">{error}</p>
        ) : groupedByDate.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">No sessions match your search.</p>
        ) : (
          <div className="space-y-10">
            {groupedByDate.map(([date, daySessions]) => (
              <div key={date} className="relative">
                {/* vertical timeline line, sits behind the day icon + session dots */}
                <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />

                <div className="relative z-10 flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-200">
                    <Calendar size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{formatDayHeading(date)}</h2>
                </div>

                <div className="space-y-4">
                  {daySessions
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((s) => {
                      const myReq = mySeatRequests[s._id]
                      const isBookmarked = bookmarks.includes(s._id)
                      return (
                        <div key={s._id} className="relative pl-14">
                          <span className="absolute left-[15px] top-7 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-gray-50 z-10" />

                          <div
                            onClick={() => openSession(s)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                {s.category && (
                                  <span className="inline-block mb-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                    {s.category}
                                  </span>
                                )}
                                <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {s.speaker}{s.speakerTitle && <span className="text-gray-400"> · {s.speakerTitle}</span>}
                                </p>
                              </div>

                              <div className="flex items-start gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {s.startTime}{s.endTime && `–${s.endTime}`}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">{s.hall}</p>
                                </div>
                                <button
                                  onClick={(e) => toggleBookmark(e, s)}
                                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark this session'}
                                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                                    isBookmarked ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-400'
                                  }`}
                                >
                                  <Bookmark size={18} className={isBookmarked ? 'fill-blue-600' : ''} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.availableSeats <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                <Users size={12} />
                                {s.availableSeats <= 0 ? 'Fully booked' : `${s.availableSeats} of ${s.totalSeats} seats left`}
                              </span>
                              {myReq && (
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${seatStatusStyle[myReq.status]}`}>
                                  {myReq.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Bookmarks modal */}
      {showBookmarks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50" onClick={() => setShowBookmarks(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="fill-blue-600 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Your Bookmarks</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                  {bookmarkedSessions.length}
                </span>
              </div>
              <button onClick={() => setShowBookmarks(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4">
              {bookmarkedSessions.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">
                  No sessions bookmarked yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookmarkedSessions.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => {
                        setShowBookmarks(false)
                        openSession(s)
                      }}
                      className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        {s.category && (
                          <span className="inline-block mb-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                            {s.category}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.speaker}{s.speakerTitle && <span className="text-gray-400"> · {s.speakerTitle}</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {formatDayHeading(s.date)} · {s.startTime}{s.endTime && `–${s.endTime}`}
                          {s.hall && ` · ${s.hall}`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(e, s)}
                        title="Remove bookmark"
                        className="shrink-0 p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Bookmark size={18} className="fill-blue-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session detail modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedSession(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>

            <div className="flex items-center justify-between pr-8">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Mic2 size={20} />
              </span>
              <button
                onClick={(e) => toggleBookmark(e, selectedSession)}
                className={`p-1.5 rounded-lg mb-3 ${bookmarks.includes(selectedSession._id) ? 'text-blue-600' : 'text-gray-300 hover:text-gray-400'}`}
              >
                <Bookmark size={20} className={bookmarks.includes(selectedSession._id) ? 'fill-blue-600' : ''} />
              </button>
            </div>

            {selectedSession.category && (
              <span className="inline-block mb-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                {selectedSession.category}
              </span>
            )}

            <h2 className="text-lg font-bold text-gray-900">{selectedSession.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedSession.speaker}
              {selectedSession.speakerTitle && <span className="text-gray-400"> · {selectedSession.speakerTitle}</span>}
            </p>

            {selectedSession.description && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{selectedSession.description}</p>
            )}

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDayHeading(selectedSession.date)} · {selectedSession.startTime}
                    {selectedSession.endTime && ` - ${selectedSession.endTime}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Hall & Location</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedSession.hall}{selectedSession.location && ` · ${selectedSession.location}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Seats</p>
                  <p className={`text-sm font-medium ${selectedSession.availableSeats <= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                    {selectedSession.availableSeats <= 0
                      ? 'Fully booked'
                      : `${selectedSession.availableSeats} of ${selectedSession.totalSeats} seats available`}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${selectedSession.availableSeats <= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, Math.round((selectedSession.bookedSeats / selectedSession.totalSeats) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              {mySeatRequests[selectedSession._id] ? (
                <div className={`flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl ${seatStatusStyle[mySeatRequests[selectedSession._id].status]}`}>
                  {mySeatRequests[selectedSession._id].status === 'approved' && <CheckCircle2 size={16} />}
                  Seat request {mySeatRequests[selectedSession._id].status}
                </div>
              ) : !currentUser ? (
                <button
                  onClick={() => navigate('/login', { state: { from: '/schedule' } })}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <LogIn size={16} /> Login to Request a Seat
                </button>
              ) : selectedSession.availableSeats <= 0 ? (
                <button disabled className="w-full bg-gray-200 text-gray-500 text-sm font-semibold py-3 rounded-xl cursor-not-allowed">
                  Seats Full
                </button>
              ) : (
                <form onSubmit={handleRequestSeat} className="space-y-3">
                  {seatError && (
                    <div className="bg-red-50 text-red-600 text-xs px-3.5 py-2 rounded-lg border border-red-100">{seatError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="name" value={seatForm.name} onChange={handleSeatFormChange} placeholder="Full name"
                      className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                    <input
                      name="email" value={seatForm.email} onChange={handleSeatFormChange} placeholder="Email" type="email"
                      className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>
                  <input
                    name="phone" value={seatForm.phone} onChange={handleSeatFormChange} placeholder="Phone (optional)"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={seatSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    <Sparkles size={16} /> {seatSubmitting ? 'Requesting...' : 'Request Seat'}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center">Admin will review your request before it's confirmed.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule