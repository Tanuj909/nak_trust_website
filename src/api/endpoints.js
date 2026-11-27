/**
 * Centralized API Endpoints Registry for Public Website & Member Portal.
 * All endpoint paths are relative to VITE_API_BASE_URL.
 */

export const ENDPOINTS = Object.freeze({
  AUTH: {
    REGISTER: '/register',
    MEMBER_LOGIN: '/member/login',
    LOGOUT: '/logout',
  },
  MEMBER: {
    PROFILE: '/member/profile',
    UPDATE_PHOTO: '/profile/photo',
    USER_IMAGE: (userId) => `/media/user/${userId}`,
    TOGGLE_VISIBILITY: '/member/profile/visibility',
    E_CARD: '/member/e-card',
    DONATIONS: '/member/donations',
    WELFARE_APPLICATIONS: '/member/welfare-applications',
    WELFARE_DOCUMENT: (documentId) => `/member/welfare-applications/documents/${documentId}`,
  },
  PUBLIC: {
    ACTIVE_QR: '/donations/active-qr',
    SUBMIT_DONATION: '/donations',
    APPROVED_DONORS: '/donations/approved',
    MEMBERS_DIRECTORY: '/members/directory',
    VERIFY_MEMBER_ECARD: (identifier) => `/members/verify/${identifier}`,
    WELFARE_APPLICATIONS: '/welfare-applications',
    TRACK_WELFARE_APPLICATION: (applicationNumber) => `/welfare-applications/track/${encodeURIComponent(applicationNumber)}`,
    POSTS: '/posts',
    POST_DETAIL: (slugOrId) => `/posts/${slugOrId}`,
    POST_IMAGE: (imageId) => `/posts/images/${imageId}`,
    GALLERY: '/gallery',
    GALLERY_IMAGE: (id) => `/gallery/${id}/image`,
    CONTACT: '/contact',
  },
})

/**
 * Safely resolves media/image streaming paths to full URLs using VITE_API_BASE_URL.
 *
 * @param {string} relativePath
 * @returns {string}
 */
export function getMediaUrl(relativePath) {
  if (!relativePath) return ''
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${baseUrl}${cleanPath}`
}

