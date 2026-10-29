import { apiClient } from './apiClient'

/**
 * Customer Addresses API Service (Activity-based endpoints)
 */
export const addressesApi = {
  /**
   * Fetch all saved addresses for the authenticated user.
   */
  async getAddresses() {
    const res = await apiClient('/addresses/get-addresses')
    return res.data || []
  },

  /**
   * Fetch a single address by ID.
   */
  async getAddress(id) {
    const res = await apiClient(`/addresses/get-address/${id}`)
    return res.data
  },

  /**
   * Create a new delivery address.
   */
  async createAddress(payload) {
    const res = await apiClient('/addresses/add-address', {
      method: 'POST',
      data: payload,
    })
    return res.data
  },

  /**
   * Update an existing delivery address.
   */
  async updateAddress(id, payload) {
    const res = await apiClient(`/addresses/update-address/${id}`, {
      method: 'PATCH',
      data: payload,
    })
    return res.data
  },

  /**
   * Delete a delivery address.
   */
  async deleteAddress(id) {
    const res = await apiClient(`/addresses/delete-address/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  /**
   * Set a delivery address as default.
   */
  async setDefaultAddress(id) {
    const res = await apiClient(`/addresses/set-default-address/${id}`, {
      method: 'PATCH',
    })
    return res.data
  },
}
