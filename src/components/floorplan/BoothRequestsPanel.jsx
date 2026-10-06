import { useEffect, useMemo, useState } from 'react'
import { Check, X, Calendar } from 'lucide-react'
import { API_ORIGIN } from '../../config/api'

const REQUEST_API = `${API_ORIGIN}/api/v1/booth-request`

const statusStyle = {
  approved: 'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  rejected: 'bg-red-50 text-red-500',
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BoothRequestsPanel() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(REQUEST_API, { credentials: 'include', cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load booth requests')
      setRequests(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleAction = async (id, status) => {
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

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests])

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  )

  return (
    <div className="space-y-3">
      {/* Status filter tabs — lets admin quickly see Approved / Rejected booth lists */}
      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label} <span className="text-xs opacity-70">({counts[f.id]})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading requests...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {filter === 'all' ? 'No booth requests yet.' : `No ${filter} booth requests.`}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Exhibitor</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Booths</th>
                <th className="px-5 py-3 font-medium">Requested On</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{r.exhibitor?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{r.exhibitor?.email || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{r.event?.title || 'Event removed'}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {(r.booths || []).map((b) => b.boothNumber).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(r.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[r.status] || statusStyle.pending}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'pending' ? (
                        <>
                          <button onClick={() => handleAction(r._id, 'approved')} disabled={actingId === r._id} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-60">
                            <Check size={14} /> Approve
                          </button>
                          <button onClick={() => handleAction(r._id, 'rejected')} disabled={actingId === r._id} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60">
                            <X size={14} /> Reject
                          </button>
                        </>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}