import { apiClient } from '@/shared/api/apiClient'

/**
 * Community Commerce API Service:
 * Comprehensive client supporting both flat methods and domain namespaces
 * (picks, shop, drops, earnings, social, leaderboard, admin) using activity-based endpoints.
 */

// --- Base Implementations ---

// Picks
async function getMyPicks({ page, per_page } = {}) {
  const params = new URLSearchParams()
  if (page !== undefined) params.set('page', String(page))
  if (per_page !== undefined) params.set('per_page', String(per_page))
  const res = await apiClient(`/picks/get-my-picks${params.size ? `?${params}` : ''}`)
  return res.data ? res : { picks: res.data || res.picks || [] }
}

async function addPick(data) {
  const res = await apiClient('/picks/add-pick', {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function savePick(productId, data = {}) {
  const res = await apiClient('/picks/add-pick', {
    method: 'POST',
    data: {
      product_id: productId,
      caption: data.caption || data.personal_caption,
      personal_caption: data.personal_caption || data.caption,
      is_featured: Boolean(data.is_featured),
      is_public: data.is_public !== undefined ? Boolean(data.is_public) : true,
    },
  })
  return res.data || res
}

async function updatePick(id, data) {
  const res = await apiClient(`/picks/update-pick/${id}`, {
    method: 'PUT',
    data,
  })
  return res.data || res
}

async function deletePick(id) {
  return apiClient(`/picks/delete-pick/${id}`, {
    method: 'DELETE',
  })
}

async function getUserPicks(username) {
  const res = await apiClient(`/picks/get-user-picks/${encodeURIComponent(username)}`)
  return res.data || res
}

async function lookupPickCode(code) {
  const res = await apiClient(`/picks/lookup-pick-code/${encodeURIComponent(code)}`)
  return res.data || res
}

// Shop
async function getMyShop() {
  const res = await apiClient('/shops/get-my-shop')
  const rawShop = res.shop || (res.data && res.data.id ? res.data : null) || (res.id ? res : null)
  const listings = res.listings || (Array.isArray(res.data) ? res.data : [])
  const hasShop = Boolean(res.has_shop ?? rawShop)

  return {
    ...res,
    ...(rawShop || {}),
    success: true,
    has_shop: hasShop,
    shop: hasShop ? rawShop : null,
    data: hasShop ? rawShop : null,
    listings,
  }
}

async function createShop(data) {
  const res = await apiClient('/shops/add-shop', {
    method: 'POST',
    data,
  })
  const rawShop = res.shop || res.data || (res.id ? res : null)
  return {
    ...res,
    ...(rawShop || {}),
    success: true,
    has_shop: true,
    shop: rawShop,
    data: rawShop,
  }
}

async function updateShop(data) {
  const res = await apiClient('/shops/update-my-shop', {
    method: 'PUT',
    data,
  })
  const rawShop = res.shop || res.data || (res.id ? res : null)
  return {
    ...res,
    ...(rawShop || {}),
    success: true,
    has_shop: true,
    shop: rawShop,
    data: rawShop,
  }
}

async function getShopListings() {
  const res = await apiClient('/shops/get-shop-listings')
  return res.data || res.listings || []
}

async function getProductResaleTerms(productId) {
  const res = await apiClient(`/shops/get-product-resale-terms/${encodeURIComponent(productId)}`)
  return res.data
}

async function addShopListing(data) {
  const res = await apiClient('/shops/add-shop-listing', {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function updateShopListing(id, data) {
  const res = await apiClient(`/shops/update-shop-listing/${id}`, {
    method: 'PUT',
    data,
  })
  return res.data || res
}

async function deleteShopListing(id) {
  return apiClient(`/shops/delete-shop-listing/${id}`, {
    method: 'DELETE',
  })
}

async function getPublicShop(slug) {
  const res = await apiClient(`/shops/get-public-shop/${encodeURIComponent(slug)}`)
  return res.data || res
}

async function getShopSales(page = 1) {
  const res = await apiClient(`/shops/get-shop-sales?page=${page}`)
  return res.data ? res : { sales: res.sales || res.data || [] }
}

// Drops
async function getEligibleDropProducts() {
  const res = await apiClient('/drops/get-eligible-drop-products')
  return res.data || res
}

async function getMyDrops() {
  const res = await apiClient('/drops/get-my-drops')
  return res.data || res
}

async function createCommunityDrop(data) {
  const res = await apiClient('/drops/add-drop', {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function getPublicDrops(params = {}) {
  const res = await getPublicDropPage(params)
  return res.data || res.drops || res
}

async function getPublicDropPage(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== 'all') query.append('category', params.category)
  if (params.q) query.append('q', params.q)
  if (params.page) query.append('page', params.page.toString())
  const qs = query.toString() ? `?${query.toString()}` : ''
  const res = await apiClient(`/drops/get-drops${qs}`)
  return res
}

async function getDrop(id) {
  const res = await apiClient(`/drops/get-drop/${id}`)
  return res.data || res.drop || res
}

async function getJoinedDrops() {
  const res = await apiClient('/drops/get-joined-drops')
  return res.data || res.drops || []
}

async function toggleJoinDrop(id, isInterested) {
  const res = await apiClient(`/drops/join-drop/${id}`, {
    method: 'POST',
    data: { is_interested: Boolean(isInterested) },
  })
  return res.data || res
}

// Feed
async function getCommunityFeed(params = {}) {
  const query = new URLSearchParams()
  if (params.tab) query.append('tab', params.tab)
  if (params.filter) query.append('filter', params.filter)
  if (params.category && params.category !== 'all') query.append('category', params.category)
  if (params.friends_only !== undefined) query.append('friends_only', params.friends_only ? '1' : '0')
  if (params.q) query.append('q', params.q)
  if (params.page) query.append('page', params.page.toString())
  if (params.per_page) query.append('per_page', params.per_page.toString())
  const qs = query.toString() ? `?${query.toString()}` : ''
  const res = await apiClient(`/feed/get-feed${qs}`)
  return res.data ? res : { data: res }
}

async function getFollowingFeed(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== 'all') query.append('category', params.category)
  if (params.page) query.append('page', params.page.toString())
  if (params.per_page) query.append('per_page', params.per_page.toString())
  const qs = query.toString() ? `?${query.toString()}` : ''
  const res = await apiClient(`/feed/get-following-feed${qs}`)
  return res.data ? res : { data: res }
}

async function getTrendingFeed(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== 'all') query.append('category', params.category)
  if (params.page) query.append('page', params.page.toString())
  if (params.per_page) query.append('per_page', params.per_page.toString())
  const qs = query.toString() ? `?${query.toString()}` : ''
  const res = await apiClient(`/feed/get-trending-feed${qs}`)
  return res.data ? res : { data: res }
}

async function addFeedFeedback(data) {
  const res = await apiClient('/feed/add-feedback', {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function addFeedImpressions(impressions, sessionId = null) {
  const res = await apiClient('/feed/add-impressions', {
    method: 'POST',
    data: {
      impressions,
      session_id: sessionId,
    },
  })
  return res.data || res
}

// Profile
async function getProfileSummary() {
  const res = await apiClient('/profile/get-profile-summary')
  return res.data || res
}

async function uploadProfileAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await apiClient('/profile/upload-avatar', {
    method: 'POST',
    data: formData,
  })
  return res.data || res
}

async function uploadProfileCover(file) {
  const formData = new FormData()
  formData.append('cover', file)
  const res = await apiClient('/profile/upload-cover', {
    method: 'POST',
    data: formData,
  })
  return res.data || res
}

async function removeProfileAvatar() {
  const res = await apiClient('/profile/remove-avatar', {
    method: 'DELETE',
  })
  return res.data || res
}

async function removeProfileCover() {
  const res = await apiClient('/profile/remove-cover', {
    method: 'DELETE',
  })
  return res.data || res
}

async function updateProfileDetails(data) {
  let payload = data
  if (data.avatar instanceof File || data.cover instanceof File) {
    payload = new FormData()
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        payload.append(key, val)
      }
    })
  }
  const res = await apiClient('/profile/update-profile', {
    method: 'POST',
    data: payload,
  })
  return res.data || res
}

// Earnings
async function getEarningsSummary() {
  const res = await apiClient('/earnings/get-earnings-summary')
  return res.data || res
}

async function getEarningsLedger(page = 1) {
  const res = await apiClient(`/earnings/get-earnings-ledger?page=${page}`)
  return res.data ? res : { entries: res.data || res.entries || [] }
}

async function requestPayout(data) {
  const res = await apiClient('/earnings/request-payout', {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function getPayoutHistory() {
  const res = await apiClient('/earnings/get-payouts')
  return res.data ? res : { payouts: res.data || res.payouts || [] }
}

// Follows
async function followUser(userId) {
  return apiClient(`/follows/follow-user/${userId}`, {
    method: 'POST',
  })
}

async function unfollowUser(userId) {
  return apiClient(`/follows/unfollow-user/${userId}`, {
    method: 'DELETE',
  })
}

async function getFollowStatus(userId) {
  const res = await apiClient(`/follows/get-follow-status/${userId}`)
  return res.data || res
}

async function getFollowers(userId) {
  const res = await apiClient(`/follows/get-followers/${userId}`)
  return res.data || res
}

async function getFollowing(userId) {
  const res = await apiClient(`/follows/get-following/${userId}`)
  return res.data || res
}

// Leaderboards
async function getLeaderboards(type = 'all') {
  const res = await apiClient(`/leaderboards/get-leaderboards${type !== 'all' ? `?type=${type}` : ''}`)
  return res.data || res
}

// Admin Community Commerce
async function getAdminShops({ q = '', status = 'all', page = 1 } = {}) {
  const params = new URLSearchParams()
  if (q) params.append('q', query || q)
  if (status && status !== 'all') params.append('status', status)
  if (page > 1) params.append('page', page.toString())

  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await apiClient(`/admin/community/get-shops${qs}`)
  return res.data ? res : { shops: res.data || res.shops || [] }
}

async function updateAdminShopStatus(id, status) {
  const res = await apiClient(`/admin/community/update-shop-status/${id}`, {
    method: 'PATCH',
    data: { status },
  })
  return res.data || res
}

async function getAdminPayouts({ status = 'all', page = 1 } = {}) {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.append('status', status)
  if (page > 1) params.append('page', page.toString())

  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await apiClient(`/admin/community/get-payouts${qs}`)
  return res.data ? res : { payouts: res.data || res.payouts || [] }
}

async function processAdminPayout(id, data) {
  const res = await apiClient(`/admin/community/process-payout/${id}`, {
    method: 'POST',
    data,
  })
  return res.data || res
}

async function getSettlementReport(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await apiClient(`/admin/community/get-settlement-report${qs ? `?${qs}` : ''}`)
  return res.data || res
}

export const communityApi = {
  // Flat API
  getMyPicks,
  addPick,
  savePick,
  updatePick,
  deletePick,
  getUserPicks,
  lookupPickCode,
  getMyShop,
  createShop,
  updateShop,
  getShopListings,
  getProductResaleTerms,
  addShopListing,
  updateShopListing,
  deleteShopListing,
  getPublicShop,
  getShopSales,
  getEligibleDropProducts,
  getMyDrops,
  createCommunityDrop,
  getEarningsSummary,
  getEarningsLedger,
  requestPayout,
  getPayoutHistory,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getLeaderboards,
  getAdminShops,
  updateAdminShopStatus,
  getAdminPayouts,
  processAdminPayout,
  getSettlementReport,
  getPublicDrops,
  getDrop,
  getJoinedDrops,
  toggleJoinDrop,
  getCommunityFeed,
  getFollowingFeed,
  getTrendingFeed,
  addFeedFeedback,
  addFeedImpressions,
  getProfileSummary,
  uploadProfileAvatar,
  uploadProfileCover,
  removeProfileAvatar,
  removeProfileCover,
  updateProfileDetails,

  // Namespaced Domains
  feed: {
    getCommunityFeed,
    getFollowingFeed,
    getTrendingFeed,
    addFeedback: addFeedFeedback,
    addImpressions: addFeedImpressions,
  },

  profile: {
    getSummary: getProfileSummary,
    uploadAvatar: uploadProfileAvatar,
    uploadCover: uploadProfileCover,
    removeAvatar: removeProfileAvatar,
    removeCover: removeProfileCover,
    update: updateProfileDetails,
  },

  picks: {
    getMyPicks,
    save: savePick,
    add: addPick,
    update: updatePick,
    remove: deletePick,
    getByUser: getUserPicks,
    lookupCode: lookupPickCode,
  },

  shop: {
    getMyShop,
    createShop,
    updateShop,
    getListings: getShopListings,
    getProductResaleTerms,
    addListing: addShopListing,
    updateListing: updateShopListing,
    removeListing: deleteShopListing,
    getBySlug: getPublicShop,
    getSales: getShopSales,
  },

  drops: {
    getEligibleProducts: getEligibleDropProducts,
    getMyDrops,
    create: createCommunityDrop,
    getPublicDrops,
    getPublicDropPage,
    getDrop,
    getJoinedDrops,
    toggleJoin: toggleJoinDrop,
  },

  earnings: {
    getBalance: getEarningsSummary,
    getLedger: getEarningsLedger,
    requestPayout,
    getPayoutHistory,
  },

  social: {
    follow: followUser,
    unfollow: unfollowUser,
    getStatus: getFollowStatus,
    getFollowers,
    getFollowing,
  },

  leaderboard: {
    getTopSellers: () => getLeaderboards('sellers'),
    getTopCurators: () => getLeaderboards('curators'),
    getTopOrganizers: () => getLeaderboards('organizers'),
    getAll: getLeaderboards,
  },

  admin: {
    getShops: getAdminShops,
    updateShopStatus: updateAdminShopStatus,
    getPayouts: getAdminPayouts,
    processPayout: processAdminPayout,
    getSettlementReport,
  },
}
