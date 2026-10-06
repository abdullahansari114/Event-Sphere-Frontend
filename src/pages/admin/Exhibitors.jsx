import { useState, useEffect, useMemo } from 'react'
import { Search, Check, X, Calendar, Building2, Mail, LayoutGrid, ChevronRight } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { API_ORIGIN } from '../../config/api'

const REQUEST_API = `${API_ORIGIN}/api/v1/event-request`
const BOOTH_REQUEST_API = `${API_ORIGIN}/api/v1/booth-request`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const AdminExhibitors = () => {
  const [requests, setRequests] = useState([])
  const [boothRequests, setBoothRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [actingId, setActingId] = useState(null)
  const [selectedId, setSelectedId] = useState(null) // _id of the event-request row currently open in modal

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [evRes, boothRes] = await Promise.all([
        fetch(REQUEST_API, { credentials: 'include' }),
        fetch(BOOTH_REQUEST_API, { credentials: 'include' }),
      ])
      if (!evRes.ok) throw new Error('Failed to load exhibitor requests')
      const evData = await evRes.json()
      setRequests(evData)
      if (boothRes.ok) {
        setBoothRequests(await boothRes.json())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // Accept/Reject an EVENT request
  const handleEventAction = async (id, status) => {
    setActingId(id)
    try {
      const res = await fetch(`${REQUEST_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update request')
      setRequests((prev) => prev.map((r) => (r._id === id ? data : r)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActingId(null)
    }
  }

  // Accept/Reject a BOOTH request
  const handleBoothAction = async (id, status) => {
    setActingId(id)
    try {
      const res = await fetch(`${BOOTH_REQUEST_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to update request')
      setBoothRequests((prev) => prev.map((b) => (b._id === id ? data : b)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActingId(null)
    }
  }

  const filtered = requests.filter((r) => {
    const name = r.exhibitor?.name || r.exhibitor?.email || ''
    const eventTitle = r.event?.title || ''
    const term = query.toLowerCase()
    return name.toLowerCase().includes(term) || eventTitle.toLowerCase().includes(term)
  })

  // Currently open row (re-derived from `requests` so it stays in sync after accept/reject)
  const selected = useMemo(
    () => requests.find((r) => r._id === selectedId) || null,
    [requests, selectedId],
  )

  // Booth requests belonging to the same exhibitor (and same event, if the event still exists)
  const relatedBoothRequests = useMemo(() => {
    if (!selected?.exhibitor?._id) return []
    return boothRequests.filter((b) => {
      const sameExhibitor = b.exhibitor?._id === selected.exhibitor._id
      const sameEvent = !selected.event?._id || !b.event?._id || b.event._id === selected.event._id
      return sameExhibitor && sameEvent
    })
  }, [boothRequests, selected])

  const openDetails = (r) => {
    if (!r.exhibitor?._id) return // no linked exhibitor account, nothing to show
    setSelectedId(r._id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exhibitors</h1>
        <p className="text-sm text-gray-500 mt-1">Event join requests from exhibitors</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by exhibitor or event..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading requests...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No exhibitor requests found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Exhibitor</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Requested On</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r._id}
                  onClick={() => openDetails(r)}
                  className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 ${
                    r.exhibitor?._id ? 'cursor-pointer' : 'cursor-default opacity-70'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{r.exhibitor?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{r.exhibitor?.email || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{r.event?.title || 'Event removed'}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(r.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 text-xs font-medium text-blue-600">
                      View <ChevronRight size={14} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal: exhibitor's event request + booth request(s), each with its own accept/reject */}
      <Modal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.exhibitor?.name || 'Exhibitor Details'}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            {/* Exhibitor contact */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={14} className="text-gray-400" />
              {selected.exhibitor?.email || '—'}
            </div>

            {/* Event Request section */}
            <div className="rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
                <Calendar size={15} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-800">Event Join Request</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selected.event?.title || 'Event removed'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Requested on {formatDate(selected.createdAt)}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                {selected.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleEventAction(selected._id, 'approved')}
                      disabled={actingId === selected._id}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-60"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => handleEventAction(selected._id, 'rejected')}
                      disabled={actingId === selected._id}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Booth Request(s) section */}
            <div className="rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
                <LayoutGrid size={15} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-800">Booth Request(s)</h4>
              </div>

              {relatedBoothRequests.length === 0 ? (
                <div className="p-4 text-xs text-gray-400">
                  This exhibitor hasn't sent a booth request yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {relatedBoothRequests.map((b) => (
                    <div key={b._id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Booths: {(b.booths || []).map((bt) => bt.boothNumber).join(', ') || '—'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {b.event?.title || 'Event removed'} · Requested on {formatDate(b.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>

                      {b.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBoothAction(b._id, 'approved')}
                            disabled={actingId === b._id}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-60"
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleBoothAction(b._id, 'rejected')}
                            disabled={actingId === b._id}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
              <Building2 size={13} /> Exhibitor account id: {selected.exhibitor?._id}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminExhibitors