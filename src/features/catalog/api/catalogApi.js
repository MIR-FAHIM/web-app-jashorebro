import { apiClient } from '@/shared/api/apiClient'

/**
 * Merchants & Product Catalog API Service
 */
export const catalogApi = {
  /**
   * Fetch all active categories with product counts.
   */
  async getCategories() {
    const res = await apiClient('/categories')
    return res.data || []
  },

  /**
   * Fetch single category by slug.
   */
  async getCategory(slug) {
    const res = await apiClient(`/categories/${encodeURIComponent(slug)}`)
    return res.data
  },

  /**
   * Search and filter product catalog.
   */
  async getProducts({
    query = '',
    category = '',
    seller = '',
    is_featured = undefined,
    is_drop_ready = undefined,
    min_price = undefined,
    max_price = undefined,
    sort = 'latest',
    page = 1,
    per_page = 20,
  } = {}) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (category) params.append('category', category)
    if (seller) params.append('seller', seller)
    if (is_featured !== undefined) params.append('is_featured', is_featured ? '1' : '0')
    if (is_drop_ready !== undefined) params.append('is_drop_ready', is_drop_ready ? '1' : '0')
    if (min_price) params.append('min_price', min_price.toString())
    if (max_price) params.append('max_price', max_price.toString())
    if (sort) params.append('sort', sort)
    if (page > 1) params.append('page', page.toString())
    if (per_page !== 20) params.append('per_page', per_page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await apiClient(`/products${qs}`)
    return res
  },

  /**
   * Fetch single product details with seller, gallery, and variants.
   */
  async getProduct(slug) {
    const res = await apiClient(`/products/${encodeURIComponent(slug)}`)
    return res.data
  },

  /**
   * Fetch curated featured and drop-ready products.
   */
  async getFeaturedProducts() {
    const res = await apiClient('/products/featured')
    return res.data || []
  },

  /**
   * List verified merchants in Jashore.
   */
  async getSellers({ query = '', page = 1 } = {}) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (page > 1) params.append('page', page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await apiClient(`/sellers${qs}`)
    return res
  },

  /**
   * Single seller storefront with their products.
   */
  async getSeller(slug) {
    const res = await apiClient(`/sellers/${encodeURIComponent(slug)}`)
    return res.data
  },

  /**
   * Apply to become a merchant.
   */
  async applySeller(formData) {
    const res = await apiClient('/sellers/apply', {
      method: 'POST',
      data: formData,
    })
    return res
  },
}
