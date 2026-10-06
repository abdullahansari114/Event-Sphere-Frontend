import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Send, CheckCircle2, Clock, Users, PartyPopper, ArrowRight } from 'lucide-react'
import { API_ORIGIN } from '../../config/api'

const EVENT_API = `${API_ORIGIN}/api/v1/event`
const REQUEST_API = `${API_ORIGIN}/api/v1/event-request`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Success popup shown after a request is sent
const RequestSentModal = ({ eventTitle, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 text-center animate-[fadeIn_0.2s_ease-out]">
      <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-5">
        <PartyPopper className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Request Sent!</h2>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        Your request to join <span className="font-semibold text-gray-700">"{eventTitle}"</span> has
        been submitted. Once it's approved, you'll be notified — now let's pick your booth.
      </p>
      <button
        onClick={onClose}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
      >
        Select my booth <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)

const ExhibitorEvents = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingId, setSendingId] = useState(null)
  const [sentModal, setSentModal] = useState(null) // { title } | null

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [eventsRes, requestsRes] = await Promise.all([
        fetch(EVENT_API, { credentials: 'include' }),
        fetch(`${REQUEST_API}/mine`, { credentials: 'include' }),
      ])
      if (!eventsRes.ok) throw new Error('Failed to load events')
      if (!requestsRes.ok) throw new Error('Failed to load your requests')

      const eventsData = await eventsRes.json()
      const requestsData = await requestsRes.json()

      setEvents(eventsData.filter((e) => e.status === 'published'))
      setMyRequests(requestsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getRequestForEvent = (eventId) =>
    myRequests.find((r) => r.event?._id === eventId)

  const handleRequest = async (event) => {
    setSendingId(event._id)
    setError('')
    try {
      const res = await fetch(REQUEST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId: event._id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to send request')

      setMyRequests((prev) => [data, ...prev])
      setSentModal({ title: event.title })
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-sm text-gray-500 mt-1">Browse published events and request to join</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-sm text-gray-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-100">
          No published events available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => {
            const request = getRequestForEvent(e._id)
            const isApproved = request?.status === 'approved'

            return (
              <Link
                key={e._id}
                to={`/exhibitor/events/${e._id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <img
                  src={e.banner || 'https://placehold.co/400x200?text=Event'}
                  alt={e.title}
                  className="w-full h-36 object-cover bg-gray-100"
                />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-semibold text-gray-800">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.category || '—'}</p>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {formatDate(e.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} /> {e.location || '—'}
                    </div>
                    {isApproved && (
                      <div className="flex items-center gap-2 text-blue-600 font-medium">
                        <Users size={14} />
                        {e.registeredAttendees ?? 0}
                        {e.maxAttendees > 0 ? ` / ${e.maxAttendees}` : ''} attendees registered
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-2">
                    {request ? (
                      <div
                        className={`flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg ${
                          request.status === 'approved'
                            ? 'bg-green-50 text-green-600'
                            : request.status === 'rejected'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}
                      >
                        {request.status === 'approved' ? (
                          <>
                            <CheckCircle2 size={16} /> Approved
                          </>
                        ) : request.status === 'rejected' ? (
                          'Rejected'
                        ) : (
                          <>
                            <Clock size={16} /> Request Pending
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation()
                          ev.preventDefault()
                          handleRequest(e)
                        }}
                        disabled={sendingId === e._id}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        <Send size={15} />
                        {sendingId === e._id ? 'Sending...' : 'Request to Join'}
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {sentModal && (
        <RequestSentModal
          eventTitle={sentModal.title}
          onClose={() => {
            setSentModal(null)
            navigate('/exhibitor/booths')
          }}
        />
      )}
    </div>
  )
}

export default ExhibitorEvents
