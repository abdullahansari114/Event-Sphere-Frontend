import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, MapPin, Clock, Users, Tag, Sparkles } from 'lucide-react'
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
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const EventDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to load event')
        const data = await res.json()
        setEvent(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      navigate('/admin/events')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-sm text-gray-400">Loading event...</div>
  }

  if (error) {
    return <div className="p-10 text-center text-sm text-red-500">{error}</div>
  }

  if (!event) return null

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/events')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[event.status] || statusStyle.draft}`}>
              {event.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{event.category || 'Uncategorized'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/events/${event._id}/edit`)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 border border-red-200 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={event.banner || 'https://placehold.co/800x300?text=Event+Banner'}
              alt={event.title}
              className="w-full h-56 object-cover bg-gray-100"
            />
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {event.startTime || '—'} {event.endTime && `- ${event.endTime}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-800">{event.location || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Theme</p>
                <p className="text-sm font-medium text-gray-800">{event.theme || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Overview</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2"><Users size={15} /> Attendees</span>
              <span className="font-semibold text-gray-800">
                {event.registeredAttendees ?? 0} / {event.maxAttendees ?? '∞'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2"><Tag size={15} /> Exhibitors</span>
              <span className="font-semibold text-gray-800">{event.exhibitorCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Booths</span>
              <span className="font-semibold text-gray-800">{event.boothCount ?? 0}</span>
            </div>
          </div>

          {event.tags?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetails
