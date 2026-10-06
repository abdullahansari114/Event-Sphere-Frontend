import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, Users, Building2, Clock, Grid3x3, UserPlus, RefreshCw, Download,
  Lightbulb, Flame, AlertCircle, TrendingUp, Trophy, CalendarCheck,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { statsService } from '../../services/statsService'
import {
  CountUp, DeltaBadge, Skeleton, RangeToggle, RegistrationsChart, BoothDonut,
  Gauge, TopEventsList, CategoryBars, RequestsFunnel, SimpleDonut,
} from '../../components/analytics/analyticsKit'
import { THEMES } from '../../components/analytics/analyticsHelpers'

const REFRESH_MS = 30000
const t = THEMES.light

const Card = ({ title, subtitle, action, className = '', children }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
)

const KpiCard = ({ label, value, icon: Icon, gradient, sub, delta, ready }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 ${gradient}`} />
    <div className="relative mb-4 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ${gradient}`}>
        <Icon size={18} className="text-white" />
      </span>
    </div>
    <p className="relative text-3xl font-bold tabular-nums text-gray-900">
      {ready ? <CountUp value={value} /> : '—'}
    </p>
    <div className="relative mt-2 min-h-[20px]">
      {delta ? <DeltaBadge pct={delta.pct} /> : <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
)

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

const downloadCsv = (stats) => {
  const rows = []
  rows.push(['EventSphere Analytics', new Date(stats.generatedAt).toLocaleString()])
  rows.push([])
  rows.push(['Summary'])
  rows.push(['Total events', stats.totals.events])
  rows.push(['Published events', stats.events.published])
  rows.push(['Draft events', stats.events.draft])
  rows.push(['Attendees (registrations)', stats.totals.attendees])
  rows.push(['Approved exhibitors', stats.totals.exhibitors])
  rows.push(['Sessions', stats.totals.sessions])
  rows.push(['Booths', stats.totals.booths])
  rows.push(['Average event fill rate %', stats.totals.fillRate])
  rows.push(['Session seat utilization %', stats.sessionSeats.utilization])
  rows.push([])
  rows.push([`Registrations by month (${stats.year})`])
  rows.push(['Month', 'Registrations'])
  stats.registrationsByMonth.forEach((m) => rows.push([m.month, m.registrations]))
  rows.push([])
  rows.push(['Top events'])
  rows.push(['Event', 'Registered', 'Capacity', 'Fill %'])
  stats.topEvents.forEach((e) => rows.push([e.title, e.registered, e.capacity || '-', e.fillRate ?? '-']))
  rows.push([])
  rows.push(['Requests', 'Pending', 'Approved', 'Rejected'])
  rows.push(['Exhibitor applications', stats.requests.events.pending, stats.requests.events.approved, stats.requests.events.rejected])
  rows.push(['Booth requests', stats.requests.booths.pending, stats.requests.booths.approved, stats.requests.booths.rejected])
  rows.push(['Session seat requests', stats.requests.sessions.pending, stats.requests.sessions.approved, stats.requests.sessions.rejected])

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `eventsphere-analytics-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const toneStyles = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
}

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [range, setRange] = useState('daily')

  // Refetches whenever tick changes (Refresh button / retry). Also auto-refreshes every 30s.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const data = await statsService.getAdmin()
        if (!alive) return
        setStats(data)
        setError('')
      } catch (err) {
        if (alive) setError(err.message)
      } finally {
        if (alive) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }
    run()
    const id = setInterval(run, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [tick])

  const refresh = () => {
    setRefreshing(true)
    setTick((n) => n + 1)
  }

  const insights = useMemo(() => {
    if (!stats) return []
    const list = []

    const best = [...stats.registrationsByMonth].sort((a, b) => b.registrations - a.registrations)[0]
    if (best && best.registrations > 0) {
      list.push({ icon: Flame, tone: 'amber', title: 'Busiest month', text: `${best.month} ${stats.year} — ${best.registrations} registration${best.registrations === 1 ? '' : 's'}` })
    }

    const top = stats.topEvents[0]
    if (top && top.registered > 0) {
      list.push({
        icon: Trophy, tone: 'purple', title: 'Most popular event',
        text: `${top.title} — ${top.registered} registered${top.fillRate !== null ? `, ${top.fillRate}% full` : ''}`,
      })
    }

    const nearlyFull = stats.topEvents.filter((e) => e.fillRate !== null && e.fillRate >= 90)
    if (nearlyFull.length > 0) {
      list.push({ icon: AlertCircle, tone: 'amber', title: 'Almost full', text: `${nearlyFull.map((e) => e.title).slice(0, 2).join(', ')} ${nearlyFull.length === 1 ? 'is' : 'are'} above 90% capacity` })
    }

    if (stats.pendingTotal > 0) {
      list.push({ icon: Clock, tone: 'blue', title: 'Needs review', text: `${stats.pendingTotal} pending request${stats.pendingTotal === 1 ? '' : 's'} waiting for approval` })
    }

    const g = stats.growth.attendees
    if (g.pct !== null) {
      list.push({
        icon: TrendingUp, tone: g.pct >= 0 ? 'emerald' : 'amber', title: 'Registrations trend',
        text: `${g.current} this month vs ${g.previous} last month (${g.pct >= 0 ? '+' : ''}${g.pct}%)`,
      })
    }

    if (stats.totals.upcomingEvents > 0) {
      list.push({ icon: CalendarCheck, tone: 'emerald', title: 'Upcoming', text: `${stats.totals.upcomingEvents} published event${stats.totals.upcomingEvents === 1 ? '' : 's'} coming up` })
    }

    return list.slice(0, 4)
  }, [stats])

  const ready = !loading && !!stats
  const s = stats

  if (!loading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Platform-wide performance insights</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-600">Could not load analytics</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            onClick={() => { setLoading(true); setTick((n) => n + 1) }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Platform-wide performance insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-400' : 'animate-ping bg-emerald-400'}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
            </span>
            {error ? 'Offline' : 'Live'}
            {s && <span className="text-gray-400">· {new Date(s.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
          </span>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => s && downloadCsv(s)}
            disabled={!s}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && s && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          Refresh failed ({error}) — showing older data.
        </div>
      )}

      {/* Insights */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : insights.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Lightbulb size={13} /> Quick insights
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((ins) => (
              <div key={ins.title} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyles[ins.tone]}`}>
                  <ins.icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400">{ins.title}</p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-gray-800">{ins.text}</p>
                  {ins.title === 'Needs review' && (
                    <Link to="/admin/exhibitors" className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700">Review now →</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard ready={ready} label="Total Events" value={s?.events.total ?? 0} icon={CalendarDays} gradient="from-blue-500 to-blue-600"
          sub={s ? `${s.events.published} published · ${s.events.draft} draft` : ''} />
        <KpiCard ready={ready} label="Attendees" value={s?.totals.attendees ?? 0} icon={Users} gradient="from-sky-500 to-blue-500"
          delta={s?.growth.attendees.pct !== null ? s?.growth.attendees : null} sub="Total registrations" />
        <KpiCard ready={ready} label="Exhibitors" value={s?.totals.exhibitors ?? 0} icon={Building2} gradient="from-orange-500 to-amber-600"
          sub="Approved exhibitors" />
        <KpiCard ready={ready} label="Sessions" value={s?.totals.sessions ?? 0} icon={Clock} gradient="from-purple-500 to-indigo-600"
          sub={s ? `${s.sessionSeats.utilization}% seats booked` : ''} />
        <KpiCard ready={ready} label="Booths" value={s?.totals.booths ?? 0} icon={Grid3x3} gradient="from-teal-500 to-emerald-600"
          sub={s ? `${s.boothStatus.available} available` : ''} />
        <KpiCard ready={ready} label="Platform Users" value={s?.usersTotal ?? 0} icon={UserPlus} gradient="from-pink-500 to-rose-600"
          delta={s?.usersGrowth.pct !== null ? s?.usersGrowth : null} sub="Registered accounts" />
      </div>

      {/* Registrations + booths */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Attendee Registrations"
          subtitle={range === 'daily' ? 'Last 30 days, day by day' : `Month by month in ${s?.year ?? new Date().getFullYear()}`}
          action={
            <RangeToggle
              value={range}
              onChange={setRange}
              options={[{ value: 'daily', label: '30 Days' }, { value: 'monthly', label: 'This Year' }]}
            />
          }
        >
          <div className="h-72">
            {ready ? (
              <RegistrationsChart daily={s.registrationsDaily} monthly={s.registrationsByMonth} mode={range} theme="light" />
            ) : <Skeleton className="h-full" />}
          </div>
        </Card>

        <Card title="Booth Occupancy" subtitle="Current booth status distribution">
          <div className="h-72">
            {ready ? <BoothDonut booth={s.boothStatus} theme="light" /> : <Skeleton className="h-full" />}
          </div>
        </Card>
      </div>

      {/* Top events + gauges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Top Events" subtitle="Most registrations, with capacity fill">
          {ready ? <TopEventsList events={s.topEvents} theme="light" active={ready} /> : <Skeleton className="h-64" />}
        </Card>

        <Card title="Capacity Health" subtitle="How full is the platform?">
          {ready ? (
            <div className="flex flex-wrap items-start justify-around gap-4 pt-2">
              <Gauge value={s.totals.fillRate} label="events" sub="Avg event fill" theme="light" active={ready} size={128} />
              <Gauge value={s.sessionSeats.utilization} label="seats" sub={`${s.sessionSeats.booked}/${s.sessionSeats.total} session seats`} theme="light" active={ready} size={128} />
            </div>
          ) : <Skeleton className="h-52" />}
        </Card>
      </div>

      {/* Funnel + users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Approvals Pipeline" subtitle="Exhibitor, booth and seat requests by status">
          <div className="h-64">
            {ready ? <RequestsFunnel requests={s.requests} theme="light" /> : <Skeleton className="h-full" />}
          </div>
        </Card>

        <Card title="Users by Role" subtitle="Who is on the platform">
          <div className="h-64">
            {ready ? <SimpleDonut data={s.usersByRole} theme="light" centerValue={s.usersTotal} centerLabel="users" /> : <Skeleton className="h-full" />}
          </div>
        </Card>
      </div>

      {/* Categories + signups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Events by Category" subtitle="Published + draft events">
          {ready ? <CategoryBars data={s.eventsByCategory} theme="light" active={ready} emptyText="No category has been assigned to events." /> : <Skeleton className="h-40" />}
        </Card>

        <Card title="Sessions by Category" subtitle="Speaker sessions across events">
          {ready ? <CategoryBars data={s.sessionsByCategory} theme="light" active={ready} emptyText="No sessions yet." /> : <Skeleton className="h-40" />}
        </Card>

        <Card title="New Users" subtitle={`Sign-ups per month in ${s?.year ?? new Date().getFullYear()}`}>
          <div className="h-44">
            {ready ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.usersByMonth} margin={{ left: -24, right: 4, top: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.axis }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: t.axis }} axisLine={false} tickLine={false} width={34} />
                  <Tooltip
                    cursor={{ fill: t.grid }}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${t.tooltipBorder}`, fontSize: 13 }}
                    formatter={(v) => [v, 'New users']}
                  />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-full" />}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
