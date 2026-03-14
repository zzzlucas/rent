import { request, BASE_URL } from './client'

export async function chatProxy(payload: { messages: any[], model?: string, stream?: boolean }) {
  const { messages, model, stream = false } = payload
  if (stream) {
    const token = localStorage.getItem('token')
    const headers: any = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }

    return fetch(`${BASE_URL}/ai/proxy`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        model,
        stream: true
      })
    })
  }

  return request('/ai/proxy', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      model,
      stream: false
    })
  })
}

export async function fetchAiModels() {
  return request('/ai/proxy/models', {
    method: 'GET'
  })
}
