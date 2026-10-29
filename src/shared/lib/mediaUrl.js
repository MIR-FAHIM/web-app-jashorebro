const LIVE_BASE_URL = 'https://backend.jashorebro.com'
const isLoopback = (hostname) => ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
const configuredMediaBase = (() => {
  try {
    const configured = new URL(import.meta.env.VITE_API_BASE_URL || LIVE_BASE_URL, window.location.origin)
    return configured.origin
  } catch { return LIVE_BASE_URL }
})()
const usesLocalMedia = (() => {
  try { return import.meta.env.DEV && /^https?:\/\//i.test(import.meta.env.VITE_API_BASE_URL || '') && isLoopback(window.location.hostname) && isLoopback(new URL(configuredMediaBase).hostname) } catch { return false }
})()
const MEDIA_BASE_URL = usesLocalMedia ? configuredMediaBase : LIVE_BASE_URL

/**
 * Resolve any image URL: ensures legacy localhost, relative paths,
 * or missing protocol use the backend media base. Local development stays local
 * only when both the frontend and the configured API use loopback hosts.
 *
 * @param {string|null|undefined} url
 * @param {string} [fallback='']
 * @returns {string}
 */
export function resolveImageUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback

  let trimmed = url.trim()
  if (!trimmed) return fallback

  // Clean double storage if present
  trimmed = trimmed.replace(/\/storage\/storage\//g, '/storage/')

  if (usesLocalMedia) {
    try {
      const absolute = new URL(trimmed)
      if (['http:', 'https:'].includes(absolute.protocol) && isLoopback(absolute.hostname)) return trimmed
    } catch { /* Relative media paths are resolved below. */ }
  }

  // If URL references localhost or 127.0.0.1 (any port)
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, LIVE_BASE_URL)
  }

  // If already absolute URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Strip public/ prefix if any
  if (trimmed.startsWith('public/')) {
    trimmed = trimmed.substring(7)
  } else if (trimmed.startsWith('/public/')) {
    trimmed = trimmed.substring(8)
  }

  // If relative storage path
  if (trimmed.startsWith('/storage/')) {
    return `${MEDIA_BASE_URL}${trimmed}`
  }
  if (trimmed.startsWith('storage/')) {
    return `${MEDIA_BASE_URL}/${trimmed}`
  }

  // If relative asset subpath
  if (/^(?:products|categories|shops|avatars|covers|uploads|images)\//i.test(trimmed)) {
    return `${MEDIA_BASE_URL}/storage/${trimmed}`
  }

  return `${MEDIA_BASE_URL}/storage/${trimmed.replace(/^\/+/, '')}`
}

/**
 * Universal resolver to extract and format a product's primary image URL.
 * Checks primary_image, primaryImage, images list, and direct image properties.
 *
 * @param {object|null|undefined} product
 * @param {string} [fallback='']
 * @returns {string}
 */
export function getProductImageUrl(product, fallback = '') {
  if (!product || typeof product !== 'object') return fallback

  const candidate =
    product.primary_image?.image_url ||
    product.primary_image?.thumbnail_url ||
    product.primary_image?.file_path ||
    product.primaryImage?.image_url ||
    product.primaryImage?.thumbnail_url ||
    product.primaryImage?.file_path ||
    product.image_url ||
    product.image ||
    product.images?.[0]?.image_url ||
    product.images?.[0]?.thumbnail_url ||
    product.images?.[0]?.file_path ||
    product.thumbnail_url ||
    product.thumbnail ||
    ''

  return resolveImageUrl(candidate, fallback)
}
