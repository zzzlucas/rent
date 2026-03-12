<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Copy,
  ChevronRight,
  Info
} from 'lucide-vue-next'

interface PropertyTemplate {
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

const templates = ref<PropertyTemplate[]>([
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

const searchQuery = ref('')
const isEditModalOpen = ref(false)
const editingTemplate = ref<PropertyTemplate | null>(null)

const openEditTemplate = (template?: PropertyTemplate) => {
  if (template) {
    editingTemplate.value = { ...template }
  } else {
    editingTemplate.value = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: '单间',
      area: '',
      rent: 0,
      deposit: 0,
      paymentType: '押一付一',
      amenities: []
    }
  }
  isEditModalOpen.value = true
}

const saveTemplate = () => {
  if (!editingTemplate.value) return
  
  const index = templates.value.findIndex(t => t.id === editingTemplate.value?.id)
  if (index !== -1) {
    templates.value[index] = { ...editingTemplate.value }
  } else {
    templates.value.push({ ...editingTemplate.value })
  }
  isEditModalOpen.value = false
}

const deleteTemplate = (id: string) => {
  if (confirm('确定要删除这个模板吗？')) {
    templates.value = templates.value.filter(t => t.id !== id)
  }
}
</script>

<template>
  <div class="template-view">
    <header class="view-header">
      <div class="title-section">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          房源配置模板
        </h1>
        <p class="text-sm text-gray-500 mt-1">预设房源规格，一键应用到整个楼栋或单个房源</p>
      </div>
      <div class="action-section">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="搜索模板名称..." />
        </div>
        <button class="add-btn" @click="openEditTemplate()">
          <Plus :size="20" /> 新增模板
        </button>
      </div>
    </header>

    <div class="template-grid">
      <div 
        v-for="tpl in templates" 
        :key="tpl.id"
        class="template-card glass card-animate-in"
      >
        <div class="card-header">
          <div class="tpl-info">
            <span v-if="tpl.isDefault" class="default-badge">默认</span>
            <h3>{{ tpl.name }}</h3>
            <span class="tpl-type">{{ tpl.type }} · {{ tpl.area }}</span>
          </div>
          <div class="tpl-actions">
            <button class="icon-btn" @click="openEditTemplate(tpl)"><Edit3 :size="16"/></button>
            <button class="icon-btn danger" @click="deleteTemplate(tpl.id)"><Trash2 :size="16"/></button>
          </div>
        </div>

        <div class="card-body">
          <div class="price-row">
            <div class="price-item">
              <span class="label">标准月租金</span>
              <span class="val">¥{{ tpl.rent.toLocaleString() }}</span>
            </div>
            <div class="price-item">
              <span class="label">预设押金</span>
              <span class="val">¥{{ tpl.deposit.toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="amenities-preview">
            <span class="label">包含配套</span>
            <div class="amen-tags">
              <span v-for="a in tpl.amenities.slice(0, 4)" :key="a" class="amen-tag">{{ a }}</span>
              <span v-if="tpl.amenities.length > 4" class="amen-tag more">+{{ tpl.amenities.length - 4 }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="payment-info">
            <Info :size="14" /> {{ tpl.paymentType }}
          </div>
          <button class="apply-btn-shortcut">
            应用到房源 <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit/Add Modal (Glassmorphism) -->
    <div v-if="isEditModalOpen" class="modal-overlay" @click="isEditModalOpen = false">
      <div class="modal-content glass card-animate-in" @click.stop>
        <div class="modal-header">
          <h2>{{ editingTemplate?.name ? '编辑模板' : '创建新模板' }}</h2>
          <button class="close-btn" @click="isEditModalOpen = false"><Plus style="transform: rotate(45deg)" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>模板名称</label>
            <input v-model="editingTemplate!.name" type="text" placeholder="例如：精装单间-标准2000" />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>户型</label>
              <select v-model="editingTemplate!.type">
                <option>单间</option>
                <option>一室一厅</option>
                <option>两室一厅</option>
                <option>三室一厅</option>
              </select>
            </div>
            <div class="form-group">
              <label>面积</label>
              <input v-model="editingTemplate!.area" type="text" placeholder="25㎡" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>标准租金 (元/月)</label>
              <input v-model.number="editingTemplate!.rent" type="number" />
            </div>
            <div class="form-group">
              <label>标准押金 (元)</label>
              <input v-model.number="editingTemplate!.deposit" type="number" />
            </div>
          </div>
          <div class="form-group">
            <label>配套设施</label>
            <div class="amenities-check-grid">
              <button 
                v-for="a in ['空调', '洗衣机', '冰箱', '热水器', '宽带', '床', '沙发', '衣柜']" 
                :key="a"
                :class="{ active: editingTemplate!.amenities.includes(a) }"
                @click="editingTemplate!.amenities.includes(a) 
                  ? editingTemplate!.amenities = editingTemplate!.amenities.filter(i => i !== a)
                  : editingTemplate!.amenities.push(a)"
              >
                {{ a }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="isEditModalOpen = false">取消</button>
          <button class="btn-submit" @click="saveTemplate">保存模板</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: #fff;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.action-section {
  display: flex;
  gap: 1rem;
}

.search-box {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 300px;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  padding: 0.8rem 0;
  width: 100%;
}

.add-btn {
  background: var(--accent-primary);
  color: #fff;
  padding: 0 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.template-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.template-card:hover {
  transform: translateY(-8px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}

.card-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.tpl-info h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; }
.tpl-type { font-size: 0.75rem; color: var(--text-muted); }

.default-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 8px;
}

.tpl-actions { display: flex; gap: 8px; }
.icon-btn { 
  width: 32px; height: 32px; 
  border-radius: 8px; 
  background: rgba(255,255,255,0.05); 
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted);
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.icon-btn.danger:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

.card-body { padding: 1.5rem; flex: 1; }

.price-row { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
.price-item .label { font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 4px; }
.price-item .val { font-size: 1.25rem; font-weight: 800; color: var(--accent-primary); }

.amenities-preview .label { font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 8px; }
.amen-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.amen-tag { font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
.amen-tag.more { background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); }

.card-footer {
  padding: 1.25rem 1.5rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-info { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

.apply-btn-shortcut {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.apply-btn-shortcut:hover { color: var(--accent-primary); }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 500px;
  border-radius: 24px;
  background: #111114;
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.modal-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); }
.modal-header h2 { font-size: 1.25rem; font-weight: 800; }

.modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
.form-group input, .form-group select {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  color: #fff;
  outline: none;
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.amenities-check-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.amenities-check-grid button {
  font-size: 0.7rem;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
.amenities-check-grid button.active {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  gap: 1rem;
}
.btn-cancel { flex: 1; padding: 0.8rem; border-radius: 12px; font-weight: 700; color: var(--text-muted); }
.btn-submit { flex: 2; padding: 0.8rem; background: var(--accent-primary); color: #fff; border-radius: 12px; font-weight: 700; }

.card-animate-in {
  animation: slideUp 0.4s cubic-bezier(0, 1, 0, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
