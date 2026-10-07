import { useId } from 'react'
import { cn } from '../lib/cn'

export function Input({
  label,
  error,
  className,
  id,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || props.name || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full min-h-12 px-3.5 py-2.5 text-base bg-elevated border border-field-border rounded-xl text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors disabled:opacity-50',
          error && 'border-danger focus:ring-danger/30 focus:border-danger',
          className
        )}
        {...props}
      />
      {error && <span id={errorId} className="text-sm text-danger">{error}</span>}
    </div>
  )
}
