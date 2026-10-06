const STYLES = {
  available: 'bg-blue-50 text-blue-600',
  reserved: 'bg-amber-50 text-amber-600',
  occupied: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-yellow-50 text-yellow-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-500',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STYLES[status] || 'bg-ink-100 text-ink-600'}`}>
      {status}
    </span>
  )
}