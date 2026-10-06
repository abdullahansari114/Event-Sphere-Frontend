import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  CalendarDays,
  LayoutGrid,
  ArrowDownWideNarrow,
  Flame,
  Clock,
  PlusCircle,
  Quote,
  Star,
  Mail,
  ShieldCheck,
  Zap,
  HeartHandshake,
} from 'lucide-react'

// Swap this import path with wherever you save the hero photo in your project
import heroBg from '../assets/hero-expo-bg.jpg'
import { API_ORIGIN } from '../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/event`

const PAGE_SIZE = 8

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const diff = Math.ceil((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (diff < 0) return null
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-700',
  Business: 'bg-purple-100 text-purple-700',
  Commerce: 'bg-amber-100 text-amber-700',
  Health: 'bg-emerald-100 text-emerald-700',
  Education: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-700',
}

const SORT_OPTIONS = [
  { value: 'soonest', label: 'Date: Soonest First' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'popular', label: 'Most Registered' },
]

const TESTIMONIALS = [
  {
    quote: 'EventSphere made it effortless to find the right expos for our team. We booked three events in one afternoon.',
    name: 'Sarah Ahmed',
    role: 'Marketing Director, TechVision',
  },
  {
    quote: 'The registration flow was smooth and the event details were always accurate and up to date.',
    name: 'James Carter',
    role: 'CEO, InnovateLabs',
  },
  {
    quote: 'Best platform for discovering industry events. The filters and search saved me so much time.',
    name: 'Ayesha Khan',
    role: 'Product Manager, FutureTech',
  },
]

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Verified Organizers', body: 'Every event is reviewed before it goes live, so listings stay trustworthy.' },
  { icon: Zap, title: 'Real-Time Availability', body: 'Attendee counts and seats update live — no surprises at the door.' },
  { icon: HeartHandshake, title: 'Built for Networking', body: 'Designed to help you find the right room full of the right people.' },
]

// --- Local styles: ambient glows, fade-ins, shimmer skeletons -------------
const PageStyles = () => (
  <style>{`
    @keyframes es-blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(25px, -20px) scale(1.08); }
    }
    .es-blob { animation: es-blob 16s ease-in-out infinite; }

    @keyframes es-zoom {
      from { transform: scale(1); }
      to { transform: scale(1.08); }
    }
    .es-zoom { animation: es-zoom 20s ease-out infinite alternate; }

    @keyframes es-fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .es-fade-up { animation: es-fade-up 0.7s ease-out both; }

    @keyframes es-shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .es-shimmer {
      background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 37%, #eef1f6 63%);
      background-size: 800px 100%;
      animation: es-shimmer 1.6s linear infinite;
    }
  `}</style>
)

// Fires once an element scrolls into view — powers the card entrance animation.
const useInView = (threshold = 0.15) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

const Reveal = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('soonest')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Failed to load events')
        const data = await res.json()
        // Sirf published events public page par dikhengi
        setEvents(data.filter((e) => e.status === 'published'))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Naya search/filter lagte hi pagination reset
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, category, sortBy])

  const categories = ['All', ...new Set(events.map((e) => e.category).filter(Boolean))]

  const filtered = events.filter((e) => {
    const matchesQuery = e.title?.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All' || e.category === category
    return matchesQuery && matchesCategory
  })

  // Spotlight — the soonest upcoming event, only shown when no
  // search/filter is active (default browsing state)
  const today = new Date().setHours(0, 0, 0, 0)
  const upcomingSorted = [...filtered]
    .filter((e) => e.date && new Date(e.date).setHours(0, 0, 0, 0) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const spotlight = !query && category === 'All' ? upcomingSorted[0] : null
  const spotlightCountdown = spotlight ? daysUntil(spotlight.date) : null

  const gridSource = spotlight ? filtered.filter((e) => e._id !== spotlight._id) : filtered

  const sortedGrid = [...gridSource].sort((a, b) => {
    if (sortBy === 'popular') return (b.registeredAttendees ?? 0) - (a.registeredAttendees ?? 0)
    if (sortBy === 'newest') return String(b._id).localeCompare(String(a._id))
    // soonest — undated events pushed to the end
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(a.date) - new Date(b.date)
  })

  const visibleEvents = sortedGrid.slice(0, visibleCount)
  const hasMore = visibleCount < sortedGrid.length

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PageStyles />

      {/* Hero — full-bleed photo, same brand language as the Home hero */}
      <div className="relative overflow-hidden min-h-[420px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Expo hall with attendees and exhibition booths"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1F]/95 via-[#050B1F]/85 to-[#050B1F]" />
        </div>
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center w-full es-fade-up">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 bg-blue-500/15 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Discover What's Happening
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Discover Upcoming <span className="text-blue-400">Events</span>
          </h1>
          <p className="text-gray-200 mt-4 text-lg max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            Explore expos, summits, and conferences happening across the country
          </p>

          <div className="mt-9 max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events by name..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 shadow-2xl shadow-black/30"
            />
          </div>

          {!loading && !error && (
            <div className="flex items-center justify-center gap-8 mt-8 text-gray-300 text-sm">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold">{events.length}</span> Events
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold">{categories.length - 1}</span> Categories
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold">{upcomingSorted.length}</span> Upcoming
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-20">
        {/* Category filter bar — floating glass panel */}
        {categories.length > 1 && (
          <Reveal>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/70 border border-gray-100 p-3 flex flex-wrap items-center gap-2 mb-10">
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      category === c
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0">
                <ArrowDownWideNarrow size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-8 pr-8 py-2 rounded-full text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Reveal>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-40 es-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded es-shimmer" />
                  <div className="h-3 w-full rounded es-shimmer" />
                  <div className="h-3 w-2/3 rounded es-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Reveal>
            <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
              <span className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-red-400" />
              </span>
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          </Reveal>
        ) : filtered.length === 0 ? (
          <Reveal>
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
              </span>
              <p className="text-gray-900 font-semibold mb-1">No events found</p>
              <p className="text-gray-400 text-sm">Try a different search or check back soon!</p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Spotlight — the soonest upcoming event, called out in a big banner card */}
            {spotlight && (
              <Reveal className="mb-10">
                <Link
                  to={`/events/${spotlight._id}`}
                  className="group relative flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.3)] transition-all duration-500"
                >
                  <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md">
                    <Flame className="w-3.5 h-3.5" /> Next Up
                  </span>

                  <div className="relative w-full md:w-[42%] bg-gray-100 overflow-hidden">
                    <img
                      src={spotlight.banner || 'https://placehold.co/700x500?text=Event'}
                      alt={spotlight.title}
                      className="w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                  </div>

                  <div className="flex-1 p-7 md:p-9 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      {spotlight.category && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[spotlight.category] || categoryColors.Other}`}
                        >
                          {spotlight.category}
                        </span>
                      )}
                      {spotlightCountdown && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50">
                          {spotlightCountdown}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {spotlight.title}
                    </h2>
                    <p className="text-gray-500 mb-6 line-clamp-2 max-w-xl">
                      {spotlight.description || 'No description available.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-7 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Calendar size={15} className="text-blue-500" /> {formatDate(spotlight.date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={15} className="text-blue-500" /> {spotlight.location || 'Location TBA'}
                      </span>
                      {spotlight.maxAttendees > 0 && (
                        <span className="flex items-center gap-2">
                          <Users size={15} className="text-blue-500" />
                          {spotlight.registeredAttendees ?? 0} / {spotlight.maxAttendees} registered
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-2 w-fit bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
                      View Event Details <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            {/* Results summary */}
            <Reveal className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{visibleEvents.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{sortedGrid.length}</span> events
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleEvents.map((e, i) => {
                const countdown = daysUntil(e.date)
                const pct = e.maxAttendees > 0 ? Math.min(100, ((e.registeredAttendees ?? 0) / e.maxAttendees) * 100) : 0
                const nearlyFull = e.maxAttendees > 0 && pct >= 80

                return (
                  <Reveal key={e._id} delay={(i % 4) * 90}>
                    <Link
                      to={`/events/${e._id}`}
                      className="group relative block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.25)] hover:-translate-y-2 ring-1 ring-transparent hover:ring-blue-200 transition-all duration-500 h-full"
                    >
                      {/* Top accent bar — expands on hover */}
                      <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-10" />

                      <div className="relative bg-gray-100 overflow-hidden">
                        <img
                          src={e.banner || 'https://placehold.co/500x300?text=Event'}
                          alt={e.title}
                          className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                          {e.category && (
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                                categoryColors[e.category] || categoryColors.Other
                              }`}
                            >
                              {e.category}
                            </span>
                          )}
                          {countdown && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-blue-600/90 backdrop-blur-md shadow-sm">
                              {countdown}
                            </span>
                          )}
                        </div>

                        {nearlyFull && (
                          <span className="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-amber-500/90 backdrop-blur-md shadow-sm">
                            Almost Full
                          </span>
                        )}

                        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 text-white text-xs font-medium bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
                          <MapPin size={12} />
                          <span className="max-w-[100px] truncate">{e.location || 'TBA'}</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 text-xl leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                          {e.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-5">
                          {e.description || 'No description available.'}
                        </p>

                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Calendar size={14} className="text-blue-600" />
                          </span>
                          <span className="text-sm text-gray-600 font-medium">{formatDate(e.date)}</span>
                        </div>

                        {e.maxAttendees > 0 && (
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <Users size={13} className="text-blue-500" />
                                {e.registeredAttendees ?? 0} / {e.maxAttendees} registered
                              </span>
                              <span className={`text-xs font-bold ${nearlyFull ? 'text-amber-600' : 'text-blue-600'}`}>
                                {Math.round(pct)}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  nearlyFull
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                          </span>
                          <span className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-200"
                >
                  Load More Events
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Host-your-own-event CTA */}
      <div className="relative overflow-hidden bg-[#050B1F] py-20">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />
        <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center mb-6">
            <PlusCircle className="w-6 h-6 text-blue-300" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact us to host an event</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Reach thousands of industry professionals. List your expo, summit, or conference on EventSphere and get discovered.
          </p>
          
        </Reveal>
      </div>

      {/* Why trust EventSphere */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-600 mb-3">WHY EVENTSPHERE</p>
            <h2 className="text-3xl font-bold text-gray-900">A Platform Built on Trust</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TRUST_POINTS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                  <span className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-600 mb-3">TESTIMONIALS</p>
            <h2 className="text-3xl font-bold text-gray-900">What Attendees Are Saying</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="h-full bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                  <Quote className="w-7 h-7 text-blue-200 mb-4" />
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.quote}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shrink-0" />
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white py-20 border-t border-gray-100">
        <Reveal className="max-w-2xl mx-auto px-6 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-blue-600" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Never Miss an Event</h2>
          <p className="text-gray-500 mb-8">
            Get the newest expos, summits, and conferences delivered straight to your inbox — no spam, unsubscribe anytime.
          </p>
          <form
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition"
            >
              Subscribe
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  )
}

export default Events
