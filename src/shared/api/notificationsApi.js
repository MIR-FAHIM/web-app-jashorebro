import { apiClient } from './apiClient'

/**
 * In-App Notifications API Service (Activity-based endpoints)
 */
export const notificationsApi = {
  /**
   * Fetch filterable, paginated notifications for current user.
   */
  async getNotifications({ context = 'customer', filter = 'all', page = 1, per_page = 15 } = {}) {
    const params = new URLSearchParams()
    if (context) params.append('context', context)
    if (filter && filter !== 'all') params.append('filter', filter)
    if (page > 1) params.append('page', page.toString())
    if (per_page) params.append('per_page', per_page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/notifications/get-notifications${qs}`)
  },

  /**
   * Fetch unread notification badge count.
   */
  async getUnreadCount({ context = 'customer' } = {}) {
    const params = new URLSearchParams()
    if (context) params.append('context', context)

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/notifications/get-unread-count${qs}`)
  },

  /**
   * Idempotently mark a notification as read.
   */
  async markAsRead(id) {
    return apiClient(`/notifications/mark-notification-read/${id}`, {
      method: 'PATCH',
    })
  },

  /**
   * Mark all unread notifications in current context as read.
   */
  async markAllAsRead({ context = 'customer' } = {}) {
    return apiClient('/notifications/mark-all-notifications-read', {
      method: 'POST',
      data: { context },
    })
  },

  /**
   * Fetch single notification detail and mark read.
   */
  async getNotification(id) {
    return apiClient(`/notifications/get-notification/${id}`)
  },
}
