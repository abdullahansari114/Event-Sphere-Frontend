import { useState, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { API_ORIGIN } from '../../config/api'

const REQUEST_API = `${API_ORIGIN}/api/v1/event-request`

const statusStyle = {
  approved: 'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  rejected: 'bg-red-50 text-red-500',
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ExhibitorApplications = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${REQUEST_API}/mine`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load applications')
      const data = await res.json()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of your event join requests</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading applications...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            You haven't requested to join any event yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Requested On</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.event?.banner || 'https://placehold.co/64x48?text=Event'}
                        alt={r.event?.title}
                        className="w-14 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <p className="font-medium text-gray-800">{r.event?.title || 'Event removed'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(r.event?.date)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {r.event?.location || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[r.status] || statusStyle.pending
                      }`}
                    >
                      {r.status}
                    </span>
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

export default ExhibitorApplications