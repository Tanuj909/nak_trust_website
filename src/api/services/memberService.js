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

  /**
   * Fetch paginated list of welfare assistance applications submitted by the logged-in member.
   *
   * @param {object} [params]
   */
  getMyWelfareApplications(params = {}) {
    return axiosClient.get(ENDPOINTS.MEMBER.WELFARE_APPLICATIONS, { params })
  },

  /**
   * Download/stream an attached document for a welfare application submitted by the member.
   *
   * @param {number|string} documentId
   * @param {string} fileName
   */
  async downloadWelfareDocument(documentId, fileName = 'document') {
    const response = await axiosClient.get(ENDPOINTS.MEMBER.WELFARE_DOCUMENT(documentId), {
      responseType: 'blob',
    })
    const blob = new Blob([response], { type: response.type || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

export default memberService

