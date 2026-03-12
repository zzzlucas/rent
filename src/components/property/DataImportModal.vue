<script setup lang="ts">
import { ref } from 'vue'
import { X, Upload, Download, FileText, CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const step = ref(1) // 1: Select Type, 2: Uploading, 3: Completed
const importType = ref('properties')

const startImport = () => {
  step.value = 2
  setTimeout(() => {
    step.value = 3
  }, 2000)
}

const reset = () => {
  step.value = 1
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="reset">
    <div class="modal-content glass animate-scale-up">
      <button class="close-btn" @click="reset">
        <X :size="20" />
      </button>

      <div class="modal-header">
        <h2>数据处理中心</h2>
        <p>支持批量导入房源、租客与财务流水数据</p>
      </div>

      <div class="modal-body">
        <div v-if="step === 1" class="step-content">
          <div class="import-options">
            <div 
              class="option-card" 
              :class="{ active: importType === 'properties' }"
              @click="importType = 'properties'"
            >
              <div class="icon-box"><FileText :size="24" /></div>
              <div class="info">
                <div class="t">房源资料批量导入</div>
                <div class="d">支持 Excel (.xlsx, .csv) 格式</div>
              </div>
            </div>
            
            <div 
              class="option-card" 
              :class="{ active: importType === 'tenants' }"
              @click="importType = 'tenants'"
            >
              <div class="icon-box"><User :size="24" /></div>
              <div class="info">
                <div class="t">租客名单一键搬家</div>
                <div class="d">快速从第三方系统迁移数据</div>
              </div>
            </div>
          </div>

          <div class="upload-area">
            <input type="file" id="fileImport" class="hidden" @change="startImport" />
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

        <div v-else-if="step === 2" class="step-content loading">
          <div class="spinner"></div>
          <h3>正在解析并导入数据...</h3>
          <p>正在努力处理 118 条数据，请稍候。</p>
          <div class="progress-track">
            <div class="progress-bar" style="width: 65%"></div>
          </div>
        </div>

        <div v-else class="step-content success">
          <div class="success-icon">
            <CheckCircle2 :size="64" color="var(--accent-success)" />
          </div>
          <h3>导入成功！</h3>
          <p>已成功为您处理并录入 118 个房源，并关联了 42 名租客。</p>
          <div class="summary-stats">
            <div class="s-item">
              <span class="v">118</span>
              <span class="l">新增房源</span>
            </div>
            <div class="s-item">
              <span class="v">0</span>
              <span class="l">失败项</span>
            </div>
          </div>
          <button class="primary-btn" @click="reset">进入房源管理查看</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  background: var(--bg-sidebar);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-muted);
}

.modal-header {
  margin-bottom: 2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover, .option-card.active {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent-primary);
}

.icon-box {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-primary);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info .t {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.info .d {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.upload-area {
  margin-top: 1.5rem;
}

.drop-zone {
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-md);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-zone:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: var(--accent-primary);
}

.drop-zone .highlight {
  color: var(--accent-primary);
  font-weight: 700;
}

.drop-zone .small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.template-download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--accent-primary);
  cursor: pointer;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 1.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  text-align: center;
}

.success-icon {
  margin-bottom: 1.5rem;
}

.summary-stats {
  display: flex;
  gap: 3rem;
  margin: 2rem 0;
}

.s-item {
  display: flex;
  flex-direction: column;
}

.s-item .v { font-size: 1.5rem; font-weight: 800; }
.s-item .l { font-size: 0.8rem; color: var(--text-muted); }

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  width: 100%;
}

.hidden { display: none; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.glass {
  background: rgba(17, 17, 20, 0.98);
  backdrop-filter: blur(20px);
}
</style>
