<script setup lang="ts">
import { ref } from 'vue'
import { X, Upload, Download, FileText, CheckCircle2, HelpCircle, Sparkles, AlertCircle, Check, User, ShieldCheck, CreditCard, Wrench } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  initialType?: string
}>()

const emit = defineEmits(['close'])

const step = ref(1) // 1: Select/Upload, 2: AI Preprocessing, 3: AI Confirmation, 4: Final Processing, 5: Completed
const importType = ref(props.initialType || 'properties')
const aiEnabled = ref(true)
const fileName = ref('')

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    fileName.value = target.files[0].name
    if (aiEnabled.value) {
      startAIPreprocessing()
    } else {
      startFinalImport()
    }
  }
}

const startAIPreprocessing = () => {
  step.value = 2
  setTimeout(() => {
    step.value = 3
  }, 2500)
}

const confirmAIResults = () => {
  step.value = 4
  setTimeout(() => {
    step.value = 5
  }, 1500)
}

const startFinalImport = () => {
  step.value = 4
  setTimeout(() => {
    step.value = 5
  }, 2000)
}

const reset = () => {
  step.value = 1
  fileName.value = ''
  emit('close')
}

// Mock AI Preprocessed results
const aiResults = [
  { field: '租次开始日期', original: '2023.05.01', fixed: '2023-05-01', reason: '统一日期格式' },
  { field: '手机号', original: '138 0013 8000', fixed: '13800138000', reason: '清除空格' },
  { field: '租金', original: '5000元', fixed: '5000', reason: '提取纯数字' },
]

</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="reset">
      <div class="modal-content glass animate-scale-up">
        <button class="close-btn" @click="reset">
          <X :size="20" />
        </button>

        <div class="modal-header">
          <div class="title-with-icon">
            <div class="icon-gradient">
              <Upload v-if="step <= 1" :size="24" />
              <Sparkles v-else-if="step <= 3" :size="24" />
              <CheckCircle2 v-else :size="24" />
            </div>
            <div>
              <h2>{{ step === 3 ? 'AI 预处理建议' : '数据处理中心' }}</h2>
              <p>{{ step === 3 ? 'AI 已为您优化了数据，请确认变更' : '支持批量导入房源、租客与财务流水数据' }}</p>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <!-- Step 1: Selection & Upload -->
          <div v-if="step === 1" class="step-content">
            <div class="import-options-grid">
              <div 
                v-for="opt in [
                  { id: 'properties', t: '房源资料导入', d: '批量录入房产信息', icon: FileText },
                  { id: 'tenants', t: '租客名单导入', d: '批量录入租客信息', icon: User },
                  { id: 'contracts', t: '电子合同导入', d: '批量导入租赁合同', icon: ShieldCheck },
                  { id: 'finance', t: '财务流水导入', d: '批量录入收支明细', icon: CreditCard },
                  { id: 'maintenance', t: '运维任务导入', d: '批量录入报修记录', icon: Wrench }
                ]"
                :key="opt.id"
                class="option-card-mini" 
                :class="{ active: importType === opt.id }"
                @click="importType = opt.id"
              >
                <div class="mini-icon-box">
                  <component :is="opt.icon" :size="20" />
                </div>
                <div class="mini-info">
                  <div class="t">{{ opt.t }}</div>
                  <div class="d">{{ opt.d }}</div>
                </div>
              </div>
            </div>

            <div class="ai-toggle-box">
              <div class="ai-label">
                <Sparkles :size="16" class="ai-icon" />
                <span>AI 智能数据预处理</span>
                <div class="tip-wrap">
                  <HelpCircle :size="14" class="tip-icon" />
                  <div class="tip-content">通过专业AI智能体进行数据清洗、格式统一与逻辑纠错</div>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="aiEnabled">
                <span class="slider"></span>
              </label>
            </div>

            <div class="upload-area">
              <input type="file" id="fileImport" class="hidden" @change="handleFileUpload" />
              <label for="fileImport" class="drop-zone">
                <Upload :size="32" />
                <span>拖拽文件到此处 或 <span class="highlight">点击上传</span></span>
                <p class="small">仅支持 .xlsx, .xls, .csv 格式，文件大小不超过 10MB</p>
              </label>
              <div class="template-download">
                <Download :size="14" />
                <span>下载标准录入模板</span>
              </div>
            </div>
          </div>

          <!-- Step 2: AI Preprocessing Loading -->
          <div v-else-if="step === 2" class="step-content loading">
            <div class="ai-thinking">
              <Sparkles :size="48" class="thinking-icon" />
              <div class="orbit-glow"></div>
            </div>
            <h3>AI 正在为您预处理数据...</h3>
            <p>正在分析数据一致性、识别潜在错误并纠正格式</p>
            <div class="ai-log">
              <div class="log-line">→ 扫描文件: {{ fileName }}</div>
              <div class="log-line">→ 正在识别字段映射...</div>
              <div class="log-line">→ 正在检测日期与金额格式...</div>
            </div>
          </div>

          <!-- Step 3: AI Confirmation -->
          <div v-else-if="step === 3" class="step-content confirmation">
            <div class="ai-results-table">
              <div class="res-head">
                <span>待处理项</span>
                <span>原始数据</span>
                <span>AI 优化后</span>
              </div>
              <div v-for="(res, idx) in aiResults" :key="idx" class="res-row">
                <div class="res-field">
                  <AlertCircle :size="12" />
                  {{ res.field }}
                </div>
                <div class="res-old">{{ res.original }}</div>
                <div class="res-new">
                  {{ res.fixed }}
                  <span class="res-tag">{{ res.reason }}</span>
                </div>
              </div>
            </div>
            <div class="conf-actions">
              <button class="secondary-btn" @click="step = 4">忽略 AI 建议</button>
              <button class="primary-btn ai-btn" @click="confirmAIResults">
                <Check :size="18" /> 确认并开始导入
              </button>
            </div>
          </div>

          <!-- Step 4: Final Processing -->
          <div v-else-if="step === 4" class="step-content loading">
            <div class="spinner"></div>
            <h3>正在同步到数据库...</h3>
            <p>正在处理 118 条记录</p>
            <div class="progress-track">
              <div class="progress-bar" style="width: 75%"></div>
            </div>
          </div>

          <!-- Step 5: Success -->
          <div v-else class="step-content success">
            <div class="success-icon-wrap">
              <CheckCircle2 :size="64" color="#10b981" />
              <div class="confetti"></div>
            </div>
            <h3>导入成功！</h3>
            <p>已成功处理并录入 118 个数据项</p>
            <div class="summary-stats">
              <div class="s-item">
                <span class="v">118</span>
                <span class="l">新增记录</span>
              </div>
              <div class="s-item">
                <span class="v">0</span>
                <span class="l">失败项</span>
              </div>
            </div>
            <button class="primary-btn" @click="reset">完成并返回</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 650px;
  background: #111114;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  padding: 6px;
  transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.title-with-icon { display: flex; gap: 1.25rem; align-items: center; }
.icon-gradient {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.modal-header h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; color: #fff; }
.modal-header p { color: var(--text-muted); font-size: 0.95rem; }

.import-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2rem 0; }
.option-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.option-card:hover { border-color: #6366f1; transform: translateY(-4px); background: rgba(99, 102, 241, 0.05); }
.option-card.active { border-color: #6366f1; background: rgba(99, 102, 241, 0.1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }

.icon-box { color: #6366f1; }
.info .t { font-weight: 700; color: #fff; margin-bottom: 4px; }
.info .d { font-size: 0.8rem; color: var(--text-muted); }

/* New Mini Options Grid */
.import-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1.5rem 0 2rem;
}

.option-card-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card-mini:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.option-card-mini.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

.mini-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
}

.mini-info .t {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}

.mini-info .d {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* AI Toggle Section */
.ai-toggle-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
  margin-bottom: 1.5rem;
}
.ai-label { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #d8b4fe; }
.ai-icon { filter: drop-shadow(0 0 5px #a855f7); }

.tip-wrap { position: relative; display: inline-flex; cursor: help; }
.tip-icon { color: rgba(216, 180, 254, 0.6); }
.tip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #1e1e24;
  padding: 12px;
  border-radius: 10px;
  width: 240px;
  font-size: 0.8rem;
  font-weight: 400;
  color: #ccc;
  border: 1px solid #333;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.tip-wrap:hover .tip-content { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(-5px); }

/* Switch Style */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px;
}
.slider:before {
  position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
  background-color: white; transition: .4s; border-radius: 50%;
}
input:checked + .slider { background-color: #a855f7; }
input:checked + .slider:before { transform: translateX(20px); }

.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255,255,255,0.01);
}
.drop-zone:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.02); }
.drop-zone .highlight { color: #6366f1; font-weight: 700; text-decoration: underline; }
.drop-zone .small { color: var(--text-muted); font-size: 0.75rem; }

/* AI Loading State */
.ai-thinking { position: relative; margin-bottom: 2rem; }
.thinking-icon { color: #a855f7; filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.5)); animation: float 2s ease-in-out infinite; }
.orbit-glow { 
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
  animation: pulse 2s infinite;
}
.ai-log { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 0.8rem; color: #a855f7; margin-top: 1.5rem; width: 100%; text-align: left; }
.log-line { margin: 4px 0; animation: fadeIn 0.5s forwards; }

/* AI Confirmation Table */
.ai-results-table { border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; margin-bottom: 2rem; }
.res-head { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 1rem; background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.res-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
.res-field { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #fff; font-size: 0.9rem; }
.res-old { color: var(--text-muted); text-decoration: line-through; font-size: 0.85rem; }
.res-new { color: #10b981; font-weight: 700; font-size: 0.95rem; display: flex; flex-direction: column; gap: 4px; }
.res-tag { font-size: 0.7rem; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 500; width: fit-content; }

.conf-actions { display: flex; gap: 1rem; }
.ai-btn { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); }

/* Success State */
.success-icon-wrap { position: relative; margin-bottom: 2rem; }

.summary-stats { display: flex; gap: 4rem; justify-content: center; margin: 2rem 0; }
.s-item { display: flex; flex-direction: column; align-items: center; }
.s-item .v { font-size: 2rem; font-weight: 900; color: #fff; }
.s-item .l { font-size: 0.85rem; color: var(--text-muted); }

.primary-btn {
  background: #6366f1; color: white; padding: 1rem 2.5rem; border-radius: 14px;
  font-weight: 700; width: 100%; transition: all 0.2s; display: flex; items-center: center; justify-content: center; gap: 8px;
}
.primary-btn:hover { background: #4f46e5; transform: scale(1.02); }

.secondary-btn {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);
  padding: 1rem 1.5rem; border-radius: 14px; font-weight: 600; width: 50%;
}

.spinner {
  width: 50px; height: 50px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: #6366f1;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse { 0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.hidden { display: none; }
.glass { background: #111114; }
</style>

