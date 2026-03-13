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

export const propertyTemplates = ref<PropertyTemplate[]>([
  {
    id: '1',
    name: '精装大一居标准模板',
    type: '一室一厅',
    area: '45㎡',
    rent: 3200,
    deposit: 3200,
    paymentType: '押一付一',
    amenities: ['空调', '洗衣机', '冰箱', '热水器', '宽带', '床', '沙发'],
    isDefault: true
  },
  {
    id: '2',
    name: '简约单间经济模板',
    type: '单间',
    area: '25㎡',
    rent: 1800,
    deposit: 1800,
    paymentType: '押一付一',
    amenities: ['空调', '洗衣机', '热水器', '床'],
    isDefault: false
  },
  {
    id: '3',
    name: '豪华三居室模板',
    type: '三室两厅',
    area: '120㎡',
    rent: 8500,
    deposit: 17000,
    paymentType: '押二付一',
    amenities: ['全免家电', '智能门锁', '浴缸', '阳台', '车位'],
    isDefault: false
  }
])

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

export const followedPropertyIds = ref<Set<string>>(new Set(['1', '2', '3', '4'])) // Pre-fill with mock data

export const toggleFollowProperty = (id: string) => {
  if (followedPropertyIds.value.has(id)) {
    followedPropertyIds.value.delete(id)
    showToast('已取消关注该房源', 'info')
  } else {
    followedPropertyIds.value.add(id)
    showToast('已成功关注该房源', 'success')
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

// Initialize theme
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme.value)
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
