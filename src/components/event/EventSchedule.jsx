import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic2, Calendar, MapPin, Users, X, LogIn, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { CARD, formatDayHeading, formatLongDate } from './eventUtils'
import { API_ORIGIN } from '../../config/api'

const SESSION_REQUEST_API = `${API_ORIGIN}/api/v1/session-registration`

const seatStatusStyle = {
  approved: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-yellow-50 text-yellow-600',
  rejected: 'bg-red-50 text-red-500',
}

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400'

/**
 * "Schedule" tab — sessions (speaker, hall, seats) + seat request.
 * props: eventId, sessions, loading, venue
 */
const EventSchedule = ({ eventId, sessions, loading, venue }) => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [mySeatRequests, setMySeatRequests] = useState({}) // sessionId -> registration
  const [selected, setSelected] = useState(null)
  const [seatForm, setSeatForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [seatError, setSeatError] = useState('')

  // logged-in user ki purani seat requests
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    fetch(`${SESSION_REQUEST_API}/mine`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return
        const map = {}
        data.forEach((r) => {
          if (r.session?._id) map[r.session._id] = r
        })
        setMySeatRequests(map)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [currentUser])

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  // date ke hisaab se group
  const days = useMemo(() => {
    const map = new Map()
    sessions.forEach((s) => {
      const key = s.date || ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    })
    return [...map.entries()]
  }, [sessions])

  const openSession = (s) => {
    setSelected(s)
    setSeatError('')
    setSeatForm({ name: currentUser?.name || '', email: currentUser?.email || '', phone: '' })
  }

  const handleSeatChange = (e) => {
    const { name, value } = e.target
    setSeatForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRequestSeat = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      navigate('/login', { state: { from: `/events/${eventId}` } })
      return
    }
    if (!seatForm.name || !seatForm.email) {
      setSeatError('Please fill in your name and email.')
      return
    }

    setSubmitting(true)
    setSeatError('')
    try {
      const res = await fetch(SESSION_REQUEST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selected._id, ...seatForm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to request seat')
      setMySeatRequests((prev) => ({ ...prev, [selected._id]: data }))
    } catch (err) {
      setSeatError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-10 text-center text-sm text-gray-400">Loading schedule...</p>

  if (sessions.length === 0) {
    return (
      <div className={`${CARD} px-6 py-14 text-center`}>
        <Mic2 size={28} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">The schedule for this event will be announced soon.</p>
      </div>
    )
  }

  const myReq = selected ? mySeatRequests[selected._id] : null

  return (
    <div className="space-y-7">
      {days.map(([date, list]) => (
        <div key={date}>
          <h3 className="mb-3 text-sm font-semibold text-gray-500">{formatDayHeading(date)}</h3>
          <div className="space-y-3">
            {list.map((s) => {
              const req = mySeatRequests[s._id]
              const full = s.availableSeats <= 0
              return (
                <button
                  key={s._id}
                  onClick={() => openSession(s)}
                  className={`${CARD} group flex w-full items-center gap-4 p-4 text-left transition-shadow hover:shadow-[0_6px_24px_rgba(15,23,42,0.10)]`}
                >
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-sm font-bold text-blue-600">{s.startTime}</p>
                    {s.endTime && <p className="text-xs text-gray-400">{s.endTime}</p>}
                  </div>
                  <span className="h-12 w-px shrink-0 bg-gray-100" />

                  <div className="min-w-0 flex-1">
                    {s.category && (
                      <span className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        {s.category}
                      </span>
                    )}
                    <p className="truncate font-semibold text-gray-900">{s.title}</p>
                    <p className="truncate text-xs text-gray-500">
                      {s.speaker}
                      {s.hall && <> · {s.hall}</>}
                    </p>
                  </div>

                  {req ? (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${seatStatusStyle[req.status]}`}>
                      {req.status}
                    </span>
                  ) : (
                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${
                        full ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {full ? 'Full' : `${s.availableSeats} seats left`}
                    </span>
                  )}
                  <ChevronRight size={16} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* ==================== Session detail modal ==================== */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelected(null)}>
          <div
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>

            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mic2 size={20} />
            </span>

            <h2 className="text-lg font-bold text-gray-900">{selected.title}</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {selected.speaker}
              {selected.speakerTitle && <span className="text-gray-400"> · {selected.speakerTitle}</span>}
            </p>

            {selected.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{selected.description}</p>
            )}

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="mt-0.5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatLongDate(selected.date)} · {selected.startTime}
                    {selected.endTime && ` - ${selected.endTime}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-400">Hall & Location</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.hall} · {venue || 'TBA'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Seats</p>
                  <p className={`text-sm font-medium ${selected.availableSeats <= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                    {selected.availableSeats <= 0
                      ? 'Fully booked'
                      : `${selected.availableSeats} of ${selected.totalSeats} seats available`}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${selected.availableSeats <= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, Math.round(((selected.bookedSeats || 0) / selected.totalSeats) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              {myReq ? (
                <div className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${seatStatusStyle[myReq.status]}`}>
                  {myReq.status === 'approved' && <CheckCircle2 size={16} />}
                  Seat request {myReq.status}
                </div>
              ) : !currentUser ? (
                <button
                  onClick={() => navigate('/login', { state: { from: `/events/${eventId}` } })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <LogIn size={16} /> Login to Request a Seat
                </button>
              ) : selected.availableSeats <= 0 ? (
                <button disabled className="w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-500">
                  Seats Full
                </button>
              ) : (
                <form onSubmit={handleRequestSeat} className="space-y-3">
                  {seatError && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2 text-xs text-red-600">{seatError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input name="name" value={seatForm.name} onChange={handleSeatChange} placeholder="Full name" className={inputClass} />
                    <input name="email" type="email" value={seatForm.email} onChange={handleSeatChange} placeholder="Email" className={inputClass} />
                  </div>
                  <input name="phone" value={seatForm.phone} onChange={handleSeatChange} placeholder="Phone (optional)" className={inputClass} />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Sparkles size={16} /> {submitting ? 'Requesting...' : 'Request Seat'}
                  </button>
                  <p className="text-center text-[11px] text-gray-400">Admin will review your request before it's confirmed.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventSchedule