import { apiClient } from '@/shared/api/apiClient'

/**
 * Admin Product Catalog & Merchandising API Service (Activity-based endpoints)
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
    return apiClient(`/admin/products/get-products${qs}`)
  },

  async getProduct(id) {
    const res = await apiClient(`/admin/products/get-product/${id}`)
    return res.data
  },

  async createProduct(data) {
    const res = await apiClient('/admin/products/add-product', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateProduct(id, data) {
    const res = await apiClient(`/admin/products/update-product/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async archiveProduct(id) {
    return apiClient(`/admin/products/delete-product/${id}`, {
      method: 'DELETE',
    })
  },

  async uploadImages(productId, formData) {
    return apiClient(`/admin/products/upload-images/${productId}`, {
      method: 'POST',
      data: formData,
    })
  },

  async updateImages(productId, images) {
    return apiClient(`/admin/products/update-images/${productId}`, {
      method: 'PUT',
      data: { images },
    })
  },

  async deleteImage(productId, imageId) {
    return apiClient(`/admin/products/delete-image/${productId}/${imageId}`, {
      method: 'DELETE',
    })
  },

  // Categories Management
  async getCategories({ q = '', is_active = '', tree = true } = {}) {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (is_active !== '' && is_active !== undefined) params.append('is_active', is_active)
    if (tree !== undefined) params.append('tree', tree ? '1' : '0')

    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await apiClient(`/admin/categories/get-categories${qs}`)
    return res.data || []
  },

  async getParentCategories() {
    const res = await apiClient('/admin/categories/get-parents')
    return res.data || []
  },

  async getCategory(id) {
    const res = await apiClient(`/admin/categories/get-category/${id}`)
    return res.data
  },

  async createCategory(data) {
    const res = await apiClient('/admin/categories/add-category', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateCategory(id, data) {
    const res = await apiClient(`/admin/categories/update-category/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async deleteCategory(id) {
    return apiClient(`/admin/categories/delete-category/${id}`, {
      method: 'DELETE',
    })
  },

  async getCategoriesLookup() {
    const res = await apiClient('/admin/categories/get-categories-lookup')
    return res.data || []
  },

  // Attributes & Items
  async getAttributes() {
    const res = await apiClient('/admin/attributes/get-attributes')
    return res.data || []
  },

  async createAttribute(data) {
    const res = await apiClient('/admin/attributes/add-attribute', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateAttribute(id, data) {
    const res = await apiClient(`/admin/attributes/update-attribute/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async deleteAttribute(id) {
    return apiClient(`/admin/attributes/delete-attribute/${id}`, {
      method: 'DELETE',
    })
  },

  async createAttributeItem(attributeId, data) {
    const res = await apiClient(`/admin/attributes/add-attribute-item/${attributeId}`, {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateAttributeItem(attributeId, itemId, data) {
    const res = await apiClient(`/admin/attributes/update-attribute-item/${attributeId}/${itemId}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async deleteAttributeItem(attributeId, itemId) {
    return apiClient(`/admin/attributes/delete-attribute-item/${attributeId}/${itemId}`, {
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
    return apiClient(`/admin/drop-campaigns/get-drop-campaigns${qs}`)
  },

  async getDropCampaign(id) {
    const res = await apiClient(`/admin/drop-campaigns/get-drop-campaign/${id}`)
    return res.data
  },

  async createDropCampaign(data) {
    const res = await apiClient('/admin/drop-campaigns/add-drop-campaign', {
      method: 'POST',
      data,
    })
    return res.data
  },

  async updateDropCampaign(id, data) {
    const res = await apiClient(`/admin/drop-campaigns/update-drop-campaign/${id}`, {
      method: 'PUT',
      data,
    })
    return res.data
  },

  async cancelDropCampaign(id, reason = '') {
    return apiClient(`/admin/drop-campaigns/cancel-drop-campaign/${id}`, {
      method: 'POST',
      data: { cancellation_reason: reason },
    })
  },

  // Orders & Local Dispatch
  async getOrders({ q = '', status = 'all', payment_status = 'all', channel = 'all', page = 1 } = {}) {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (status && status !== 'all') params.append('status', status)
    if (payment_status && payment_status !== 'all') params.append('payment_status', payment_status)
    if (channel && channel !== 'all') params.append('channel', channel)
    if (page > 1) params.append('page', page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/admin/orders/get-orders${qs}`)
  },

  async getOrder(id) {
    const res = await apiClient(`/admin/orders/get-order/${id}`)
    return res.data
  },

  async updateOrderStatus(id, data) {
    const res = await apiClient(`/admin/orders/update-order-status/${id}`, {
      method: 'PATCH',
      data,
    })
    return res.data
  },

  async getOrderHistory(id) {
    const res = await apiClient(`/admin/orders/get-order-status-history/${id}`)
    return res.data || []
  },
}
