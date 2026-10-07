import { cn } from '../lib/cn'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-2xl overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
