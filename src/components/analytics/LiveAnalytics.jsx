import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarDays, Building2, Clock, ArrowRight, Radio } from 'lucide-react'
import { statsService } from '../../services/statsService'
import {
  CountUp, DeltaBadge, Skeleton, RangeToggle, RegistrationsChart, BoothDonut,
  Gauge, TopEventsList, CategoryBars,
} from './analyticsKit'
import { useInView } from './analyticsHelpers'

const REFRESH_MS = 60000

const GlassCard = ({ title, subtitle, action, className = '', children }) => (
  <div className={`rounded-2xl border border-cyan-500/15 bg-[#081329]/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/40 ${className}`}>
    {(title || action) && (
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
)

const StatTile = ({ icon: Icon, label, value, sub, delta, active }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#081329]/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-[#0b1b3a]/80">
    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
      <Icon className="h-5 w-5 text-cyan-400" />
    </div>
    <p className="relative text-3xl font-extrabold tabular-nums tracking-tight text-white">
      <CountUp value={value} active={active} />
    </p>
    <p className="relative mt-1 text-xs font-medium tracking-wide text-slate-400">{label}</p>
    <div className="relative mt-2 min-h-[20px]">
      {delta ? <DeltaBadge pct={delta.pct} theme="dark" /> : <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  </div>
)

// The home page's public "Live Analytics" section.
// If no data comes back from the backend, the whole section quietly hides itself — the home page never breaks.
const LiveAnalytics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [range, setRange] = useState('daily')
  const [ref, inView] = useInView(0.1)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const data = await statsService.getPublic()
        if (!alive) return
        setStats(data)
        setFailed(false)
      } catch {
        if (alive) setFailed(true)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  // The first load failed and there's no data -> don't show the section at all
  if (failed && !stats) return null

  const ready = !loading && !!stats
  const active = ready && inView
  const s = stats

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#030712] py-24 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[320px] w-[720px] -translate-x-1/2 bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
        {/* Heading */}
        <div className={`mb-12 flex flex-col justify-between gap-6 transition-all duration-700 sm:flex-row sm:items-end ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Live Analytics
            </span>
            <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              EventSphere in <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Real Numbers</span>
            </h2>
            <p className="max-w-lg text-xs leading-relaxed text-slate-400 sm:text-sm">
              These figures come straight from our platform, live — registrations, exhibitors, booths and sessions, updating every minute.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:brightness-125"
          >
            Join an Event <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stat tiles */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ready ? (
            <>
              <StatTile active={active} icon={Users} label="Attendees Registered" value={s.totals.attendees}
                delta={s.growth.attendees.pct !== null ? s.growth.attendees : null} sub="Across all events" />
              <StatTile active={active} icon={CalendarDays} label="Published Events" value={s.totals.events}
                sub={`${s.totals.upcomingEvents} upcoming`} />
              <StatTile active={active} icon={Building2} label="Approved Exhibitors" value={s.totals.exhibitors}
                sub={`${s.totals.booths} booths on the floor`} />
              <StatTile active={active} icon={Clock} label="Speaker Sessions" value={s.totals.sessions}
                sub="Talks, workshops & panels" />
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} theme="dark" className="h-36" />)
          )}
        </div>

        {/* Chart + booth donut */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard
            className="lg:col-span-2"
            title="Registrations Over Time"
            subtitle={range === 'daily' ? 'Last 30 days' : `Month by month in ${s?.year ?? new Date().getFullYear()}`}
            action={
              <RangeToggle
                theme="dark"
                value={range}
                onChange={setRange}
                options={[{ value: 'daily', label: '30 Days' }, { value: 'monthly', label: 'This Year' }]}
              />
            }
          >
            <div className="h-72">
              {ready ? (
                <RegistrationsChart daily={s.registrationsDaily} monthly={s.registrationsByMonth} mode={range} theme="dark" />
              ) : <Skeleton theme="dark" className="h-full" />}
            </div>
          </GlassCard>

          <GlassCard title="Booth Occupancy" subtitle="Live floor status">
            <div className="h-72">
              {ready ? <BoothDonut booth={s.boothStatus} theme="dark" /> : <Skeleton theme="dark" className="h-full" />}
            </div>
          </GlassCard>
        </div>

        {/* Top events + fill gauge + categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2" title="Trending Events" subtitle="Most registered right now">
            {ready ? <TopEventsList events={s.topEvents.slice(0, 5)} theme="dark" active={active} /> : <Skeleton theme="dark" className="h-56" />}
          </GlassCard>

          <div className="grid grid-cols-1 gap-6">
            <GlassCard title="Seats Filled" subtitle="Average across events with a seat limit">
              <div className="flex justify-center">
                {ready ? <Gauge value={s.totals.fillRate} label="filled" theme="dark" active={active} size={140} /> : <Skeleton theme="dark" className="h-36 w-36 rounded-full" />}
              </div>
            </GlassCard>
          </div>
        </div>

        {ready && s.eventsByCategory.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlassCard title="Events by Category" subtitle="What is happening on the platform">
              <CategoryBars data={s.eventsByCategory} theme="dark" active={active} />
            </GlassCard>
            <GlassCard title="Session Topics" subtitle="Speaker sessions by category">
              <CategoryBars data={s.sessionsByCategory} theme="dark" active={active} emptyText="Sessions coming soon." />
            </GlassCard>
          </div>
        )}

        {ready && (
          <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Radio className="h-3 w-3 text-cyan-400" />
            Last updated {new Date(s.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every minute
          </p>
        )}
      </div>
    </section>
  )
}

export default LiveAnalytics
