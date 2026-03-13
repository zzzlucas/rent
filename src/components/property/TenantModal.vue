<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { User, Phone, CreditCard, FileText, Check, Loader2 } from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'
import { createCustomer } from '../../api/property'
import { showToast } from '../../store'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)

const form = reactive({
  name: '',
  phone: '',
  gender: 0, // 0: 未知, 1: 男, 2: 女
  idCard: '',
  status: 0, // 0: 意向, 1: 在租
  remark: ''
})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.gender = 0
  form.idCard = ''
  form.status = 0
  form.remark = ''
}

const handleSubmit = async () => {
  if (!form.name || !form.phone) {
    showToast('请填写必填项', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    const res = await createCustomer(form)
    if (res.code === 0) {
      showToast('登记成功', 'success')
      emit('success')
      handleClose()
    } else {
      showToast(res.message || '操作失败', 'error')
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

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})
</script>

<template>
  <BaseModal 
    :show="show" 
    title="登记新租客" 
    subtitle="填写租客基础资料，后续可关联房源合同"
    max-width="500px"
    @close="handleClose"
  >
    <div class="form-container">
      <div class="form-grid">
        <div class="form-item">
          <label><User :size="14" /> 姓名 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="form.name" type="text" placeholder="请输入租客真实姓名" />
          </div>
        </div>

        <div class="form-item">
          <label><Phone :size="14" /> 联系电话 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="form.phone" type="text" placeholder="请输入手机号码" />
          </div>
        </div>

        <div class="form-item">
          <label>性别</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="form.gender" :value="1" />
              <span>男</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.gender" :value="2" />
              <span>女</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.gender" :value="0" />
              <span>未知</span>
            </label>
          </div>
        </div>

        <div class="form-item">
          <label><CreditCard :size="14" /> 证件号码</label>
          <div class="input-wrap">
            <input v-model="form.idCard" type="text" placeholder="请输入身份证号" />
          </div>
        </div>

        <div class="form-item">
          <label>初始状态</label>
          <select v-model="form.status" class="custom-select">
            <option :value="0">意向租客</option>
            <option :value="1">正式租客</option>
          </select>
        </div>

        <div class="form-item full">
          <label><FileText :size="14" /> 备注说明</label>
          <textarea v-model="form.remark" placeholder="记录租客特定需求或其他信息..."></textarea>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <button class="secondary-btn" @click="handleClose">取消</button>
        <button class="primary-btn" @click="handleSubmit" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
          <Check v-else :size="18" />
          {{ isSubmitting ? '保存中...' : '提交登记' }}
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

.form-item.full {
  grid-column: span 2;
}

.form-item label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #ef4444;
}

.input-wrap input, .custom-select, textarea {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.input-wrap input:focus, .custom-select:focus, textarea:focus {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.03);
  outline: none;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-label input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
}

.footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
