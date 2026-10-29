import { apiClient } from '@/shared/api/apiClient'

const CONTEXTS_KEY = 'jb_product_referrals_v1'
const VISITOR_KEY = 'jb_referral_visitor_v1'
const pendingVisits = new Map()
const visitVersions = new Map()

function readContexts() {
  try {
    const value = JSON.parse(localStorage.getItem(CONTEXTS_KEY) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function saveContext(productId, context) {
  const contexts = readContexts()
  if (context) contexts[String(productId)] = context
  else delete contexts[String(productId)]
  try { localStorage.setItem(CONTEXTS_KEY, JSON.stringify(contexts)) } catch { /* The current page can still use its verified receipt. */ }
}

export function getReferralVisitorToken() {
  let saved
  try { saved = localStorage.getItem(VISITOR_KEY) || sessionStorage.getItem(VISITOR_KEY) } catch { /* Use memory if storage is unavailable. */ }
  if (/^[a-f0-9]{64}$/.test(saved || '')) return saved
  if (!getReferralVisitorToken.memoryToken) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    getReferralVisitorToken.memoryToken = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  const token = getReferralVisitorToken.memoryToken
  try { localStorage.setItem(VISITOR_KEY, token) } catch {
    try { sessionStorage.setItem(VISITOR_KEY, token) } catch { /* Memory lasts for this page only. */ }
  }
  return token
}

export function getStoredReferral(productId) {
  const context = readContexts()[String(productId)]
  return context && Number(context.product_id) === Number(productId) && typeof context.attribution_token === 'string'
    ? context
    : null
}

export function getRecommendationPath(product, code) {
  const productKey = typeof product === 'object' ? product?.slug || product?.id : product
  if (productKey == null || productKey === '') return '/explore'
  return `/products/${encodeURIComponent(productKey)}${code ? `?rec=${encodeURIComponent(code)}` : ''}`
}

function verifiedContext(data, productId) {
  if (data?.status === 'ineligible') return null
  if (data?.status !== 'verified' || Number(data.product_id) !== Number(productId) ||
    typeof data.attribution_token !== 'string' || !data.attribution_token ||
    !data.recommendation_code || !data.recommender_id || !Number.isFinite(Date.parse(data.expires_at)) ||
    Date.parse(data.expires_at) <= Date.now()) {
    throw new Error('This recommendation could not be verified. Please try again.')
  }
  return data
}

export async function resolveReferralVisit(product, recommendationCode) {
  const productId = Number(product?.id)
  if (!Number.isInteger(productId) || productId < 1) return null
  const previous = getStoredReferral(productId)
  const explicitCode = typeof recommendationCode === 'string' ? recommendationCode.trim() : ''
  if (!explicitCode && (!previous || Date.parse(previous.expires_at) <= Date.now())) {
    if (previous) saveContext(productId, null)
    return null
  }
  const code = explicitCode || previous.recommendation_code
  // Requests are deduplicated within one account's render, including StrictMode.
  let account = ''
  try { account = JSON.parse(localStorage.getItem('jb_auth_user') || 'null')?.id || '' } catch { /* Guest. */ }
  const requestKey = JSON.stringify([productId, code, account, previous?.attribution_token || ''])
  if (pendingVisits.has(requestKey)) return pendingVisits.get(requestKey)
  const version = (visitVersions.get(productId) || 0) + 1
  visitVersions.set(productId, version)
  const request = (async () => {
    const response = await apiClient('/picks/resolve-attribution', {
      method: 'POST',
      data: {
        product_id: productId,
        recommendation_code: code,
        visitor_token: getReferralVisitorToken(),
        attribution_token: previous?.recommendation_code === code ? previous.attribution_token : undefined,
      },
    })
    const context = verifiedContext(response.data, productId)
    if (visitVersions.get(productId) === version) saveContext(productId, context)
    return context
  })()
  pendingVisits.set(requestKey, request)
  try { return await request } finally { pendingVisits.delete(requestKey) }
}

export function referralCartFields(context) {
  if (!context) return {}
  return {
    attribution_token: context.attribution_token,
    recommendation_code: context.recommendation_code,
    recommender_id: context.recommender_id,
    recommender_name: context.recommender?.name || '',
    attribution_expires_at: context.expires_at,
    attribution_visited_at: context.visited_at,
    attribution_policy_version: context.policy_version,
  }
}

export async function prepareReferralForCart(product, recommendationCode, { existingVisit = false, context: pageContext = null } = {}) {
  // Adding from an already-open product is not a new referral visit. Another
  // tab may have since opened a different person's Pick for this product.
  const context = existingVisit
    ? getStoredReferral(product.id) || pageContext
    : await resolveReferralVisit(product, recommendationCode)
  if (existingVisit && !context && recommendationCode) {
    throw new Error('This recommendation could not be verified. Please try again.')
  }
  if (!context) return null
  const response = await apiClient('/picks/lock-attribution', {
    method: 'POST',
    data: { product_id: Number(product.id), attribution_token: context.attribution_token, visitor_token: getReferralVisitorToken() },
  })
  const locked = verifiedContext(response.data, product.id)
  if (locked && !locked.locked_at) throw new Error('This recommendation could not be saved for your cart. Please try again.')
  saveContext(product.id, locked)
  return locked ? referralCartFields(locked) : null
}
