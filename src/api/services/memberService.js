import axiosClient from '../axiosClient'
import { ENDPOINTS } from '../endpoints'

export const memberService = {
  /**
   * Fetch authenticated member's profile and membership status.
   */
  getProfile() {
    return axiosClient.get(ENDPOINTS.MEMBER.PROFILE)
  },

  /**
   * Update member profile fields.
   *
   * @param {object} data
   */
  updateProfile(data) {
    return axiosClient.put(ENDPOINTS.MEMBER.PROFILE, data)
  },

  /**
   * Upload or update member profile photo (multipart/form-data with 'image').
   *
   * @param {File|Blob|FormData} fileOrFormData
   */
  updateProfilePhoto(fileOrFormData) {
    let payload = fileOrFormData
    if (fileOrFormData instanceof File || (typeof Blob !== 'undefined' && fileOrFormData instanceof Blob)) {
      payload = new FormData()
      payload.append('image', fileOrFormData)
    }
    return axiosClient.post(ENDPOINTS.MEMBER.UPDATE_PHOTO, payload)
  },

  /**
   * Helper to get direct streaming URL for a member's profile image.
   *
   * @param {number|string} userId
   * @returns {string}
   */
  getUserImageUrl(userId) {
    if (!userId) return ''
    return ENDPOINTS.MEMBER.USER_IMAGE(userId)
  },

  /**
   * Toggle member visibility in the public directory.
   *
   * @param {boolean} isPublic
   */
  toggleVisibility(isPublic) {
    return axiosClient.patch(ENDPOINTS.MEMBER.TOGGLE_VISIBILITY, {
      is_public: Boolean(isPublic),
    })
  },

  /**
   * Fetch Digital E-Member Card payload for the logged-in member.
   */
  getECard() {
    return axiosClient.get(ENDPOINTS.MEMBER.E_CARD)
  },

  /**
   * Fetch donation transaction history for the logged-in member.
   *
   * @param {object} [params]
   */
  getMyDonations(params = {}) {
    return axiosClient.get(ENDPOINTS.MEMBER.DONATIONS, { params })
  },
}

export default memberService

