import axiosClient from '../axiosClient'
import { ENDPOINTS } from '../endpoints'

export const authService = {
  /**
   * Submit 6-step member registration with optional avatar.
   * Accepts FormData or standard JavaScript object.
   *
   * @param {FormData|object} payload
   */
  registerMember(payload) {
    return axiosClient.post(ENDPOINTS.AUTH.REGISTER, payload)
  },

  /**
   * Authenticate regular member with Phone / Member Code / Email + Password.
   *
   * @param {{ login_id: string, password: string }} credentials
   */
  loginMember(credentials) {
    return axiosClient.post(ENDPOINTS.AUTH.MEMBER_LOGIN, credentials)
  },

  /**
   * Revoke current active Sanctum session.
   */
  logoutMember() {
    return axiosClient.post(ENDPOINTS.AUTH.LOGOUT)
  },
}

export default authService

