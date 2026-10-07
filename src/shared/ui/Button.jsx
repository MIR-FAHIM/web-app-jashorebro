import React from 'react'
import { cn } from '../lib/cn'

const variantStyles = {
  primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] active:scale-[0.98]',
  'drop-fire': 'bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-[0.98]',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]',
  outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 active:scale-[0.98]',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl font-medium',
  icon: 'p-2 rounded-xl flex items-center justify-center',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled,
  ...props
}) {
  return (
    <button
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
