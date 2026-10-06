import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { API_ORIGIN } from '../../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/event`

const statusStyle = {
  published: 'bg-green-50 text-green-600',
  draft: 'bg-gray-100 text-gray-500',
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const AdminEvents = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_BASE, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      setEvents((prev) => prev.filter((e) => e._id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = events.filter((e) => {
    const matchesQuery = e.title?.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all events on the platform</p>
        </div>
        <button
          onClick={() => navigate('/admin/events/create')}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading events...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No events found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Exhibitors</th>
                <th className="px-5 py-3 font-medium">Attendees</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={e.banner || 'https://placehold.co/64x48?text=Event'}
                        alt={e.title}
                        className="w-14 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{e.title}</p>
                        <p className="text-xs text-gray-400">{e.category || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(e.date)}</td>
                  <td className="px-5 py-3.5 text-gray-600">{e.location || '—'}</td>
                  <td className="px-5 py-3.5 text-blue-600 font-medium">{e.exhibitorCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-blue-600 font-medium">{e.registeredAttendees ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[e.status] || statusStyle.draft}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/events/${e._id}`)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                        title="View"
                      >
                        <Eye size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/events/${e._id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
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

export default AdminEvents