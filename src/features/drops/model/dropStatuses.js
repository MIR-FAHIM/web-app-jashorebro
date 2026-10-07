export const DROP_STATUSES = {
  UPCOMING: 'upcoming',
  RALLYING: 'rallying',
  UNLOCKED: 'unlocked',
  ENDED_SUCCESS: 'ended_success',
  ENDED_FAILED: 'ended_failed',
  FULFILLED: 'fulfilled',
}

/**
 * Calculates current active tier and next target tier based on participant count.
 */
export function calculateDropTier(tiers = [], currentParticipants = 0) {
  if (!tiers || tiers.length === 0) {
    return { currentTier: null, nextTier: null, progressToNext: 0 }
  }

  // Sort tiers by required participants ascending
  const sorted = [...tiers].sort((a, b) => a.requiredParticipants - b.requiredParticipants)

  let currentTier = null
  let nextTier = null

  for (let i = 0; i < sorted.length; i++) {
    if (currentParticipants >= sorted[i].requiredParticipants) {
      currentTier = sorted[i]
    } else {
      nextTier = sorted[i]
      break
    }
  }

  let progressToNext = 100
  if (nextTier) {
    const prevCount = currentTier ? currentTier.requiredParticipants : 0
    const needed = nextTier.requiredParticipants - prevCount
    const currentOverPrev = currentParticipants - prevCount
    progressToNext = Math.min(100, Math.max(0, Math.round((currentOverPrev / needed) * 100)))
  }

  return {
    currentTier,
    nextTier,
    neededForNext: nextTier ? nextTier.requiredParticipants - currentParticipants : 0,
    progressToNext,
  }
}
