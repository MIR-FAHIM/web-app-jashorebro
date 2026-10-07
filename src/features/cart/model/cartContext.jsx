import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'jb_cart_preview_v1'

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0).map((item) => ({ ...item, quantity: Math.min(item.quantity, 99) })) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* The cart remains usable without browser storage. */ }
  }, [items])

  const addItem = (product, quantity = 1) => {
    if (!product?.id || !product.name || !Number.isFinite(product.price) || product.price < 0) return
    const count = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)))
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + count) } : item) : [...current, { ...product, quantity: count }]
    })
  }
  const updateQuantity = (id, quantity) => {
    const count = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)))
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: count } : item))
  }
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const clearCart = () => setItems([])
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal }}>{children}</CartContext.Provider>
}

// Context hooks live beside their provider for a single public cart interface.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
