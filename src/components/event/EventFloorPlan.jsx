import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, ArrowRight } from 'lucide-react'
import { CARD } from './eventUtils'

const boothLabel = (booth) => `R${booth.row}-C${booth.col}`

/**
 * "Floor Plan" tab — shows only the booths that actually have an exhibitor
 * placed on them, as a compact list of clearly-labeled booth chips rather
 * than a full sparse grid (which left huge empty gaps and needed scrolling).
 * props: floorPlan { rows, cols, booths }, exhibitors, loading
 */
const EventFloorPlan = ({ floorPlan, exhibitors, loading }) => {
  const [selectedId, setSelectedId] = useState(null)
  const { booths } = floorPlan

  const exhibitorBooths = useMemo(() => booths.filter((b) => b.exhibitor), [booths])

  if (loading) return <p className="py-10 text-center text-sm text-gray-400">Loading floor plan...</p>

  if (exhibitorBooths.length === 0) {
    return (
      <div className={`${CARD} px-6 py-14 text-center`}>
        <LayoutGrid size={28} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">No exhibitors have been placed on the floor plan yet.</p>
      </div>
    )
  }

  const selected = exhibitorBooths.find((b) => b._id === selectedId)
  const selectedExhibitor = selected?.exhibitor && exhibitors.find((e) => String(e._id) === String(selected.exhibitor._id))

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-5`}>
        <p className="mb-4 text-xs text-gray-500">
          Exhibitor booths <span className="font-semibold text-gray-800">{exhibitorBooths.length}</span>
        </p>

        <div className="flex flex-wrap gap-3">
          {exhibitorBooths.map((booth) => {
            const isSelected = booth._id === selectedId
            return (
              <button
                key={booth._id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : booth._id)}
                className={`flex min-w-[104px] flex-col items-start gap-0.5 rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'border-rose-500 bg-rose-100'
                    : 'border-rose-300 bg-rose-50 hover:border-rose-400 hover:bg-rose-100'
                }`}
              >
                <span className="text-sm font-bold text-rose-700">{boothLabel(booth)}</span>
                <span className="truncate text-xs text-rose-600/80">{booth.exhibitor.companyName}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`${CARD} px-5 py-4 text-sm`}>
        {selected ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">Booth {boothLabel(selected)}</p>
              <p className="text-gray-500">Occupied by {selected.exhibitor.companyName}</p>
            </div>
            {selectedExhibitor && (
              <Link
                to={`/exhibitors/${selectedExhibitor.profileId}`}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                View exhibitor <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Tap a booth to see who's there.</p>
        )}
      </div>
    </div>
  )
}

export default EventFloorPlan