import { apiClient } from '@/shared/api/apiClient'

/**
 * Friends & Social Connections API Client
 */
export const friendsApi = {
  /**
   * Get confirmed friends of the authenticated user with optional search query.
   */
  async getFriends({ query = '', page = 1 } = {}) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (page > 1) params.append('page', page.toString())

    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await apiClient(`/friends${qs}`)
    return res
  },

  /**
   * Get pending incoming and outgoing friend requests + counts.
   */
  async getRequests() {
    const res = await apiClient('/friends/requests')
    return res.data
  },

  /**
   * Send a friend request by recipient_id or username.
   */
  async sendRequest({ recipient_id, username }) {
    const res = await apiClient('/friends/request', {
      method: 'POST',
      data: { recipient_id, username },
    })
    return res
  },

  /**
   * Accept an incoming friend request by friendship ID.
   */
  async acceptRequest(friendshipId) {
    const res = await apiClient(`/friends/requests/${friendshipId}/accept`, {
      method: 'POST',
    })
    return res
  },

  /**
   * Decline an incoming friend request.
   */
  async declineRequest(friendshipId) {
    const res = await apiClient(`/friends/requests/${friendshipId}/decline`, {
      method: 'POST',
    })
    return res
  },

  /**
   * Cancel an outgoing pending friend request.
   */
  async cancelRequest(friendshipId) {
    const res = await apiClient(`/friends/requests/${friendshipId}/cancel`, {
      method: 'DELETE',
    })
    return res
  },

  /**
   * Remove a confirmed friend.
   */
  async unfriend(userId) {
    const res = await apiClient(`/friends/${userId}/unfriend`, {
      method: 'DELETE',
    })
    return res
  },

  /**
   * Search users by name, username, or phone number.
   */
  async findUsers(query) {
    if (!query || query.trim().length < 2) return []
    const res = await apiClient(`/friends/find?q=${encodeURIComponent(query.trim())}`)
    return res.data || []
  },

  /**
   * Get suggested friends based on locality and mutual connections.
   */
  async getSuggestions() {
    const res = await apiClient('/friends/suggestions')
    return res.data || []
  },

  /**
   * Get Instagram-style public user profile with relationship status.
   */
  async getUserProfile(username) {
    const res = await apiClient(`/users/${encodeURIComponent(username)}`)
    return res.data
  },
}
