import { createContext, useContext, useEffect, useState } from 'react'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

const CartContext = createContext(null)
const STORAGE_KEY = 'jb_cart_normalized_v2'

export function getCartCheckoutIssue(items) {
  const drops = items.filter((item) => item.purchase_mode === 'group_buy')
  if (items.some((item) => item.purchase_mode === 'group_buy' ? !item.campaign_id : item.campaign_id)) {
    return 'A Price Drop item is missing its campaign details. Remove it, then open the Drop and add it again.'
  }
  if (drops.length && drops.length !== items.length) {
    return 'Check out Price Drop items separately from normal products. Remove one group of items from this cart to continue.'
  }
  if (new Set(drops.map((item) => String(item.campaign_id))).size > 1) {
    return 'Each checkout can contain one Price Drop. Keep the items from one campaign and remove the others to continue.'
  }
  return ''
}

/**
 * Build a stable unique line identifier for a cart item.
 * Cart lines from different shops remain separate even when referencing the same product and variant.
 */
export function buildCartLineId({
  product_id,
  variant_id = null,
  purchase_mode = 'normal',
  campaign_id = null,
  shop_listing_id = null,
  community_shop_id = null,
}) {
  return `${purchase_mode}-${product_id}-${variant_id ?? 'base'}-${campaign_id ?? 'none'}-${shop_listing_id ?? 'direct'}-${community_shop_id ?? 'main'}`
}

/**
 * Standardize product and variant into a consistent cart line with attribution.
 */
export function normalizeCartItem(product, {
  variant = null,
  purchase_mode = 'normal',
  campaign = null,
  quantity = 1,
  shop_listing_id = null,
  community_shop_id = null,
  shop_name = null,
  recommendation_code = null,
  recommender_id = null,
  attribution_token = null,
  recommender_name = null,
  attribution_expires_at = null,
  attribution_visited_at = null,
  attribution_policy_version = null,
  custom_price = null,
} = {}) {
  const productId = Number(product.id)
  const variantId = variant?.id ? Number(variant.id) : null
  const campaignId = campaign?.id ? Number(campaign.id) : null

  let unitPrice = Number(product.base_price ?? product.retailPrice ?? product.price ?? 0)

  if (custom_price !== null && Number.isFinite(Number(custom_price))) {
    unitPrice = Number(custom_price)
  } else if (purchase_mode === 'group_buy' && campaign) {
    unitPrice = Number(campaign.group_price ?? unitPrice)
  } else if (variant && Number.isFinite(variant.price ?? variant.price_override)) {
    unitPrice = Number(variant.price ?? variant.price_override)
  }

  const title = product.title || product.name || 'Artisan Product'
  const variantLabel = variant?.name ? ` (${variant.name})` : ''
  const displayTitle = `${title}${variantLabel}`
  const image = resolveImageUrl(variant?.image_url || product.image || product.images?.[0]?.image_url || '')

  const lineId = buildCartLineId({
    product_id: productId,
    variant_id: variantId,
    purchase_mode,
    campaign_id: campaignId,
    shop_listing_id,
    community_shop_id,
  })

  return {
    lineId,
    id: lineId, // backward-compat alias
    product_id: productId,
    variant_id: variantId,
    purchase_mode,
    campaign_id: campaignId,
    campaign_title: campaign?.title || null,
    campaign_end_at: campaign?.end_at || null,
    campaign_target: campaign?.target_participants || null,
    shop_listing_id,
    community_shop_id,
    shop_name,
    recommendation_code,
    recommender_id,
    attribution_token,
    recommender_name,
    attribution_expires_at,
    attribution_visited_at,
    attribution_policy_version,
    quantity: Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1))),
    price: unitPrice,
    unit_price: unitPrice,
    title: displayTitle,
    name: displayTitle, // backward-compat alias
    image,
    seller: shop_name ? `${shop_name} (Community Store)` : (product.seller?.store_name || product.seller?.name || 'Jashore Producer'),
    is_free_shipping: Boolean(product.is_free_shipping),
    shipping_charge: Number(product.shipping_charge ?? 60),
    max_quantity: Math.min(Number(product.max_order_quantity) || 99,
      purchase_mode === 'group_buy' ? Number(campaign?.quantity_limit_per_customer) || 99 : 99),
  }
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item) =>
      item &&
      item.lineId &&
      item.product_id &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      item.quantity > 0
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable
    }
  }, [items])

  const addItem = (itemOrProduct, quantity = 1, options = {}) => {
    let normalized
    if (itemOrProduct.lineId && itemOrProduct.product_id) {
      normalized = {
        ...itemOrProduct,
        quantity: Math.max(1, Math.min(99, Math.floor(Number(itemOrProduct.quantity || quantity) || 1))),
      }
    } else {
      normalized = normalizeCartItem(itemOrProduct, {
        ...options,
        quantity,
      })
    }

    setItems((current) => {
      const existing = current.find((item) => item.lineId === normalized.lineId)
      if (existing) {
        // A cart line keeps the source it had when first added, even if a later
        // visit opens another person's Pick for this same product and variant.
        return current.map((item) =>
          item.lineId === normalized.lineId
            ? { ...item, quantity: Math.min(item.max_quantity || 99, item.quantity + normalized.quantity) }
            : item
        )
      }
      return [...current, normalized]
    })
  }

  const updateQuantity = (lineIdOrId, quantity) => {
    const count = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)))
    setItems((current) =>
      current.map((item) =>
        (item.lineId === lineIdOrId || item.id === lineIdOrId)
          ? { ...item, quantity: Math.min(item.max_quantity || 99, count) }
          : item
      )
    )
  }

  const removeItem = (lineIdOrId) => {
    setItems((current) =>
      current.filter((item) => item.lineId !== lineIdOrId && item.id !== lineIdOrId)
    )
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
