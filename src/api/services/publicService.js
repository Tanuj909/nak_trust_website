import axiosClient from '../axiosClient'
import { ENDPOINTS } from '../endpoints'

export const publicService = {
  /**
   * Retrieve active Trust UPI & Bank QR code details.
   */
  getActiveQr() {
    return axiosClient.get(ENDPOINTS.PUBLIC.ACTIVE_QR)
  },

  /**
   * Submit donation transaction with proof screenshot (multipart/form-data).
   *
   * @param {FormData} formData
   */
  submitDonation(formData) {
    return axiosClient.post(ENDPOINTS.PUBLIC.SUBMIT_DONATION, formData)
  },

  /**
   * Paginated list of approved donations (anonymous donors masked).
   *
   * @param {object} [params]
   */
  getApprovedDonors(params = {}) {
    return axiosClient.get(ENDPOINTS.PUBLIC.APPROVED_DONORS, { params })
  },

  /**
   * Public directory of active registered members (privacy-protected: member_code omitted).
   *
   * @param {object} [params]
   */
  getPublicMembers(params = {}) {
    return axiosClient.get(ENDPOINTS.PUBLIC.MEMBERS_DIRECTORY, { params })
  },

  /**
   * Paginated list of published news, blogs & events.
   *
   * @param {object} [params]
   */
  getPosts(params = {}) {
    return axiosClient.get(ENDPOINTS.PUBLIC.POSTS, { params })
  },

  /**
   * Fetch single published post with complete gallery images by slug or ID.
   *
   * @param {string|number} slugOrId
   */
  getPostBySlugOrId(slugOrId) {
    return axiosClient.get(ENDPOINTS.PUBLIC.POST_DETAIL(slugOrId))
  },

  /**
   * Paginated public photo gallery items.
   *
   * @param {object} [params]
   */
  getGallery(params = {}) {
    return axiosClient.get(ENDPOINTS.PUBLIC.GALLERY, { params })
  },

  /**
   * Submit visitor contact inquiry.
   *
   * @param {object} payload
   */
  submitContact(payload) {
    return axiosClient.post(ENDPOINTS.PUBLIC.CONTACT, payload)
  },
}

export default publicService

