import { request } from './client'

export const getProperties = () => request('/properties')
export const createProperty = (data: any) => request('/properties', {
  method: 'POST',
  body: JSON.stringify(data)
})
export const updateProperty = (id: number, data: any) => request(`/properties/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})
export const deleteProperty = (id: number) => request(`/properties/${id}`, {
  method: 'DELETE'
})

export const getRooms = (propertyId?: number) => {
  const url = propertyId ? `/rooms?propertyId=${propertyId}` : '/rooms'
  return request(url)
}
export const createRoom = (data: any) => request('/rooms', {
  method: 'POST',
  body: JSON.stringify(data)
})
export const updateRoom = (id: number, data: any) => request(`/rooms/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

export const getCustomers = (params: any = {}) => {
  const query = new URLSearchParams(params).toString()
  return request(`/customers?${query}`)
}
export const createCustomer = (data: any) => request('/customers', {
  method: 'POST',
  body: JSON.stringify(data)
})

// 合同/办理入住
export const createContract = (data: any) => request('/contracts', {
  method: 'POST',
  body: JSON.stringify(data)
})
export const getContracts = () => request('/contracts')
export const terminateLease = (id: number) => request(`/contracts/${id}`, {
  method: 'DELETE'
})

// 初始化接口
export const initDefaultTenant = () => request('/auth/init-default-tenant', {
  method: 'POST'
})
