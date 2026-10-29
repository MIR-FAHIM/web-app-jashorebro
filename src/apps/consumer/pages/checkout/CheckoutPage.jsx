import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, ShoppingBag, AlertCircle, PlusCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { getCartCheckoutIssue, useCart } from '@/features/cart/model/cartContext'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { checkoutApi } from '@/features/checkout/api/checkoutApi'
import { addressesApi } from '@/shared/api/addressesApi'
import { AddressFormModal } from '@/features/addresses/components/AddressFormModal'
import { getReferralVisitorToken } from '@/features/referrals/model/referralAttribution'
import { checkoutItemsSignature, clearCheckoutIntent, getStoredCheckoutIntent, markCheckoutNotFound, markCheckoutSubmitted, prepareCheckoutIntent } from '@/features/checkout/model/checkoutIntent'

function deliveryFields(address) {
  return {
    name: address.recipient_name || '',
    phone: address.recipient_phone || '',
    address: address.street_address || '',
    upazila: address.upazila || address.sub_district_thana || '',
    district: address.district || address.locality_district || '',
  }
}

function validMoney(value) {
  return (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
}

function checkedQuote(data, requestedItems) {
  if (!data || !['subtotal', 'shipping_fee', 'discount_amount', 'total_amount'].every((field) => validMoney(data[field])) ||
    !Array.isArray(data.items) || data.items.length !== requestedItems.length) {
    throw new Error('The order total could not be checked. Please retry pricing.')
  }
  // The endpoint returns lines in request order. Matching only product IDs would
  // confuse variants or separate shop / campaign lines.
  const lines = data.items.map((line, index) => {
    const requested = requestedItems[index]
    if (!line || Number(line.product_id) !== Number(requested.product_id) ||
      (line.variant_id == null ? null : Number(line.variant_id)) !== (requested.variant_id == null ? null : Number(requested.variant_id)) ||
      line.purchase_mode !== requested.purchase_mode || Number(line.quantity) !== Number(requested.quantity) ||
      !validMoney(line.unit_price) || !validMoney(line.line_total)) {
      throw new Error('Some product prices could not be checked. Please retry pricing.')
    }
    if (requested.attribution_token && !['verified', 'ineligible', 'none', 'overridden'].includes(line.referral_status)) {
      throw new Error('Recommendation verification is unavailable. Please retry pricing before placing this order.')
    }
    if (requested.purchase_mode === 'group_buy' &&
      (Number(line.campaign?.id) !== Number(requested.campaign_id) || !validMoney(line.campaign?.group_price) ||
        !Number.isInteger(Number(line.campaign?.target_participants)) || Number(line.campaign.target_participants) < 2 ||
        !/^[a-f0-9]{64}$/.test(line.campaign_terms_hash || ''))) {
      throw new Error('The Price Drop conditions could not be checked. Reopen the Drop or retry pricing before ordering.')
    }
    return { ...line, unit_price: Number(line.unit_price), line_total: Number(line.line_total) }
  })
  return { ...data, items: lines, subtotal: Number(data.subtotal), shipping_fee: Number(data.shipping_fee),
    discount_amount: Number(data.discount_amount), total_amount: Number(data.total_amount) }
}

function samePricing(left, right) {
  const amounts = (quote) => [quote.subtotal, quote.shipping_fee, quote.discount_amount, quote.total_amount,
    ...quote.items.flatMap((line) => [line.unit_price, line.line_total])].map((value) => Math.round(value * 100))
  const conditions = (quote) => quote.items.map((line) => line.campaign_terms_hash || null)
  return JSON.stringify(amounts(left)) === JSON.stringify(amounts(right)) && JSON.stringify(conditions(left)) === JSON.stringify(conditions(right))
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, itemCount, clearCart } = useCart()
  const checkoutIssue = getCartCheckoutIssue(items)
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [previousAttempt, setPreviousAttempt] = useState(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [quoteState, setQuoteState] = useState({ status: 'idle', key: '', data: null, error: '' })
  const [quoteRetry, setQuoteRetry] = useState(0)
  const [priceReviewKey, setPriceReviewKey] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [addressError, setAddressError] = useState('')
  const [addressRetry, setAddressRetry] = useState(0)
  const [addressOwner, setAddressOwner] = useState(null)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', address: '', upazila: '', district: '', paymentMethod: 'cod', notes: '',
  })

  const accountKey = isAuthenticated && user?.id != null ? String(user.id) : null
  useEffect(() => {
    const intent = getStoredCheckoutIntent(accountKey)
    setPreviousAttempt(intent?.submitted ? intent : null)
  }, [accountKey])
  const addressesReady = !loadingAddresses && !addressError && accountKey !== null && addressOwner === accountKey
  const hasDeliveryAddress = addressesReady && selectedAddressId != null &&
    ['name', 'phone', 'address', 'upazila', 'district'].every((field) => String(form[field]).trim())

  useEffect(() => {
    if (!isAuthenticated || accountKey === null) return
    let active = true
    setLoadingAddresses(true)
    setAddressError('')
    setSelectedAddressId(null)
    setAddressModalOpen(false)
    addressesApi.getAddresses()
      .then((list) => {
        if (!active) return
        if (!Array.isArray(list)) throw new Error('Unable to load delivery addresses.')
        setSavedAddresses(list)
        setAddressOwner(accountKey)
        const defaultAddress = list.find((address) => address.is_default) || list[0]
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setForm((previous) => ({ ...previous, ...deliveryFields(defaultAddress) }))
        }
      })
      .catch((error) => { if (active) setAddressError(error.message || 'Unable to load delivery addresses.') })
      .finally(() => { if (active) setLoadingAddresses(false) })
    return () => { active = false }
  }, [isAuthenticated, accountKey, addressRetry])

  const payloadItems = useMemo(() => items.map((item) => ({
    product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity,
    purchase_mode: item.purchase_mode || 'normal', campaign_id: item.campaign_id,
    community_shop_id: item.community_shop_id || null, shop_listing_id: item.shop_listing_id || null,
    recommendation_code: item.recommendation_code || null, recommender_id: item.recommender_id || null,
    attribution_token: item.attribution_token || null,
    attribution_visitor_token: item.attribution_token ? getReferralVisitorToken() : null,
  })), [items])
  const quoteKey = JSON.stringify({
    account: accountKey, items: payloadItems, addressId: selectedAddressId,
    name: form.name, phone: form.phone, address: form.address, upazila: form.upazila, district: form.district,
    hasDeliveryAddress: Boolean(hasDeliveryAddress),
  })
  const currentCheckoutRef = useRef(null)
  currentCheckoutRef.current = { key: quoteKey, account: accountKey, authenticated: isAuthenticated }
  const quote = quoteState.status === 'ready' && quoteState.key === quoteKey ? quoteState.data : null
  const quotedCampaign = quote?.items.find((line) => line.campaign)?.campaign
  const quoteError = quoteState.status === 'error' && quoteState.key === quoteKey ? quoteState.error : ''
  const isCheckingQuote = Boolean(isAuthenticated && items.length && hasDeliveryAddress && !checkoutIssue && !quote && !quoteError)

  useEffect(() => {
    if (!isAuthenticated || !items.length || !hasDeliveryAddress || confirmedOrder || checkoutIssue) {
      setQuoteState({ status: 'idle', key: quoteKey, data: null, error: '' })
      return
    }
    let active = true
    setQuoteState({ status: 'checking', key: quoteKey, data: null, error: '' })
    checkoutApi.getQuote(payloadItems, form.upazila)
      .then((data) => {
        const checked = checkedQuote(data, payloadItems)
        if (active) setQuoteState({ status: 'ready', key: quoteKey, data: checked, error: '' })
      })
      .catch((error) => {
        if (active) setQuoteState({ status: 'error', key: quoteKey, data: null, error: error.message || 'Unable to check current prices. Please retry.' })
      })
    return () => { active = false }
  }, [quoteKey, quoteRetry, isAuthenticated, payloadItems, form.upazila, hasDeliveryAddress, confirmedOrder, items.length, checkoutIssue])

  const handleSelectAddress = (address) => {
    if (submittingRef.current) return
    setSelectedAddressId(address.id)
    setForm((previous) => ({ ...previous, ...deliveryFields(address) }))
    setErrorMessage('')
  }
  const updateField = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
  }

  const orderPayload = () => ({
    items: payloadItems.map((item, index) => ({ ...item,
      ...(quote ? { expected_unit_price: quote.items[index].unit_price } : {}),
      ...(quote?.items[index].campaign_terms_hash ? { expected_campaign_terms_hash: quote.items[index].campaign_terms_hash } : {}),
    })), payment_method: form.paymentMethod, address_id: selectedAddressId,
    shipping_name: form.name, shipping_phone: form.phone, shipping_district: form.district,
    shipping_upazila: form.upazila, shipping_address: form.address, notes: form.notes,
  })

  const handleRecoverOrder = async () => {
    if (submittingRef.current || !previousAttempt || !accountKey) return
    submittingRef.current = true
    setIsRecovering(true)
    setErrorMessage('')
    const owner = accountKey
    const recoveryCartKey = quoteKey
    const recoveryPayload = orderPayload()
    try {
      const order = await checkoutApi.getCheckoutAttempt(previousAttempt.key)
      if (!mountedRef.current || currentCheckoutRef.current.account !== owner) return
      if (order) {
        if (!order.order_number || !validMoney(order.total_amount)) throw new Error('The previous order could not be read. Check your orders before retrying.')
        const matchesCart = await checkoutItemsSignature(recoveryPayload.items) === previousAttempt.itemsSignature
        if (!mountedRef.current || currentCheckoutRef.current.account !== owner) return
        setConfirmedOrder(order)
        if (matchesCart && currentCheckoutRef.current.key === recoveryCartKey) clearCart()
        clearCheckoutIntent(owner, previousAttempt.key)
      } else {
        markCheckoutNotFound(owner, previousAttempt)
        setErrorMessage('No accepted order was found for the previous checkout. Review the current details before confirming again.')
      }
      setPreviousAttempt(null)
    } catch (error) {
      if (mountedRef.current && currentCheckoutRef.current.account === owner) setErrorMessage(error.message || 'Unable to check the previous checkout. Please retry.')
    } finally {
      submittingRef.current = false
      if (mountedRef.current) setIsRecovering(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current || !items.length) return
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location } })
      return
    }
    if (checkoutIssue || !hasDeliveryAddress || !quote || !['cod', 'bkash'].includes(form.paymentMethod)) {
      setErrorMessage('Select a complete delivery address and wait for current pricing before placing your order.')
      return
    }
    submittingRef.current = true
    setIsSubmitting(true)
    setErrorMessage('')
    const submittedKey = quoteKey
    const isCurrentSubmission = () => mountedRef.current && currentCheckoutRef.current.authenticated && currentCheckoutRef.current.key === submittedKey
    let checkingPrices = true
    try {
      const payload = orderPayload()
      const intent = await prepareCheckoutIntent(accountKey, payload)
      if (!isCurrentSubmission()) return
      if (intent.submitted) {
        const accepted = await checkoutApi.getCheckoutAttempt(intent.key)
        if (!isCurrentSubmission()) return
        if (accepted) {
          if (!accepted.order_number || !validMoney(accepted.total_amount)) throw new Error('The previous order confirmation could not be read. Check your orders before retrying.')
          setConfirmedOrder(accepted)
          clearCart()
          clearCheckoutIntent(accountKey, intent.key)
          setPreviousAttempt(null)
          return
        }
      }
      // A quote does not lock pricing or stock. Recheck before submitting and
      // require another confirmation if the reviewed prices have changed.
      setQuoteState({ status: 'checking', key: submittedKey, data: null, error: '' })
      const freshQuote = checkedQuote(await checkoutApi.getQuote(payloadItems, form.upazila), payloadItems)
      if (!isCurrentSubmission()) return
      setQuoteState({ status: 'ready', key: submittedKey, data: freshQuote, error: '' })
      if (!samePricing(quote, freshQuote)) {
        setPriceReviewKey(submittedKey)
        setErrorMessage('The price or Drop conditions changed during the final check. Review the updated summary, then confirm again.')
        return
      }
      checkingPrices = false
      setPreviousAttempt(markCheckoutSubmitted(accountKey, intent))
      const order = await checkoutApi.placeOrder({ ...payload, idempotency_key: intent.key })
      if (!isCurrentSubmission()) return
      if (!order?.order_number || !validMoney(order.total_amount)) {
        throw new Error('We could not read the order confirmation. Your cart is still here. Check your orders before trying again.')
      }
      setConfirmedOrder(order)
      clearCart()
      clearCheckoutIntent(accountKey, intent.key)
      setPreviousAttempt(null)
    } catch (error) {
      if (!isCurrentSubmission()) return
      if (checkingPrices) {
        setQuoteState({ status: 'error', key: submittedKey, data: null, error: error.message || 'Unable to check current prices. Please retry.' })
      } else {
        setErrorMessage(error.message || 'We could not confirm the order. Your cart is still here. Check your orders before trying again.')
        setQuoteState({ status: 'idle', key: submittedKey, data: null, error: '' })
        setQuoteRetry((previous) => previous + 1)
      }
    } finally {
      submittingRef.current = false
      if (mountedRef.current) setIsSubmitting(false)
    }
  }

  if (confirmedOrder) {
    const paymentReceived = confirmedOrder.payment_status === 'paid'
    const paymentRefunded = confirmedOrder.payment_status === 'refunded'
    const awaitingTarget = confirmedOrder.status === 'awaiting_group' && !paymentRefunded
    const orderCancelled = confirmedOrder.status === 'cancelled'
    const confirmedDrop = !awaitingTarget && !orderCancelled && !paymentRefunded && confirmedOrder.items?.some((item) => item.purchase_mode === 'group_buy')
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl px-0 py-6 sm:py-10">
        <Card className="min-w-0 space-y-6 p-5 text-center shadow-xl sm:p-9">
          <div className={`mx-auto flex size-16 items-center justify-center rounded-2xl border ${orderCancelled ? 'border-danger/30 bg-danger-soft text-danger' : 'border-success/30 bg-success-soft text-success'}`}>{orderCancelled ? <AlertCircle size={32} /> : <Check size={32} />}</div>
          <div className="min-w-0 space-y-2">
            <Badge variant={orderCancelled || paymentRefunded ? 'danger' : awaitingTarget ? 'brand' : 'unlocked'}>{paymentRefunded ? 'Refund recorded' : orderCancelled ? 'Order cancelled' : awaitingTarget ? 'Conditional order placed' : confirmedDrop ? 'Drop target reached' : 'Order placed'}</Badge>
            <h1 className="text-2xl font-bold tracking-tight text-ink">{paymentRefunded ? 'A full refund is recorded' : orderCancelled ? 'This order was cancelled' : awaitingTarget ? 'Waiting for the buyer target' : confirmedDrop ? 'Your Drop order is confirmed' : 'Thank you for your order'}</h1>
            <p className="break-words text-xs font-semibold text-brand [overflow-wrap:anywhere]">Order reference: {confirmedOrder.order_number}</p>
          </div>
          <dl className="min-w-0 space-y-3 rounded-xl border border-line bg-elevated p-4 text-left text-xs">
            <div className="grid min-w-0 gap-1 sm:grid-cols-[100px_minmax(0,1fr)]"><dt className="text-muted">Delivery to</dt><dd className="min-w-0 break-words font-semibold text-ink [overflow-wrap:anywhere]">{confirmedOrder.shipping_name} ({confirmedOrder.shipping_phone})</dd></div>
            <div className="grid min-w-0 gap-1 sm:grid-cols-[100px_minmax(0,1fr)]"><dt className="text-muted">Address</dt><dd className="min-w-0 break-words text-soft [overflow-wrap:anywhere]">{confirmedOrder.shipping_address}, {confirmedOrder.shipping_upazila}, {confirmedOrder.shipping_district}</dd></div>
            <div className="grid gap-1 sm:grid-cols-[100px_minmax(0,1fr)]"><dt className="text-muted">Payment method</dt><dd className="font-semibold text-ink">{confirmedOrder.payment_method === 'cod' ? 'Cash on delivery' : 'bKash (manual)'}</dd></div>
            <div className="grid gap-1 sm:grid-cols-[100px_minmax(0,1fr)]"><dt className="text-muted">Payment status</dt><dd className="font-semibold text-ink">{paymentRefunded ? 'Refund recorded' : paymentReceived ? 'Paid' : orderCancelled ? 'Unpaid' : 'Payment pending'}</dd></div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-3 font-semibold"><dt className="text-soft">Order total</dt><dd className="break-words text-sm text-brand [overflow-wrap:anywhere]">{formatCurrency(confirmedOrder.total_amount)}</dd></div>
          </dl>
          <p className="text-xs leading-relaxed text-muted">
            {orderCancelled ? 'This reservation is no longer active. ' : awaitingTarget ? 'Your order counts toward this Drop’s buyer target. Fulfillment starts only after the target is reached. If the Drop expires or is cancelled first, this reservation is cancelled and stock is released. Any payment needs separate refund review. ' : confirmedDrop ? 'The buyer target was reached. Your order can proceed to fulfillment at its accepted price. This Drop is closed to new orders. ' : 'Your order has been recorded. '}
            {paymentRefunded ? 'A full refund is recorded for this order.' : orderCancelled ? paymentReceived ? 'Payment is still recorded as paid. Contact support for separate refund review.' : 'No payment is due for this cancelled order.' : paymentReceived ? 'Payment is marked as received.' : confirmedOrder.payment_method === 'cod' ? 'Payment is due on delivery.' : 'No bKash payment was collected here. Confirm payment instructions with the seller before sending money.'}
          </p>
          <Link to={`/orders/${confirmedOrder.id}`} className="inline-flex min-h-11 items-center font-semibold text-brand">View order and status</Link>
          <Button className="w-full font-semibold" onClick={() => navigate('/explore')}><span>Continue exploring</span><ArrowRight size={17} className="shrink-0" /></Button>
        </Card>
      </div>
    )
  }
  if (isAuthLoading) return <div role="status" className="py-12 text-center text-muted">Loading your account…</div>
  if (!items.length) {
    return (
      <Card className="mx-auto min-w-0 max-w-lg space-y-4 px-5 py-16 text-center">
        <ShoppingBag size={40} className="mx-auto text-brand" /><h1 className="text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="text-xs text-muted">Add a product before checking out.</p>
        <Link to="/explore" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand">Explore products <ArrowRight size={16} /></Link>
      </Card>
    )
  }
  if (!isAuthenticated) {
    return (
      <Card className="mx-auto min-w-0 max-w-md space-y-4 p-7 text-center">
        <ShoppingBag size={32} className="mx-auto text-brand" /><h1 className="text-xl font-semibold text-ink">Sign in to continue checkout</h1>
        <p className="text-sm leading-relaxed text-muted">Your cart is saved on this device. Sign in to add your delivery address and review your order.</p>
        <Link to="/auth" state={{ from: location }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand">Continue to sign in</Link>
        <Link to="/cart" className="block py-2 text-sm font-medium text-soft hover:text-ink">Back to cart</Link>
      </Card>
    )
  }

  const priceChanged = quote && (priceReviewKey === quoteKey || quote.items.some((line, index) => Math.round(line.unit_price * 100) !== Math.round(Number(items[index].price) * 100)))
  const cannotConfirm = Boolean(checkoutIssue) || isSubmitting || isRecovering || !hasDeliveryAddress || !quote || !['cod', 'bkash'].includes(form.paymentMethod)
  const readinessMessage = isSubmitting ? 'Checking pricing and sending your order…'
    : checkoutIssue ? checkoutIssue
    : addressError ? 'Retry loading your delivery addresses to continue.'
    : loadingAddresses || addressOwner !== accountKey ? 'Wait for your delivery addresses to load.'
    : !hasDeliveryAddress ? 'Add or select a complete delivery address to continue.'
    : quoteError ? 'Retry pricing to confirm your order total.'
    : !quote ? 'Wait for current pricing before placing your order.'
    : 'Review your address, payment method and total before confirming.'

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 [overflow-wrap:anywhere]">
      <Link to="/cart" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft size={16} className="shrink-0" />Back to cart</Link>
      <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Checkout & Delivery</h1><p className="mt-1 text-xs leading-relaxed text-muted">Review your products, delivery address and payment preference.</p></div>
      {errorMessage && <div role="alert" className="flex min-w-0 items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-4 text-xs text-danger"><AlertCircle size={16} className="shrink-0" /><span className="min-w-0">{errorMessage}</span></div>}
      {checkoutIssue && <Card className="space-y-3 p-4 text-sm text-warning"><p role="alert">{checkoutIssue}</p><Link to="/cart" className="inline-flex min-h-11 items-center font-semibold text-brand">Review cart items</Link></Card>}
      {previousAttempt && <Card className="space-y-3 p-4 text-xs text-soft"><p>A previous checkout may already have been accepted. Check it before sending another order.</p><Button type="button" variant="outline" disabled={isSubmitting || isRecovering} isLoading={isRecovering} onClick={handleRecoverOrder}>Check previous checkout</Button></Card>}

      <form onSubmit={handleSubmit} className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <fieldset disabled={isSubmitting} className="m-0 w-full min-w-0 space-y-5 border-0 p-0">
          <legend className="sr-only">Delivery and payment details</legend>
          <Card className="min-w-0 space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink"><MapPin size={18} className="shrink-0 text-brand" />Delivery address</h2>
              <button type="button" disabled={!addressesReady} onClick={() => setAddressModalOpen(true)} className="flex min-h-11 items-center gap-1.5 text-xs font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"><PlusCircle size={15} className="shrink-0" /><span>Add address</span></button>
            </div>
            {addressError ? (
              <div role="alert" className="space-y-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger"><p>{addressError}</p><Button type="button" variant="outline" size="sm" onClick={() => setAddressRetry((previous) => previous + 1)}>Retry addresses</Button></div>
            ) : !addressesReady ? <p role="status" className="py-4 text-xs text-muted">Loading delivery addresses…</p> : savedAddresses.length > 0 ? (
              <div className="min-w-0 space-y-3">
                <p id="delivery-address-label" className="text-xs text-muted">Select a delivery address:</p>
                <div role="radiogroup" aria-labelledby="delivery-address-label" className="grid min-w-0 gap-2.5 sm:grid-cols-2">
                  {savedAddresses.map((address) => {
                    const selected = selectedAddressId === address.id
                    const fields = deliveryFields(address)
                    return (
                      <label key={address.id} className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-brand ${selected ? 'border-brand bg-brand-soft' : 'border-line bg-elevated hover:border-field-border'}`}>
                        <input type="radio" name="deliveryAddress" value={address.id} checked={selected} onChange={() => handleSelectAddress(address)} className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]" />
                        <span className="block min-w-0 flex-1 space-y-1 text-xs">
                          <span className="flex min-w-0 flex-wrap items-center gap-1.5 font-semibold text-ink"><span>{address.label || 'Home'}</span>{address.is_default && <Badge variant="unlocked">Default</Badge>}</span>
                          <span className="block font-semibold text-ink">{fields.name} ({fields.phone})</span><span className="block text-muted">{fields.address}</span><span className="block text-muted">{fields.upazila}, {fields.district}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {!hasDeliveryAddress && <p className="text-xs text-warning">This address is incomplete. Add a complete delivery address to continue.</p>}
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-brand/30 bg-brand-soft p-4 text-xs text-soft"><p>You don’t have a saved delivery address yet. Add one to continue.</p><Button type="button" size="sm" onClick={() => setAddressModalOpen(true)} className="max-w-full"><PlusCircle size={15} className="shrink-0" /><span>Add delivery address</span></Button></div>
            )}
            <div className="min-w-0 border-t border-line pt-3">
              <label htmlFor="checkout-notes" className="mb-1 block text-xs font-semibold text-soft">Delivery notes (optional)</label>
              <textarea id="checkout-notes" name="notes" rows={2} maxLength={500} value={form.notes} onChange={updateField} placeholder="Delivery instructions or preferred contact time" className="w-full min-w-0 rounded-xl border border-field-border bg-elevated px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none" />
            </div>
          </Card>
          <Card className="min-w-0 space-y-4 p-4 sm:p-6">
            <h2 id="payment-method-label" className="flex items-center gap-2 text-sm font-semibold text-ink"><CreditCard size={18} className="shrink-0 text-brand" />Payment method</h2>
            <div role="radiogroup" aria-labelledby="payment-method-label" className="grid min-w-0 gap-3 sm:grid-cols-2">
              {[{ value: 'cod', label: 'Cash on delivery', description: 'Pay in cash when your order is delivered.' }, { value: 'bkash', label: 'bKash (manual)', description: 'Payment is arranged separately with the seller.' }].map((method) => (
                <label key={method.value} className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 focus-within:ring-2 focus-within:ring-brand ${form.paymentMethod === method.value ? 'border-brand bg-brand-soft' : 'border-line bg-elevated hover:border-field-border'}`}>
                  <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={updateField} className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]" />
                  <span className="block min-w-0"><span className="block text-xs font-semibold text-ink">{method.label}</span><span className="mt-1 block text-[11px] leading-relaxed text-muted">{method.description}</span></span>
                </label>
              ))}
            </div>
            {form.paymentMethod === 'bkash' && <p className="text-xs leading-relaxed text-muted">This checkout records your payment preference. It does not collect a bKash payment. Your order will start with payment pending.</p>}
          </Card>
        </fieldset>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <Card className="min-w-0 space-y-4 p-4 shadow-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3"><h2 className="text-sm font-semibold text-ink">Order summary</h2><span className="text-xs text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div>
            {isCheckingQuote && <p role="status" className="text-xs text-muted">Checking total…</p>}
            {!hasDeliveryAddress && <p className="text-xs text-muted">Select a complete delivery address to check pricing.</p>}
            {quoteError && <div role="alert" className="space-y-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger"><p>{quoteError}</p><Button type="button" variant="outline" size="sm" disabled={isSubmitting} onClick={() => setQuoteRetry((previous) => previous + 1)}>Retry pricing</Button></div>}
            {priceChanged && <p role="status" className="rounded-xl border border-brand/30 bg-brand-soft p-3 text-xs leading-relaxed text-soft">The price or Drop conditions changed. Review the current summary before confirming.</p>}
            <div className="max-h-80 min-w-0 space-y-4 overflow-y-auto">
              {items.map((item, index) => {
                const line = quote?.items[index]
                return (
                  <div key={item.lineId} className="flex min-w-0 items-start gap-3 text-xs">
                    {item.image && <img src={item.image} alt="" className="size-12 shrink-0 rounded-lg border border-line bg-elevated object-cover" />}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="break-words font-semibold text-ink">{item.title}</p>
                      <p className="text-[11px] text-muted">Qty {item.quantity}{line ? ` · ${formatCurrency(line.unit_price)} each` : ' · Price pending'}</p>
                      {item.purchase_mode === 'group_buy' && <Badge variant="brand" className="max-w-full text-[10px]">Conditional Price Drop</Badge>}
                      {line?.referral_status === 'verified' && <p className="text-[11px] leading-relaxed text-success">Recommendation from {line.referral?.recommender?.name || item.recommender_name || 'your community'} verified for this item.</p>}
                      {line?.referral_status === 'ineligible' && <p className="text-[11px] leading-relaxed text-muted">This recommendation is no longer eligible for credit.</p>}
                      {line?.referral_status === 'overridden' && <p className="text-[11px] leading-relaxed text-muted">Campaign or store terms apply to this item.</p>}
                      <p className="break-words font-semibold text-ink">{line ? formatCurrency(line.line_total) : '—'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {quotedCampaign && <div className="space-y-2 rounded-xl border border-brand/30 bg-brand-soft p-3 text-xs leading-relaxed text-soft">
              <p className="font-semibold">Conditional order · {quotedCampaign.title}</p>
              <p>Accepted orders from {quotedCampaign.target_participants} different customers unlock this Drop. Unpaid cash-on-delivery orders count; interest alone does not.</p>
              {quotedCampaign.end_at && <p>Deadline: {new Date(quotedCampaign.end_at).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' })} (Bangladesh time).</p>}
              <p>The accepted price stays fixed. If the target is not reached before expiry or the Drop is cancelled first, your reservation is cancelled and stock is released. Any payment needs separate refund review.</p>
            </div>}
            <dl className="space-y-2 border-t border-line pt-3 text-xs" aria-live="polite" aria-busy={isCheckingQuote}>
              <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted">Subtotal</dt><dd className="font-medium text-ink">{quote ? formatCurrency(quote.subtotal) : 'Pending'}</dd></div>
              <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted">Shipping</dt><dd className="font-medium text-ink">{quote ? quote.shipping_fee === 0 ? 'Free' : formatCurrency(quote.shipping_fee) : 'Pending'}</dd></div>
              {quote?.discount_amount > 0 && <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted">Discount</dt><dd className="font-medium text-ink">−{formatCurrency(quote.discount_amount)}</dd></div>}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-semibold"><dt className="text-sm text-ink">Order total</dt><dd className="text-base text-brand">{quote ? formatCurrency(quote.total_amount) : 'Pending'}</dd></div>
            </dl>
            <Button type="submit" className="w-full min-w-0 gap-2 px-3 text-sm font-semibold" size="lg" isLoading={isSubmitting} disabled={cannotConfirm} aria-describedby="checkout-readiness"><span className="min-w-0">{isSubmitting ? 'Placing order…' : quotedCampaign ? 'Confirm conditional order' : 'Confirm & place order'}</span>{!isSubmitting && <ArrowRight size={17} className="shrink-0" />}</Button>
            <p id="checkout-readiness" className="text-center text-[11px] leading-relaxed text-muted">{readinessMessage}</p>
          </Card>
        </aside>
      </form>
      <AddressFormModal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} onSaved={(newAddress) => {
        if (!mountedRef.current || !currentCheckoutRef.current.authenticated || currentCheckoutRef.current.account !== accountKey) return
        setSavedAddresses((previous) => [newAddress, ...previous.filter((address) => address.id !== newAddress.id)])
        setAddressOwner(accountKey)
        setAddressError('')
        handleSelectAddress(newAddress)
        setAddressModalOpen(false)
      }} />
    </div>
  )
}
