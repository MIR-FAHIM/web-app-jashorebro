export function dropFacts(drop = {}, now = Date.now()) {
  const qualifying = Math.max(0, Number(drop.qualifying_participants_count ?? drop.currentParticipants ?? drop.current_participants ?? drop.distinct_participants_count ?? drop.distinct_participants ?? 0) || 0)
  const target = Math.max(0, Number(drop.target_participants ?? 0) || 0)
  const deadline = drop.end_at ? Date.parse(drop.end_at) : NaN
  const startsAt = drop.start_at ? Date.parse(drop.start_at) : NaN
  const hasEnded = Number.isFinite(deadline) && deadline <= now
  const notStarted = Number.isFinite(startsAt) && startsAt > now
  const labels = { draft: 'Not open', active: 'Collecting orders', succeeded: 'Target reached', failed: 'Ended without target', expired: 'Ended without target', cancelled: 'Cancelled' }
  return {
    qualifying, target, remaining: Math.max(0, target - qualifying),
    progress: target > 0 ? Math.min(100, Math.round(qualifying / target * 100)) : 0,
    interested: Boolean(drop.viewer_state?.has_expressed_interest),
    reserved: Boolean(drop.viewer_state?.has_order_reservation),
    confirmed: Boolean(drop.viewer_state?.has_confirmed_participation),
    interestCount: Math.max(0, Number(drop.interest_count ?? drop.interested_count ?? 0) || 0),
    canOrder: drop.can_order === true && !hasEnded && !notStarted,
    canExpressInterest: drop.can_express_interest === true && !hasEnded && !notStarted,
    hasEnded, notStarted,
    statusLabel: notStarted ? 'Not started' : drop.status === 'active' && hasEnded ? 'Ended — awaiting final status' : labels[drop.status] || 'Unavailable',
    unavailableReason: drop.unavailability_reason || (hasEnded ? 'This Drop is no longer accepting orders.' : notStarted ? 'This Drop has not opened yet.' : 'This Drop is not currently accepting orders.'),
  }
}

export function formatDropDeadline(value) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return null
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dhaka' }).format(timestamp)
}
