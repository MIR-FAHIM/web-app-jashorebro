import { ApiError } from './errors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Standard HTTP transport client for Laravel API.
 */
export async function apiClient(endpoint, { data, method = 'GET', headers = {}, ...customConfig } = {}) {
  const token = localStorage.getItem('jb_auth_token')

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`
    const response = await fetch(url, config)

    if (response.status === 401) {
      // Clear token if unauthenticated
      localStorage.removeItem('jb_auth_token')
    }

    const json = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new ApiError(
        json.message || `Request failed with status ${response.status}`,
        response.status,
        json.errors
      )
    }

    return json
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error.message || 'Network error', 0)
  }
}
