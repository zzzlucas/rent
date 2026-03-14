<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Search
} from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'
import { createContract } from '../../api/contract'
import { getRooms } from '../../api/property'
import { showToast } from '../../store'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const roomSearchLoading = ref(false)
const rooms = ref<any[]>([])

const form = reactive({
  customerName: '',
  customerPhone: '',
  propertyName: '',
  roomNumber: '',
  roomId: null as number | null,
  startDate: '',
  endDate: '',
  actualRentPrice: '',
  deposit: ''
})

let searchTimer: any = null

const handleRoomSearch = () => {
  if (!form.roomNumber && !form.propertyName) {
    rooms.value = []
    return
  }
  
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    roomSearchLoading.value = true
    try {
      const res = await getRooms({ 
        roomNumber: form.roomNumber,
        propertyName: form.propertyName
      })
      if (res.code === 0) {
        rooms.value = res.data
      }
    } catch (e) {
      console.error(e)
    } finally {
      roomSearchLoading.value = false
    }
  }, 500)
}

const selectRoom = (room: any) => {
  form.roomId = room.id
  form.roomNumber = room.roomNumber
  form.propertyName = room.property?.name || ''
  rooms.value = []
}

const handleSubmit = async () => {
  // Validation
  if (!form.customerName || !form.customerPhone || !form.startDate || !form.endDate || !form.actualRentPrice) {
    showToast('请填写必填项', 'error')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form,
      actualRentPrice: Math.round(parseFloat(form.actualRentPrice) * 100),
      deposit: Math.round((parseFloat(form.deposit) || 0) * 100)
    }
    
    const res = await createContract(payload)
    if (res.code === 0) {
      showToast('合同录入成功', 'success')
      emit('success')
      resetForm()
      emit('close')
    }
  } catch (e: any) {
    showToast(e.message || '录入失败', 'error')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    customerName: '',
    customerPhone: '',
    propertyName: '',
    roomNumber: '',
    roomId: null,
    startDate: '',
    endDate: '',
    actualRentPrice: '',
    deposit: ''
  })
}
</script>

<template>
  <BaseModal
    :show="show"
    title="手动录入合同"
    subtitle="请填写租客及合同详细信息，系统将自动关联房源并更新状态。"
    max-width="700px"
    @close="emit('close')"
  >
    <div class="manual-form">
      <!-- Tenant Section -->
      <div class="form-section">
        <div class="section-header">
          <User :size="18" />
          <span>租客基本信息</span>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <label>租客姓名 <span class="required">*</span></label>
            <div class="input-wrapper">
              <User :size="16" class="field-icon" />
              <input v-model="form.customerName" type="text" placeholder="请输入姓名" />
            </div>
          </div>
          <div class="form-item">
            <label>联系电话 <span class="required">*</span></label>
            <div class="input-wrapper">
              <Phone :size="16" class="field-icon" />
              <input v-model="form.customerPhone" type="text" placeholder="请输入手机号" />
            </div>
          </div>
        </div>
      </div>

      <!-- Property Section -->
      <div class="form-section">
        <div class="section-header">
          <MapPin :size="18" />
          <span>房源关联信息</span>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <label>物业名称 / 小区</label>
            <div class="input-wrapper">
              <MapPin :size="16" class="field-icon" />
              <input v-model="form.propertyName" type="text" placeholder="例如：壹间公寓" @blur="handleRoomSearch" />
            </div>
          </div>
          <div class="form-item relative">
            <label>房间号 <span class="required">*</span></label>
            <div class="input-wrapper">
              <Search :size="16" class="field-icon" />
              <input v-model="form.roomNumber" type="text" placeholder="例如：1201" @input="handleRoomSearch" />
              <div v-if="roomSearchLoading" class="mini-spinner"></div>
            </div>
            <!-- Search Results Dropdown -->
            <div v-if="rooms.length > 0" class="room-dropdown glass">
              <div 
                v-for="room in rooms" 
                :key="room.id" 
                class="room-option"
                @click="selectRoom(room)"
              >
                <div class="r-main">
                  <span class="r-num">{{ room.roomNumber }}</span>
                  <span class="r-prop">{{ room.property?.name }}</span>
                </div>
                <span class="r-status-pill" :class="room.status === 1 ? 'occupied' : 'vacant' ">
                  {{ room.status === 1 ? '已占用' : '可签约' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Details Section -->
      <div class="form-section">
        <div class="section-header">
          <Calendar :size="18" />
          <span>合同条款信息</span>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <label>起租日期 <span class="required">*</span></label>
            <div class="input-wrapper">
              <Calendar :size="16" class="field-icon" />
              <input v-model="form.startDate" type="date" />
            </div>
          </div>
          <div class="form-item">
            <label>结束日期 <span class="required">*</span></label>
            <div class="input-wrapper">
              <Calendar :size="16" class="field-icon" />
              <input v-model="form.endDate" type="date" />
            </div>
          </div>
          <div class="form-item">
            <label>月租金 (元) <span class="required">*</span></label>
            <div class="input-wrapper">
              <CreditCard :size="16" class="field-icon" />
              <input v-model="form.actualRentPrice" type="number" placeholder="5000" />
            </div>
          </div>
          <div class="form-item">
            <label>押金金额 (元)</label>
            <div class="input-wrapper">
              <ShieldCheck :size="16" class="field-icon" />
              <input v-model="form.deposit" type="number" placeholder="5000" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">取消</button>
        <button class="btn-submit" :disabled="loading" @click="handleSubmit">
          <CheckCircle2 v-if="!loading" :size="18" />
          <div v-else class="spinner-mini"></div>
          {{ loading ? '录入中...' : '确认并入库' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.manual-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 0.95rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.required { color: #f87171; margin-left: 2px; }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

input[type="date"] {
  padding-right: 0.5rem;
}

/* Room Dropdown */
.room-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.room-option {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.room-option:hover {
  background: var(--bg-card-hover);
}

.r-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.r-num { font-weight: 800; color: var(--text-primary); font-size: 0.95rem; }
.r-prop { font-size: 0.75rem; color: var(--text-muted); }
.r-status-pill { font-size: 0.65rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; border: 1px solid transparent; }
.r-status-pill.vacant { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
.r-status-pill.occupied { background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); border-color: rgba(99, 102, 241, 0.2); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.btn-submit {
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.mini-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-mini {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}
</style>
