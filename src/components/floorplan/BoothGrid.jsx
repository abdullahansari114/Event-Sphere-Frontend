import { STATUS_STYLES, SELECTED_STYLE } from '../../utils/gridUtils'

// Inline, self-contained scrollbar styling — no separate CSS file edit needed.
const ScrollbarStyle = () => (
  <style>{`
    .booth-scroll {
      scrollbar-width: thin;
      scrollbar-color: #60a5fa #eef2f7;
    }
    .booth-scroll::-webkit-scrollbar {
      height: 12px;
      width: 12px;
    }
    .booth-scroll::-webkit-scrollbar-track {
      background: #eef2f7;
      border-radius: 999px;
    }
    .booth-scroll::-webkit-scrollbar-thumb {
      background-color: #60a5fa;
      border-radius: 999px;
      border: 3px solid #eef2f7;
    }
    .booth-scroll::-webkit-scrollbar-thumb:hover {
      background-color: #3b82f6;
    }
    .booth-scroll::-webkit-scrollbar-corner {
      background: transparent;
    }
  `}</style>
)

export default function BoothGrid({ rows, cols, booths, selectable = false, selectedIds = new Set(), onCellClick }) {
  if (!rows || !cols) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        No grid has been generated for this event yet.
      </div>
    )
  }

  const boothMap = new Map(booths.map((b) => [`${b.row}-${b.col}`, b]))

  return (
    <div className="w-full max-w-full">
      <ScrollbarStyle />
      <div className="booth-scroll w-full max-w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className="grid gap-2 w-max"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(38px, 1fr))` }}
      >
        {Array.from({ length: rows }).map((_, ri) =>
          Array.from({ length: cols }).map((__, ci) => {
            const row = ri + 1
            const col = ci + 1
            const booth = boothMap.get(`${row}-${col}`)
            if (!booth) return <div key={`${row}-${col}`} />

            const isSelected = selectedIds.has(booth._id)
            const clickable = selectable ? booth.status === 'available' || isSelected : true
            const style = isSelected ? SELECTED_STYLE : (STATUS_STYLES[booth.status] || STATUS_STYLES.available)

            return (
              <button
                key={booth._id}
                type="button"
                disabled={!clickable}
                onClick={() => onCellClick?.(booth)}
                title={`${booth.boothNumber}${booth.exhibitor ? ` — ${booth.exhibitor.name}` : ''}`}
                className={`h-10 w-10 rounded-lg border text-[10px] font-semibold flex items-center justify-center shadow-sm transition-all duration-150 ${style} ${
                  clickable ? 'hover:scale-110 hover:shadow-md hover:z-10 active:scale-95' : 'opacity-60'
                } ${isSelected ? 'scale-105 shadow-md ring-2 ring-blue-300 ring-offset-1' : ''}`}
              >
                {row}.{col}
              </button>
            )
          }),
        )}
      </div>
      </div>
    </div>
  )
}