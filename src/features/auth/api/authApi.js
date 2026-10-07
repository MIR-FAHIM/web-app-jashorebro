import { apiClient } from '@/shared/api/apiClient'

/**
 * Auth API Service calling the Laravel endpoints
 */
export const authApi = {
  /**
   * Login with phone and password.
   */
  async login({ phone, password }) {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      data: { phone, password },
    })
    return res.data
  },

  /**
   * Register with mobile number and password.
   */
  async register({ name, username, phone, password, email }) {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      data: { name, username, phone, password, email },
    })
    return res.data
  },

  /**
   * Send phone OTP challenge.
   */
  async sendOtp({ phone, purpose = 'phone_verification' }) {
    const res = await apiClient('/auth/otp/send', {
      method: 'POST',
      data: { phone, purpose },
    })
    return res
  },

  /**
   * Verify phone OTP challenge.
   */
  async verifyOtp({ phone, code, purpose = 'phone_verification' }) {
    const res = await apiClient('/auth/otp/verify', {
      method: 'POST',
      data: { phone, code, purpose },
    })
    return res
  },

  /**
   * Fetch current authenticated user.
   */
  async getMe() {
    const res = await apiClient('/auth/me')
    return res.data.user
  },

  /**
   * Log out and revoke access token.
   */
  async logout() {
    return apiClient('/auth/logout', { method: 'POST' })
  },
}
