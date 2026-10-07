import React from 'react'
import { cn } from '../lib/cn'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
