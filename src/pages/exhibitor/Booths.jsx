import { useEffect, useState } from 'react'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import BoothGrid from '../../components/floorplan/BoothGrid'
import { floorPlanService } from '../../services/floorPlanService'
import { boothRequestService } from '../../services/boothRequestService'
import { isContiguousGroup } from '../../utils/gridUtils'
import { useToast } from '../../context/ToastContext'
import { API_ORIGIN } from '../../config/api'

const EVENT_REQUEST_API = `${API_ORIGIN}/api/v1/event-request/mine`

export default function ExhibitorBooths() {
  const { toast } = useToast()
  const [approvedEvents, setApprovedEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [grid, setGrid] = useState({ rows: 0, cols: 0, booths: [] })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(EVENT_REQUEST_API, { credentials: 'include', cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const approved = (data || []).filter((r) => r.status === 'approved' && r.event)
        setApprovedEvents(approved)
        if (approved.length) setEventId(approved[0].event._id)
        else setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    setSelectedIds(new Set())
    floorPlanService.get(eventId).then(setGrid).finally(() => setLoading(false))
  }, [eventId])

  const selectedBooths = grid.booths.filter((b) => selectedIds.has(b._id))
  const contiguous = isContiguousGroup(selectedBooths)

  const toggleBooth = (booth) => {
    if (booth.status !== 'available' && !selectedIds.has(booth._id)) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(booth._id)) next.delete(booth._id)
      else next.add(booth._id)
      return next
    })
  }

  const submitRequest = async () => {
    setSubmitting(true)
    try {
      await boothRequestService.create([...selectedIds], message)
      toast(`Request sent for ${selectedIds.size} booth(s)`)
      setSelectedIds(new Set())
      setMessage('')
      setConfirmOpen(false)
      const data = await floorPlanService.get(eventId)
      setGrid(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booth Selection</h1>
        <p className="text-sm text-gray-500 mt-1">Select one or more adjacent booths from the grid</p>
      </div>

      {approvedEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-400">
          You don't have any approved event join requests. Send a request for an event first.
        </div>
      ) : (
        <>
          <div className="max-w-xs">
            <Select value={eventId} onChange={(e) => setEventId(e.target.value)} options={approvedEvents.map((r) => ({ value: r.event._id, label: r.event.title }))} />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /> Available</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" /> Reserved</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Occupied</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-700" /> Selected</span>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading booths..." />
          ) : (
            <BoothGrid rows={grid.rows} cols={grid.cols} booths={grid.booths} selectable selectedIds={selectedIds} onCellClick={toggleBooth} />
          )}

          {selectedIds.size > 0 && (
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4 sticky bottom-4">
              <div>
                <p className="text-sm font-medium text-ink-800">{selectedIds.size} booth(s) selected</p>
                {!contiguous && <p className="text-xs text-red-500">These booths aren't adjacent to each other — only adjacent booths can be requested together.</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSelectedIds(new Set())}>Clear</Button>
                <Button onClick={() => setConfirmOpen(true)} disabled={!contiguous}>Send Request</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Booth Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={submitRequest} disabled={submitting}>{submitting ? 'Sending...' : 'Confirm & Send'}</Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-ink-600">Booths: <span className="font-medium">{selectedBooths.map((b) => b.boothNumber).join(', ')}</span></p>
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input-base"
              placeholder="Write a note for the admin here, if you'd like..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}