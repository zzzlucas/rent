<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Star,
  Upload,
  HelpCircle
} from 'lucide-vue-next'
import { followedPropertyIds, toggleFollowProperty, showToast } from '../../store'
import DataImportModal from './DataImportModal.vue'
import RoomModal from './RoomModal.vue'
import LeaseModal from './LeaseModal.vue'
import { getRooms, terminateLease } from '../../api/property'
import { LogIn, LogOut } from 'lucide-vue-next'

const showImportModal = ref(false)
const showRoomModal = ref(false)
const showLeaseModal = ref(false)
const selectedRoom = ref<any>(null)

// Data state
const properties = ref<any[]>([])
const isLoading = ref(false)

const fetchRooms = async () => {
  isLoading.value = true
  try {
    const res = await getRooms()
    if (res.code === 0 && Array.isArray(res.data)) {
      // Mapping backend Room to frontend format
      properties.value = res.data.map((r: any) => {
        // Find active contract to get tenant info
        const activeLease = r.contracts?.find((c: any) => c.status === 1)
        return {
          id: r.id.toString(),
          title: `${r.property?.name || '未建物业'} ${r.roomNumber}`,
          type: r.towards ? `${r.towards}向` : '标准间',
          area: r.area || 0,
          rent: r.rentPrice / 100,
          status: r.status === 1 ? 'occupied' : r.status === 2 ? 'maintenance' : 'vacant',
          tenant: activeLease?.customer?.name || '-',
          phone: activeLease?.customer?.phone || '-',
          leaseEnd: activeLease?.endDate || '-',
          progress: activeLease ? calculateLeaseProgress(activeLease.startDate, activeLease.endDate) : 0,
          raw: r, // Keep raw data for modal
          contractId: activeLease?.id
        }
      })
    }
  } catch (error: any) {
    showToast(error.message || '加载房源失败', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRooms()
})

const searchQuery = ref('')
const statusFilter = ref('all')
const selectedIds = ref<string[]>([])

const filteredData = computed(() => {
  return properties.value.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.tenant.includes(searchQuery.value)
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const toggleAll = () => {
  if (selectedIds.value.length === filteredData.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredData.value.map(p => p.id)
  }
}

const getStatusLabel = (status: string) => {
  const map: any = {
    occupied: { text: '已出租', color: '#10b981' },
    vacant: { text: '待租', color: '#f59e0b' },
    maintenance: { text: '维修中', color: '#ef4444' }
  }
  return map[status] || { text: status, color: '#94a3b8' }
}

const exportLedger = () => {
  showToast(`正在生成 ${selectedIds.value.length || filteredData.value.length} 条房源的Excel台账报表...`, 'info')
}
const openLeaseModal = (room: any) => {
  selectedRoom.value = room.raw
  showLeaseModal.value = true
}

const handleTerminateLease = async (p: any) => {
  if (!confirm(`确认要为 ${p.title} 办理退租吗？合同将被终止。`)) return
  try {
    const res = await terminateLease(p.contractId)
    if (res.code === 0) {
      showToast('退租办理成功', 'success')
      fetchRooms()
    }
  } catch (error: any) {
    showToast(error.message || '操作失败', 'error')
  }
}

const calculateLeaseProgress = (start: string, end: string) => {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const n = new Date().getTime()
  if (n < s) return 0
  if (n > e) return 100
  return Math.round(((n - s) / (e - s)) * 100)
}

</script>

<template>
  <div class="ledger-view">
    <header class="page-top">
      <div>
        <h1 class="text-2xl font-bold">房源台账管理</h1>
        <p class="text-sm text-gray-500">资产全局搜索、批量审计与数据导出中心</p>
      </div>
      <div class="top-actions">
        <div class="import-group">
          <button class="export-btn" @click="showImportModal = true">
            <Upload :size="18" /> Excel 导入
          </button>
        </div>
        <button class="export-btn" @click="exportLedger">
          <Download :size="18" /> 导出本页台账
        </button>
        <button class="primary-btn" @click="showRoomModal = true">
          <Plus :size="18" /> 添加房源
        </button>
      </div>
    </header>

    <DataImportModal :show="showImportModal" initial-type="properties" @close="showImportModal = false" />
    <RoomModal :show="showRoomModal" @close="showRoomModal = false" @success="fetchRooms" />
    <LeaseModal :show="showLeaseModal" :room="selectedRoom" @close="showLeaseModal = false" @success="fetchRooms" />

    <!-- Ledger Stats Summary -->
    <div class="stats-summary-strip glass">
      <div class="strip-item">
        <TrendingUp :size="20" color="#10b981" />
        <div class="s-info"><span class="v">94.2%</span><span class="l">当前出租率</span></div>
      </div>
      <div class="strip-item">
        <Clock :size="20" color="#f59e0b" />
        <div class="s-info"><span class="v">12</span><span class="l">本月即将到期</span></div>
      </div>
      <div class="strip-item">
        <AlertCircle :size="20" color="#ef4444" />
        <div class="s-info"><span class="v">3</span><span class="l">空置超过15天</span></div>
      </div>
      <div class="strip-item">
        <CheckCircle2 :size="20" color="#6366f1" />
        <div class="s-info"><span class="v">¥32,400</span><span class="l">本月预估营收</span></div>
      </div>
    </div>

    <!-- Multi-Tool Toolbar -->
    <div class="ledger-toolbar">
      <div class="search-group">
        <div class="search-input-wrap">
          <Search :size="18" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="全局搜索房号、租客名..." />
        </div>
        <div class="filter-pills">
          <button 
            v-for="s in [{id:'all',l:'全部'}, {id:'occupied',l:'已租'}, {id:'vacant',l:'待租'}, {id:'maintenance',l:'维修'}]"
            :key="s.id"
            :class="{ active: statusFilter === s.id }"
            @click="statusFilter = s.id"
          >
            {{ s.l }}
          </button>
        </div>
      </div>
      
      <div class="batch-ops" v-if="selectedIds.length > 0">
        <span class="selected-count">已选 {{ selectedIds.length }} 项</span>
        <button class="batch-btn"><Edit3 :size="14"/> 批量调价</button>
        <button class="batch-btn"><Copy :size="14"/> 应用模板</button>
        <button class="batch-btn danger"><Trash2 :size="14"/> 批量删除</button>
      </div>
    </div>

    <!-- Data Table Ledger -->
    <div class="ledger-table-container glass">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="check-col">
              <input type="checkbox" :checked="selectedIds.length === filteredData.length && filteredData.length > 0" @change="toggleAll" />
            </th>
            <th>房源/规格</th>
            <th>月租金</th>
            <th>房源状态</th>
            <th>租客及联系方式</th>
            <th>租约进度/到期</th>
            <th class="actions-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredData" :key="p.id" :class="{ selected: selectedIds.includes(p.id) }">
            <td>
              <input type="checkbox" v-model="selectedIds" :value="p.id" />
            </td>
            <td>
              <div class="prop-cell">
                <span class="p-title">{{ p.title }}</span>
                <span class="p-meta">{{ p.type }} · {{ p.area }}㎡</span>
              </div>
            </td>
            <td>
              <span class="p-price">¥{{ p.rent }}</span>
            </td>
            <td>
              <div class="status-badge" :style="{ color: getStatusLabel(p.status).color, background: getStatusLabel(p.status).color + '10', borderColor: getStatusLabel(p.status).color + '30' }">
                {{ getStatusLabel(p.status).text }}
              </div>
            </td>
            <td>
              <div class="tenant-cell">
                <span class="t-name">{{ p.tenant }}</span>
                <span class="t-phone" v-if="p.phone !== '-'">{{ p.phone }}</span>
              </div>
            </td>
            <td>
              <div class="lease-cell" v-if="p.leaseEnd !== '-'">
                <div class="progress-track"><div class="progress-fill" :style="{ width: p.progress + '%', background: p.progress > 80 ? '#f87171' : 'var(--accent-primary)' }"></div></div>
                <span class="lease-date">{{ p.leaseEnd }}</span>
              </div>
              <span class="p-meta" v-else>暂无租约</span>
            </td>
            <td>
              <div class="row-actions">
                <button 
                  class="row-btn star-toggle" 
                  :class="{ 'is-active': followedPropertyIds.has(p.id) }"
                  @click="toggleFollowProperty(p.id)"
                  :title="followedPropertyIds.has(p.id) ? '取消关注' : '加入关注清单'"
                >
                  <Star :size="16" :fill="followedPropertyIds.has(p.id) ? 'var(--accent-warning)' : 'none'" />
                </button>
                <button 
                  v-if="p.status === 'vacant'"
                  class="row-btn lease-btn" 
                  title="办理代租"
                  @click="openLeaseModal(p)"
                >
                  <LogIn :size="16" color="#10b981" />
                </button>
                <button 
                  v-if="p.status === 'occupied'"
                  class="row-btn terminate-btn" 
                  title="办理退租"
                  @click="handleTerminateLease(p)"
                >
                  <LogOut :size="16" color="#ef4444" />
                </button>
                <button class="row-btn"><Edit3 :size="16"/></button>
                <button class="row-btn"><ChevronRight :size="16"/></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredData.length === 0" class="empty-state">
        <AlertCircle :size="48" />
        <p>未找到匹配条件的房源数据</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ledger-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--text-primary);
}

.page-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.top-actions { display: flex; gap: 1rem; }

.export-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.8rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.export-btn:hover { background: var(--bg-card-hover); border-color: var(--accent-primary); }

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

/* Summary Strip */
.stats-summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
}

.strip-item { display: flex; align-items: center; gap: 1rem; border-right: 1px solid var(--border-color); padding: 0 1.5rem; }
.strip-item:last-child { border-right: none; }
.strip-item .s-info { display: flex; flex-direction: column; }
.strip-item .v { font-size: 1.2rem; font-weight: 800; font-family: 'Outfit', sans-serif; color: var(--text-primary); }
.strip-item .l { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }

/* Toolbar */
.ledger-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.search-group { display: flex; align-items: center; gap: 1.5rem; }
.search-input-wrap {
  position: relative;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 300px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
}
.search-input-wrap input { background: transparent; border: none; outline: none; padding: 0.8rem 0; color: var(--text-primary); width: 100%; }

.filter-pills { display: flex; gap: 6px; }
.filter-pills button { 
  font-size: 0.8rem; padding: 6px 14px; border-radius: 20px; 
  background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-muted);
}
.filter-pills button.active { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }

.batch-ops {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: slideIn 0.3s ease;
}
.selected-count { font-size: 0.8rem; font-weight: 700; color: var(--accent-primary); margin-right: 0.5rem; }
.batch-btn { font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-color); }
.batch-btn.danger { background: rgba(248, 113, 113, 0.1); color: #f87171; border-color: rgba(248, 113, 113, 0.2); }

/* Table Ledger */
.ledger-table-container {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.ledger-table { width: 100%; border-collapse: collapse; }
.ledger-table th {
  text-align: left; padding: 1.25rem 1.5rem; background: var(--bg-input);
  color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid var(--border-color);
}

.ledger-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; transition: all 0.2s; }
.ledger-table tr:hover td { background: var(--bg-card-hover); }
.ledger-table tr.selected td { background: rgba(99, 102, 241, 0.08); }

.prop-cell { display: flex; flex-direction: column; gap: 4px; }
.p-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
.p-meta { font-size: 0.75rem; color: var(--text-muted); }

.p-price { font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 1rem; color: var(--accent-primary); }

.status-badge {
  display: inline-flex; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; border: 1px solid transparent;
}

.tenant-cell { display: flex; flex-direction: column; gap: 4px; }
.t-name { font-weight: 600; font-size: 0.9rem; }
.t-phone { font-size: 0.75rem; color: var(--text-muted); font-family: 'Courier New', Courier, monospace; }

.lease-cell { display: flex; flex-direction: column; gap: 6px; width: 140px; }
.progress-track { height: 4px; background: var(--bg-input); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; }
.lease-date { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

.row-actions { display: flex; gap: 4px; }
.row-btn { width: 32px; height: 32px; border-radius: 8px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.row-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }

.row-btn.star-toggle.is-active {
  color: var(--accent-warning);
}

.row-btn.star-toggle:hover {
  color: var(--accent-warning);
  transform: scale(1.1);
}

.empty-state { padding: 5rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem; }

@keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.glass { 
  background: var(--glass-bg); 
  backdrop-filter: blur(20px); 
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
</style>

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
  background: var(--bg-input);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
  width: 320px;
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-primary);
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
  background: var(--bg-input);
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
  background: var(--bg-input);
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
  background: var(--bg-input);
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
