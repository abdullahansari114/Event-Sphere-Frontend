export default function Select({ label, options = [], className = '', ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>}
      <select className={`input-base ${className}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}