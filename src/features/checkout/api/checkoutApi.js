import { apiClient } from '@/shared/api/apiClient'

/**
 * Customer Checkout, Orders & Group Buy API Service (Activity-based endpoints)
 */
export const checkoutApi = {
  /**
   * Revalidate cart items and obtain official server-calculated quote.
   */
  async getQuote(items, shippingUpazila = 'Jashore Sadar') {
    const res = await apiClient('/checkout/get-checkout-quote', {
      method: 'POST',
      data: {
        items,
        shipping_upazila: shippingUpazila,
      },
    })
    return res.data
  },

  /**
   * Submit authenticated order.
   */
  async placeOrder(orderData) {
    const res = await apiClient('/orders/add-order', {
      method: 'POST',
      data: orderData,
    })
    return res.data
  },

  async getCheckoutAttempt(key) {
    const res = await apiClient(`/orders/get-checkout-attempt/${encodeURIComponent(key)}`)
    return res.data
  },

  /**
   * Fetch customer order history.
   */
  async getOrders(page = 1) {
    const qs = page > 1 ? `?page=${page}` : ''
    return apiClient(`/orders/get-orders${qs}`)
  },

  /**
   * Single order details.
   */
  async getOrder(id) {
    const res = await apiClient(`/orders/get-order/${id}`)
    return res.data
  },

  /**
   * Cancel customer order within cancellation cutoff window.
   */
  async cancelOrder(id, reason = '') {
    return apiClient(`/orders/cancel-order/${id}`, {
      method: 'POST',
      data: { reason },
    })
  },

  /**
   * Fetch customer order status transition history.
   */
  async getOrderHistory(id, page = 1) {
    const qs = page > 1 ? `?page=${page}` : ''
    return apiClient(`/orders/get-order-status-history/${id}${qs}`)
  },
}
