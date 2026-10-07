import React from 'react'
import { cn } from '../lib/cn'

const badgeVariants = {
  default: 'bg-slate-100 text-slate-800',
  fire: 'bg-red-50 text-red-600 border border-red-200/60 font-semibold',
  unlocked: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold',
  brand: 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  outline: 'border border-slate-200 text-slate-600',
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
