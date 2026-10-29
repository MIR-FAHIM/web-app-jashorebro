import { apiClient } from '@/shared/api/apiClient'

/**
 * Friends & Social Connections API Client (Activity-based endpoints)
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
    const res = await apiClient(`/friends/get-friends${qs}`)
    return res
  },

  /**
   * Get pending incoming and outgoing friend requests + counts.
   */
  async getRequests() {
    const res = await apiClient('/friends/get-friend-requests')
    return res.data
  },

  /**
   * Send a friend request by recipient_id or username.
   */
  async sendRequest({ recipient_id, username }) {
    const res = await apiClient('/friends/send-friend-request', {
      method: 'POST',
      data: { recipient_id, username },
    })
    return res
  },

  /**
   * Accept an incoming friend request by friendship ID.
   */
  async acceptRequest(friendshipId) {
    const res = await apiClient(`/friends/accept-friend-request/${friendshipId}`, {
      method: 'POST',
    })
    return res
  },

  /**
   * Decline an incoming friend request.
   */
  async declineRequest(friendshipId) {
    const res = await apiClient(`/friends/decline-friend-request/${friendshipId}`, {
      method: 'POST',
    })
    return res
  },

  /**
   * Cancel an outgoing pending friend request.
   */
  async cancelRequest(friendshipId) {
    const res = await apiClient(`/friends/cancel-friend-request/${friendshipId}`, {
      method: 'DELETE',
    })
    return res
  },

  /**
   * Remove a confirmed friend.
   */
  async unfriend(userId) {
    const res = await apiClient(`/friends/unfriend-user/${userId}`, {
      method: 'DELETE',
    })
    return res
  },

  /**
   * Search users by name, username, or phone number.
   */
  async findUsers(query) {
    if (!query || query.trim().length < 2) return []
    const res = await apiClient(`/friends/find-friends?q=${encodeURIComponent(query.trim())}`)
    return res.data || []
  },

  /**
   * Get suggested friends based on locality and mutual connections.
   */
  async getSuggestions() {
    const res = await apiClient('/friends/get-friend-suggestions')
    return res.data || []
  },

  /**
   * Get public identity, relationship status, and a page of public Picks.
   */
  async getUserProfile(username, { picks_page = 1, picks_per_page = 12 } = {}) {
    const params = new URLSearchParams({ picks_page: String(picks_page), picks_per_page: String(picks_per_page) })
    const res = await apiClient(`/users/get-user-profile/${encodeURIComponent(username)}?${params}`)
    return res.data
  },
}
