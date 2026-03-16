import { request } from './client'

export const login = (data: any) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const register = (data: any) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const sendCode = (phone: string) => request('/auth/sendCode', {
  method: 'POST',
  body: JSON.stringify({ phone })
})

export const smsLogin = (data: { phone: string; code: string }) => request('/auth/smsLogin', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const getUserInfo = () => request('/user/info')
