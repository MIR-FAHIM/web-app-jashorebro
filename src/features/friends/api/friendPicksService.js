function countValue(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : null
}

function normalizeFriend(friend) {
  return {
    ...friend,
    avatar_url: friend.avatar_url || friend.avatar || friend.profile?.avatar_url,
    picks_count: countValue(friend.public_picks_count ?? friend.picks_count),
  }
}

function normalizePick(pick) {
  // The seven-day window starts at a server-verified visit, not Pick creation.
  // This is only a potential-support hint; checkout validates eligibility.
  const enabled = [true, 1, '1'].includes(pick.product?.is_recommendation_enabled)
  const isPublic = [true, 1, '1'].includes(pick.is_public)
  return {
    ...pick,
    personal_caption: pick.personal_caption || pick.caption || '',
    is_support_eligible: Boolean(pick.recommendation_code && isPublic && enabled && Number(pick.product?.recommendation_commission) > 0),
  }
}

export function createFriendPicksService(request) {
  const getPublicPicks = async (friend, { page = 1, perPage = 12, signal } = {}) => {
    const identifier = friend.username || friend.id
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    const response = await request(`/picks/get-user-picks/${encodeURIComponent(identifier)}?${params}`, { signal })
    const payload = response.data || response
    const records = Array.isArray(payload) ? payload : payload.picks || response.picks || []
    const picks = records.filter((pick) => ![false, 0, '0'].includes(pick.is_public)).map(normalizePick)
    const meta = response.meta || payload.meta || {}
    return {
      picks,
      total: countValue(meta.total) ?? picks.length,
      currentPage: Number(meta.current_page || page),
      lastPage: Number(meta.last_page || page),
    }
  }

  return {
    async getAllFriends({ signal } = {}) {
      const friends = new Map()
      let page = 1
      let lastPage
      do {
        if (signal?.aborted) return []
        const response = await request(`/friends/get-friends?page=${page}`, { signal })
        const records = Array.isArray(response.data) ? response.data : []
        records.forEach((friend) => friends.set(String(friend.id), normalizeFriend(friend)))
        lastPage = Math.max(page, Number(response.meta?.last_page || page))
        page += 1
      } while (page <= lastPage)
      return [...friends.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    },

    getPublicPicks,

    async populateCounts(friends, onCount, { signal } = {}) {
      const pending = friends.filter((friend) => friend.picks_count === null)
      let index = 0
      const worker = async () => {
        while (index < pending.length && !signal?.aborted) {
          const friend = pending[index++]
          try {
            // The current friends endpoint has no count field. Request one public
            // pick to read meta.total, rather than downloading every product.
            const { total } = await getPublicPicks(friend, { perPage: 1, signal })
            if (!signal?.aborted) onCount(friend.id, total)
          } catch {
            // Unknown counts stay unknown; the selected friend's panel has retry.
            if (!signal?.aborted) onCount(friend.id, null)
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker))
    },
  }
}
