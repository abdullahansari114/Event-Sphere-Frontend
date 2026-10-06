import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Mail, Phone, Globe, MapPin, Package, CalendarDays, ArrowRight, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ChatModal from '../components/ChatModal'
import { API_ORIGIN } from '../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/event-request/public`

const statusStyles = {
  approved: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  rejected: 'bg-red-50 text-red-500',
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-600',
  'bg-purple-500',
  'bg-teal-500',
]

const colorFor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

const displayName = (exhibitor) => exhibitor?.companyName || exhibitor?.name || 'Exhibitor'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const ExhibitorDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    const fetchExhibitor = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/${id}`)
        if (!res.ok) throw new Error('Failed to load exhibitor')
        const data = await res.json()
        setRequest(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchExhibitor()
  }, [id])

  if (loading) {
    return <div className="p-10 text-center text-sm text-gray-400">Loading exhibitor...</div>
  }

  if (error || !request) {
    return <div className="p-10 text-center text-sm text-red-500">{error || 'Exhibitor not found.'}</div>
  }

  const exhibitor = request.exhibitor || {}
  const event = request.event
  const name = displayName(exhibitor)

  // "Contact Exhibitor" — requires login, and you can't message
  // yourself on your own profile
  const handleContactClick = () => {
    if (!user) {
      toast('Please log in first to message this exhibitor')
      navigate('/login')
      return
    }
    if (user.id === exhibitor._id) {
      toast('This is your own profile')
      return
    }
    setChatOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/exhibitors" className="hover:text-blue-600 transition-colors">Exhibitors</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{name}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <span
                  className={`w-16 h-16 rounded-2xl ${colorFor(name)} flex items-center justify-center text-white text-xl font-bold shrink-0`}
                >
                  {initialsFor(name)}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[request.status] || statusStyles.pending}`}>
                      {request.status}
                    </span>
                  </div>
                  {exhibitor.category && (
                    <p className="text-sm text-blue-600 font-medium mt-0.5">{exhibitor.category}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    {exhibitor.description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Products & Services */}
            {exhibitor.products?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <Package size={16} className="text-blue-600" /> Products &amp; Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exhibitor.products.map((p, i) => (
                    <div key={i} className="px-4 py-3 rounded-xl border border-gray-100 text-sm text-gray-700 font-medium">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event */}
            {event && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <CalendarDays size={16} className="text-blue-600" /> Event
                </h2>
                <Link
                  to={`/events/${event._id}`}
                  className="group flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <img
                    src={event.banner || 'https://placehold.co/120x80?text=Event'}
                    alt={event.title}
                    className="w-24 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {formatDate(event.date)} · {event.venue || event.location || 'Venue TBA'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar — Contact Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit space-y-4">
            <h2 className="font-semibold text-gray-900">Contact Information</h2>

            <div className="space-y-3 text-sm text-gray-600">
              {exhibitor.email && (
                <p className="flex items-center gap-2.5">
                  <Mail size={15} className="text-blue-600 shrink-0" />
                  <span className="truncate">{exhibitor.email}</span>
                </p>
              )}
              {exhibitor.phone && (
                <p className="flex items-center gap-2.5">
                  <Phone size={15} className="text-blue-600 shrink-0" />
                  {exhibitor.phone}
                </p>
              )}
              {exhibitor.website && (
                <p className="flex items-center gap-2.5">
                  <Globe size={15} className="text-blue-600 shrink-0" />
                  <a
                    href={exhibitor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-blue-600 transition-colors"
                  >
                    {exhibitor.website}
                  </a>
                </p>
              )}
              {exhibitor.address && (
                <p className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  <span className="truncate">{exhibitor.address}</span>
                </p>
              )}
              {exhibitor.boothNumber && (
                <p className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-600 shrink-0" />
                  Booth {exhibitor.boothNumber}
                </p>
              )}
            </div>

            <button
              onClick={handleContactClick}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              <MessageCircle size={16} />
              Contact Exhibitor
            </button>
          </div>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        otherUserId={exhibitor._id}
        otherUserName={name}
        otherUserSubtitle={exhibitor.email}
        avatarColor={colorFor(name)}
        avatarInitials={initialsFor(name)}
      />
    </div>
  )
}

export default ExhibitorDetails
