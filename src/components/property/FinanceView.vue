<script setup lang="ts">
import { ref } from 'vue'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Camera,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  X,
  Upload,
  HelpCircle
} from 'lucide-vue-next'
import DataImportModal from './DataImportModal.vue'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  category: string
  property: string
  amount: number
  date: string
  status: 'completed' | 'pending'
  channel: 'wechat' | 'alipay' | 'bank' | 'cash'
}

const transactions = ref<Transaction[]>([
  { id: 1, type: 'income', category: '租金缴纳', property: '秀湖花苑 8号楼 1202', amount: 3500, date: '2024-03-12', status: 'completed', channel: 'alipay' },
  { id: 2, type: 'expense', category: '维修支出', property: '秀湖花苑 12号楼 504', amount: 450, date: '2024-03-11', status: 'completed', channel: 'bank' },
  { id: 3, type: 'income', category: '租金缴纳', property: '秀湖花苑 6号楼 612', amount: 3200, date: '2024-03-10', status: 'pending', channel: 'wechat' },
  { id: 4, type: 'expense', category: '中介佣金', property: '秀湖花苑 15号楼 1508', amount: 2800, date: '2024-03-08', status: 'completed', channel: 'cash' },
  { id: 5, type: 'income', category: '水电代缴', property: '秀湖花苑 3号楼 201', amount: 120, date: '2024-03-05', status: 'completed', channel: 'alipay' },
])

const isEntryModalOpen = ref(false)
const isScanning = ref(false)
const newEntry = ref<{
  type: 'income' | 'expense'
  category: string
  property: string
  amount: number
  date: string
  channel: Transaction['channel']
}>({
  type: 'income',
  category: '',
  property: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0] || '',
  channel: 'wechat'
})

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'wechat': return Smartphone
    case 'alipay': return Smartphone
    case 'bank': return CreditCard
    case 'cash': return Banknote
    default: return Smartphone
  }
}

const getChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    wechat: '微信',
    alipay: '支付宝',
    bank: '银联/银行',
    cash: '现金'
  }
  return labels[channel] || channel
}

const handleAddEntry = () => {
  transactions.value.unshift({
    id: Date.now(),
    type: newEntry.value.type,
    category: newEntry.value.category,
    property: newEntry.value.property,
    amount: newEntry.value.amount,
    date: newEntry.value.date || new Date().toISOString().split('T')[0] || '',
    channel: newEntry.value.channel,
    status: 'completed'
  })
  isEntryModalOpen.value = false
  // Reset
  newEntry.value = {
    type: 'income',
    category: '',
    property: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0] || '',
    channel: 'wechat'
  }
}

const runAiScan = () => {
  isScanning.value = true
  // Mock AI Scanning
  setTimeout(() => {
    newEntry.value.amount = 3200
    newEntry.value.category = '租金收入'
    newEntry.value.property = '秀湖花苑 1号楼 802'
    newEntry.value.channel = Math.random() > 0.5 ? 'alipay' : 'wechat'
    isScanning.value = false
  }, 1500)
}

const stats = [
  { label: '总资产', value: '¥2,450,000', trend: '+12.5%', isUp: true },
  { label: '本月净收入', value: '¥42,800', trend: '+5.2%', isUp: true },
  { label: '待收金额', value: '¥18,400', trend: '-2.1%', isUp: false },
]

const showImportModal = ref(false)
</script>

<template>
  <div class="finance-view">
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card glass">
        <div class="card-header">
          <span class="label">{{ s.label }}</span>
          <div class="trend" :class="{ up: s.isUp, down: !s.isUp }">
            <component :is="s.isUp ? TrendingUp : TrendingDown" :size="14" />
            <span>{{ s.trend }}</span>
          </div>
        </div>
        <div class="value">{{ s.value }}</div>
      </div>
    </div>

    <div class="finance-main-grid">
      <section class="transactions-container glass">
        <div class="section-header">
          <h2>收支明细</h2>
          <div class="actions">
            <button class="icon-btn"><Filter :size="18" /></button>
            <div class="import-group">
              <button class="secondary-btn" @click="showImportModal = true">
                <Upload :size="16" />
                <span>Excel 导入</span>
              </button>
            </div>
            <button class="primary-btn-sm" @click="isEntryModalOpen = true">
              <Plus :size="16" />
              <span>记一笔</span>
            </button>
            <button class="secondary-btn">
              <Download :size="16" />
              <span>导出</span>
            </button>
          </div>
        </div>

        <DataImportModal :show="showImportModal" initial-type="finance" @close="showImportModal = false" />

        <div class="table-wrapper">
          <table class="finance-table">
            <thead>
              <tr>
                <th>交易内容</th>
                <th>关联房源</th>
                <th>日期</th>
                <th>金额</th>
                <th>方式</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td>
                  <div class="type-col">
                    <div class="icon-box" :class="t.type">
                      <component :is="t.type === 'income' ? ArrowUpRight : ArrowDownRight" :size="14" />
                    </div>
                    <span>{{ t.category }}</span>
                  </div>
                </td>
                <td>{{ t.property }}</td>
                <td>{{ t.date }}</td>
                <td :class="['amount', t.type]">
                  {{ t.type === 'income' ? '+' : '-' }}¥{{ t.amount.toLocaleString() }}
                </td>
                <td>
                  <div class="channel-info">
                    <component :is="getChannelIcon(t.channel)" :size="12" class="channel-icon" />
                    <span>{{ getChannelLabel(t.channel) }}</span>
                  </div>
                </td>
                <td class="text-right">
                  <span class="status-pill" :class="t.status">
                    {{ t.status === 'completed' ? '已完成' : '进行中' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="finance-charts">
        <div class="chart-card glass">
          <h3>营收构成</h3>
          <div class="donut-chart-mock">
            <div class="center-text">
              <span class="p">85%</span>
              <span class="t">租金收入</span>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="dot income"></span>
              <span class="name">房屋租金</span>
              <span class="val">85%</span>
            </div>
            <div class="legend-item">
              <span class="dot utility"></span>
              <span class="name">水电杂费</span>
              <span class="val">10%</span>
            </div>
            <div class="legend-item">
              <span class="dot other"></span>
              <span class="name">其他收入</span>
              <span class="val">5%</span>
            </div>
          </div>
        </div>

        <div class="quick-action-card glass">
          <h3>财务工具</h3>
          <div class="tool-buttons">
            <button class="tool-btn">
              <Wallet :size="20" />
              <span>租金自动催缴</span>
            </button>
            <button class="tool-btn">
              <TrendingUp :size="20" />
              <span>本月财务预测</span>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Entry Modal -->
    <div v-if="isEntryModalOpen" class="modal-overlay" @click="isEntryModalOpen = false">
      <div class="modal-content glass animate-scale-up" @click.stop>
        <div class="modal-header">
          <h2>新增财务流水</h2>
          <button class="close-btn" @click="isEntryModalOpen = false"><X :size="20" /></button>
        </div>

        <div class="modal-body">
          <!-- AI Scan Feature -->
          <div class="ai-scan-box" @click="runAiScan">
            <div v-if="!isScanning" class="scan-prompt">
              <Camera :size="32" />
              <p>拍摄或上传账单截图 (AI 智能识别)</p>
            </div>
            <div v-else class="scanning-state">
              <div class="scan-line"></div>
              <p>AI 正在分析票据信息...</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-item row">
              <label>收支类型</label>
              <div class="type-selector">
                <button 
                  :class="{ active: newEntry.type === 'income' }" 
                  @click="newEntry.type = 'income'"
                >收入</button>
                <button 
                  :class="{ active: newEntry.type === 'expense' }" 
                  @click="newEntry.type = 'expense'"
                >支出</button>
              </div>
            </div>

            <div class="form-item">
              <label>交易分类</label>
              <input v-model="newEntry.category" placeholder="如：租金收入、空调维修" />
            </div>

            <div class="form-item">
              <label>金额 (¥)</label>
              <input type="number" v-model="newEntry.amount" class="amount-input" />
            </div>

            <div class="form-item">
              <label>关联房源</label>
              <input v-model="newEntry.property" placeholder="秀湖花苑 x号楼 xxx" />
            </div>

            <div class="form-item">
              <label>收款/支付渠道</label>
              <select v-model="newEntry.channel">
                <option value="wechat">微信</option>
                <option value="alipay">支付宝</option>
                <option value="bank">银联/银行</option>
                <option value="cash">现金</option>
              </select>
            </div>

            <div class="form-item">
              <label>确认日期</label>
              <input type="date" v-model="newEntry.date" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="isEntryModalOpen = false">取消</button>
          <button class="confirm-btn" @click="handleAddEntry">
            <Check :size="18" /> 完成录入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.stat-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.stat-card .label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.trend.up { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
.trend.down { background: rgba(239, 68, 68, 0.1); color: var(--accent-danger); }

.stat-card .value {
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.finance-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
}

@media (max-width: 1366px) {
  .finance-main-grid {
    grid-template-columns: 1fr;
  }
  
  .finance-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .chart-card { margin-bottom: 0; }
}

@media (max-width: 768px) {
  .finance-charts {
    grid-template-columns: 1fr;
  }
}

.transactions-container {
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.primary-btn-sm {
  background: var(--accent-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.8rem;
}

.secondary-btn {
  background: var(--bg-card);
  padding: 0.8rem 1.25rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s;
}
.secondary-btn:hover { background: var(--bg-card-hover); border-color: var(--accent-primary); }

.finance-table {
  width: 100%;
  border-collapse: collapse;
}

.finance-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.finance-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  white-space: nowrap;
}

.text-right { text-align: right; }

.channel-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.channel-icon {
  opacity: 0.7;
}

.type-col {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box.income { background: rgba(16, 185, 129, 0.15); color: var(--accent-success); }
.icon-box.expense { background: rgba(239, 68, 68, 0.15); color: var(--accent-danger); }

.amount {
  font-weight: 700;
}

.amount.income { color: var(--accent-success); }
.amount.expense { color: var(--accent-danger); }

.status-pill {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pill.completed { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
.status-pill.pending { background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); }

.chart-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  margin-bottom: 1.5rem;
}

.chart-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.donut-chart-mock {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 12px solid var(--accent-primary);
  border-right-color: var(--accent-secondary);
  border-bottom-color: var(--text-muted);
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.center-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-text .p { font-size: 1.5rem; font-weight: 800; }
.center-text .t { font-size: 0.75rem; color: var(--text-muted); }

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  margin-right: 0.75rem;
}

.dot.income { background: var(--accent-primary); }
.dot.utility { background: var(--accent-secondary); }
.dot.other { background: var(--text-muted); }

.legend-item .val { margin-left: auto; font-weight: 700; }

.quick-action-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.quick-action-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  text-align: left;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--accent-primary);
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 480px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--glass-shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.ai-scan-box {
  background: rgba(99, 102, 241, 0.05);
  border: 2px dashed rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.ai-scan-box:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--accent-primary);
}

.scan-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-primary);
}

.scan-prompt p { font-size: 0.85rem; font-weight: 600; }

.scanning-state {
  padding: 1rem 0;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-primary);
  animation: scanMove 1.5s linear infinite;
}

@keyframes scanMove {
  0% { top: 0; }
  100% { top: 100%; }
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.form-item label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.type-selector {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem;
  border-radius: 8px;
}

.type-selector button {
  padding: 0.4rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s;
}

.type-selector button.active {
  background: var(--accent-primary);
  color: white;
}

input, select {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  outline: none;
}

input:focus, select:focus {
  border-color: var(--accent-primary);
}

.amount-input {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-success);
}

.modal-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

.confirm-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.cancel-btn {
  background: var(--bg-input);
  color: var(--text-secondary);
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 600;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
