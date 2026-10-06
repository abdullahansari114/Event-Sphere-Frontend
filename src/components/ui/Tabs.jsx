export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="relative inline-grid rounded-xl border border-slate-200 bg-white p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative z-10 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            active === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}