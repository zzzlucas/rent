import { request } from './client'

export const followRoom = (roomId: number) => {
  return request('/follows', {
    method: 'POST',
    body: JSON.stringify({ roomId })
  })
}

export const unfollowRoom = (roomId: number) => {
  return request(`/follows/${roomId}`, {
    method: 'DELETE'
  })
}

export const getFollowedIds = () => {
  return request('/follows/ids')
}

export const getFollowedRooms = () => {
  return request('/follows')
}
