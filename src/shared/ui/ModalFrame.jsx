import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

export function ModalFrame({ isOpen, onClose, title, description, children, className, sheet = false }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const panel = panelRef.current
    panel?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = [...panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length)
      const first = elements[0]
      const last = elements.at(-1)
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex', sheet ? 'items-end justify-center md:items-center' : 'items-center justify-center p-4')}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : 'Dialog'} aria-describedby={description ? descriptionId : undefined} tabIndex={-1}
        className={cn('relative w-full border border-line bg-elevated shadow-2xl max-h-[90dvh] overflow-y-auto p-5 sm:p-6', sheet ? 'max-w-lg rounded-t-3xl md:rounded-2xl pb-safe' : 'max-w-lg rounded-2xl', className)}>
        {sheet && <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-field-border md:hidden" />}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="pt-2 min-w-0">
            {title && <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>}
            {description && <p id={descriptionId} className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-line hover:text-ink"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
