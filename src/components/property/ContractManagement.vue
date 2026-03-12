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
  ArrowRight
} from 'lucide-vue-next'

const contracts = [
  { id: 1, tenant: '张三', property: '秀湖花苑 8号楼 1202', rent: 3500, period: '2023.05 - 2024.05', status: 'active' },
  { id: 2, tenant: '李四', property: '秀湖花苑 12号楼 504', rent: 4200, period: '2023.08 - 2024.08', status: 'expiring' },
  { id: 3, tenant: '赵六', property: '秀湖花苑 3号楼 201', rent: 2800, period: '2022.11 - 2023.11', status: 'expired' },
]

const showScanner = ref(false)
const scanState = ref<'idle' | 'scanning' | 'review'>('idle')
const ocrResults = ref({
  tenantName: '王小云',
  idNumber: '3101**********1234',
  rentAmount: 5500,
  startDate: '2024-04-01',
  endDate: '2025-03-31',
  property: '万科云城 612'
})

const startScan = () => {
  scanState.value = 'scanning'
  setTimeout(() => {
    scanState.value = 'review'
  }, 3000)
}

const saveContract = () => {
  showScanner.value = false
  scanState.value = 'idle'
}
</script>

<template>
  <div class="contract-view">
    <div class="view-header">
      <div class="h-info">
        <h2>合同管理 <span class="badge">{{ contracts.length }}</span></h2>
        <p>支持拍照上传，通过 AI 模型自动识别并录入纸质合同。</p>
      </div>
      <button class="ai-scan-btn" @click="showScanner = true">
        <Scan :size="20" />
        <span>AI 智绘录入</span>
      </button>
    </div>

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

    <!-- AI Scan Modal -->
    <div v-if="showScanner" class="modal-overlay" @click.self="showScanner = false">
      <div class="modal-content glass animate-scale-up" :class="{ wide: scanState === 'review' }">
        <button class="close-btn" @click="showScanner = false"><X :size="20" /></button>
        
        <div v-if="scanState === 'idle'" class="scan-idle">
          <div class="scan-visual">
            <div class="phone-mockup">
              <Camera :size="48" />
            </div>
          </div>
          <h3>AI 智能识图录入</h3>
          <p>对准纸质合同正面拍照，或者上传清晰的扫描件。</p>
          <div class="actions">
            <button class="primary-btn" @click="startScan">
              <Camera :size="20" />
              <span>开始拍摄</span>
            </button>
            <div class="upload-link">
              <Upload :size="16" />
              <span>上传已有图片</span>
            </div>
          </div>
        </div>

        <div v-else-if="scanState === 'scanning'" class="scan-loading">
          <div class="preview-img-box">
            <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1470&auto=format&fit=crop" alt="Scan preview" />
            <div class="scanner-line"></div>
          </div>
          <h3>AI 正在分析条款...</h3>
          <p>正在识别租期、租金及违约责任等关键信息...</p>
        </div>

        <div v-else class="scan-review">
          <div class="review-layout">
            <div class="img-reference">
              <h3>原件参考</h3>
              <div class="ref-box">
                <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1470&auto=format&fit=crop" alt="Contract source" />
              </div>
            </div>
            
            <div class="form-review">
              <h3>识别结果核对</h3>
              <div class="review-grid">
                <div class="field active">
                  <label>承租人姓名</label>
                  <input type="text" v-model="ocrResults.tenantName" />
                </div>
                <div class="field">
                  <label>证件号码</label>
                  <input type="text" v-model="ocrResults.idNumber" />
                </div>
                <div class="field active">
                  <label>月租金 (元)</label>
                  <input type="number" v-model="ocrResults.rentAmount" />
                </div>
                <div class="field">
                  <label>签约房屋</label>
                  <input type="text" v-model="ocrResults.property" />
                </div>
                <div class="field">
                  <label>生效周期</label>
                  <div class="date-row">
                    <input type="date" v-model="ocrResults.startDate" />
                    <ArrowRight :size="14" />
                    <input type="date" v-model="ocrResults.endDate" />
                  </div>
                </div>
              </div>
              <div class="review-footer">
                <button class="secondary-btn" @click="scanState = 'idle'">重试</button>
                <button class="primary-btn" @click="saveContract">确认并录入系统</button>
              </div>
            </div>
          </div>
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  width: 90%;
  max-width: 480px;
  background: var(--bg-sidebar);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  transition: max-width 0.4s ease;
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
  background: #222;
  border-radius: 16px;
  border: 4px solid #333;
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
  background: rgba(255, 255, 255, 0.05);
  padding: 0.85rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

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
  background: #000;
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  padding: 0.75rem;
  border-radius: 8px;
  color: white;
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
  background: rgba(255, 255, 255, 0.03);
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
