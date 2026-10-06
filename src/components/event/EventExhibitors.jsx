import { Link } from 'react-router-dom'
import { Building2, MapPin, Package, ArrowRight } from 'lucide-react'
import { CARD, initials } from './eventUtils'

/**
 * "Exhibitors" tab — is event ke approved exhibitors.
 * props: exhibitors (public API se), loading
 */
const EventExhibitors = ({ exhibitors, loading }) => {
  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading exhibitors...</p>
  }

  if (exhibitors.length === 0) {
    return (
      <div className={`${CARD} px-6 py-14 text-center`}>
        <Building2 size={28} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">Exhibitors for this event will be announced soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {exhibitors.map((ex) => (
        <div key={ex._id} className={`${CARD} flex flex-col p-5 transition-shadow hover:shadow-[0_6px_24px_rgba(15,23,42,0.10)]`}>
          <div className="flex items-center gap-3">
            {ex.avatar ? (
              <img src={ex.avatar} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                {initials(ex.companyName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{ex.companyName}</p>
              {ex.category && <p className="truncate text-xs text-gray-500">{ex.category}</p>}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-gray-500">
            {ex.description || 'No description added yet.'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {ex.booths.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <MapPin size={12} /> Booth {ex.booths.join(', ')}
              </span>
            )}
            {ex.productCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                <Package size={12} /> {ex.productCount} {ex.productCount === 1 ? 'product' : 'products'}
              </span>
            )}
          </div>

          <Link
            to={`/exhibitors/${ex.profileId}`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View profile <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  )
}

export default EventExhibitors