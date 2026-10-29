import { apiClient } from '@/shared/api/apiClient'

/**
 * Admin Business Audit & Activity Logs API Service (Activity-based endpoints)
 */
export const adminLogsApi = {
  /**
   * Fetch filterable, paginated audit logs.
   */
  async getLogs(params = {}) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        searchParams.append(key, value.toString())
      }
    })

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient(`/admin/logs/get-logs${qs}`)
  },

  /**
   * Fetch aggregated summary KPI totals for the selected filters.
   */
  async getSummary(params = {}) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        searchParams.append(key, value.toString())
      }
    })

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient(`/admin/logs/get-summary${qs}`)
  },

  /**
   * Fetch single log item detail.
   */
  async getLogById(id) {
    return apiClient(`/admin/logs/get-log/${id}`)
  },
}
