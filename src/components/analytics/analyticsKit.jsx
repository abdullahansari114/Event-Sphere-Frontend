import { useId, useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { THEMES, PALETTE, BOOTH_COLORS, STATUS_COLORS, useCountUp } from './analyticsHelpers'

// ============================================================
//  Shared analytics widgets — used by both admin Analytics (light)
//  and the home page's Live Analytics (dark).
// ============================================================

const tooltipProps = (t) => ({
  contentStyle: {
    background: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 12,
    fontSize: 13,
    color: t.text,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  },
  labelStyle: { color: t.muted, fontWeight: 600 },
  itemStyle: { color: t.text },
  cursor: { stroke: t.axis, strokeOpacity: 0.3 },
})

export const CountUp = ({ value = 0, active = true, suffix = '', duration = 1000 }) => {
  const v = useCountUp(value, active, duration)
  return <>{v.toLocaleString()}{suffix}</>
}

// ---------- small pieces ----------

export const DeltaBadge = ({ pct, theme = 'light', label = 'vs last month' }) => {
  if (pct === null || pct === undefined) return null
  const up = pct >= 0
  const cls =
    theme === 'dark'
      ? up ? 'text-emerald-300 bg-emerald-400/10' : 'text-red-300 bg-red-400/10'
      : up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{pct}% {label}
    </span>
  )
}

export const Skeleton = ({ className = '', theme = 'light' }) => (
  <div className={`animate-pulse rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'} ${className}`} />
)

export const EmptyState = ({ text, theme = 'light' }) => (
  <div className={`h-full w-full flex items-center justify-center text-center text-sm px-6 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
    {text}
  </div>
)

export const RangeToggle = ({ value, onChange, options, theme = 'light' }) => (
  <div className={`inline-flex rounded-full p-0.5 text-xs font-semibold ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100'}`}>
    {options.map((o) => {
      const active = value === o.value
      const activeCls = theme === 'dark' ? 'bg-cyan-400/90 text-slate-900' : 'bg-white text-blue-600 shadow-sm'
      const idleCls = theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 transition-colors ${active ? activeCls : idleCls}`}
        >
          {o.label}
        </button>
      )
    })}
  </div>
)

// ---------- charts ----------

// mode: 'daily' (last 30 days) | 'monthly' (this year)
export const RegistrationsChart = ({ daily = [], monthly = [], mode = 'daily', theme = 'light' }) => {
  const t = THEMES[theme]
  const gid = 'regFill' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const data = mode === 'daily' ? daily : monthly
  const xKey = mode === 'daily' ? 'label' : 'month'
  const hasData = data.some((d) => d.registrations > 0)

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.line} stopOpacity={0.4} />
              <stop offset="95%" stopColor={t.line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: t.axis }}
            axisLine={false}
            tickLine={false}
            interval={mode === 'daily' ? 4 : 0}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: t.axis }} axisLine={false} tickLine={false} width={34} />
          <Tooltip {...tooltipProps(t)} formatter={(v) => [v, 'Registrations']} />
          <Area
            type="monotone"
            dataKey="registrations"
            stroke={t.line}
            strokeWidth={2.5}
            fill={`url(#${gid})`}
            activeDot={{ r: 5, strokeWidth: 0, fill: t.line }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasData && (
        <div className={`absolute inset-0 flex items-center justify-center text-sm pointer-events-none ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
          No registrations yet in this period.
        </div>
      )}
    </div>
  )
}

export const BoothDonut = ({ booth, theme = 'light' }) => {
  const t = THEMES[theme]
  const data = useMemo(
    () =>
      [
        { name: 'Available', value: booth?.available || 0 },
        { name: 'Reserved', value: booth?.reserved || 0 },
        { name: 'Occupied', value: booth?.occupied || 0 },
      ].filter((d) => d.value > 0),
    [booth],
  )
  const total = booth?.total || 0
  const takenPct = total > 0 ? Math.round((((booth?.occupied || 0) + (booth?.reserved || 0)) / total) * 100) : 0

  if (total === 0) return <EmptyState theme={theme} text="No booth grid has been generated yet." />

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={1000}>
              {data.map((d) => <Cell key={d.name} fill={BOOTH_COLORS[d.name]} />)}
            </Pie>
            <Tooltip {...tooltipProps(t)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold tabular-nums" style={{ color: t.text }}>{takenPct}%</p>
          <p className="text-[11px]" style={{ color: t.muted }}>booked</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        {['Available', 'Reserved', 'Occupied'].map((name) => (
          <span key={name} className="inline-flex items-center gap-1.5 text-xs" style={{ color: t.muted }}>
            <span className="h-2 w-2 rounded-full" style={{ background: BOOTH_COLORS[name] }} />
            {name} <b style={{ color: t.text }}>{booth?.[name.toLowerCase()] || 0}</b>
          </span>
        ))}
      </div>
    </div>
  )
}

// Circular gauge — value 0..100
export const Gauge = ({ value = 0, label = '', sub = '', theme = 'light', active = true, size = 150 }) => {
  const t = THEMES[theme]
  const r = 52
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const gid = 'gauge' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={r} fill="none" stroke={t.track} strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={active ? c * (1 - pct / 100) : c}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold tabular-nums" style={{ color: t.text }}>
            <CountUp value={pct} active={active} suffix="%" />
          </p>
          {label && <p className="text-[11px]" style={{ color: t.muted }}>{label}</p>}
        </div>
      </div>
      {sub && <p className="mt-2 text-center text-xs" style={{ color: t.muted }}>{sub}</p>}
    </div>
  )
}

// Top events — registered vs capacity progress bars
export const TopEventsList = ({ events = [], theme = 'light', active = true }) => {
  const t = THEMES[theme]
  if (events.length === 0) return <EmptyState theme={theme} text="No published events yet." />
  const maxRegistered = Math.max(1, ...events.map((e) => e.registered))
  return (
    <div className="space-y-4">
      {events.map((e, i) => {
        const width = e.fillRate !== null ? e.fillRate : Math.round((e.registered / maxRegistered) * 100)
        return (
          <div key={e.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                  style={{ background: theme === 'dark' ? 'rgba(34,211,238,0.12)' : '#eff6ff', color: theme === 'dark' ? '#22d3ee' : '#2563eb' }}
                >
                  {i + 1}
                </span>
                <p className="truncate text-sm font-semibold" style={{ color: t.text }}>{e.title}</p>
              </div>
              <p className="shrink-0 text-xs tabular-nums" style={{ color: t.muted }}>
                <b style={{ color: t.text }}>{e.registered}</b>
                {e.capacity > 0 ? ` / ${e.capacity}` : ' registered'}
                {e.fillRate !== null && <span className="ml-1.5 font-semibold" style={{ color: e.fillRate >= 90 ? '#f59e0b' : t.muted }}>{e.fillRate}%</span>}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: t.track }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: active ? `${Math.max(width, e.registered > 0 ? 3 : 0)}%` : '0%',
                  background: 'linear-gradient(90deg,#06b6d4,#3b82f6,#6366f1)',
                  transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Horizontal bars by category (events or sessions)
export const CategoryBars = ({ data = [], theme = 'light', active = true, emptyText = 'No categories yet.' }) => {
  const t = THEMES[theme]
  if (data.length === 0) return <EmptyState theme={theme} text={emptyText} />
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((d, i) => (
        <div key={d.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium" style={{ color: t.text }}>
              <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {d.name}
            </span>
            <span className="tabular-nums" style={{ color: t.muted }}>{d.value}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: t.track }}>
            <div
              className="h-full rounded-full"
              style={{
                width: active ? `${(d.value / max) * 100}%` : '0%',
                background: PALETTE[i % PALETTE.length],
                transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Requests funnel — pending / approved / rejected (stacked horizontal bars)
export const RequestsFunnel = ({ requests, theme = 'light' }) => {
  const t = THEMES[theme]
  const data = [
    { name: 'Exhibitor applications', ...pick(requests?.events) },
    { name: 'Booth requests', ...pick(requests?.booths) },
    { name: 'Session seat requests', ...pick(requests?.sessions) },
  ]
  const total = data.reduce((s, d) => s + d.pending + d.approved + d.rejected, 0)
  if (total === 0) return <EmptyState theme={theme} text="No requests yet." />
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16, top: 4, bottom: 4 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={t.grid} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: t.axis }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: t.muted }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps(t)} cursor={{ fill: t.grid }} />
            <Bar dataKey="approved" name="Approved" stackId="a" fill={STATUS_COLORS.approved} animationDuration={900} />
            <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.pending} animationDuration={900} />
            <Bar dataKey="rejected" name="Rejected" stackId="a" fill={STATUS_COLORS.rejected} radius={[0, 6, 6, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        {['approved', 'pending', 'rejected'].map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-xs capitalize" style={{ color: t.muted }}>
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

const pick = (c) => ({ pending: c?.pending || 0, approved: c?.approved || 0, rejected: c?.rejected || 0 })

// Donut chart — generic (users by role)
export const SimpleDonut = ({ data = [], theme = 'light', centerLabel = '', centerValue }) => {
  const t = THEMES[theme]
  if (data.length === 0) return <EmptyState theme={theme} text="No data yet." />
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="88%" paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={1000}>
              {data.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip {...tooltipProps(t)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold tabular-nums" style={{ color: t.text }}>{centerValue}</p>
          <p className="text-[11px]" style={{ color: t.muted }}>{centerLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5 text-xs" style={{ color: t.muted }}>
            <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.name} <b style={{ color: t.text }}>{d.value}</b>
          </span>
        ))}
      </div>
    </div>
  )
}
