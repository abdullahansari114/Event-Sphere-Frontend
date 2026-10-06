import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, Grid3x3, ClipboardList, CheckCircle2, Sparkles, Clock,
  ArrowUpRight, MapPin, Store, CalendarSearch, PackagePlus, Layers,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { API_ORIGIN } from '../../config/api'

const EVENT_REQUEST_MINE_API = `${API_ORIGIN}/api/v1/event-request/mine`
const BOOTH_REQUEST_MINE_API = `${API_ORIGIN}/api/v1/booth-request/mine`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const useCountUp = (target, active) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf
    const start = performance.now()
    const duration = 800
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])
  return val
}

const StatCard = ({ s, ready }) => {
  const animated = useCountUp(s.value, ready)
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 bg-gradient-to-br ${s.gradient}`} />
      <div className="relative flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{s.label}</span>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-sm`}>
          <s.icon size={18} className="text-white" />
        </span>
      </div>
      <p className="relative text-3xl font-bold text-gray-900 tabular-nums">{ready ? animated.toLocaleString() : '—'}</p>
      <p className="relative text-xs mt-2 text-gray-400">{s.sub}</p>
    </div>
  )
}

const statusPill = (status) => {
  const map = {
    approved: 'bg-emerald-50 text-emerald-600',
    pending: 'bg-yellow-50 text-yellow-600',
    rejected: 'bg-red-50 text-red-500',
  }
  return map[status] || map.pending
}

const ExhibitorDashboard = () => {
  const { user } = useAuth()
  const [eventRequests, setEventRequests] = useState([])
  const [boothRequests, setBoothRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [evRes, boothRes] = await Promise.all([
          fetch(EVENT_REQUEST_MINE_API, { credentials: 'include' }),
          fetch(BOOTH_REQUEST_MINE_API, { credentials: 'include' }),
        ])
        setEventRequests(evRes.ok ? await evRes.json() : [])
        setBoothRequests(boothRes.ok ? await boothRes.json() : [])
      } catch (err) {
        console.error('Exhibitor dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [now])

  const activeBoothsCount = useMemo(
    () => boothRequests.filter((b) => b.status === 'approved').reduce((sum, b) => sum + (b.booths?.length || 0), 0),
    [boothRequests],
  )

  const pendingEventsCount = useMemo(() => eventRequests.filter((r) => r.status === 'pending').length, [eventRequests])
  const pendingBoothsCount = useMemo(() => boothRequests.filter((r) => r.status === 'pending').length, [boothRequests])
  const pendingCount = pendingEventsCount + pendingBoothsCount

  const approvedEventsCount = useMemo(() => eventRequests.filter((r) => r.status === 'approved').length, [eventRequests])
  const approvedBoothsCount = useMemo(() => boothRequests.filter((r) => r.status === 'approved').length, [boothRequests])

  const STATS = [
    { label: 'My Events', value: eventRequests.length, sub: 'Total join requests sent', icon: CalendarDays, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Active Booths', value: activeBoothsCount, sub: 'Booths currently assigned', icon: Grid3x3, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Pending Events', value: pendingEventsCount, sub: 'Join requests awaiting review', icon: ClipboardList, gradient: 'from-yellow-500 to-orange-500' },
    { label: 'Approved Events', value: approvedEventsCount, sub: 'Matches your Applications page', icon: CheckCircle2, gradient: 'from-sky-500 to-indigo-500' },
    { label: 'Approved Booths', value: approvedBoothsCount, sub: 'Booth requests approved', icon: Store, gradient: 'from-purple-500 to-fuchsia-600' },
  ]

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventRequests
      .filter((r) => r.status === 'approved' && r.event)
      .filter((r) => {
        const d = new Date(r.event.date)
        return !isNaN(d) && d >= today
      })
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
      .slice(0, 5)
  }, [eventRequests])

  const activity = useMemo(() => {
    const items = []
    eventRequests.forEach((r) =>
      items.push({
        id: `er-${r._id}`, at: r.updatedAt || r.createdAt, icon: CalendarDays, color: 'text-blue-600 bg-blue-50',
        text: `Your request to join "${r.event?.title || 'an event'}" is ${r.status}`, status: r.status,
      }),
    )
    boothRequests.forEach((r) =>
      items.push({
        id: `br-${r._id}`, at: r.updatedAt || r.createdAt, icon: Store, color: 'text-purple-600 bg-purple-50',
        text: `Your request for ${(r.booths || []).length} booth(s) at "${r.event?.title || 'an event'}" is ${r.status}`, status: r.status,
      }),
    )
    return items.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7)
  }, [eventRequests, boothRequests])

  const quickActions = [
    { label: 'Browse Events', to: '/exhibitor/events', icon: CalendarSearch, gradient: 'from-blue-600 to-indigo-600' },
    { label: 'My Applications', to: '/exhibitor/applications', icon: ClipboardList, gradient: 'from-yellow-500 to-orange-500', badge: pendingCount },
    { label: 'My Booths', to: '/exhibitor/booths', icon: Layers, gradient: 'from-teal-500 to-emerald-600' },
    { label: 'Products & Services', to: '/exhibitor/products', icon: PackagePlus, gradient: 'from-sky-500 to-blue-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-7 shadow-lg">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-[-4rem] h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-blue-100">
              <Sparkles size={14} /> {greeting}
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white">
              Welcome back, {(user?.name || '').split(' ')[0] || 'Exhibitor'}
            </h1>
            <p className="mt-1 text-sm text-blue-100">Here is where your applications and booths stand today.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-2.5 text-white">
            <Clock size={16} />
            <div className="text-sm">
              <p className="font-semibold">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              <p className="text-blue-100 text-xs">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2.5">
          {[
            { label: 'Upcoming Events', value: upcomingEvents.length },
            { label: 'Pending Applications', value: pendingCount },
            { label: 'Active Booths', value: activeBoothsCount },
          ].map((chip) => (
            <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {loading ? '—' : chip.value} {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((s) => <StatCard key={s.label} s={s} ready={!loading} />)}
      </div>

      {/* Upcoming events + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/exhibitor/events" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              Browse all <ArrowUpRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-300">Loading...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No upcoming events — <Link to="/exhibitor/events" className="text-blue-600 font-medium">browse events</Link> and send a join request.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((r) => {
                const e = r.event
                const d = new Date(e.date)
                const daysLeft = Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 86400000)
                const hasBooth = boothRequests.some((b) => b.status === 'approved' && b.event?._id === e._id)
                return (
                  <Link
                    to={`/exhibitor/events/${e._id}`}
                    key={r._id}
                    className="flex items-center gap-4 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <span className="text-[10px] font-semibold uppercase leading-none">{MONTHS[d.getMonth()]}</span>
                      <span className="text-lg font-bold leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{e.title}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 truncate">
                        <MapPin size={11} /> {e.venue || e.location || 'TBA'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${hasBooth ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {hasBooth ? 'Booth Assigned' : 'No Booth Yet'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-300">Loading...</div>
          ) : activity.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No activity yet.</div>
          ) : (
            <div className="space-y-4">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      {a.text}{' '}
                      <span className={`ml-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ${statusPill(a.status)}`}>
                        {a.status}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((qa) => (
          <Link
            key={qa.label}
            to={qa.to}
            className={`relative overflow-hidden flex items-center gap-3 rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br ${qa.gradient} transition-transform hover:-translate-y-0.5 hover:shadow-md`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <qa.icon size={18} />
            </span>
            <span className="text-sm font-semibold">{qa.label}</span>
            {!!qa.badge && (
              <span className="absolute top-2 right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-gray-800">
                {qa.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ExhibitorDashboard
