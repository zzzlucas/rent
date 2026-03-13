import { request } from './client'

export const getPropertyTemplates = () => request('/property-templates')

export const createPropertyTemplate = (data: any) => request('/property-templates', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const updatePropertyTemplate = (id: number | string, data: any) => request(`/property-templates/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

export const deletePropertyTemplate = (id: number | string) => request(`/property-templates/${id}`, {
  method: 'DELETE'
})

export const applyPropertyTemplate = (id: number | string, roomIds: number[]) => request(`/property-templates/${id}/apply`, {
  method: 'POST',
  body: JSON.stringify({ roomIds })
})
