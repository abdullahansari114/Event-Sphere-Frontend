import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CalendarDays, Clock, MapPin, ShieldOff, User } from 'lucide-react'
import { formatLongDate } from './eventUtils'

// Last 8 characters of the registration document's _id, shown as the "Ticket No."
const ticketNumber = (registrationId = '') =>
  registrationId.slice(-8).toUpperCase().replace(/(.{4})/, '$1-')

// Data encoded inside the QR code — enough for entry verification
const buildQrValue = (event, registration) =>
  JSON.stringify({
    pass: 'EventSphere',
    registrationId: registration._id,
    eventId: event._id || event.id,
    name: registration.name,
    event: event.title,
  })

// Combine the event's date with an "HH:MM" time string into a real Date
const combineDateAndTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null
  const base = new Date(dateValue)
  if (Number.isNaN(base.getTime())) return null
  const [hours, minutes] = timeValue.split(':').map(Number)
  if (Number.isNaN(hours)) return null
  base.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0)
  return base
}

// The pass expires GRACE_MINUTES after the event's end time (or start time, if no end time)
const GRACE_MINUTES = 10

const getPassExpiry = (event) => {
  const endTime = event.endTime || event.startTime
  const end = combineDateAndTime(event.date, endTime)
  if (!end) return null
  return new Date(end.getTime() + GRACE_MINUTES * 60000)
}

const formatExpiry = (date) =>
  date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

// Small reusable detail item — flex-wrap decides on its own how many fit per
// row, so whether the container is a modal or the full tab, nothing overlaps
const DetailItem = ({ icon: Icon, label, value, accent }) => (
  <div className="flex min-w-[132px] flex-1 items-start gap-2.5">
    <Icon size={16} className={`mt-0.5 shrink-0 ${accent}`} />
    <div className="min-w-0">
      <p className={`text-[11px] ${accent}`}>{label}</p>
      <p className="break-words text-sm font-medium !text-white">{value}</p>
    </div>
  </div>
)

// A wide card styled like a real event ticket — main stub + tear-off QR stub.
// Measures its own width (via ResizeObserver), so it never overlaps whether
// it's rendered in a narrow popup or across the full "Your Pass" tab.
const EventPass = ({ event, registration }) => {
  const wrapperRef = useRef(null)
  const [isCompact, setIsCompact] = useState(true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return undefined
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setIsCompact(width < 560)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  if (!event || !registration) return null

  const venue = event.venue || event.location
  const expiry = getPassExpiry(event)
  const isExpired = Boolean(expiry) && now > expiry

  return (
    <div ref={wrapperRef} className="mx-auto w-full max-w-3xl">
      <div className={`flex overflow-hidden rounded-[28px] !bg-white shadow-[0_20px_45px_-15px_rgba(16,26,51,0.35)] ${isCompact ? 'flex-col' : 'flex-row'}`}>
        {/* ---------- Main stub ---------- */}
        <div
          className={`relative flex-1 overflow-hidden px-7 py-7 !text-white sm:px-9 sm:py-8 ${
            isExpired
              ? 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700'
              : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'
          }`}
        >
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full !bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full !bg-white/10" />

          {isExpired && (
            <span className="absolute right-5 top-5 rotate-6 rounded-md border-2 border-white/70 px-2.5 py-1 text-[11px] font-bold tracking-[0.2em] !text-white">
              EXPIRED
            </span>
          )}

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.2em] !text-blue-100">
                Event Pass
              </p>
              <h2 className="mt-2 break-words text-2xl font-bold leading-tight !text-white sm:text-[28px]">
                {event.title}
              </h2>
              {event.theme && <p className="mt-1 text-sm !text-blue-100">{event.theme}</p>}
            </div>
            {event.category && (
              <span className="shrink-0 rounded-full border border-white/20 !bg-white/15 px-3 py-1 text-[11px] font-medium !text-white">
                {event.category}
              </span>
            )}
          </div>

          <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-5 border-t border-white/10 pt-6">
            <DetailItem icon={User} label="Attendee" value={registration.name} accent="!text-blue-100" />
            <DetailItem icon={CalendarDays} label="Date" value={formatLongDate(event.date)} accent="!text-blue-100" />
            <DetailItem
              icon={Clock}
              label="Time"
              value={event.startTime ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ''}` : 'TBA'}
              accent="!text-blue-100"
            />
            {venue && <DetailItem icon={MapPin} label="Venue" value={venue} accent="!text-blue-100" />}
          </div>
        </div>

        {/* ---------- Perforated tear line ---------- */}
        {isCompact ? (
          <div className="relative flex">
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#f6f7fb]" />
            <div className="w-full border-t-2 border-dashed border-slate-200" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#f6f7fb]" />
          </div>
        ) : (
          <div className="relative w-px">
            <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#f6f7fb]" />
            <div className="h-full border-l-2 border-dashed border-slate-200" />
            <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#f6f7fb]" />
          </div>
        )}

        {/* ---------- Ticket stub: QR + ticket number ---------- */}
        <div
          className={`flex shrink-0 items-center justify-between gap-4 !bg-gray-50 px-6 py-6 ${
            isCompact ? 'flex-row' : 'w-56 flex-col justify-center px-7'
          }`}
        >
          {!isCompact && (
            <span className="rounded-full !bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] !text-blue-600">
              Admit One
            </span>
          )}
          <div className={`relative rounded-xl !bg-white p-2 shadow-sm ring-1 ring-black/5 ${isExpired ? 'opacity-40 grayscale' : ''}`}>
            <QRCodeSVG value={buildQrValue(event, registration)} size={92} />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldOff size={28} className="!text-gray-600" />
              </div>
            )}
          </div>
          <div className="text-right sm:text-center">
            <p className="text-[11px] !text-gray-400">Ticket No.</p>
            <p className="font-mono text-sm font-bold tracking-wide !text-gray-900">
              {ticketNumber(registration._id)}
            </p>
            {expiry && (
              <p className={`mt-1 text-[11px] ${isExpired ? '!text-red-500 font-medium' : '!text-gray-400'}`}>
                {isExpired ? `Expired ${formatExpiry(expiry)}` : `Valid until ${formatExpiry(expiry)}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventPass