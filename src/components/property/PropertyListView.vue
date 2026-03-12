<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, Plus, List, LayoutGrid, UploadCloud } from 'lucide-vue-next'
import PropertyCard from './PropertyCard.vue'
import DataImportModal from './DataImportModal.vue'

const props = defineProps<{
  properties: any[]
}>()

const showImportModal = ref(false)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const statusFilter = ref('all')

const filteredProperties = computed(() => {
  return props.properties.filter(p => {
    const matchesSearch = p.title.includes(searchQuery.value) || p.address.includes(searchQuery.value)
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})
</script>

<template>
  <div class="property-list-view">
    <div class="toolbar glass">
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" type="text" placeholder="按名称或地址搜索房源..." />
      </div>
      
      <div class="filters">
        <div class="filter-group">
          <Filter :size="16" />
          <select v-model="statusFilter">
            <option value="all">所有状态</option>
            <option value="occupied">已出租</option>
            <option value="vacant">待租</option>
            <option value="maintenance">维修中</option>
          </select>
        </div>

        <div class="view-toggle">
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <LayoutGrid :size="18" />
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <List :size="18" />
          </button>
        </div>

        <button class="secondary-btn" @click="showImportModal = true">
          <UploadCloud :size="18" />
          <span>批量导入</span>
        </button>

        <button class="primary-btn">
          <Plus :size="18" />
          <span>新增房源</span>
        </button>
      </div>
    </div>

    <!-- Data Import Modal -->
    <DataImportModal :show="showImportModal" @close="showImportModal = false" />

    <div :class="['content-area', viewMode]">
      <template v-if="viewMode === 'grid'">
        <PropertyCard 
          v-for="p in filteredProperties" 
          :key="p.id" 
          :property="p" 
        />
      </template>
      <template v-else>
        <div class="list-container glass">
          <table class="data-table">
            <thead>
              <tr>
                <th>房源信息</th>
                <th>状态</th>
                <th>月租</th>
                <th>租客</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredProperties" :key="p.id">
                <td>
                  <div class="prop-info">
                    <img :src="p.thumbnail" class="mini-thumb" />
                    <div>
                      <div class="name">{{ p.title }}</div>
                      <div class="addr">{{ p.address }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-dot" :class="p.status"></span>
                  {{ p.status === 'occupied' ? '已出租' : p.status === 'vacant' ? '待租' : '维修中' }}
                </td>
                <td>¥{{ p.price.toLocaleString() }}</td>
                <td>{{ p.tenant || '-' }}</td>
                <td><button class="action-btn">编辑</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.property-list-view {
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

.filters {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

select {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  outline: none;
}

select option {
  background: var(--bg-sidebar);
}

.view-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.view-toggle button {
  padding: 0.4rem;
  border-radius: 4px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: var(--accent-primary);
  color: white;
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  font-weight: 600;
}

.content-area.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.list-container {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.prop-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mini-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.prop-info .name {
  font-weight: 600;
  font-size: 0.95rem;
}

.prop-info .addr {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot.occupied { background: var(--accent-success); }
.status-dot.vacant { background: var(--accent-warning); }
.status-dot.maintenance { background: var(--accent-danger); }

.action-btn {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.85rem;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}
</style>
