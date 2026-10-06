import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Wrench, Search, X, Building2, MapPin, ArrowRight, ShoppingBag } from 'lucide-react'
import { API_ORIGIN } from '../config/api'

const PRODUCT_API = `${API_ORIGIN}/api/v1/product`

const formatPrice = (price) =>
  price === null || price === undefined ? 'Contact for price' : `PKR ${Number(price).toLocaleString('en-PK')}`

const TypeBadge = ({ type, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      type === 'service' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
    } ${className}`}
  >
    {type === 'service' ? <Wrench size={11} /> : <Package size={11} />}
    {type === 'service' ? 'Service' : 'Product'}
  </span>
)

const Placeholder = ({ type, size = 32 }) => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 text-blue-200">
    {type === 'service' ? <Wrench size={size} /> : <Package size={size} />}
  </div>
)

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

/**
 * "Products & Services" section for the attendee's event details page.
 * Usage:  <EventProducts eventId={id} />
 */
const EventProducts = ({ eventId }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [typeFilter, setTypeFilter] = useState('all')
  const [exhibitorFilter, setExhibitorFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${PRODUCT_API}/event/${eventId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Could not load products')
        const data = await res.json()
        if (!cancelled) setProducts(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [eventId])

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const exhibitors = useMemo(() => {
    const map = new Map()
    products.forEach((p) => p.exhibitor && map.set(p.exhibitor._id, p.exhibitor))
    return [...map.values()]
  }, [products])

  const counts = useMemo(
    () => ({
      all: products.length,
      product: products.filter((p) => p.type === 'product').length,
      service: products.filter((p) => p.type === 'service').length,
    }),
    [products],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (exhibitorFilter !== 'all' && p.exhibitor?._id !== exhibitorFilter) return false
      if (q && !`${p.name} ${p.category} ${p.description} ${p.exhibitor?.companyName || ''}`.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [products, typeFilter, exhibitorFilter, search])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_14px_rgba(15,23,42,0.06)]">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-gray-900">Products & Services</h3>
        {products.length > 0 && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-gray-400">What our exhibitors will be showcasing at this event</p>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          Loading products...
        </div>
      ) : error ? (
        <p className="py-4 text-sm text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
          <ShoppingBag size={22} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">Exhibitors haven't added their products yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[
                ['all', 'All'],
                ['product', 'Products'],
                ['service', 'Services'],
              ]
                .filter(([key]) => key === 'all' || counts[key] > 0)
                .map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTypeFilter(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      typeFilter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label} <span className="text-gray-400">{counts[key]}</span>
                  </button>
                ))}
            </div>

            {exhibitors.length > 1 && (
              <select
                value={exhibitorFilter}
                onChange={(e) => setExhibitorFilter(e.target.value)}
                className="max-w-[10rem] rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All exhibitors</option>
                {exhibitors.map((ex) => (
                  <option key={ex._id} value={ex._id}>{ex.companyName}</option>
                ))}
              </select>
            )}

            <div className="relative ml-auto w-full sm:w-44">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Nothing matches your search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelected(p)}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="relative h-36 overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Placeholder type={p.type} />
                    )}
                    <TypeBadge type={p.type} className="absolute left-2.5 top-2.5 bg-white/95 shadow-sm" />
                  </div>
                  <div className="p-3.5">
                    <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                      <Building2 size={11} className="shrink-0" /> {p.exhibitor?.companyName}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold ${p.price === null ? 'text-gray-400' : 'text-blue-600'}`}>
                        {formatPrice(p.price)}
                      </span>
                      {p.category && (
                        <span className="truncate rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== Detail modal ==================== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm hover:text-gray-800"
            >
              <X size={16} />
            </button>

            <div className="h-56 bg-gray-50">
              {selected.image ? (
                <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
              ) : (
                <Placeholder type={selected.type} size={48} />
              )}
            </div>

            <div className="p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={selected.type} />
                {selected.category && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {selected.category}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
              <p className={`mt-1 text-lg font-semibold ${selected.price === null ? 'text-gray-400' : 'text-blue-600'}`}>
                {formatPrice(selected.price)}
              </p>

              {selected.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{selected.description}</p>
              ) : (
                <p className="mt-3 text-sm text-gray-400">No description provided.</p>
              )}

              {/* Exhibitor */}
              <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Offered by</p>
                <div className="flex items-center gap-3">
                  {selected.exhibitor?.avatar ? (
                    <img src={selected.exhibitor.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {initials(selected.exhibitor?.companyName)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{selected.exhibitor?.companyName}</p>
                    {selected.exhibitor?.category && (
                      <p className="truncate text-xs text-gray-500">{selected.exhibitor.category}</p>
                    )}
                  </div>
                </div>

                {selected.exhibitor?.booths?.length > 0 && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-blue-500" />
                    <span>
                      Find them at booth <span className="font-semibold">{selected.exhibitor.booths.join(', ')}</span>
                    </span>
                  </p>
                )}

                {selected.exhibitor?.profileId && (
                  <Link
                    to={`/exhibitors/${selected.exhibitor.profileId}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View exhibitor profile <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventProducts