import { useEffect, useState, useMemo } from 'react'
import {
  LayoutGrid, ClipboardList, RotateCw, X, Check, User2, Store,
  CircleDot, ChevronDown, Rows3, Columns3,
} from 'lucide-react'
import BoothGrid from '../../components/floorplan/BoothGrid'
import BoothRequestsPanel from '../../components/floorplan/BoothRequestsPanel'
import { eventService } from '../../services/eventService'
import { floorPlanService } from '../../services/floorPlanService'
import { exhibitorService } from '../../services/exhibitorService'
import { boothService } from '../../services/boothService'
import { API_ORIGIN } from '../../config/api'

const BOOTH_REQUEST_API = `${API_ORIGIN}/api/v1/booth-request`

const STAT_CARDS = [
  { key: 'total', label: 'Total Booths', icon: LayoutGrid, ring: 'ring-slate-200', bg: 'bg-slate-50', text: 'text-slate-700', bar: 'bg-slate-400' },
  { key: 'available', label: 'Available', icon: CircleDot, ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  { key: 'reserved', label: 'Reserved', icon: CircleDot, ring: 'ring-amber-100', bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
  { key: 'occupied', label: 'Occupied', icon: CircleDot, ring: 'ring-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
]

export default function AdminBooths() {
  const [view, setView] = useState('floorplan')
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [grid, setGrid] = useState({ rows: 0, cols: 0, booths: [] })
  const [exhibitors, setExhibitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [assignTo, setAssignTo] = useState('')
  const [acting, setActing] = useState(false)
  const [rowsInput, setRowsInput] = useState(5)
  const [colsInput, setColsInput] = useState(10)
  const [pendingBoothCount, setPendingBoothCount] = useState(0)

  useEffect(() => {
    eventService.getAll().then((evts) => {
      setEvents(evts)
      if (evts.length) setEventId(evts[0]._id)
    })
  }, [])

  // Small badge on the "Booth Requests" tab so pending count is visible without switching view
  useEffect(() => {
    fetch(BOOTH_REQUEST_API, { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPendingBoothCount((data || []).filter((r) => r.status === 'pending').length))
      .catch(() => {})
  }, [view])

  const loadGrid = async (id) => {
    setLoading(true)
    try {
      const data = await floorPlanService.get(id)
      setGrid(data)
      setRowsInput(data.rows || 5)
      setColsInput(data.cols || 10)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!eventId) return
    loadGrid(eventId)
    exhibitorService.getForEvent(eventId).then(setExhibitors)
  }, [eventId])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await floorPlanService.generateGrid(eventId, Number(rowsInput), Number(colsInput))
      setGrid(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const openBooth = (booth) => { setSelected(booth); setAssignTo('') }

  const handleAssign = async () => {
    if (!assignTo) return
    setActing(true)
    try {
      await boothService.assign(selected._id, assignTo)
      await loadGrid(eventId)
      setSelected(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setActing(false)
    }
  }

  const handleRelease = async () => {
    setActing(true)
    try {
      await boothService.unassign(selected._id)
      await loadGrid(eventId)
      setSelected(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setActing(false)
    }
  }

  const stats = useMemo(() => {
    const booths = grid.booths || []
    return {
      total: booths.length,
      available: booths.filter((b) => b.status === 'available').length,
      reserved: booths.filter((b) => b.status === 'reserved').length,
      occupied: booths.filter((b) => b.status === 'occupied').length,
    }
  }, [grid.booths])

  const activeEvent = events.find((e) => e._id === eventId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booth Management</h1>
          <p className="text-sm text-gray-500 mt-1">Build the expo hall's fixed grid and manage booths</p>
        </div>

        {/* Sliding segmented switch — replaces the old plain Tabs toggle */}
        <div className="relative inline-grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
          <span
            className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out"
            style={{ transform: view === 'requests' ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
          />
          <button
            type="button"
            onClick={() => setView('floorplan')}
            className={`relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              view === 'floorplan' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid size={15} /> Booth Grid
          </button>
          <button
            type="button"
            onClick={() => setView('requests')}
            className={`relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              view === 'requests' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={15} /> Booth Requests
            {pendingBoothCount > 0 && (
              <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {pendingBoothCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {view === 'requests' ? (
        <BoothRequestsPanel />
      ) : !events.length ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
          <span className="text-sm">Loading events...</span>
        </div>
      ) : (
        <>
          {/* Event picker */}
          <div className="relative max-w-xs">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {events.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAT_CARDS.map((card) => (
              <div key={card.key} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className={`absolute inset-y-0 left-0 w-1 ${card.bar}`} />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg} ${card.text}`}>
                    <card.icon size={14} />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-800">{stats[card.key]}</p>
              </div>
            ))}
          </div>

          {/* Grid size settings */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Rows3 size={13} /> Rows
                </span>
                <input
                  type="number" min={1} max={50}
                  value={rowsInput}
                  onChange={(e) => setRowsInput(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Columns3 size={13} /> Columns
                </span>
                <input
                  type="number" min={1} max={50}
                  value={colsInput}
                  onChange={(e) => setColsInput(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </label>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {generating ? <RotateCw size={14} className="animate-spin" /> : <LayoutGrid size={14} />}
                {generating ? 'Generating...' : grid.rows ? 'Update Grid' : 'Generate Grid'}
              </button>
              <p className="w-full text-xs text-slate-400 sm:w-auto sm:flex-1">
                Total booths: <span className="font-semibold text-slate-500">{(Number(rowsInput) || 0) * (Number(colsInput) || 0)}</span>.
                {' '}Shrinking the grid will require releasing reserved/occupied booths first.
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Available
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Reserved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Occupied
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
              <span className="text-sm">Loading grid...</span>
            </div>
          ) : (
            <BoothGrid rows={grid.rows} cols={grid.cols} booths={grid.booths} onCellClick={openBooth} />
          )}
        </>
      )}

      {/* Booth detail modal — fully custom, self-contained styling */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Store size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Booth {selected.boothNumber}</p>
                  <p className="text-xs text-slate-400">{activeEvent?.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    selected.status === 'available'
                      ? 'bg-blue-50 text-blue-700'
                      : selected.status === 'reserved'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {selected.status}
                </span>
              </div>

              {selected.exhibitor && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Exhibitor</span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <User2 size={13} className="text-slate-400" /> {selected.exhibitor.name}
                  </span>
                </div>
              )}

              {selected.status === 'available' && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500">Assign to Exhibitor</span>
                  <div className="relative">
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    >
                      <option value="">Select Exhibitor</option>
                      {exhibitors.map((x) => (
                        <option key={x._id} value={x._id}>{x.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </label>
              )}

              {selected.status === 'reserved' && (
                <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                  This booth is reserved because of a pending request from an exhibitor — approve/reject it in the "Booth Requests" tab, or force-release it from here.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {selected.status === 'available' ? (
                <button
                  onClick={handleAssign}
                  disabled={acting || !assignTo}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Check size={14} /> {acting ? 'Assigning...' : 'Assign'}
                </button>
              ) : (
                <button
                  onClick={handleRelease}
                  disabled={acting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  <X size={14} /> {acting ? 'Releasing...' : 'Release Booth'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}