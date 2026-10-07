import { cn } from '../lib/cn'

const badgeVariants = {
  default: 'bg-elevated text-soft',
  fire: 'bg-brand-soft text-brand border border-brand/20',
  unlocked: 'bg-success-soft text-success border border-success/20',
  brand: 'bg-brand-soft text-brand',
  warning: 'bg-warning-soft text-warning border border-warning/20',
  outline: 'border border-line text-muted',
  danger: 'bg-danger-soft text-danger border border-danger/20',
  info: 'bg-info-soft text-info',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
  ...props
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-2.5 py-1 text-xs rounded-lg',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium select-none',
        badgeVariants[variant] || badgeVariants.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
