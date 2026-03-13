<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search, Plus, Filter, Mail, Phone, MoreVertical, Upload, HelpCircle } from 'lucide-vue-next'
import DataImportModal from './DataImportModal.vue'
import TenantModal from './TenantModal.vue'
import { getCustomers } from '../../api/property'
import { showToast } from '../../store'

const tenants = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const showImportModal = ref(false)
const showTenantModal = ref(false)

const fetchCustomers = async () => {
  isLoading.value = true
  try {
    const res = await getCustomers({ name: searchQuery.value })
    if (res.code === 0 && Array.isArray(res.data)) {
      tenants.value = res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '-',
        property: '-', // TODO: fetch from contract
        status: c.status === 0 ? 'active' : 'overdue',
        joinDate: c.createTime?.split('T')[0] || '-'
      }))
    }
  } catch (error: any) {
    showToast(error.message || '加载客户数据失败', 'error')
  } finally {
    isLoading.value = false
  }
}

watch(searchQuery, () => {
  // Debounce could be added here
  fetchCustomers()
})

onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <div class="tenant-view">
    <div class="toolbar glass">
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" type="text" placeholder="搜索租客姓名、电话..." />
      </div>
      
      <div class="actions">
        <div class="import-group">
          <button class="secondary-btn" @click="showImportModal = true">
            <Upload :size="18" />
            <span>Excel 导入</span>
          </button>
        </div>
        <button class="secondary-btn">
          <Filter :size="18" />
          <span>筛选</span>
        </button>
        <button class="primary-btn" @click="showTenantModal = true">
          <Plus :size="18" />
          <span>登记新租客</span>
        </button>
      </div>
    </div>

    <DataImportModal :show="showImportModal" initial-type="tenants" @close="showImportModal = false" />
    <TenantModal :show="showTenantModal" @close="showTenantModal = false" @success="fetchCustomers" />

    <div class="tenant-table-container glass">
      <table class="tenant-table">
        <thead>
          <tr>
            <th>租客姓名</th>
            <th>联系方式</th>
            <th>租住房源</th>
            <th>状态</th>
            <th>入驻时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tenants" :key="t.id">
            <td>
              <div class="tenant-name-col">
                <div class="avatar">{{ t.name.charAt(0) }}</div>
                <span>{{ t.name }}</span>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <div class="contact-item"><Phone :size="12" /> {{ t.phone }}</div>
                <div class="contact-item"><Mail :size="12" /> {{ t.email }}</div>
              </div>
            </td>
            <td>{{ t.property }}</td>
            <td>
              <span class="badge" :class="t.status">
                {{ t.status === 'active' ? '合约中' : '欠费中' }}
              </span>
            </td>
            <td>{{ t.joinDate }}</td>
            <td>
              <button class="icon-btn"><MoreVertical :size="18" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tenant-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.toolbar {
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
  width: 320px;
}

.search-box input {
  background: none;
  border: none;
  color: white;
  outline: none;
  width: 100%;
}

.actions {
  display: flex;
  gap: 1rem;
}

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0.8rem 1.25rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  font-size: 0.85rem;
}
.secondary-btn:hover { background: rgba(255, 255, 255, 0.15); border-color: var(--accent-primary); }

.tenant-table-container {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tenant-table {
  width: 100%;
  border-collapse: collapse;
}

.tenant-table th {
  text-align: left;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tenant-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tenant-name-col {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.active { background: rgba(16, 185, 129, 0.15); color: var(--accent-success); }
.badge.overdue { background: rgba(239, 68, 68, 0.15); color: var(--accent-danger); }

.icon-btn {
  color: var(--text-muted);
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}
</style>
