// Backend integration point for the future PHP API.
// Current phase intentionally uses static data only.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Backend API is not configured. Use static services in the current phase.')
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}
