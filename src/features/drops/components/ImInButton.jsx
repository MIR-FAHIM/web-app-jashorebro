import React from 'react'
import { Flame, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

export function ImInButton({
  isJoined = false,
  onToggleJoin,
  isLoading = false,
  className,
  size = 'lg',
}) {
  return (
    <Button
      variant={isJoined ? 'outline' : 'drop-fire'}
      size={size}
      isLoading={isLoading}
      onClick={onToggleJoin}
      className={cn(
        'w-full font-bold transition-all shadow-sm',
        isJoined && 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        className
      )}
    >
      {isJoined ? (
        <>
          <Check size={18} className="text-emerald-600 stroke-[3]" />
          <span>You're In! 🔥</span>
        </>
      ) : (
        <>
          <Flame size={18} className="fill-white animate-pulse" />
          <span>🔥 I'm In</span>
        </>
      )}
    </Button>
  )
}
