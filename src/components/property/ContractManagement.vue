<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FileText, 
  Camera, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  Upload,
  ArrowRight,
  HelpCircle,
  Search,
  Filter,
  Download,
  Trash2,
  Plus
} from 'lucide-vue-next'
import DataImportModal from './DataImportModal.vue'
import BaseConfirm from '../common/BaseConfirm.vue'
import ContractDetailDrawer from './ContractDetailDrawer.vue'
import { getContracts, terminateContract } from '../../api/contract'
import { showToast } from '../../store'

const contracts = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('all') // all, active, expiring, expired

const showTerminateConfirm = ref(false)
const contractToTerminate = ref<number | null>(null)

const showDetailDrawer = ref(false)
const selectedContract = ref<any>(null)

const fetchContracts = async () => {
  loading.value = true
  try {
    const res = await getContracts()
    if (res.code === 0) {
      contracts.value = res.data.map((c: any) => ({
        id: c.id,
        tenant: c.customer?.name || '未知',
        property: `${c.room?.property?.name || ''} ${c.room?.roomNumber || ''}`,
        rent: (c.actualRentPrice || 0) / 100, // Convert cents to Yuan for frontend
        deposit: (c.deposit || 0) / 100, // Convert cents to Yuan for frontend
        period: `${c.startDate?.replace(/-/g, '.') || ''} - ${c.endDate?.replace(/-/g, '.') || ''}`,
        status: c.status === 1 ? 'active' : c.status === 3 ? 'expired' : 'expiring',
        raw: c
      }))
    }
  } catch (e) {
    showToast('获取合同列表失败', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchContracts)

const showImportModal = ref(false)
const importMode = ref<'excel' | 'ai_scan'>('excel')

const openImport = (mode: 'excel' | 'ai_scan') => {
  importMode.value = mode
  showImportModal.value = true
}

const filteredContracts = computed(() => {
  let result = contracts.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(c => c.status === activeTab.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.tenant.toLowerCase().includes(q) || 
      c.property.toLowerCase().includes(q)
    )
  }
  
  return result
})

const stats = computed(() => {
  return {
    total: contracts.value.length,
    active: contracts.value.filter(c => c.status === 'active').length,
    expiring: contracts.value.filter(c => c.status === 'expiring').length,
    expired: contracts.value.filter(c => c.status === 'expired').length
  }
})

const handleTerminate = (id: number) => {
  contractToTerminate.value = id
  showTerminateConfirm.value = true
}

const openDetail = (contract: any) => {
  selectedContract.value = contract
  showDetailDrawer.value = true
}

const closeDetail = () => {
  showDetailDrawer.value = false
  setTimeout(() => {
    selectedContract.value = null
  }, 300)
}

const confirmTerminate = async () => {
  if (contractToTerminate.value === null) return
  
  try {
    const res = await terminateContract(contractToTerminate.value)
    if (res.code === 0) {
      showToast('合同已解除', 'success')
      fetchContracts()
    }
  } catch (e: any) {
    showToast(e.message || '操作失败', 'error')
  } finally {
    showTerminateConfirm.value = false
    contractToTerminate.value = null
  }
}
</script>

<template>
  <div class="contract-view">
    <div class="view-header">
      <div class="h-info">
        <h2>合同管理 <span class="badge">{{ contracts.length }}</span></h2>
        <p>支持拍照上传，通过 AI 模型自动识别并录入纸质合同。</p>
      </div>
      <div class="header-actions">
        <div class="import-group">
          <button class="secondary-btn" @click="openImport('excel')">
            <Upload :size="18" />
            <span>Excel 批量导入</span>
          </button>
        </div>
        <button class="ai-scan-btn" @click="openImport('ai_scan')">
          <Scan :size="20" />
          <span>AI 智绘录入</span>
        </button>
      </div>
    </div>

    <DataImportModal 
      :show="showImportModal" 
      initial-type="contracts" 
      :initial-mode="importMode"
      @close="showImportModal = false" 
      @success="fetchContracts"
    />

    <BaseConfirm
      :show="showTerminateConfirm"
      title="解除合同确认"
      message="确定要解除此合同并释放房源吗？解除后房源将立即变更为“待租”状态。"
      confirm-text="确定解除"
      type="danger"
      @confirm="confirmTerminate"
      @cancel="showTerminateConfirm = false"
    />

    <ContractDetailDrawer
      :show="showDetailDrawer"
      :contract="selectedContract"
      @close="closeDetail"
      @terminate="handleTerminate"
    />

    <!-- Stats Bar -->
    <div class="stats-bar glass animate-in">
      <div v-for="s in [
        { label: '全部合同', val: stats.total, icon: FileText, color: 'var(--text-primary)' },
        { label: '履行中', val: stats.active, icon: CheckCircle2, color: 'var(--accent-success)' },
        { label: '即将到期', val: stats.expiring, icon: Clock, color: 'var(--accent-warning)' },
        { label: '已失效', val: stats.expired, icon: AlertCircle, color: 'var(--accent-danger)' }
      ]" :key="s.label" class="stat-item">
        <div class="s-icon" :style="{ color: s.color }">
          <component :is="s.icon" :size="20" />
        </div>
        <div class="s-info">
          <div class="s-val">{{ s.val }}</div>
          <div class="s-lab">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filter-row">
      <div class="tab-group">
        <button 
          v-for="t in [
            { id: 'all', name: '全部' },
            { id: 'active', name: '履行中' },
            { id: 'expiring', name: '即将到期' },
            { id: 'expired', name: '已失效' }
          ]" 
          :key="t.id"
          class="tab-btn"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          {{ t.name }}
        </button>
      </div>

      <div class="search-wrap">
        <Search :size="18" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索租客姓名、房源地址..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- Contract List -->
    <div v-if="filteredContracts.length > 0" class="contracts-grid">
      <div 
        v-for="c in filteredContracts" 
        :key="c.id" 
        class="contract-card glass animate-in"
        @click="openDetail(c)"
      >
        <div class="c-header-top">
          <div class="c-tag">NO.{{ String(c.id).padStart(6, '0') }}</div>
        </div>
        <div class="c-main">
          <div class="c-left">
            <div class="c-icon-bg"><FileText :size="28" /></div>
          </div>
          <div class="c-right">
            <div class="c-tenant">{{ c.tenant }}</div>
            <div class="c-prop">{{ c.property }}</div>
          </div>
        </div>
        
        <div class="c-details">
          <div class="det-item">
            <span class="l">月租金</span>
            <span class="vHighlight">¥{{ c.rent.toLocaleString() }}</span>
          </div>
          <div class="det-item">
            <span class="l">押金</span>
            <span class="v">¥{{ (c.raw?.deposit / 100 || 0).toLocaleString() }}</span>
          </div>
          <div class="det-item full">
            <span class="l">租期范围</span>
            <span class="v">{{ c.period }}</span>
          </div>
        </div>

        <div class="c-footer">
          <div class="status-badge" :class="c.status">
            <div class="dot"></div>
            {{ c.status === 'active' ? '履行中' : c.status === 'expiring' ? '即将到期' : '已失效' }}
          </div>
          <div class="card-actions">
            <button class="icon-btn" title="下载合同"><Download :size="16" /></button>
            <button class="icon-btn danger" @click.stop="handleTerminate(c.id)" title="解除合同">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state glass animate-in">
      <div class="empty-icon-wrapper">
        <FileText :size="48" />
      </div>
      <h3>暂无符合条件的合同</h3>
      <p>您可以尝试更换筛选条件，或者直接点击右上角“AI 智绘录入”添加新合同。</p>
      <button class="ai-scan-btn mt-6" @click="openImport('ai_scan')">
        <Plus :size="18" /> 添加第一份合同
      </button>
    </div>


  </div>
</template>

<style scoped>
.contract-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-info h2 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.h-info .badge {
  font-size: 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.2rem 0.75rem;
  border-radius: 20px;
  color: var(--accent-primary);
}

.h-info p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ai-scan-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 0.8rem 1.75rem;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-scan-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.ai-scan-btn.mt-6 { margin-top: 1.5rem; }

.secondary-btn {
  background: var(--bg-card);
  padding: 0.8rem 1.25rem;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem;
}

.s-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s-val {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.2;
}

.s-lab {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Filter Row */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.tab-group {
  display: flex;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: all 0.2s;
}

.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active {
  background: var(--bg-surface);
  color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 14px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* Contracts Grid & Card Redesign */
.contracts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

.contract-card {
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.contract-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.c-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.c-tag {
  font-size: 0.7rem;
  font-family: 'Fira Code', monospace;
  color: var(--text-muted);
  background: var(--bg-input);
  padding: 2px 8px;
  border-radius: 6px;
}

.c-more { color: var(--text-muted); cursor: pointer; }

.c-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.c-icon-bg {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.c-tenant { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); }
.c-prop { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; }

.c-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 16px;
}

.det-item { display: flex; flex-direction: column; gap: 4px; }
.det-item.full { grid-column: span 2; }
.det-item .l { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
.det-item .v { font-size: 0.9rem; color: var(--text-primary); font-weight: 700; }
.det-item .vHighlight { font-size: 1.05rem; color: var(--accent-primary); font-weight: 800; }

.c-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
}

.status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-badge.expiring { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-badge.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.status-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.card-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.icon-btn.danger:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #ef4444;
}

/* Empty State */
.empty-state {
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 30px;
  border: 1px dashed var(--border-color);
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.empty-state h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; }
.empty-state p { color: var(--text-muted); max-width: 400px; line-height: 1.6; }

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}

.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
