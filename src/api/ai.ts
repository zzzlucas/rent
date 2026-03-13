import { request } from './client'

export async function chatProxy(messages: any[], stream = false) {
  if (stream) {
    const token = localStorage.getItem('token')
    const headers: any = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }

    return fetch('/api/ai/proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        stream: true
      })
    })
  }

  return request('/ai/proxy', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      stream: false
    })
  })
}
