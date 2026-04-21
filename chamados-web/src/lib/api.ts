const BASE = import.meta.env.VITE_API_URL ?? ''

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${BASE}${p}`
}

export function getToken(): string | null {
  return localStorage.getItem('agrosys_token')
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('agrosys_token', token)
  } else {
    localStorage.removeItem('agrosys_token')
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const t = getToken()
  if (t) {
    headers.set('Authorization', `Bearer ${t}`)
  }
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(apiUrl(path), { ...init, headers })
}
