const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const sizeClass = size === 'sm' ? '!px-2.5 !py-1.5 !text-xs' : ''
  return (
    <button className={`${VARIANTS[variant] || VARIANTS.primary} ${sizeClass} ${className}`} {...rest}>
      {children}
    </button>
  )
}