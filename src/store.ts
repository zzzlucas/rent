import { ref } from 'vue'

export interface PropertyTemplate {
  id: string
  name: string
  type: string
  area: string
  rent: number
  deposit: number
  paymentType: string
  amenities: string[]
  isDefault?: boolean
}

export const propertyTemplates = ref<PropertyTemplate[]>([])

export const activeApplyingTemplateId = ref<string | null>(null)

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const toasts = ref<Toast[]>([])

export const showToast = (message: string, type: Toast['type'] = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
}

import { followRoom, unfollowRoom, getFollowedIds } from './api/follow'
import { 
  getPropertyTemplates, 
  createPropertyTemplate, 
  updatePropertyTemplate, 
  deletePropertyTemplate,
  applyPropertyTemplate
} from './api/propertyTemplate'

export const fetchTemplates = async () => {
  try {
    const res = await getPropertyTemplates()
    if (res.code === 0) {
      propertyTemplates.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch templates', error)
  }
}

export const saveTemplateAction = async (template: PropertyTemplate) => {
  try {
    let res
    if (template.id && !isNaN(Number(template.id))) {
      res = await updatePropertyTemplate(template.id, template)
    } else {
      const { id, ...data } = template
      res = await createPropertyTemplate(data)
    }
    if (res.code === 0) {
      await fetchTemplates()
      showToast('模板保存成功')
      return true
    }
  } catch (error: any) {
    showToast(error.message || '保存失败', 'error')
  }
  return false
}

export const deleteTemplateAction = async (id: string | number) => {
  try {
    const res = await deletePropertyTemplate(id)
    if (res.code === 0) {
      await fetchTemplates()
      showToast('模板已删除', 'warning')
      return true
    }
  } catch (error: any) {
    showToast(error.message || '删除失败', 'error')
  }
  return false
}

export const applyTemplateToRooms = async (templateId: string | number, roomIds: number[]) => {
  try {
    const res = await applyPropertyTemplate(templateId, roomIds)
    if (res.code === 0) {
      showToast('模板应用成功')
      return true
    }
  } catch (error: any) {
    showToast(error.message || '应用失败', 'error')
  }
  return false
}

export const followedPropertyIds = ref<Set<string>>(new Set())

export const syncFollows = async () => {
  try {
    const res = await getFollowedIds()
    if (res.code === 0) {
      followedPropertyIds.value = new Set(res.data.map((id: number) => id.toString()))
    }
  } catch (error) {
    console.error('Failed to sync follows', error)
  }
}

export const toggleFollowProperty = async (id: string | number) => {
  const stringId = id.toString()
  const numericId = Number(id)
  const isFollowing = followedPropertyIds.value.has(stringId)
  try {
    if (isFollowing) {
      await unfollowRoom(numericId)
      followedPropertyIds.value.delete(stringId)
      showToast('已取消关注该房源', 'info')
    } else {
      await followRoom(numericId)
      followedPropertyIds.value.add(stringId)
      showToast('已成功关注该房源', 'success')
    }
  } catch (error: any) {
    showToast(error.message || '操作失败', 'error')
  }
}

// Theme Management
export type Theme = 'light' | 'dark'
const savedTheme = localStorage.getItem('theme') as Theme | null
export const theme = ref<Theme>(savedTheme || 'dark')

export const applyTheme = (newTheme: Theme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  document.documentElement.setAttribute('data-theme', newTheme)
}

export const toggleTheme = () => {
  const nextTheme = theme.value === 'light' ? 'dark' : 'light'
  applyTheme(nextTheme)
}

// Initialize
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme.value)
  fetchTemplates()
  syncFollows()
}

// 催缴记录追踪状态 (Buried point tracking)
export interface CollectionRecord {
  id: string
  isRead: boolean
  readAt?: string
  sentAt: string
}

export const collectionStats = ref<Record<string, CollectionRecord>>({
  '1': {
    id: '1',
    isRead: true,
    readAt: new Date().toLocaleDateString() + ' 09:41',
    sentAt: new Date().toLocaleDateString() + ' 08:30'
  }
})

export const registerCollection = (id: string) => {
  collectionStats.value[id] = {
    id,
    isRead: false,
    sentAt: new Date().toLocaleString()
  }
}

export const markAsRead = (id: string) => {
  if (collectionStats.value[id] && !collectionStats.value[id].isRead) {
    collectionStats.value[id].isRead = true
    collectionStats.value[id].readAt = new Date().toLocaleString()
    console.log(`[埋点日志] 租户点击了催缴链接，ID: ${id}, 时间: ${collectionStats.value[id].readAt}`)
  }
}
