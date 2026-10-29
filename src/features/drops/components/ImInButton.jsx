import { Users, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

export function ImInButton({ isJoined = false, onToggleJoin, isLoading = false, disabled = false, className, size = 'lg' }) {
  return (
    <Button variant={isJoined ? 'outline' : 'secondary'} size={size} disabled={disabled} isLoading={isLoading} onClick={onToggleJoin} aria-pressed={isJoined} className={cn('w-full', isJoined && 'border-success/40 bg-success-soft text-success hover:bg-success/15', className)}>
      {isJoined ? <><Check size={18} /><span>Interested · remove</span></> : <><Users size={18} /><span>I'm interested</span></>}
    </Button>
  )
}
