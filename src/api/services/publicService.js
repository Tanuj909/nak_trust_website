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
   * Public directory of active registered members.
   *
   * @param {object} [params]
   */
  getPublicMembers(params = {}) {
    return axiosClient.get(ENDPOINTS.PUBLIC.MEMBERS_DIRECTORY, { params })
  },

  /**
   * Public verification and retrieval of a member's Digital E-Card by Member Code or Phone.
   *
   * @param {string|number} identifier
   */
  verifyMemberECard(identifier) {
    const clean = encodeURIComponent(String(identifier).trim())
    return axiosClient.get(ENDPOINTS.PUBLIC.VERIFY_MEMBER_ECARD(clean))
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

  /**
   * Submit mutual welfare assistance application (Demise, Kanyadaan, Medical) with optional documents.
   *
   * @param {FormData|object} payload
   */
  submitWelfareApplication(payload) {
    return axiosClient.post(ENDPOINTS.PUBLIC.WELFARE_APPLICATIONS, payload)
  },

  /**
   * Track live status of a welfare assistance application by application reference number.
   *
   * @param {string} applicationNumber
   */
  trackWelfareApplication(applicationNumber) {
    const cleanNumber = String(applicationNumber).trim()
    return axiosClient.get(ENDPOINTS.PUBLIC.TRACK_WELFARE_APPLICATION(cleanNumber))
  },
}

export default publicService

