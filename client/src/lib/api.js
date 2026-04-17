const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function fetchWithAuth(url, options = {}, getToken) {
  const token = await getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data
    )
  }

  return response.json()
}

export function createApiClient(getToken) {
  return {
    get: (url, options) => fetchWithAuth(url, { ...options, method: 'GET' }, getToken),
    post: (url, body, options) => fetchWithAuth(url, { ...options, method: 'POST', body: JSON.stringify(body) }, getToken),
    put: (url, body, options) => fetchWithAuth(url, { ...options, method: 'PUT', body: JSON.stringify(body) }, getToken),
    patch: (url, body, options) => fetchWithAuth(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }, getToken),
    delete: (url, options) => fetchWithAuth(url, { ...options, method: 'DELETE' }, getToken),
  }
}
