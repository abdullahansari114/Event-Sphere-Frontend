import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, Activity, Building2, Users, ClipboardList, Grid3x3,
  TrendingUp, TrendingDown, Sparkles, Clock, ArrowUpRight, Store,
  UserPlus, CalendarPlus, Layers, ClipboardCheck, MapPin,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { eventService } from '../../services/eventService'
import { API_ORIGIN } from '../../config/api'

const EVENT_REQUEST_API = `${API_ORIGIN}/api/v1/event-request`
const BOOTH_REQUEST_API = `${API_ORIGIN}/api/v1/booth-request`
const REGISTRATION_API = `${API_ORIGIN}/api/v1/registration`
const BOOTH_STATS_API = `${API_ORIGIN}/api/v1/booth/stats/summary`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const BOOTH_COLORS = { Available: '#3b82f6', Reserved: '#f59e0b', Occupied: '#10b981' }

const countInMonth = (items, field, monthsAgo) => {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  return items.filter((it) => {
    const d = new Date(it[field])
    return !isNaN(d) && d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()
  }).length
}

const monthDelta = (items, field) => {
  const curr = countInMonth(items, field, 0)
  const prev = countInMonth(items, field, 1)
  if (prev === 0 && curr === 0) return null
  if (prev === 0) return { pct: 100, up: true, label: 'New this month' }
  const pct = Math.round(((curr - prev) / prev) * 100)
  return { pct, up: pct >= 0, label: `${pct >= 0 ? '+' : ''}${pct}% vs last month` }
}

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Animated count-up number
const useCountUp = (target, active) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf
    const start = performance.now()
    const duration = 800
    const from = 0
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (target - from) * eased))
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
      {s.delta ? (
        <p className={`relative flex items-center gap-1 text-xs mt-2 font-semibold ${s.delta.up ? 'text-emerald-600' : 'text-red-500'}`}>
          {s.delta.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {s.delta.label}
        </p>
      ) : (
        <p className="relative text-xs mt-2 text-gray-300">Live count</p>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [eventRequests, setEventRequests] = useState([])
  const [boothRequests, setBoothRequests] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [boothStats, setBoothStats] = useState({ available: 0, reserved: 0, occupied: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [evts, evReqRes, boothReqRes, regRes, boothStatsRes] = await Promise.all([
          eventService.getAll(),
          fetch(EVENT_REQUEST_API, { credentials: 'include' }),
          fetch(BOOTH_REQUEST_API, { credentials: 'include' }),
          fetch(REGISTRATION_API, { credentials: 'include' }),
          fetch(BOOTH_STATS_API, { credentials: 'include' }),
        ])
        setEvents(evts)
        setEventRequests(evReqRes.ok ? await evReqRes.json() : [])
        setBoothRequests(boothReqRes.ok ? await boothReqRes.json() : [])
        setRegistrations(regRes.ok ? await regRes.json() : [])
        setBoothStats(boothStatsRes.ok ? await boothStatsRes.json() : { available: 0, reserved: 0, occupied: 0, total: 0 })
      } catch (err) {
        console.error('Dashboard load failed:', err)
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

  const approvedExhibitorIds = useMemo(
    () => new Set(eventRequests.filter((r) => r.status === 'approved').map((r) => r.exhibitor?._id).filter(Boolean)),
    [eventRequests],
  )

  const pendingAppsCount = useMemo(
    () =>
      eventRequests.filter((r) => r.status === 'pending').length +
      boothRequests.filter((r) => r.status === 'pending').length,
    [eventRequests, boothRequests],
  )

  const STATS = useMemo(() => {
    const eventsDelta = monthDelta(events, 'createdAt')
    const approvedList = eventRequests.filter((r) => r.status === 'approved')
    const exhibitorsDelta = monthDelta(approvedList, 'updatedAt')
    const registrationsDelta = monthDelta(registrations, 'createdAt')

    return [
      { label: 'Total Events', value: events.length, delta: eventsDelta, icon: CalendarDays, gradient: 'from-blue-500 to-blue-600' },
      { label: 'Active Events', value: events.filter((e) => e.status === 'published').length, delta: null, icon: Activity, gradient: 'from-emerald-500 to-green-600' },
      { label: 'Exhibitors', value: approvedExhibitorIds.size, delta: exhibitorsDelta, icon: Building2, gradient: 'from-orange-500 to-amber-600' },
      { label: 'Attendees', value: registrations.length, delta: registrationsDelta, icon: Users, gradient: 'from-sky-500 to-blue-500' },
      { label: 'Pending Apps', value: pendingAppsCount, delta: null, icon: ClipboardList, gradient: 'from-yellow-500 to-orange-500' },
      { label: 'Available Booths', value: boothStats.available, delta: null, icon: Grid3x3, gradient: 'from-teal-500 to-emerald-600' },
    ]
  }, [events, eventRequests, registrations, boothStats, approvedExhibitorIds, pendingAppsCount])

  const registrationChartData = useMemo(() => {
    const year = new Date().getFullYear()
    const counts = Array(12).fill(0)
    registrations.forEach((r) => {
      const d = new Date(r.createdAt)
      if (d.getFullYear() === year) counts[d.getMonth()] += 1
    })
    return MONTHS.map((m, i) => ({ month: m, registrations: counts[i] }))
  }, [registrations])

  const boothChartData = useMemo(
    () => [
      { name: 'Available', value: boothStats.available },
      { name: 'Reserved', value: boothStats.reserved },
      { name: 'Occupied', value: boothStats.occupied },
    ].filter((d) => d.value > 0),
    [boothStats],
  )

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events
      .filter((e) => {
        const d = new Date(e.date)
        return !isNaN(d) && d >= today
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  }, [events])

  const activity = useMemo(() => {
    const items = []
    eventRequests.forEach((r) =>
      items.push({
        id: `er-${r._id}`, createdAt: r.createdAt, status: r.status, icon: CalendarDays, color: 'text-blue-600 bg-blue-50',
        text: `${r.exhibitor?.name || 'Someone'} requested to join ${r.event?.title || 'an event'}`,
      }),
    )
    boothRequests.forEach((r) =>
      items.push({
        id: `br-${r._id}`, createdAt: r.createdAt, status: r.status, icon: Store, color: 'text-purple-600 bg-purple-50',
        text: `${r.exhibitor?.name || 'Someone'} requested ${(r.booths || []).length || ''} booth(s) for ${r.event?.title || 'an event'}`,
      }),
    )
    registrations.forEach((r) =>
      items.push({
        id: `rg-${r._id}`, createdAt: r.createdAt, status: 'approved', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50',
        text: `${r.name} registered for ${r.event?.title || 'an event'}`,
      }),
    )
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7)
  }, [eventRequests, boothRequests, registrations])

  const quickActions = [
    { label: 'Create Event', to: '/admin/events/create', icon: CalendarPlus, gradient: 'from-blue-600 to-indigo-600' },
    { label: 'Review Exhibitors', to: '/admin/exhibitors', icon: ClipboardCheck, gradient: 'from-orange-500 to-amber-600', badge: eventRequests.filter((r) => r.status === 'pending').length },
    { label: 'Manage Booths', to: '/admin/booths', icon: Layers, gradient: 'from-teal-500 to-emerald-600' },
    { label: 'View Registrations', to: '/admin/registrations', icon: Users, gradient: 'from-sky-500 to-blue-600' },
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
              Welcome back, {(user?.name || '').split(' ')[0] || 'Admin'}
            </h1>
            <p className="mt-1 text-sm text-blue-100">Here is what is happening across EventSphere today.</p>
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
            { label: 'Active Events', value: STATS[1]?.value },
            { label: 'Pending Apps', value: pendingAppsCount },
            { label: 'Available Booths', value: boothStats.available },
          ].map((chip) => (
            <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {loading ? '—' : chip.value} {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map((s) => <StatCard key={s.label} s={s} ready={!loading} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Attendee Registrations</h2>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Monthly registrations over the year</p>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationChartData} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => [v, 'Registrations']} />
                  <Area type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2.5} fill="url(#regFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900">Booth Occupancy</h2>
          <p className="text-sm text-gray-500 mb-4">Current booth status distribution</p>
          <div className="h-64 relative">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm">Loading...</div>
            ) : boothStats.total === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm">No booth grid has been generated yet.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={boothChartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={3} cornerRadius={6}>
                      {boothChartData.map((entry) => <Cell key={entry.name} fill={BOOTH_COLORS[entry.name]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend verticalAlign="bottom" height={30} iconType="circle" formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 30 }}>
                  <p className="text-2xl font-bold text-gray-800">{boothStats.total}</p>
                  <p className="text-xs text-gray-400">Total Booths</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming events + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/admin/events" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-300">Loading...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No upcoming events.</div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => {
                const d = new Date(e.date)
                const daysLeft = Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 86400000)
                const fillPct = e.maxAttendees > 0 ? Math.min(100, Math.round((e.registeredAttendees / e.maxAttendees) * 100)) : null
                return (
                  <Link
                    to={`/admin/events/${e._id}`}
                    key={e._id}
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
                      {fillPct !== null && (
                        <div className="mt-1.5 h-1.5 w-full max-w-[180px] rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${fillPct}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${e.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {e.status}
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
                    <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
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

export default AdminDashboard