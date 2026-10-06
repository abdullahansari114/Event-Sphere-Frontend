import { useEffect, useMemo, useState } from 'react'
import { API_ORIGIN } from '../../config/api'
import {
  Search, Download, Trash2, Users, CalendarCheck, Clock3, Sparkles,
  ChevronDown, Mail, Phone, X,
} from 'lucide-react'

const REGISTRATION_API = `${API_ORIGIN}/api/v1/registration`

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-sky-500 to-cyan-600',
]

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'

const gradientFor = (str = '') => {
  const code = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length]
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [removingId, setRemovingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(REGISTRATION_API, { credentials: 'include', cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load registrations')
      setRegistrations(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Ye registration cancel kar dein?')) return
    setRemovingId(id)
    try {
      const res = await fetch(`${REGISTRATION_API}/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to cancel registration')
      setRegistrations((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  // How many events each attendee (by email) has registered for — for the "Frequent Attendee" badge
  const emailCounts = useMemo(() => {
    const map = new Map()
    registrations.forEach((r) => map.set(r.email, (map.get(r.email) || 0) + 1))
    return map
  }, [registrations])

  const eventOptions = useMemo(
    () => Array.from(new Set(registrations.map((r) => r.event?.title).filter(Boolean))).sort(),
    [registrations],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return registrations
      .filter((r) => eventFilter === 'all' || r.event?.title === eventFilter)
      .filter((r) =>
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        (r.event?.title || '').toLowerCase().includes(term),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [registrations, query, eventFilter])

  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return {
      total: registrations.length,
      today: registrations.filter((r) => isSameDay(new Date(r.createdAt), now)).length,
      thisWeek: registrations.filter((r) => new Date(r.createdAt) >= weekAgo).length,
      uniqueEvents: new Set(registrations.map((r) => r.event?._id).filter(Boolean)).size,
    }
  }, [registrations])

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Event', 'Registered On'],
      ...filtered.map((r) => [r.name, r.email, r.phone, r.event?.title || '', formatDate(r.createdAt)]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const STAT_CARDS = [
    { label: 'Total Registrations', value: stats.total, icon: Users, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Today', value: stats.today, icon: Sparkles, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'This Week', value: stats.thisWeek, icon: Clock3, gradient: 'from-orange-500 to-amber-600' },
    { label: 'Events Covered', value: stats.uniqueEvents, icon: CalendarCheck, gradient: 'from-purple-500 to-violet-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">Attendee registrations across all events</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!filtered.length}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-40"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 bg-gradient-to-br ${s.gradient}`} />
            <div className="relative flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.gradient}`}>
                <s.icon size={14} className="text-white" />
              </span>
            </div>
            <p className="relative text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or event..."
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="all">All Events</option>
            {eventOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <span className="text-xs text-gray-400 ml-auto">
          Showing {filtered.length} of {registrations.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading registrations...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {registrations.length === 0 ? 'No registrations yet.' : 'No results found for this search/filter.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 font-medium">Attendee</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Registered On</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const frequent = (emailCounts.get(r.email) || 0) > 1
                return (
                  <tr key={r._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(r.name)} text-xs font-semibold text-white shadow-sm`}>
                          {initials(r.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate flex items-center gap-1.5">
                            {r.name}
                            {frequent && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                <Sparkles size={9} /> Frequent
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <p className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-gray-400" /> {r.email}</p>
                      {r.phone && <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5"><Phone size={12} /> {r.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {r.event?.title || 'Event removed'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <p className="text-sm">{formatDate(r.createdAt)}</p>
                      <p className="text-xs text-gray-400">{timeAgo(r.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancel(r._id)}
                          disabled={removingId === r._id}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60"
                        >
                          <Trash2 size={13} /> {removingId === r._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminRegistrations