const BASE_URL = '/api'

export async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers)
  
  if (token) {
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers
  })

  // 如果是 401，可能需要处理登录逻辑，这里简单处理
  if (response.status === 401) {
    console.error('Unauthorized, please login.')
    // localStorage.removeItem('token')
  }

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message || 'Request failed')
  }

  return result
}
