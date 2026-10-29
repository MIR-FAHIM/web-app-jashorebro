import { apiClient } from '@/shared/api/apiClient'

/**
 * Admin POS API Service (Activity-based endpoints)
 */
export const posApi = {
  /**
   * Search eligible products and variants for POS counter.
   */
  async searchProducts(q = '', categoryId = '') {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categoryId) params.set('category_id', categoryId)

    const endpoint = `/admin/pos/search-products${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiClient(endpoint)
    return res.data || []
  },

  /**
   * Search registered customers by name, phone, or email.
   */
  async searchCustomers(q = '') {
    const params = new URLSearchParams()
    if (q) params.set('q', q)

    const endpoint = `/admin/pos/search-customers${params.toString() ? `?${params.toString()}` : ''}`
    const res = await apiClient(endpoint)
    return res.data || []
  },

  /**
   * Retrieve saved addresses belonging to a selected customer.
   */
  async getCustomerAddresses(customerId) {
    const res = await apiClient(`/admin/customers/get-addresses/${customerId}`)
    return res.data || []
  },

  /**
   * Create a new address on behalf of a selected customer.
   */
  async createCustomerAddress(customerId, payload) {
    const res = await apiClient(`/admin/customers/add-address/${customerId}`, {
      method: 'POST',
      data: payload,
    })
    return res.data
  },

  /**
   * Compute a real-time decimal-safe quote for current POS cart.
   */
  async getQuote(payload) {
    const res = await apiClient('/admin/pos/get-sale-quote', {
      method: 'POST',
      data: payload,
    })
    return res.data
  },

  /**
   * Complete and record a POS counter sale.
   */
  async createOrder(payload) {
    const res = await apiClient('/admin/pos/add-sale', {
      method: 'POST',
      data: payload,
    })
    return res.data
  },

  /**
   * Fetch complete POS order and receipt details.
   */
  async getOrder(orderId) {
    const res = await apiClient(`/admin/pos/get-sale/${orderId}`)
    return res.data
  },
}
