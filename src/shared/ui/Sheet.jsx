import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content (Slide up on mobile, dialog card on desktop) */}
      <div
        className={cn(
          'relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-5 z-10 max-h-[85vh] overflow-y-auto animate-slide-up md:animate-scale-up',
          className
        )}
      >
        {/* Mobile drag handle bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden" />

        <div className="flex items-center justify-between pb-3">
          {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pt-1">{children}</div>
      </div>
    </div>
  )
}
