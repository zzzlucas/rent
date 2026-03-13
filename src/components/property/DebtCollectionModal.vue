<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { 
  X, 
  Zap, 
  Search, 
  User, 
  Phone, 
  Home, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  Clock
} from 'lucide-vue-next'
import { followedPropertyIds, showToast, collectionStats, registerCollection } from '../../store'
import BaseModal from '../common/BaseModal.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const searchQuery = ref('')
const isSending = ref(false)
const sendProgress = ref(0)
const selectedIds = ref<Set<string>>(new Set())

// Mock data for potential debt collection
const debtProperties = [
  { id: '1', title: '秀湖花苑 8号楼 1202', tenant: '张先生', phone: '138****0001', debtDays: 3, amount: 3500 },
  { id: '2', title: '秀湖花苑 12号楼 504', tenant: '李女士', phone: '139****8888', debtDays: 1, amount: 4200 },
  { id: '3', title: '秀湖花苑 3号楼 201', tenant: '王阿姨', phone: '135****1111', debtDays: 0, amount: 2800, upcoming: true },
  { id: '4', title: '秀湖花苑 15号楼 1508', tenant: '赵医生', phone: '186****2222', debtDays: 5, amount: 5200 },
  { id: '10', title: '悦澜湾 2-101', tenant: '周同学', phone: '155****9999', debtDays: 10, amount: 1600 },
  { id: '11', title: '悦澜湾 5-302', tenant: '孙经理', phone: '137****4444', debtDays: 0, amount: 2200, upcoming: true },
]

const filteredProperties = computed(() => {
  if (!searchQuery.value) return debtProperties
  const q = searchQuery.value.toLowerCase()
  return debtProperties.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.tenant.toLowerCase().includes(q)
  )
})

// Initialize selections when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Start with followed properties that have debt or are upcoming
    const initial = new Set<string>()
    debtProperties.forEach(p => {
      if (followedPropertyIds.value.has(p.id)) {
        initial.add(p.id)
      }
    })
    selectedIds.value = initial
    sendProgress.value = 0
    isSending.value = false
  }
})

const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const toggleAll = () => {
  if (selectedIds.value.size === filteredProperties.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredProperties.value.map(p => p.id))
  }
}

const handleConfirm = async () => {
  if (selectedIds.value.size === 0) return
  
  isSending.value = true
  sendProgress.value = 0
  
  const total = selectedIds.value.size
  const selectedList = debtProperties.filter(p => selectedIds.value.has(p.id))
  
  for (let i = 0; i < total; i++) {
    const property = selectedList[i]
    // 1. 注册埋点记录
    registerCollection(property.id)
    
    // 2. 模拟短信日志
    console.log(`[短信发送] 正在发至 ${property.phone}: 【租管家】${property.tenant}您好，您有房费待结，请查阅详情：${window.location.origin}/p/${property.id}`)
    
    sendProgress.value = Math.floor(((i + 1) / total) * 100)
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  showToast(`已成功为 ${total} 位租客发送带追踪链接的催缴提醒`, 'success')
  isSending.value = false
  emit('close')
}
</script>

<template>
  <BaseModal 
    :show="show" 
    max-width="600px"
    @close="emit('close')"
  >
    <template #default>
      <div class="modal-content-wrapper">
        <header class="custom-header">
          <div class="title-with-icon">
            <div class="zap-icon-wrap">
              <Zap :size="20" fill="currentColor" />
            </div>
            <div>
              <h3>智能催缴中心</h3>
              <p>快速向待交租客发送温馨缴费提醒</p>
            </div>
          </div>
        </header>

        <div class="modal-body-content">
          <div class="search-and-filter">
            <div class="search-box">
              <Search :size="16" />
              <input v-model="searchQuery" type="text" placeholder="搜索房源或租客..." />
            </div>
            <button class="select-all-btn" @click="toggleAll">
              {{ selectedIds.size === filteredProperties.length ? '取消全选' : '全选本页' }}
            </button>
          </div>

          <div class="debt-list">
            <div 
              v-for="p in filteredProperties" 
              :key="p.id" 
              class="debt-item"
              :class="{ selected: selectedIds.has(p.id) }"
              @click="toggleSelect(p.id)"
            >
              <div class="check-box">
                <div v-if="selectedIds.has(p.id)" class="check-inner"></div>
              </div>
              
              <div class="item-content">
                <div class="item-main">
                  <div class="prop-info">
                    <Home :size="14" class="muted-icon" />
                    <span class="p-title">{{ p.title }}</span>
                  </div>
                  <div class="tenant-info">
                    <div class="tag-wrap">
                      <User :size="12" />
                      <span>{{ p.tenant }}</span>
                    </div>
                    <div class="tag-wrap">
                      <Phone :size="12" />
                      <span>{{ p.phone }}</span>
                    </div>
                  </div>
                </div>

                <div class="item-stats">
                  <div class="amount">¥{{ p.amount }}</div>
                  
                  <!-- 阅读状态埋点显示 -->
                  <div v-if="collectionStats[p.id]" class="read-status" :class="{ 'read': collectionStats[p.id].isRead }">
                    <CheckCircle2 v-if="collectionStats[p.id].isRead" :size="12" />
                    <Clock v-else :size="12" />
                    {{ collectionStats[p.id].isRead ? '租客已阅读回执 ' + collectionStats[p.id].readAt?.split(' ')[1] : '短信已发/未点击' }}
                  </div>
                  <div v-else class="read-status-placeholder">
                     <Zap :size="10" /> 链路追踪已就绪
                  </div>

                  <div v-if="p.debtDays > 0" class="status-tag danger">
                    <AlertTriangle :size="12" />
                    逾期 {{ p.debtDays }} 天
                  </div>
                  <div v-else-if="p.upcoming" class="status-tag warning">
                    <Zap :size="12" />
                    3日内预期
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div v-if="isSending" class="sending-status">
        <div class="progress-info">
          <Loader2 :size="16" class="animate-spin" />
          <span>正在向 {{ selectedIds.size }} 位租客发送 SMS 提醒... ({{ sendProgress }}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: sendProgress + '%' }"></div>
        </div>
      </div>
      
      <div v-else class="footer-actions">
        <div class="selected-summary">
          已选择 <strong>{{ selectedIds.size }}</strong> 位记录
        </div>
        <div class="btns">
          <button class="cancel-btn" @click="emit('close')">取消</button>
          <button 
            class="confirm-btn" 
            :disabled="selectedIds.size === 0"
            @click="handleConfirm"
          >
            <Send :size="18" />
            立即一键催缴
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
/* Content Styles */
.custom-header {
  margin-bottom: 2rem;
  padding-right: 3rem; /* Space for the top-right close button */
}

.title-with-icon {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.zap-icon-wrap {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
  color: var(--accent-warning);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px -4px rgba(245, 158, 11, 0.1);
}

.title-with-icon h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.title-with-icon p {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.modal-body-content {
  display: flex;
  flex-direction: column;
}

.search-and-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent-warning);
  background: var(--bg-card-hover);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  padding: 0.85rem 0.5rem;
  width: 100%;
  font-size: 0.95rem;
}

.select-all-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0 1.5rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.select-all-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.debt-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.debt-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.debt-item:hover {
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  border-color: var(--accent-primary);
}

.debt-item.selected {
  background: var(--bg-surface);
  border-color: var(--accent-warning);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.check-box {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.selected .check-box {
  background: var(--accent-warning);
  border-color: var(--accent-warning);
}

.check-inner {
  width: 6px;
  height: 10px;
  border: 2.5px solid white;
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg) translate(-1px, -1.5px);
}

[data-theme='light'] .check-inner {
  border-color: white;
}

.item-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.prop-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.p-title {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.tenant-info {
  display: flex;
  gap: 1.5rem;
}

.tag-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.item-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.amount {
  font-weight: 800;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-family: 'Outfit', sans-serif;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  text-transform: uppercase;
}

.status-tag.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.status-tag.warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-warning);
}

.read-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-muted);
  transition: all 0.3s;
}

.read-status.read {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.read-status-placeholder {
  font-size: 0.65rem;
  color: var(--text-muted);
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.selected-summary {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.selected-summary strong {
  color: var(--accent-warning);
  font-size: 1.1rem;
}

.btns {
  display: flex;
  gap: 1rem;
}

.cancel-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.85rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.confirm-btn {
  background: var(--accent-warning);
  border: none;
  color: white;
  padding: 0.85rem 2rem;
  border-radius: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.confirm-btn:hover:not(:disabled) {
  background: var(--accent-warning);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(245, 158, 11, 0.4);
  filter: brightness(1.05);
}

.confirm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

.sending-status {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #f59e0b;
}

.progress-bar {
  height: 8px;
  background: var(--bg-input);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.muted-icon { color: var(--text-muted); opacity: 0.5; }
</style>
