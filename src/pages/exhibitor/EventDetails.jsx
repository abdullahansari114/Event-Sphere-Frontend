import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_ORIGIN } from '../../config/api'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  ClockIcon,
  XCircle,
  Send,
} from 'lucide-react'

const EVENT_API = `${API_ORIGIN}/api/v1/event`
const REQUEST_API = `${API_ORIGIN}/api/v1/event-request`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const ExhibitorEventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [eventRes, requestsRes] = await Promise.all([
        fetch(`${EVENT_API}/${id}`, { credentials: 'include' }),
        fetch(`${REQUEST_API}/mine`, { credentials: 'include' }),
      ])
      if (!eventRes.ok) throw new Error('Event not found')
      if (!requestsRes.ok) throw new Error('Failed to load your request status')

      const eventData = await eventRes.json()
      const requestsData = await requestsRes.json()

      setEvent(eventData)
      setRequest(requestsData.find((r) => r.event?._id === id) || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleRequest = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch(REQUEST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to send request')
      setRequest(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-sm text-gray-400">Loading event...</div>
  }

  if (error && !event) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/exhibitor/events')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>
        <div className="p-10 text-center text-sm text-red-500 bg-white rounded-2xl border border-gray-100">
          {error}
        </div>
      </div>
    )
  }

  if (!event) return null

  const isApproved = request?.status === 'approved'
  const isUnlimited = !event.maxAttendees || event.maxAttendees <= 0

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/exhibitor/events')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <img
          src={event.banner || 'https://placehold.co/1000x300?text=Event'}
          alt={event.title}
          className="w-full h-56 object-cover bg-gray-100"
        />
        <div className="p-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            {event.category && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                {event.category}
              </span>
            )}
          </div>
          {event.theme && <p className="text-sm text-gray-500 mt-1">{event.theme}</p>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-1.5">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
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

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
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
            {isApproved && (
              <div className="flex items-start gap-3">
                <Users size={18} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Attendees</p>
                  <p className="text-sm font-medium text-gray-800">
                    {event.registeredAttendees ?? 0}
                    {!isUnlimited ? ` / ${event.maxAttendees}` : ''} registered
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Your Request</h3>

            {request ? (
              request.status === 'approved' ? (
                <div className="flex items-center gap-2 text-sm font-medium bg-green-50 text-green-600 py-2.5 rounded-lg justify-center">
                  <CheckCircle2 size={16} /> Approved
                </div>
              ) : request.status === 'rejected' ? (
                <div className="flex items-center gap-2 text-sm font-medium bg-red-50 text-red-500 py-2.5 rounded-lg justify-center">
                  <XCircle size={16} /> Rejected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium bg-yellow-50 text-yellow-600 py-2.5 rounded-lg justify-center">
                  <ClockIcon size={16} /> Request Pending
                </div>
              )
            ) : (
              <button
                onClick={handleRequest}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <Send size={15} />
                {sending ? 'Sending...' : 'Request to Join'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExhibitorEventDetails