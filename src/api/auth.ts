import { request } from './client'

export const login = (data: any) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const register = (data: any) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const getUserInfo = () => request('/user/info')
