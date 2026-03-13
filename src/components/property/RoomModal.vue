<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Building2, Home, Hash, Layers, Compass, Tag, Coins, Square, Check, Loader2, Plus } from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'
import { getProperties, createRoom, createProperty } from '../../api/property'
import { showToast } from '../../store'

const props = defineProps<{
  show: boolean
  initialPropertyId?: number
}>()

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const properties = ref<any[]>([])
const showNewProperty = ref(false)

const form = reactive({
  propertyId: undefined as number | undefined,
  roomNumber: '',
  floor: 1,
  towards: '南',
  tags: '',
  status: 0, // 0: 待租, 1: 已租
  rentPrice: 0,
  area: 0
})

const newPropertyForm = reactive({
  name: '',
  address: '',
  totalFloors: 1,
  type: 2, // 住宅
  remark: ''
})

const fetchProperties = async () => {
  try {
    const res = await getProperties()
    if (res.code === 0) {
      properties.value = res.data
      if (props.initialPropertyId) {
        form.propertyId = props.initialPropertyId
      } else if (properties.value.length > 0 && !form.propertyId) {
        form.propertyId = properties.value[0].id
      }
    }
  } catch (error) {
    console.error('Failed to fetch properties', error)
  }
}

const resetForm = () => {
  form.roomNumber = ''
  form.floor = 1
  form.towards = '南'
  form.tags = ''
  form.status = 0
  form.rentPrice = 0
  form.area = 0
  showNewProperty.value = false
}

const handleAddProperty = async () => {
  if (!newPropertyForm.name) {
    showToast('请输入楼盘名称', 'warning')
    return
  }
  isSubmitting.value = true
  try {
    const res = await createProperty(newPropertyForm)
    if (res.code === 0) {
      showToast('建筑物添加成功', 'success')
      await fetchProperties()
      form.propertyId = res.data.id
      showNewProperty.value = false
    }
  } catch (error: any) {
    showToast(error.message || '操作失败', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!form.propertyId || !form.roomNumber) {
    showToast('请选择楼盘并输入房号', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    // 转换为后端需要的单位（假设分）
    const payload = {
      ...form,
      rentPrice: Math.round(form.rentPrice * 100)
    }
    const res = await createRoom(payload)
    if (res.code === 0) {
      showToast('房源添加成功', 'success')
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

onMounted(() => {
  fetchProperties()
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchProperties()
    if (props.initialPropertyId) {
      form.propertyId = props.initialPropertyId
    }
  }
})
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="showNewProperty ? '新增建筑物' : '新增房源'" 
    :subtitle="showNewProperty ? '创建一个新的楼盘或单元' : '录入新房源信息，支持详细参数设置'"
    max-width="500px"
    @close="handleClose"
  >
    <div class="form-container">
      <!-- New Property Form -->
      <div v-if="showNewProperty" class="form-grid">
        <div class="form-item full">
          <label><Building2 :size="14" /> 建筑物名称 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="newPropertyForm.name" type="text" placeholder="如：秀湖花苑 8号楼" />
          </div>
        </div>
        <div class="form-item full">
          <label>详细地址</label>
          <div class="input-wrap">
            <input v-model="newPropertyForm.address" type="text" placeholder="请输入具体地址" />
          </div>
        </div>
        <div class="form-item">
          <label>总楼层</label>
          <div class="input-wrap">
            <input v-model.number="newPropertyForm.totalFloors" type="number" min="1" />
          </div>
        </div>
        <div class="form-item">
          <label>类型</label>
          <select v-model="newPropertyForm.type" class="custom-select">
            <option :value="1">公寓</option>
            <option :value="2">住宅</option>
            <option :value="3">商铺</option>
          </select>
        </div>
        <div class="property-actions full">
          <button class="secondary-btn" @click="showNewProperty = false">返回录入房源</button>
          <button class="primary-btn" @click="handleAddProperty" :disabled="isSubmitting">提交建筑物</button>
        </div>
      </div>

      <!-- Main Room Form -->
      <div v-else class="form-grid">
        <div class="form-item full">
          <label><Building2 :size="14" /> 所属建筑物 <span class="required">*</span></label>
          <div class="select-row">
            <select v-model="form.propertyId" class="custom-select">
              <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
              <option v-if="properties.length === 0" disabled>暂无建筑物，请先添加</option>
            </select>
            <button class="add-btn" title="添加新建筑物" @click="showNewProperty = true">
              <Plus :size="18" />
            </button>
          </div>
        </div>

        <div class="form-item">
          <label><Hash :size="14" /> 房间号 <span class="required">*</span></label>
          <div class="input-wrap">
            <input v-model="form.roomNumber" type="text" placeholder="如：101" />
          </div>
        </div>

        <div class="form-item">
          <label><Layers :size="14" /> 所在楼层</label>
          <div class="input-wrap">
            <input v-model.number="form.floor" type="number" />
          </div>
        </div>

        <div class="form-item">
          <label><Coins :size="14" /> 意向月租 (元)</label>
          <div class="input-wrap">
            <input v-model.number="form.rentPrice" type="number" step="0.01" />
          </div>
        </div>

        <div class="form-item">
          <label><Square :size="14" /> 面积 (㎡)</label>
          <div class="input-wrap">
            <input v-model.number="form.area" type="number" step="0.1" />
          </div>
        </div>

        <div class="form-item">
          <label><Compass :size="14" /> 朝向</label>
          <div class="input-wrap">
            <input v-model="form.towards" type="text" placeholder="如：南" />
          </div>
        </div>

        <div class="form-item">
          <label>当前状态</label>
          <select v-model="form.status" class="custom-select">
            <option :value="0">待租 (Vacant)</option>
            <option :value="1">已租 (Occupied)</option>
            <option :value="2">维修 (Maintenance)</option>
          </select>
        </div>

        <div class="form-item full">
          <label><Tag :size="14" /> 房源标签</label>
          <div class="input-wrap">
            <input v-model="form.tags" type="text" placeholder="多个标签用逗号分隔，如：有阳台,精装修" />
          </div>
        </div>
      </div>
    </div>

    <template #footer v-if="!showNewProperty">
      <div class="footer-actions">
        <button class="secondary-btn" @click="handleClose">取消</button>
        <button class="primary-btn" @click="handleSubmit" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
          <Check v-else :size="18" />
          {{ isSubmitting ? '保存中...' : '确认录入' }}
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

.select-row {
  display: flex;
  gap: 8px;
}

.select-row .custom-select {
  flex: 1;
}

.add-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--accent-primary);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
}

.input-wrap input:focus, .custom-select:focus, textarea:focus {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.03);
  outline: none;
}

.footer-actions, .property-actions {
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
