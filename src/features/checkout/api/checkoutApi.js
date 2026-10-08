import { apiClient } from '@/shared/api/apiClient'

/**
 * Customer Checkout, Orders & Group Buy API Service
 */
export const checkoutApi = {
  /**
   * Revalidate cart items and obtain official server-calculated quote.
   */
  async getQuote(items, shippingUpazila = 'Jashore Sadar') {
    const res = await apiClient('/checkout/quote', {
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
    const res = await apiClient('/orders', {
      method: 'POST',
      data: orderData,
    })
    return res.data
  },

  /**
   * Fetch customer order history.
   */
  async getOrders(page = 1) {
    const qs = page > 1 ? `?page=${page}` : ''
    return apiClient(`/orders${qs}`)
  },

  /**
   * Single order details.
   */
  async getOrder(id) {
    const res = await apiClient(`/orders/${id}`)
    return res.data
  },

  /**
   * Cancel customer order within cancellation cutoff window.
   */
  async cancelOrder(id) {
    return apiClient(`/orders/${id}/cancel`, {
      method: 'POST',
    })
  },
}
