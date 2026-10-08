import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'jb_cart_normalized_v2'

/**
 * Build a stable unique line identifier for a cart item.
 */
export function buildCartLineId({ product_id, variant_id = null, purchase_mode = 'normal', campaign_id = null }) {
  return `${purchase_mode}-${product_id}-${variant_id ?? 'base'}-${campaign_id ?? 'none'}`
}

/**
 * Standardize product and variant into a consistent cart line.
 */
export function normalizeCartItem(product, {
  variant = null,
  purchase_mode = 'normal',
  campaign = null,
  quantity = 1,
} = {}) {
  const productId = Number(product.id)
  const variantId = variant?.id ? Number(variant.id) : null
  const campaignId = campaign?.id ? Number(campaign.id) : null

  let unitPrice = Number(product.base_price ?? product.retailPrice ?? product.price ?? 0)

  if (purchase_mode === 'group_buy' && campaign) {
    unitPrice = Number(campaign.group_price ?? unitPrice)
  } else if (variant && Number.isFinite(variant.price ?? variant.price_override)) {
    unitPrice = Number(variant.price ?? variant.price_override)
  }

  const title = product.title || product.name || 'Artisan Product'
  const variantLabel = variant?.name ? ` (${variant.name})` : ''
  const displayTitle = `${title}${variantLabel}`
  const image = variant?.image_url || product.image || product.images?.[0]?.image_url || ''

  const lineId = buildCartLineId({
    product_id: productId,
    variant_id: variantId,
    purchase_mode,
    campaign_id: campaignId,
  })

  return {
    lineId,
    id: lineId, // backward-compat alias
    product_id: productId,
    variant_id: variantId,
    purchase_mode,
    campaign_id: campaignId,
    quantity: Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1))),
    price: unitPrice,
    unit_price: unitPrice,
    title: displayTitle,
    name: displayTitle, // backward-compat alias
    image,
    seller: product.seller?.store_name || product.seller?.name || 'Jashore Producer',
    is_free_shipping: Boolean(product.is_free_shipping),
    shipping_charge: Number(product.shipping_charge ?? 60),
    max_quantity: product.max_order_quantity || 99,
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
