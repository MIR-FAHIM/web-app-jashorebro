import { apiClient } from '@/shared/api/apiClient'

/**
 * Admin Product Catalog & Merchandising API Service
 */
export const adminCatalogApi = {
  // Products
  async getProducts({ q = '', status = 'all', category_id = '', is_group_buy_enabled = undefined, page = 1, per_page = 20 } = {}) {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (status && status !== 'all') params.append('status', status)
    if (category_id) params.append('category_id', category_id.toString())
    if (is_group_buy_enabled !== undefined) params.append('is_group_buy_enabled', is_group_buy_enabled ? '1' : '0')
    if (page > 1) params.append('page', page.toString())
    if (per_page !== 20) params.append('per_page', per_page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/admin/products${qs}`)
  },

  async getProduct(id) {
    const res = await apiClient(`/admin/products/${id}`)
    return res.data
  },

  async createProduct(data) {
    const res = await apiClient('/admin/products', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateProduct(id, data) {
    const res = await apiClient(`/admin/products/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async archiveProduct(id) {
    return apiClient(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  },

  async uploadImages(productId, formData) {
    return apiClient(`/admin/products/${productId}/images`, {
      method: 'POST',
      data: formData,
    })
  },

  async updateImages(productId, images) {
    return apiClient(`/admin/products/${productId}/images`, {
      method: 'PUT',
      data: { images },
    })
  },

  async deleteImage(productId, imageId) {
    return apiClient(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    })
  },

  async getCategoriesLookup() {
    const res = await apiClient('/admin/categories-lookup')
    return res.data || []
  },

  // Attributes & Items
  async getAttributes() {
    const res = await apiClient('/admin/attributes')
    return res.data || []
  },

  async createAttribute(data) {
    const res = await apiClient('/admin/attributes', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateAttribute(id, data) {
    const res = await apiClient(`/admin/attributes/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async deleteAttribute(id) {
    return apiClient(`/admin/attributes/${id}`, {
      method: 'DELETE',
    })
  },

  async createAttributeItem(attributeId, data) {
    const res = await apiClient(`/admin/attributes/${attributeId}/items`, {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateAttributeItem(attributeId, itemId, data) {
    const res = await apiClient(`/admin/attributes/${attributeId}/items/${itemId}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async deleteAttributeItem(attributeId, itemId) {
    return apiClient(`/admin/attributes/${attributeId}/items/${itemId}`, {
      method: 'DELETE',
    })
  },

  // Drop Campaigns
  async getDropCampaigns({ status = 'all', product_id = '', page = 1 } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    if (product_id) params.append('product_id', product_id.toString())
    if (page > 1) params.append('page', page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/admin/drop-campaigns${qs}`)
  },

  async getDropCampaign(id) {
    const res = await apiClient(`/admin/drop-campaigns/${id}`)
    return res.data
  },

  async createDropCampaign(data) {
    const res = await apiClient('/admin/drop-campaigns', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateDropCampaign(id, data) {
    const res = await apiClient(`/admin/drop-campaigns/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async cancelDropCampaign(id, reason = '') {
    return apiClient(`/admin/drop-campaigns/${id}/cancel`, {
      method: 'POST',
      data: { cancellation_reason: reason },
    })
  },

  // Orders & Local Dispatch
  async getOrders({ q = '', status = 'all', payment_status = 'all', page = 1 } = {}) {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (status && status !== 'all') params.append('status', status)
    if (payment_status && payment_status !== 'all') params.append('payment_status', payment_status)
    if (page > 1) params.append('page', page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/admin/orders${qs}`)
  },

  async getOrder(id) {
    const res = await apiClient(`/admin/orders/${id}`)
    return res.data
  },

  async updateOrderStatus(id, data) {
    const res = await apiClient(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      data,
    })
    return res.data
  },
}
