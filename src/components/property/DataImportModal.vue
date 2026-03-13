<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Download, FileText, CheckCircle2, HelpCircle, Sparkles, AlertCircle, Check, User, ShieldCheck, CreditCard, Wrench } from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'

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
  <BaseModal 
    :show="show" 
    :title="step === 3 ? 'AI 预处理建议' : '数据处理中心'"
    :subtitle="step === 3 ? 'AI 已为您优化了数据，请确认变更' : '支持批量导入房源、租客与财务流水数据'"
    max-width="650px"
    @close="reset"
  >
    <div class="modal-body-content">
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
  </BaseModal>
</template>

<style scoped>
.modal-body-content {
  display: flex;
  flex-direction: column;
}

.step-content.loading, .step-content.success {
  align-items: center;
  padding: 2rem 0;
  text-align: center;
}

.import-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.option-card-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card-mini:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.option-card-mini.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.option-card-mini.active .mini-info .t {
  color: var(--accent-primary);
}

.mini-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.2s;
}

.active .mini-icon-box {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
}

.mini-info .t {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mini-info .d {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.ai-toggle-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.ai-toggle-box:has(input:checked) {
  border-color: var(--accent-secondary);
  background: rgba(168, 85, 247, 0.05);
}

.ai-label { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 700; 
  color: var(--text-primary); 
}
.ai-icon { color: var(--accent-secondary); }

.tip-wrap { position: relative; display: inline-flex; cursor: help; }
.tip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: var(--bg-surface);
  padding: 12px;
  border-radius: 10px;
  width: 240px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
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
input:checked + .slider { background-color: var(--accent-secondary); }
input:checked + .slider:before { transform: translateX(20px); background-color: white; }

.upload-area { display: flex; flex-direction: column; gap: 1rem; }
.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  background: var(--bg-card);
}
.drop-zone:hover { border-color: var(--accent-primary); background: var(--bg-card-hover); }
.drop-zone .highlight { color: var(--accent-primary); font-weight: 800; }
.drop-zone .small { color: var(--text-secondary); font-size: 0.75rem; font-weight: 500; }

.template-download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--accent-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.template-download:hover {
  background: rgba(99, 102, 241, 0.05);
  text-decoration: underline;
}

/* AI Thinking */
.ai-thinking { position: relative; margin-bottom: 2rem; }
.thinking-icon { color: #a855f7; filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)); animation: float 2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.ai-log { background: var(--bg-surface); border: 1px solid var(--border-color); padding: 1rem; border-radius: 10px; font-family: monospace; font-size: 0.8rem; color: var(--accent-secondary); width: 100%; text-align: left; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }

.ai-results-table { border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; margin-bottom: 1.5rem; }
.res-head { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 0.75rem 1rem; background: var(--bg-input); color: var(--text-muted); font-size: 0.75rem; font-weight: 800; }
.res-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 1rem; border-bottom: 1px solid var(--border-color); }
.res-field { font-weight: 700; color: var(--text-primary); font-size: 0.85rem; }
.res-old { color: var(--text-muted); text-decoration: line-through; font-size: 0.8rem; }
.res-new { color: #10b981; font-weight: 700; font-size: 0.9rem; }
.res-tag { font-size: 0.65rem; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; }

.conf-actions { display: flex; gap: 1rem; }
.primary-btn { background: var(--accent-primary); color: white; padding: 0.85rem 2rem; border-radius: 12px; font-weight: 700; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
.secondary-btn { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 600; width: 50%; }

.spinner { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.progress-track { height: 6px; background: var(--bg-input); border-radius: 3px; width: 100%; margin-top: 1rem; }
.progress-bar { height: 100%; background: var(--accent-primary); border-radius: 3px; }

.summary-stats { display: flex; gap: 3rem; justify-content: center; margin: 1.5rem 0; }
.s-item { display: flex; flex-direction: column; }
.s-item .v { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); }
.s-item .l { font-size: 0.75rem; color: var(--text-muted); }

.hidden { display: none; }
</style>
