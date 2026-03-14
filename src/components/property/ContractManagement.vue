<script setup lang="ts">
import { ref } from 'vue'
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
  HelpCircle
} from 'lucide-vue-next'
import DataImportModal from './DataImportModal.vue'

const contracts = [
  { id: 1, tenant: '张三', property: '秀湖花苑 8号楼 1202', rent: 3500, period: '2023.05 - 2024.05', status: 'active' },
  { id: 2, tenant: '李四', property: '秀湖花苑 12号楼 504', rent: 4200, period: '2023.08 - 2024.08', status: 'expiring' },
  { id: 3, tenant: '赵六', property: '秀湖花苑 3号楼 201', rent: 2800, period: '2022.11 - 2023.11', status: 'expired' },
]

const showImportModal = ref(false)
const importMode = ref<'excel' | 'ai_scan'>('excel')

const openImport = (mode: 'excel' | 'ai_scan') => {
  importMode.value = mode
  showImportModal.value = true
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
    />

    <!-- Contract List -->
    <div class="contracts-grid">
      <div v-for="c in contracts" :key="c.id" class="contract-card glass">
        <div class="c-icon"><FileText :size="24" /></div>
        <div class="c-body">
          <div class="c-tenant">{{ c.tenant }}</div>
          <div class="c-prop">{{ c.property }}</div>
          <div class="c-meta">
            <span>¥{{ c.rent.toLocaleString() }}/月</span>
            <span class="dot">·</span>
            <span>{{ c.period }}</span>
          </div>
        </div>
        <div class="c-status" :class="c.status">
          <component :is="c.status === 'active' ? CheckCircle2 : c.status === 'expiring' ? Clock : AlertCircle" :size="14" />
          {{ c.status === 'active' ? '履行中' : c.status === 'expiring' ? '即将到期' : '已失效' }}
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.contract-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.h-info .badge {
  font-size: 0.9rem;
  background: var(--bg-card);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.h-info p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.ai-scan-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-scan-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contracts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.contract-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  transition: all 0.2s;
}

.contract-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
}

.c-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.c-tenant {
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.c-prop {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.c-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.c-status {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.c-status.active { color: var(--accent-success); }
.c-status.expiring { color: var(--accent-warning); }
.c-status.expired { color: var(--accent-danger); }

/* Modal & Scanner Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  width: 90%;
  max-width: 480px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  transition: max-width 0.4s ease;
  box-shadow: var(--glass-shadow);
}

.modal-content.wide {
  max-width: 900px;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-muted);
}

.scan-visual {
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.phone-mockup {
  width: 100px;
  height: 160px;
  background: var(--bg-input);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
}

.scan-idle h3 { margin-bottom: 0.75rem; }
.scan-idle p { color: var(--text-muted); margin-bottom: 2.5rem; }

.actions {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.secondary-btn {
  background: var(--bg-card);
  padding: 0.8rem 1.25rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.secondary-btn:hover { background: rgba(99, 102, 241, 0.05); transform: translateY(-1px); }

.upload-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--accent-primary);
  cursor: pointer;
}

/* Scanning Animation */
.preview-img-box {
  position: relative;
  width: 280px;
  height: 380px;
  margin: 0 auto 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.preview-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.5) blur(1px);
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-primary);
  animation: scanAnim 2s infinite linear;
}

@keyframes scanAnim {
  0% { top: 0; }
  50% { top: 100%; }
  100% { top: 0; }
}

/* Review Layout */
.review-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  text-align: left;
}

.img-reference .ref-box {
  margin-top: 1rem;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.img-reference .ref-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--bg-input);
}

.review-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 1.5rem 0 2.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.field input {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.field.active input {
  border-color: var(--accent-success);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
}

.date-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-row input { flex: 1; }

.review-footer {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .review-layout {
    grid-template-columns: 1fr;
  }
  .img-reference { display: none; }
}
</style>
