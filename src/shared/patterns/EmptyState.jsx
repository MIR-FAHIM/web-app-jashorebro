import { Button } from '../ui/Button'
import { cn } from '../lib/cn'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center text-muted mb-4">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description && <p className="text-xs text-muted max-w-xs mt-1 mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
