import { cn } from '../lib/cn'

const variantStyles = {
  primary: 'bg-brand text-on-brand hover:bg-[var(--color-brand-hover)] active:scale-[0.98]',
  'drop-fire': 'bg-brand text-on-brand hover:bg-[var(--color-brand-hover)] active:scale-[0.98]',
  secondary: 'bg-elevated text-ink hover:bg-line active:scale-[0.98]',
  outline: 'border border-field-border text-soft hover:bg-elevated hover:text-ink active:scale-[0.98]',
  ghost: 'text-muted hover:bg-elevated hover:text-ink active:scale-[0.98]',
  danger: 'bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]',
}

const sizeStyles = {
  sm: 'min-h-11 px-3 py-2 text-sm rounded-xl',
  md: 'min-h-11 px-4 py-2.5 text-sm rounded-xl',
  lg: 'min-h-12 px-5 py-3 text-base rounded-xl',
  icon: 'size-11 rounded-xl flex items-center justify-center shrink-0',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all font-medium select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
