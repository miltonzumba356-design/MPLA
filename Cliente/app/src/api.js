const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'clacs_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`
    try {
      const body = await response.json()
      message = body.detail || message
    } catch {
      // Keep the generic message when the API does not return JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  me: () => request('/auth/me'),
  projects: () => request('/projects/'),
  createProject: (payload) => request('/projects/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  addKeyword: (projectId, payload) => request(`/projects/${projectId}/keywords`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  mentions: (projectId, filters = {}) => {
    const params = new URLSearchParams({ project_id: projectId, limit: filters.limit || 100 })
    if (filters.source && filters.source !== 'all') params.set('source', filters.source)
    if (filters.sentiment && filters.sentiment !== 'all') params.set('sentiment', filters.sentiment)
    return request(`/mentions/?${params.toString()}`)
  },
  mentionStats: (projectId) => request(`/mentions/stats?project_id=${projectId}`),
  alerts: (projectId) => request(`/alerts/?project_id=${projectId}`),
  reports: (projectId) => request(`/reports/?project_id=${projectId}`),
  generateReport: (payload) => request('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}
