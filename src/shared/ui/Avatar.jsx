import React, { useState } from 'react'
import { cn } from '../lib/cn'

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-semibold',
  xl: 'w-20 h-20 text-xl font-bold',
}

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className,
}) {
  const [hasError, setHasError] = useState(false)

  const getInitials = (str) => {
    if (!str) return 'JB'
    const parts = str.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return str.slice(0, 2).toUpperCase()
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-slate-100 text-slate-700 select-none border border-slate-200/60',
        sizeStyles[size] || sizeStyles.md,
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold uppercase tracking-wider">{getInitials(name || alt)}</span>
      )}
    </div>
  )
}
