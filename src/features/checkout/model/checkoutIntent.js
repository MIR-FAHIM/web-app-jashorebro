const memory = new Map()
const storageKey = (account) => `jb_checkout_intent_v1:${account}`

export function getStoredCheckoutIntent(account) {
  if (!account) return null
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(account)) || 'null')
    if (saved?.key && saved?.signature) return saved
  } catch { /* A memory fallback still protects retries in this tab. */ }
  return memory.get(String(account)) || null
}

function save(account, intent) {
  memory.set(String(account), intent)
  try { localStorage.setItem(storageKey(account), JSON.stringify(intent)) } catch { /* Memory fallback. */ }
}

export async function checkoutSignature(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const checkoutItemsSignature = (items) => checkoutSignature(items.map(({ expected_unit_price, expected_campaign_terms_hash, ...item }) => item))

export async function prepareCheckoutIntent(account, payload) {
  const signature = await checkoutSignature(payload)
  const itemsSignature = await checkoutItemsSignature(payload.items)
  const prepare = () => {
    const previous = getStoredCheckoutIntent(account)
    if (previous?.signature === signature) return previous
    if (previous?.submitted) {
      throw new Error('A previous checkout needs checking. Use “Check previous checkout” before changing the order and trying again.')
    }
    // Reuse the same key after an inconclusive lookup too: an earlier HTTP
    // request could still commit after that lookup returned no accepted order.
    const intent = { key: previous?.key || crypto.randomUUID(), signature, itemsSignature, submitted: false }
    save(account, intent)
    return intent
  }
  // Supported browsers serialize intent creation across tabs on this origin.
  if (navigator.locks?.request) return navigator.locks.request(storageKey(account), prepare)
  return prepare()
}

export function markCheckoutSubmitted(account, intent) {
  const submitted = { ...intent, submitted: true }
  save(account, submitted)
  return submitted
}

export function markCheckoutNotFound(account, intent) {
  save(account, { ...intent, submitted: false })
}

export function clearCheckoutIntent(account, key) {
  if (getStoredCheckoutIntent(account)?.key !== key) return
  memory.delete(String(account))
  try { localStorage.removeItem(storageKey(account)) } catch { /* Memory fallback. */ }
}
