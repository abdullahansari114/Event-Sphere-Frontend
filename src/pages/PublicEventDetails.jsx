import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, X, Lock, LogIn, Tag, Building2, Users, Ticket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import EventProducts from '../components/EventProducts'
import EventSchedule from '../components/event/EventSchedule'
import EventExhibitors from '../components/event/EventExhibitors'
import EventFloorPlan from '../components/event/EventFloorPlan'
import EventPass from '../components/event/EventPass'
import { CARD, formatShortDate } from '../components/event/eventUtils'
import { API_ORIGIN } from '../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/event`
const PUBLIC_INFO_API = `${API_ORIGIN}/api/v1/event-public`
const SESSION_API = `${API_ORIGIN}/api/v1/session`
const REGISTRATION_API = `${API_ORIGIN}/api/v1/registration`

const EMPTY_PUBLIC = {
  exhibitors: [],
  floorPlan: { rows: 0, cols: 0, booths: [] },
  stats: { exhibitors: 0, totalBooths: 0, occupiedBooths: 0, availableBooths: 0 },
}

const primaryBtn =
  'flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700'
const disabledBtn =
  'flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-200 py-3 text-sm font-semibold text-gray-500'

// Reset the whole page state whenever the route's :id changes
const PublicEventDetails = () => {
  const { id } = useParams()
  return <EventPage key={id} id={id} />
}

const EventPage = ({ id }) => {
  const navigate = useNavigate()
  const { user: currentUser, loading: checkingAuth } = useAuth()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tab, setTab] = useState('overview')

  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [publicInfo, setPublicInfo] = useState(EMPTY_PUBLIC)
  const [publicLoading, setPublicLoading] = useState(true)
  const [publicReady, setPublicReady] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [registration, setRegistration] = useState(null) // full registration doc — used to build the pass
  const [showPass, setShowPass] = useState(false) // pass popup shown right after registering

  // ---------- data ----------
  useEffect(() => {
    fetch(`${API_BASE}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Event not found')
        return res.json()
      })
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetch(`${SESSION_API}/event/${id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false))
  }, [id])

  // exhibitors + floor plan + counts (a single public call)
  useEffect(() => {
    fetch(`${PUBLIC_INFO_API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then((data) => {
        setPublicInfo(data)
        setPublicReady(true)
      })
      .catch(() => {
        // keep the page working even if the backend route isn't found
      })
      .finally(() => setPublicLoading(false))
  }, [id])

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    fetch(`${REGISTRATION_API}/mine`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return
        const mine = data.find((r) => r.event?._id === id)
        setIsRegistered(Boolean(mine))
        setRegistration(mine || null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id, currentUser])

  // ---------- registration ----------
  const openRegisterForm = () => {
    setForm((prev) => ({ ...prev, name: prev.name || currentUser?.name || '', email: prev.email || currentUser?.email || '' }))
    setRegisterError('')
    setShowForm(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitRegistration = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      setRegisterError('Please log in to register for this event.')
      return
    }
    if (!(event?.exhibitorCount > 0)) {
      setRegisterError('Registration is not open yet for this event.')
      return
    }
    if (!form.name || !form.email || !form.phone) {
      setRegisterError('Please fill in all fields.')
      return
    }

    setRegistering(true)
    setRegisterError('')
    try {
      const res = await fetch(REGISTRATION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId: id, ...form }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        setRegisterError('Please log in to register for this event.')
        return
      }
      if (!res.ok) throw new Error(data.message || 'Failed to register')

      setIsRegistered(true)
      setRegistration(data.registration)
      setShowForm(false)
      setShowPass(true) // show the pass in a popup right away
      setEvent((prev) => (prev ? { ...prev, registeredAttendees: data.event.registeredAttendees } : prev))
    } catch (err) {
      setRegisterError(err.message)
    } finally {
      setRegistering(false)
    }
  }

  // ---------- states ----------
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">Loading event...</div>
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500">{error || 'Event not found.'}</p>
        <Link to="/events" className="text-sm font-medium text-blue-600">Back to Events</Link>
      </div>
    )
  }

  const hasApprovedExhibitor = (event.exhibitorCount || 0) > 0
  const isUnlimited = !event.maxAttendees || event.maxAttendees <= 0
  const spotsLeft = isUnlimited ? null : event.maxAttendees - (event.registeredAttendees || 0)
  const isFull = !isUnlimited && spotsLeft <= 0

  const exhibitorTotal = publicReady ? publicInfo.stats.exhibitors : event.exhibitorCount || 0
  const boothTotal = publicReady ? publicInfo.stats.totalBooths : event.boothCount || 0
  const venue = event.venue || event.location

  const tabs = [
    { key: 'overview', label: 'Overview' },
    isRegistered
      ? { key: 'schedule', label: 'Your Pass', icon: Ticket }
      : { key: 'schedule', label: 'Schedule', count: sessions.length },
    { key: 'exhibitors', label: 'Exhibitors', count: exhibitorTotal },
    { key: 'floorplan', label: 'Floor Plan' },
  ]

  const stats = [
    { label: 'Registered', value: (event.registeredAttendees || 0).toLocaleString(), Icon: Users },
    { label: 'Capacity', value: isUnlimited ? 'Unlimited' : event.maxAttendees.toLocaleString(), Icon: Users },
    { label: 'Exhibitors', value: exhibitorTotal.toLocaleString(), Icon: Building2 },
    { label: 'Booths', value: boothTotal.toLocaleString(), Icon: Building2 },
  ]

  const renderRegisterAction = () => {
    if (checkingAuth) return <div className={`${disabledBtn} cursor-default bg-gray-100 text-gray-400`}>Checking...</div>

    if (isRegistered) {
      return (
        <div className="space-y-2.5">
          <div className="flex w-full items-center justify-center gap-2 rounded-full bg-green-50 py-3 text-sm font-semibold text-green-600">
            <CheckCircle2 size={16} /> You're registered!
          </div>
          {registration && (
            <button
              onClick={() => setShowPass(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              <Ticket size={16} /> View Pass
            </button>
          )}
        </div>
      )
    }
    if (!currentUser) {
      return (
        <button onClick={() => navigate('/login', { state: { from: `/events/${id}` } })} className={primaryBtn}>
          <LogIn size={16} /> Login to Register
        </button>
      )
    }
    if (!hasApprovedExhibitor) {
      return (
        <button disabled className={disabledBtn} title="Registration opens once an exhibitor is confirmed for this event">
          <Lock size={16} /> Registration Not Open Yet
        </button>
      )
    }
    if (isFull) {
      return (
        <button disabled className={disabledBtn}>
          Seats Full
        </button>
      )
    }
    return (
      <button onClick={openRegisterForm} className={primaryBtn}>
        Register Now <ArrowRight size={16} />
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* ==================== Hero ==================== */}
      <div className="relative h-72 bg-gray-800 md:h-96">
        <img
          src={event.banner || 'https://placehold.co/1200x500?text=Event'}
          alt={event.title}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-8">
          <Link to="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          {event.category && (
            <span className="mb-3 block w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {event.category}
            </span>
          )}
          <h1 className="text-3xl font-bold text-white md:text-4xl">{event.title}</h1>
          {event.theme && <p className="mt-1 text-white/80">{event.theme}</p>}
        </div>
      </div>

      {/* ==================== Body ==================== */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* -------- Left: tabs + content -------- */}
        <div className="min-w-0">
          <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 sm:gap-6">
            {tabs.map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2 whitespace-nowrap px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.icon && <t.icon size={14} />}
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                  {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-blue-600" />}
                </button>
              )
            })}
          </div>

          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">About this event</h2>
                <p className="mt-2 leading-relaxed text-gray-500">
                  {event.description || 'No description provided for this event yet.'}
                </p>
              </div>

              {(event.theme || venue) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {event.theme && (
                    <div className={`${CARD} flex items-center gap-3.5 px-5 py-4`}>
                      <Tag size={20} className="shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Theme</p>
                        <p className="truncate font-medium text-gray-900">{event.theme}</p>
                      </div>
                    </div>
                  )}
                  {venue && (
                    <div className={`${CARD} flex items-center gap-3.5 px-5 py-4`}>
                      <Building2 size={20} className="shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Venue</p>
                        <p className="truncate font-medium text-gray-900">{venue}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`${CARD} p-6`}>
                <h3 className="mb-5 text-lg font-bold text-gray-900">Event Statistics</h3>
                <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
                  {stats.map(({ label, value, Icon }) => (
                    <div key={label} className="flex flex-col items-center text-center">
                      <Icon size={20} className="mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exhibitors' products & services */}
              <EventProducts eventId={id} />

              {event.tags?.length > 0 && (
                <div className={`${CARD} p-6`}>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((t) => (
                      <span key={t} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'schedule' && isRegistered && registration && (
            <div className="py-2">
              <h2 className="mb-1 text-xl font-bold text-gray-900">Your Pass</h2>
              <p className="mb-6 text-sm text-gray-500">
                Show this QR code at entry. You can come back to this tab any time to see it again.
              </p>
              <EventPass event={event} registration={registration} />
            </div>
          )}

          {tab === 'schedule' && !isRegistered && (
            <EventSchedule eventId={id} sessions={sessions} loading={sessionsLoading} venue={venue} />
          )}

          {tab === 'exhibitors' && <EventExhibitors exhibitors={publicInfo.exhibitors} loading={publicLoading} />}

          {tab === 'floorplan' && (
            <EventFloorPlan floorPlan={publicInfo.floorPlan} exhibitors={publicInfo.exhibitors} loading={publicLoading} />
          )}
        </div>

        {/* -------- Right: register card -------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={`${CARD} p-6`}>
            <h3 className="text-lg font-bold text-gray-900">Register for this event</h3>
            <p className="mt-1 text-sm text-gray-500">Secure your spot at {event.title}.</p>

            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Date</dt>
                <dd className="text-right font-medium text-gray-900">{formatShortDate(event.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Time</dt>
                <dd className="text-right font-medium text-gray-900">
                  {event.startTime ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ''}` : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Location</dt>
                <dd className="text-right font-medium text-gray-900">{event.location || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Spots left</dt>
                <dd className={`text-right font-semibold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isUnlimited ? 'Unlimited' : isFull ? 'Fully booked' : spotsLeft.toLocaleString()}
                </dd>
              </div>
            </dl>

            {registerError && !showForm && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {registerError}
              </div>
            )}

            <div className="mt-5">{renderRegisterAction()}</div>

            <p className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle2 size={14} className="text-emerald-500" /> Free cancellation up to 48h before
            </p>
          </div>
        </aside>
      </div>

      {/* ==================== Registration modal ==================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-gray-900">Register for {event.title}</h2>
            <p className="mb-5 mt-1 text-sm text-gray-500">Enter your details to confirm your spot</p>

            {registerError && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{registerError}</div>
            )}

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {[
                ['name', 'Full Name', 'text', 'John Doe'],
                ['email', 'Email', 'email', 'you@example.com'],
                ['phone', 'Phone', 'text', '+92 300 1234567'],
              ].map(([name, label, type, placeholder]) => (
                <div key={name}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleFormChange}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={registering}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {registering ? 'Confirming...' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== Pass popup (shown right after registering) ==================== */}
      {showPass && registration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowPass(false)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-white p-2 text-gray-500 shadow-md hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-center justify-center gap-2 text-white">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <p className="text-sm font-semibold">You're all set — here's your pass!</p>
            </div>

            <EventPass event={event} registration={registration} />

            <p className="mt-4 text-center text-xs text-white/70">
              This pass will always be available in the "Your Pass" tab too.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicEventDetails