import { AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../lib/cn'

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger flex items-center justify-center mb-3">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="text-xs text-muted max-w-xs mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
