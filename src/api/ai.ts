import { request, BASE_URL } from './client'

export interface RecognitionMetaPayload {
  requestType?: string
  ocrModel?: string
  analysisModel?: string
  contractFormat?: string
  contractCount?: number
  pageCount?: number
  fileSizeBytes?: number
  imageWidth?: number
  imageHeight?: number
}

export interface RecognitionRecord {
  id: number
  createdAt: string
  model: string
  requestType: string
  ocrModel: string | null
  analysisModel: string | null
  contractFormat: string | null
  contractCount: number | null
  pageCount: number | null
  fileSizeBytes: number | null
  imageWidth: number | null
  imageHeight: number | null
  aspectRatio: number | null
  estimatedDurationMs: number | null
  actualDurationMs: number | null
  estimatedSampleSize: number
  estimatedConfidence: number | null
  reviewed?: boolean
  reviewedAt?: string | null
  reviewAccuracy?: number | null
  success: boolean
  status: number
  errorMessage: string | null
  hasDetail: boolean
}

export interface RecognitionReviewField {
  field: string
  original: string
  fixed: string
}

export async function chatProxy(payload: {
  messages: any[]
  model?: string
  stream?: boolean
  recognitionMeta?: RecognitionMetaPayload
}) {
  const { messages, model, stream = false, recognitionMeta } = payload
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
        stream: true,
        recognitionMeta
      })
    })
  }

  return request('/ai/proxy', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      model,
      stream: false,
      recognitionMeta
    })
  })
}

export async function fetchAiModels() {
  return request('/ai/proxy/models', {
    method: 'GET'
  })
}

export async function fetchRecognitionRecords(limit = 10) {
  return request(`/ai/proxy/recognition-records?limit=${limit}`, {
    method: 'GET'
  }) as Promise<{ code: number, data: RecognitionRecord[] }>
}

export async function fetchRecognitionRecordDetail(id: number) {
  return request(`/ai/proxy/recognition-records/${id}`, {
    method: 'GET'
  })
}

export async function clearRecognitionRecords() {
  return request('/ai/proxy/recognition-records', {
    method: 'DELETE'
  })
}

export async function submitRecognitionReview(payload: {
  recordId?: number
  fields: RecognitionReviewField[]
  recognitionMeta?: RecognitionMetaPayload
  ocrModel?: string
  analysisModel?: string
  model?: string
  confirmed?: boolean
  note?: string
}) {
  return request('/ai/proxy/recognition-records/review', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
