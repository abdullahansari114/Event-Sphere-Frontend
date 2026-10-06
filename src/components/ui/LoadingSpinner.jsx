export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-ink-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  )
}