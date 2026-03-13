<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { 
  User, 
  Calendar, 
  Coins, 
  CreditCard, 
  Check, 
  Loader2, 
  Plus,
  Search,
  UserPlus,
  ArrowRight,
  Info
} from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'
import { createContract, getCustomers, createCustomer } from '../../api/property'
import { showToast } from '../../store'

const props = defineProps<{
  show: boolean
  room: any // 选中的房间对象
}>()

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const customers = ref<any[]>([])
const searchQuery = ref('')
const isLoadingCustomers = ref(false)
const showNewCustomerForm = ref(false)

const form = reactive({
  roomId: undefined as number | undefined,
  customerId: undefined as number | undefined,
  startDate: '',
  endDate: '',
  actualRentPrice: 0,
  deposit: 0
})

const newCustomerForm = reactive({
  name: '',
  phone: '',
  idCard: '',
  gender: 0
})

// 计算属性：过滤后的租客列表
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value.slice(0, 5)
  return customers.value.filter(c => 
    c.name.includes(searchQuery.value) || c.phone.includes(searchQuery.value)
  )
})

const fetchCustomers = async () => {
  isLoadingCustomers.value = true
  try {
    const res = await getCustomers()
    if (res.code === 0) {
      customers.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch customers', error)
  } finally {
    isLoadingCustomers.value = false
  }
}

const selectCustomer = (c: any) => {
  form.customerId = c.id
  searchQuery.value = c.name
}

const handleAddCustomer = async () => {
  if (!newCustomerForm.name || !newCustomerForm.phone) {
    showToast('请填写租客姓名和电话', 'warning')
    return
  }
  isSubmitting.value = true
  try {
    const res = await createCustomer({ ...newCustomerForm, status: 0 }) // 初始登记设为意向租客
    if (res.code === 0) {
      showToast('租客登记成功', 'success')
      await fetchCustomers()
      form.customerId = res.data.id
      searchQuery.value = res.data.name
      showNewCustomerForm.value = false
    }
  } catch (error: any) {
    showToast(error.message || '操作失败', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!form.customerId || !form.startDate || !form.endDate) {
    showToast('请完整填写起止日期和租客信息', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...form,
      roomId: props.room.id,
      actualRentPrice: Math.round(form.actualRentPrice * 100),
      deposit: Math.round(form.deposit * 100)
    }
    const res = await createContract(payload)
    if (res.code === 0) {
      showToast('签约完成，房源已入住', 'success')
      emit('success')
      handleClose()
    } else {
      showToast(res.message || '签约失败', 'error')
    }
  } catch (error: any) {
    showToast(error.message || '网络请求失败', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.customerId = undefined
  form.startDate = ''
  form.endDate = ''
  form.actualRentPrice = props.room?.rentPrice / 100 || 0
  form.deposit = 0
  searchQuery.value = ''
  showNewCustomerForm.value = false
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchCustomers()
    if (props.room) {
      form.actualRentPrice = props.room.rentPrice / 100 || 0
      // 默认租期一年
      const now = new Date()
      const nextYear = new Date()
      nextYear.setFullYear(now.getFullYear() + 1)
      form.startDate = now.toISOString().split('T')[0]
      form.endDate = nextYear.toISOString().split('T')[0]
    }
  }
})

onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="showNewCustomerForm ? '登记新租客' : '办理签约入住'" 
    :subtitle="showNewCustomerForm ? '快速登记租客信息并签约' : `正在为 ${room?.property?.name || '资产'} ${room?.roomNumber || ''} 办理入住`"
    max-width="500px"
    @close="handleClose"
  >
    <div class="form-container">
      <!-- New Customer Mini Form -->
      <div v-if="showNewCustomerForm" class="form-grid animate-fade-in">
        <div class="form-item">
          <label><User :size="14" /> 姓名 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="newCustomerForm.name" type="text" placeholder="真实姓名" />
          </div>
        </div>
        <div class="form-item">
          <label><Phone :size="14" /> 联系电话 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="newCustomerForm.phone" type="text" placeholder="手机号码" />
          </div>
        </div>
        <div class="form-item full">
          <label><CreditCard :size="14" /> 证件号码</label>
          <div class="input-wrap">
            <input v-model="newCustomerForm.idCard" type="text" placeholder="身份证号" />
          </div>
        </div>
        <div class="property-actions full">
          <button class="secondary-btn" @click="showNewCustomerForm = false">返回选择</button>
          <button class="primary-btn" @click="handleAddCustomer" :disabled="isSubmitting">确认登记</button>
        </div>
      </div>

      <!-- Main Lease Form -->
      <div v-else class="form-grid">
        <div class="form-item full">
          <label><User :size="14" /> 选择租客 <span class="required">*</span></label>
          <div class="search-select-wrap">
            <div class="input-wrap has-icon">
              <Search :size="16" class="search-icon" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="搜索姓名或电话..."
                @focus="form.customerId = undefined"
              />
              <button class="quick-add-btn" title="登记新租客" @click="showNewCustomerForm = true">
                <UserPlus :size="18" />
              </button>
            </div>
            
            <div v-if="!form.customerId && searchQuery && filteredCustomers.length > 0" class="search-results-dropdown glass">
              <div 
                v-for="c in filteredCustomers" 
                :key="c.id" 
                class="result-item" 
                @click="selectCustomer(c)"
              >
                <div class="c-avatar">{{ c.name.charAt(0) }}</div>
                <div class="c-info">
                  <span class="c-name">{{ c.name }}</span>
                  <span class="c-tel">{{ c.phone }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="form.customerId" class="selected-customer-tag animate-fade-in">
              <Check :size="14" class="check-icon" />
              <span>已选择: {{ filteredCustomers.find(c => c.id === form.customerId)?.name }}</span>
              <button class="clear-btn" @click="form.customerId = undefined; searchQuery = ''">修改</button>
            </div>
          </div>
        </div>

        <div class="form-item">
          <label><Calendar :size="14" /> 合同开始日期</label>
          <div class="input-wrap">
            <input v-model="form.startDate" type="date" />
          </div>
        </div>

        <div class="form-item">
          <label><Calendar :size="14" /> 合同结束日期</label>
          <div class="input-wrap">
            <input v-model="form.endDate" type="date" />
          </div>
        </div>

        <div class="form-item">
          <label><Coins :size="14" /> 月租金(元)</label>
          <div class="input-wrap">
            <input v-model.number="form.actualRentPrice" type="number" step="0.01" />
          </div>
        </div>

        <div class="form-item">
          <label><CreditCard :size="14" /> 押金(元)</label>
          <div class="input-wrap">
            <input v-model.number="form.deposit" type="number" step="0.01" />
          </div>
        </div>

        <div class="form-item full">
          <div class="info-banner">
            <Info :size="16" />
            <p>完成签约后，系统将自动生成合同账单，并同步房态为“已租”。</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer v-if="!showNewCustomerForm">
      <div class="footer-actions">
        <button class="secondary-btn" @click="handleClose">取消</button>
        <button class="primary-btn apply-btn" @click="handleSubmit" :disabled="isSubmitting || !form.customerId">
          <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
          <ArrowRight v-else :size="18" />
          {{ isSubmitting ? '正在签署...' : '确认签署并入住' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.form-container {
  padding: 0.5rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.form-item label :deep(svg) {
  color: var(--accent-primary);
  opacity: 0.8;
}

.form-item.full {
  grid-column: span 2;
}

.required {
  color: var(--accent-danger);
  margin-left: 2px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap.has-icon .search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.input-wrap.has-icon input {
  padding-left: 2.5rem;
}

.input-wrap input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrap input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  outline: none;
}

.quick-add-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--accent-primary);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.2s;
}

.quick-add-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
}

.search-select-wrap {
  position: relative;
}

.search-results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 52px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: var(--bg-card-hover);
}

.c-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.c-info {
  display: flex;
  flex-direction: column;
}

.c-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.c-tel {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.selected-customer-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.check-icon {
  color: #10b981;
}

.clear-btn {
  margin-left: auto;
  font-size: 0.8rem;
  text-decoration: underline;
  color: var(--text-muted);
  cursor: pointer;
}

.info-banner {
  display: flex;
  gap: 12px;
  background: rgba(99, 102, 241, 0.08);
  padding: 1.15rem;
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-top: 0.5rem;
  width: 100%;
}

.info-banner :deep(svg) {
  flex-shrink: 0;
  color: var(--accent-primary);
}

.info-banner p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.footer-actions, .property-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.primary-btn.apply-btn {
  min-width: 140px;
  justify-content: center;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
