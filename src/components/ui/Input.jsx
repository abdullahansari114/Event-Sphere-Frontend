export default function Input({ label, hint, error, className = '', ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>}
      <input className={`input-base ${error ? '!border-red-400' : ''} ${className}`} {...rest} />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  )
}