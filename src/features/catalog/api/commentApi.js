import { apiClient } from '@/shared/api/apiClient'

/**
 * Product Comment & Reaction Center API Service (Activity-based endpoints)
 */
export const commentApi = {
  /**
   * Fetch paginated comments for a product.
   */
  async getComments(productId, { page = 1, per_page = 15, sort = 'latest', type = '', verified_only = false } = {}) {
    const params = new URLSearchParams()
    if (page > 1) params.append('page', page.toString())
    if (per_page !== 15) params.append('per_page', per_page.toString())
    if (sort && sort !== 'latest') params.append('sort', sort)
    if (type && type !== 'all') params.append('type', type)
    if (verified_only) params.append('verified_only', '1')

    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient(`/products/${productId}/comments/get-comments${qs}`)
  },

  /**
   * Fetch social metrics summary for a product.
   */
  async getSummary(productId) {
    const res = await apiClient(`/products/${productId}/comments/get-summary`)
    return res.data
  },

  /**
   * Post a new comment or reply (supports text and optional image attachment).
   */
  async addComment(productId, data, imageFile = null) {
    let payload = data

    if (imageFile) {
      const formData = new FormData()
      formData.append('content', data.content || '')
      if (data.comment_type) formData.append('comment_type', data.comment_type)
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString())
      if (data.price_suggestion) formData.append('price_suggestion', data.price_suggestion.toString())
      if (data.alternative_product_id) formData.append('alternative_product_id', data.alternative_product_id.toString())
      formData.append('attachment', imageFile)
      payload = formData
    }

    const res = await apiClient(`/products/${productId}/comments/add-comment`, {
      method: 'POST',
      data: payload,
    })
    return res.data
  },

  /**
   * Edit existing comment content.
   */
  async updateComment(commentId, content) {
    const res = await apiClient(`/comments/update-comment/${commentId}`, {
      method: 'PUT',
      data: { content },
    })
    return res.data
  },

  /**
   * Delete comment (soft delete).
   */
  async deleteComment(commentId) {
    return apiClient(`/comments/delete-comment/${commentId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Toggle or change sentiment reaction on a comment.
   */
  async toggleReaction(commentId, reactionType) {
    return apiClient(`/comments/toggle-reaction/${commentId}`, {
      method: 'POST',
      data: { reaction_type: reactionType },
    })
  },

  /**
   * Report inappropriate comment.
   */
  async reportComment(commentId, { reason, description = '' }) {
    return apiClient(`/comments/report-comment/${commentId}`, {
      method: 'POST',
      data: { reason, description },
    })
  },
}
