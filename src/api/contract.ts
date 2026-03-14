import { request } from './client'

export const getContracts = () => {
  return request('/contracts', { method: 'GET' })
}

export const createContract = (data: any) => {
  return request('/contracts', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export const terminateContract = (id: number) => {
  return request(`/contracts/${id}`, { method: 'DELETE' })
}
