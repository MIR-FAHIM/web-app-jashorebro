import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  MapPin,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  RotateCcw,
  Tag,
  Building,
  Check,
  ChevronDown,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Input } from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { posApi } from '@/features/pos/api/posApi'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { PosCustomerAddressModal } from '@/features/pos/components/PosCustomerAddressModal'
import { PosReceiptModal } from '@/features/pos/components/PosReceiptModal'

export default function AdminPosPage() {
  // Product Catalog State
  const [productQuery, setProductQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [variantModalProduct, setVariantModalProduct] = useState(null)
  const [selectedVariantId, setSelectedVariantId] = useState(null)

  // Customer State
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerAddresses, setCustomerAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)

  // Sale Cart State
  const [cart, setCart] = useState([]) // array of { product, variant, quantity }

  // Pricing & Quote State
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountReason, setDiscountReason] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [quote, setQuote] = useState(null)
  const [isQuoting, setIsQuoting] = useState(false)

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [saleNotes, setSaleNotes] = useState('')

  // Submission & Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  const productSearchTimeout = useRef(null)
  const customerSearchTimeout = useRef(null)

  // 1. Fetch products when search query changes
  const fetchProducts = useCallback(async (q = '') => {
    setLoadingProducts(true)
    try {
      const data = await posApi.searchProducts(q)
      setProducts(data)
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleProductSearch = (e) => {
    const val = e.target.value
    setProductQuery(val)
    clearTimeout(productSearchTimeout.current)
    productSearchTimeout.current = setTimeout(() => {
      fetchProducts(val)
    }, 250)
  }

  // 2. Customer search debounced
  const handleCustomerSearch = (e) => {
    const val = e.target.value
    setCustomerQuery(val)
    if (!val.trim()) {
      setCustomerResults([])
      return
    }
    clearTimeout(customerSearchTimeout.current)
    customerSearchTimeout.current = setTimeout(async () => {
      setIsSearchingCustomers(true)
      try {
        const results = await posApi.searchCustomers(val)
        setCustomerResults(results)
      } catch {
        // ignore
      } finally {
        setIsSearchingCustomers(false)
      }
    }, 250)
  }

  // 3. Customer selection & Address loading
  const handleSelectCustomer = async (cust) => {
    setSelectedCustomer(cust)
    setCustomerQuery('')
    setCustomerResults([])
    setLoadingAddresses(true)
    try {
      const addrs = await posApi.getCustomerAddresses(cust.id)
      setCustomerAddresses(addrs)
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.is_default) || addrs[0]
        setSelectedAddressId(def.id)
      } else {
        setSelectedAddressId(null)
      }
    } catch {
      // ignore
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerAddresses([])
    setSelectedAddressId(null)
  }

  // 4. Cart actions: Add, Update Qty, Remove, Clear
  const handleAddToCart = (product, variant = null) => {
    // If product has active variants and none provided, open variant selection dialog
    if (product.active_variants?.length > 0 && !variant) {
      setVariantModalProduct(product)
      setSelectedVariantId(product.active_variants[0]?.id || null)
      return
    }

    setCart((prev) => {
      const variantId = variant?.id || null
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && (i.variant?.id || null) === variantId
      )

      if (existingIdx >= 0) {
        const next = [...prev]
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        }
        return next
      } else {
        return [...prev, { product, variant, quantity: 1 }]
      }
    })
    setErrorMessage('')
  }

  const handleUpdateQuantity = (idx, delta) => {
    setCart((prev) => {
      const next = [...prev]
      const newQty = next[idx].quantity + delta
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx)
      }
      next[idx] = { ...next[idx], quantity: newQty }
      return next
    })
  }

  const handleRemoveCartItem = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleClearCart = () => {
    if (cart.length === 0 || window.confirm('Clear all items from POS sale cart?')) {
      setCart([])
      setDiscountAmount(0)
      setDiscountReason('')
      setShippingFee(0)
      setQuote(null)
      setErrorMessage('')
    }
  }

  // 5. Compute real-time server validated quote
  useEffect(() => {
    if (!selectedCustomer?.id || cart.length === 0) {
      setQuote(null)
      return
    }

    let isMounted = true
    setIsQuoting(true)

    const payload = {
      customer_id: selectedCustomer.id,
      address_id: selectedAddressId || undefined,
      items: cart.map((i) => ({
        product_id: i.product.id,
        variant_id: i.variant?.id || undefined,
        quantity: i.quantity,
      })),
      discount_amount: Number(discountAmount) || 0,
      discount_reason: discountReason || undefined,
      shipping_fee: Number(shippingFee) || 0,
    }

    posApi
      .getQuote(payload)
      .then((data) => {
        if (isMounted) setQuote(data)
      })
      .catch((err) => {
        if (isMounted) {
          // If discount exceeds subtotal, just keep prior or set message
          console.warn('POS Quote calculation note:', err.message)
        }
      })
      .finally(() => {
        if (isMounted) setIsQuoting(false)
      })

    return () => {
      isMounted = false
    }
  }, [cart, selectedCustomer, selectedAddressId, discountAmount, discountReason, shippingFee])

  // Subtotal fallback when quote is pending
  const localSubtotal = cart.reduce((sum, item) => {
    const price = item.variant?.effective_price ?? item.product.base_price
    return sum + price * item.quantity
  }, 0)

  const effectiveTotal = quote?.total_amount ?? Math.max(0, localSubtotal - discountAmount + Number(shippingFee || 0))

  // 6. Cash Change Calculation
  const parsedReceived = parseFloat(amountReceived) || 0
  const cashChange = paymentMethod === 'cash' ? Math.max(0, parsedReceived - effectiveTotal) : 0
  const isCashInsufficient = paymentMethod === 'cash' && parsedReceived < effectiveTotal

  // 7. Complete Sale Submit
  const handleCompleteSale = async (e) => {
    e.preventDefault()
    if (isSubmitting || cart.length === 0) return

    if (!selectedCustomer) {
      setErrorMessage('Please select a customer before completing the sale.')
      return
    }

    if (paymentMethod === 'cash' && isCashInsufficient) {
      setErrorMessage(`Insufficient cash received. Order total is ${formatCurrency(effectiveTotal)}, received ${formatCurrency(parsedReceived)}.`)
      return
    }

    if (discountAmount > 0 && !discountReason.trim()) {
      setErrorMessage('Please provide an explanation for the manual discount.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const idempotencyKey = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      const orderPayload = {
        idempotency_key: idempotencyKey,
        customer_id: selectedCustomer.id,
        address_id: selectedAddressId || undefined,
        items: cart.map((i) => ({
          product_id: i.product.id,
          variant_id: i.variant?.id || undefined,
          quantity: i.quantity,
        })),
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? parsedReceived : undefined,
        discount_amount: Number(discountAmount) || 0,
        discount_reason: discountReason.trim() || undefined,
        shipping_fee: Number(shippingFee) || 0,
        notes: saleNotes.trim() || undefined,
      }

      const order = await posApi.createOrder(orderPayload)
      setCompletedOrder(order)
      setReceiptModalOpen(true)

      // Clear cart on successful order creation
      setCart([])
      setDiscountAmount(0)
      setDiscountReason('')
      setShippingFee(0)
      setAmountReceived('')
      setSaleNotes('')
      fetchProducts(productQuery) // refresh stock levels
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete sale. Inventory has not been charged.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartNewSale = () => {
    setSelectedCustomer(null)
    setCustomerAddresses([])
    setSelectedAddressId(null)
    setCart([])
    setDiscountAmount(0)
    setDiscountReason('')
    setShippingFee(0)
    setAmountReceived('')
    setSaleNotes('')
    setQuote(null)
    setErrorMessage('')
    setReceiptModalOpen(false)
  }

  return (
    <div className="space-y-5">
      {/* Page Title & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CreditCard className="text-orange-500" size={24} />
            <span>Point of Sale Terminal</span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Rapid in-store checkout, inventory management, and customer receipt issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="unlocked" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1">
            <CheckCircle2 size={13} />
            <span>Store Online (Kotwali)</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={handleClearCart} disabled={cart.length === 0} className="text-xs">
            <RotateCcw size={13} />
            <span>Reset Cart</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/80 p-3.5 text-xs text-red-200 flex items-center gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main POS 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT PANEL: PRODUCT SEARCH & CATALOG (7 cols) ================= */}
        <section className="lg:col-span-7 space-y-4">
          <Card className="p-4 bg-slate-900 border-slate-800 text-white space-y-3">
            {/* Search Bar with SKU / Barcode support */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={productQuery}
                onChange={handleProductSearch}
                placeholder="Scan barcode, or search by title / SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
                autoFocus
              />
              {productQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setProductQuery('')
                    fetchProducts('')
                  }}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            <div className="min-h-[460px] max-h-[640px] overflow-y-auto pr-1">
              {loadingProducts ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                  <Package size={32} className="mx-auto text-slate-600" />
                  <p>No eligible catalog products found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {products.map((prod) => {
                    const hasVariants = prod.active_variants?.length > 0
                    const stock = prod.stock_quantity
                    const isOutOfStock = prod.track_inventory && stock <= 0

                    return (
                      <div
                        key={prod.id}
                        onClick={() => !isOutOfStock && handleAddToCart(prod)}
                        className={`group p-3 rounded-xl border flex flex-col justify-between transition-all select-none ${
                          isOutOfStock
                            ? 'border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-950 hover:border-orange-500/50 hover:bg-slate-900/90 cursor-pointer shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Image or fallback */}
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mb-2 relative">
                            {prod.primary_image?.image_url ? (
                              <img src={resolveImageUrl(prod.primary_image.image_url)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Package size={24} />
                              </div>
                            )}

                            {hasVariants && (
                              <span className="absolute bottom-1 right-1 bg-slate-900/90 border border-slate-700 text-orange-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                {prod.active_variants.length} vars
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-xs text-slate-100 line-clamp-2 leading-tight">
                            {prod.title}
                          </h3>

                          {prod.sku && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {prod.sku}</p>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-orange-400">
                              {formatCurrency(prod.base_price)}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {prod.track_inventory ? `${stock} in stock` : 'Unlimited'}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className="size-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-slate-950 transition-colors"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* ================= RIGHT PANEL: CART, CUSTOMER & CHECKOUT (5 cols) ================= */}
        <section className="lg:col-span-5 space-y-4">
          {/* Customer Selection Card */}
          <Card className="p-4 bg-slate-900 border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon size={14} className="text-orange-400" />
                <span>Customer & Delivery</span>
              </h2>

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="text-[11px] font-semibold text-orange-400 hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {!selectedCustomer ? (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={customerQuery}
                  onChange={handleCustomerSearch}
                  placeholder="Search customer by name, phone, or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
                />

                {isSearchingCustomers && (
                  <p className="text-[11px] text-slate-400 mt-1">Searching customers...</p>
                )}

                {customerResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-950 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800">
                    {customerResults.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-2.5 hover:bg-slate-900 cursor-pointer text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-white">{cust.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{cust.phone || cust.email}</p>
                        </div>
                        <span className="text-[10px] text-orange-400 font-bold uppercase">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Selected Customer Identity */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-white">{selectedCustomer.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {selectedCustomer.phone || selectedCustomer.email}
                    </p>
                  </div>
                  <Badge variant="unlocked" size="xs" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Customer Verified
                  </Badge>
                </div>

                {/* Customer Address Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-orange-400" />
                      <span>Delivery Spot:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className="text-orange-400 hover:text-orange-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Address
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <p className="text-[11px] text-slate-500">Loading addresses...</p>
                  ) : customerAddresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value) || null)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                    >
                      {customerAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label || 'Home'} - {addr.street_address}, {addr.upazila || addr.sub_district_thana} {addr.is_default ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-300 flex items-center justify-between">
                      <span>No address saved for this customer.</span>
                      <button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        className="underline font-bold"
                      >
                        Add Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Cart Table Card */}
          <Card className="p-4 bg-slate-900 border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-orange-400" />
                <span>Sale Cart ({cart.reduce((n, i) => n + i.quantity, 0)} items)</span>
              </h2>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items list */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Sale cart is empty. Scan or pick items on the left.
                </div>
              ) : (
                cart.map((item, idx) => {
                  const price = item.variant?.effective_price ?? item.product.base_price
                  const lineTotal = price * item.quantity

                  return (
                    <div
                      key={`${item.product.id}_${item.variant?.id || 'none'}`}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{item.product.title}</p>
                        {item.variant && (
                          <span className="text-[10px] text-orange-400 font-mono">
                            Var: {item.variant.name}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {formatCurrency(price)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="size-6 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="size-6 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right min-w-[65px]">
                        <p className="font-bold text-white">{formatCurrency(lineTotal)}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(idx)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Manual Discount & Delivery adjustments */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Discount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Delivery Fee (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shippingFee || ''}
                    onChange={(e) => setShippingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-orange-400 mb-1">
                    Discount Reason *
                  </label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="e.g. In-store VIP discount / Manager promo"
                    className="w-full bg-slate-950 border border-orange-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(quote?.subtotal ?? localSubtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {Number(shippingFee) > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charge:</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-white border-t border-slate-800 pt-2">
                <span>Total Payable:</span>
                <span className="text-base font-black text-orange-400">
                  {formatCurrency(effectiveTotal)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment & Submit Card */}
          <Card className="p-4 bg-slate-900 border-slate-800 text-white space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-orange-400" />
              <span>Payment & Finalize</span>
            </h2>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'cash', label: 'Cash' },
                { id: 'bkash', label: 'bKash' },
                { id: 'nagad', label: 'Nagad' },
                { id: 'cod', label: 'COD' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === id
                      ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cash Tender & Change Calculation */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Amount Received (BDT) *</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAmountReceived(effectiveTotal.toString())}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Exact
                    </button>
                    {[500, 1000, 2000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setAmountReceived(quick.toString())}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Enter cash collected from customer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-brand"
                  required
                />

                <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Change to return:</span>
                  <span className={`font-mono text-sm font-black ${isCashInsufficient ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isCashInsufficient ? `Short by ${formatCurrency(effectiveTotal - parsedReceived)}` : formatCurrency(cashChange)}
                  </span>
                </div>
              </div>
            )}

            {/* Complete Sale Button */}
            <Button
              type="button"
              variant="drop-fire"
              size="lg"
              onClick={handleCompleteSale}
              disabled={isSubmitting || cart.length === 0 || !selectedCustomer || isCashInsufficient}
              className="w-full font-bold flex items-center justify-center gap-2 py-3"
            >
              <span>{isSubmitting ? 'Recording POS Sale...' : 'Complete POS Sale'}</span>
              <ArrowRight size={17} />
            </Button>
          </Card>
        </section>
      </div>

      {/* Variant Selection Modal */}
      {variantModalProduct && (
        <Dialog
          isOpen={Boolean(variantModalProduct)}
          onClose={() => setVariantModalProduct(null)}
          title={`Select Variant: ${variantModalProduct.title}`}
          description="This product requires specifying a size, color, or edition before adding."
          className="max-w-md bg-slate-900 border-slate-800 text-white"
        >
          <div className="space-y-3">
            <div className="space-y-2">
              {variantModalProduct.active_variants?.map((v) => {
                const isSelected = selectedVariantId === v.id
                const stock = v.stock_quantity
                const isOut = variantModalProduct.track_inventory && stock <= 0

                return (
                  <div
                    key={v.id}
                    onClick={() => !isOut && setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isOut
                        ? 'border-slate-800 bg-slate-950 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'border-orange-500 bg-orange-500/20 ring-1 ring-orange-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{v.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SKU: {v.sku || 'N/A'} · Stock: {stock}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-orange-400">
                        {formatCurrency(v.effective_price)}
                      </p>
                      {isSelected && <Check size={14} className="text-orange-400 ml-auto mt-0.5" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setVariantModalProduct(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="drop-fire"
                size="sm"
                disabled={!selectedVariantId}
                onClick={() => {
                  const chosenVar = variantModalProduct.active_variants?.find((v) => v.id === selectedVariantId)
                  handleAddToCart(variantModalProduct, chosenVar)
                  setVariantModalProduct(null)
                }}
              >
                Add Variant to Cart
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Customer Address Creation Modal */}
      <PosCustomerAddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        customer={selectedCustomer}
        onSaved={(newAddr) => {
          setCustomerAddresses((prev) => [newAddr, ...prev])
          setSelectedAddressId(newAddr.id)
        }}
      />

      {/* Printable Receipt Modal */}
      <PosReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        order={completedOrder}
        onNewSale={handleStartNewSale}
      />
    </div>
  )
}
