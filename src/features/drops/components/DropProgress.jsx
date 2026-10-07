import React from 'react'
import { Flame } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { calculateDropTier } from '../model/dropStatuses'

export function DropProgress({ tiers = [], currentParticipants = 0, retailPrice = 0 }) {
  const { currentTier, nextTier, neededForNext, progressToNext } = calculateDropTier(
    tiers,
    currentParticipants
  )

  const currentPrice = currentTier ? currentTier.price : retailPrice

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Pricing Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-slate-900">
            {formatCurrency(currentPrice)}
          </span>
          {retailPrice > currentPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(retailPrice)}
            </span>
          )}
        </div>

        {nextTier && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Flame size={12} className="text-orange-500 fill-orange-500" />
            Next: {formatCurrency(nextTier.price)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressToNext}%` }}
        />
      </div>

      {/* Milestone status label */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">
          🔥 {currentParticipants} {currentParticipants === 1 ? 'person is in' : 'people are in'}
        </span>
        {nextTier ? (
          <span className="text-slate-500">
            {neededForNext} more to unlock {formatCurrency(nextTier.price)}
          </span>
        ) : (
          <span className="text-emerald-600 font-semibold">🎉 Lowest tier unlocked!</span>
        )}
      </div>
    </div>
  )
}
