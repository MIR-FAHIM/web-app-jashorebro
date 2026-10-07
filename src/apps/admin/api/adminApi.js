import { apiClient } from '@/shared/api/apiClient'

/**
 * Admin Panel & Control Center API Service
 */
export const adminApi = {
  /**
   * Fetch executive KPIs and platform health.
   */
  async getOverview() {
    try {
      const res = await apiClient('/admin/overview')
      return res.data
    } catch {
      // Graceful fallback if offline or backend route error
      return null
    }
  },

  /**
   * Fetch users directory.
   */
  async getUsers({ query = '', status = 'all', page = 1 } = {}) {
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (status && status !== 'all') params.append('status', status)
      if (page > 1) params.append('page', page.toString())

      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient(`/admin/users${qs}`)
      return res
    } catch {
      return { data: [], meta: { total: 0 } }
    }
  },

  /**
   * Fetch producers / sellers.
   */
  async getSellers({ query = '', status = 'all', page = 1 } = {}) {
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (status && status !== 'all') params.append('status', status)
      if (page > 1) params.append('page', page.toString())

      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient(`/admin/sellers${qs}`)
      return res
    } catch {
      return { data: [], meta: { total: 0 } }
    }
  },

  /**
   * Update seller status (e.g. approve, suspend).
   */
  async updateSellerStatus(id, status) {
    const res = await apiClient(`/admin/sellers/${id}/status`, {
      method: 'PATCH',
      data: { status },
    })
    return res
  },

  /**
   * Update product status or drop readiness.
   */
  async updateProduct(id, payload) {
    const res = await apiClient(`/admin/products/${id}`, {
      method: 'PATCH',
      data: payload,
    })
    return res
  },
}
