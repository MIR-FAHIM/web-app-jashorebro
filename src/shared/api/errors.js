/**
 * Standard API Error model representing Laravel validation errors and HTTP status.
 */
export class ApiError extends Error {
  constructor(message, status = 500, validationErrors = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
  }

  isValidationError() {
    return this.status === 422 && Boolean(this.validationErrors)
  }

  getFirstError() {
    if (!this.validationErrors) return this.message
    const firstKey = Object.keys(this.validationErrors)[0]
    return this.validationErrors[firstKey]?.[0] || this.message
  }
}
