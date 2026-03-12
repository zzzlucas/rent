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
  Send
} from 'lucide-vue-next'
import { followedPropertyIds, showToast } from '../../store'
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
  
  for (let i = 0; i <= total; i++) {
    sendProgress.value = Math.floor((i / total) * 100)
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  showToast(`已成功为 ${total} 位租客发送催缴提醒`, 'success')
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
}

.title-with-icon {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.zap-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
}

.title-with-icon h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.title-with-icon p {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #94a3b8;
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  color: #64748b;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #f59e0b;
  background: rgba(255, 255, 255, 0.05);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  padding: 0.85rem 0.5rem;
  width: 100%;
  font-size: 0.95rem;
}

.select-all-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0 1.5rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.select-all-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.debt-item:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: scale(1.01);
  border-color: rgba(255, 255, 255, 0.1);
}

.debt-item.selected {
  background: rgba(245, 158, 11, 0.06);
  border-color: rgba(245, 158, 11, 0.4);
}

.check-box {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.selected .check-box {
  background: #f59e0b;
  border-color: #f59e0b;
}

.check-inner {
  width: 6px;
  height: 10px;
  border: 2.5px solid #000;
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg) translate(-1px, -1.5px);
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
  font-weight: 750;
  font-size: 1.05rem;
  color: #fff;
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
  color: #64748b;
}

.item-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.amount {
  font-weight: 800;
  color: #fff;
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
  color: #fbbf24;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.selected-summary {
  font-size: 0.95rem;
  color: #94a3b8;
}

.selected-summary strong {
  color: #f59e0b;
  font-size: 1.1rem;
}

.btns {
  display: flex;
  gap: 1rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.85rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.confirm-btn {
  background: #f59e0b;
  border: none;
  color: #000;
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
  background: #fbbf24;
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
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
  background: rgba(255, 255, 255, 0.05);
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

.muted-icon { color: rgba(255, 255, 255, 0.3); }
</style>
