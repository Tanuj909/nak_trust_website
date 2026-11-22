import axios from 'axios'
import { ENDPOINTS } from './endpoints'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Bearer Token & handle FormData
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nak_member_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Allow browser to calculate boundary for FormData automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Flatten response.data, normalize errors, and handle 401s
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status || 500
    const responseData = error.response?.data

    // Normalize error payload
    const normalizedError = {
      status,
      message: responseData?.message || error.message || 'An unexpected error occurred.',
      errors: responseData?.errors || {},
      data: responseData || null,
      raw: error,
    }

    // Auto-logout on 401 Unauthorized for protected calls (excluding login attempts)
    if (status === 401) {
      const requestUrl = error.config?.url || ''
      const isLoginRequest = requestUrl.includes(ENDPOINTS.AUTH.MEMBER_LOGIN) || requestUrl.endsWith('/login')

      if (!isLoginRequest) {
        localStorage.removeItem('nak_member_token')
        localStorage.removeItem('nak_member_user')

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nak:auth-expired'))
        }
      }
    }

    return Promise.reject(normalizedError)
  }
)

export default axiosClient

