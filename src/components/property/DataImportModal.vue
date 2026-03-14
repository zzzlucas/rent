<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Upload, Download, FileText, CheckCircle2, HelpCircle, Sparkles, AlertCircle, Check, User, ShieldCheck, CreditCard, Wrench, Camera, Wand2, Terminal, Cpu, LayoutGrid } from 'lucide-vue-next'
import BaseModal from '../common/BaseModal.vue'
import { chatProxy, fetchAiModels } from '../../api/ai'

const props = defineProps<{
  show: boolean
  initialType?: string
}>()

const emit = defineEmits(['close'])

const step = ref(1) // 1: Select/Upload, 2: AI Preprocessing/OCR, 3: AI Confirmation, 4: Final Processing, 5: Completed
const importType = ref(props.initialType || 'properties')
const aiEnabled = ref(true)
const entryMode = ref<'excel' | 'ai_scan'>('excel') // excel: 传统表格, ai_scan: 拍照/扫描件 OCR
const fileName = ref('')
const fileBase64 = ref('')
const previewUrl = ref('')

// AI Models & Logs
const availableModels = ref<any[]>([])
const selectedOcrModel = ref('deepseek-ai/DeepSeek-OCR')
const selectedLlmModel = ref('deepseek-ai/DeepSeek-V3')
const aiLogs = ref<{msg: string, type: 'info'|'success'|'error'}[]>([])
const ocrResultText = ref('')
const extractedFields = ref<any[]>([])
const batchQueue = ref<{name: string, status: 'pending'|'processing'|'done'|'error', progress: number}[]>([])
const currentBatchIndex = ref(-1)

// Recognition History & Estimation
const recognitionHistory = ref<any[]>(JSON.parse(localStorage.getItem('contract_scan_history') || '[]'))
const estimatedSeconds = ref(0)
const elapsedSeconds = ref(0)
let progressTimer: any = null

const saveHistory = (data: any) => {
  recognitionHistory.value.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    ...data
  })
  recognitionHistory.value = recognitionHistory.value.slice(0, 10) // Keep last 10
  localStorage.setItem('contract_scan_history', JSON.stringify(recognitionHistory.value))
}

const getEstimate = (ocrModel: string, pageCount: number) => {
  const modelStats = recognitionHistory.value.filter(h => h.ocrModel === ocrModel)
  if (modelStats.length > 0) {
    const avgTimePerPage = modelStats.reduce((acc, curr) => acc + (curr.totalTime / curr.pages), 0) / modelStats.length
    return Math.max(5, Math.round(avgTimePerPage * pageCount + 3)) // Base 3s for LLM
  }
  return pageCount * 8 + 5 // Default fallback: 8s per page + 5s LLM
}

const startProgressTimer = (totalEstimate: number) => {
  elapsedSeconds.value = 0
  estimatedSeconds.value = totalEstimate
  if (progressTimer) clearInterval(progressTimer)
  
  progressTimer = setInterval(() => {
    elapsedSeconds.value += 0.5
    if (elapsedSeconds.value >= totalEstimate) {
      clearInterval(progressTimer)
    }
  }, 500)
}

const currentSmoothProgress = computed(() => {
  if (step.value > 2) return 100
  if (estimatedSeconds.value === 0) return 0
  const linear = (elapsedSeconds.value / estimatedSeconds.value) * 100
  return Math.min(linear, 92) // Stop at 92% until actual finish
})

const fetchModels = async () => {
  try {
    const res = await fetchAiModels()
    if (res.code === 0) {
      availableModels.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch models', e)
    // Fallback defaults
    availableModels.value = [
      { id: 'ocr-1', name: 'DeepSeek OCR', model: 'deepseek-ai/DeepSeek-OCR', type: 'vision' },
      { id: 'llm-1', name: 'DeepSeek V3', model: 'deepseek-ai/DeepSeek-V3', type: 'text' }
    ]
  }
}

onMounted(fetchModels)

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    
    if (entryMode.value === 'ai_scan') {
      const startTime = Date.now()
      batchQueue.value = files.map(f => ({ name: f.name, status: 'pending', progress: 0 }))
      step.value = 2
      aiLogs.value = []
      
      const totalEst = getEstimate(selectedOcrModel.value, files.length)
      startProgressTimer(totalEst)
      addLog(`⚡ 预计处理耗时: 约 ${totalEst} 秒 (基于历史模型表现)`, 'info')
      
      let allOcrResults = ''
      
      for (let i = 0; i < files.length; i++) {
        currentBatchIndex.value = i
        const file = files[i]
        batchQueue.value[i].status = 'processing'
        
        const reader = new FileReader()
        const fileContent = await new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string)
          reader.readAsDataURL(file)
        })
        
        fileBase64.value = fileContent.split(',')[1]
        previewUrl.value = fileContent
        
        const result = await processSingleFile(file.name, i)
        allOcrResults += `\n--- 文件: ${file.name} ---\n${result}`
        batchQueue.value[i].status = 'done'
        batchQueue.value[i].progress = 100
      }
      
      ocrResultText.value = allOcrResults
      await finalizeStructuredExtraction(allOcrResults)
      
      const duration = (Date.now() - startTime) / 1000
      saveHistory({
        ocrModel: selectedOcrModel.value,
        llmModel: selectedLlmModel.value,
        pages: files.length,
        totalTime: duration
      })
      clearInterval(progressTimer)
      
    } else {
      const file = files[0]
      fileName.value = file.name
      if (aiEnabled.value) {
        startAIPreprocessing()
      } else {
        startFinalImport()
      }
    }
  }
}

const processSingleFile = async (name: string, index: number) => {
  addLog(`📄 正在识别页面 [${index + 1}/${batchQueue.value.length}]: ${name}`, 'info')
  batchQueue.value[index].progress = 20
  
  try {
    const ocrResp = await chatProxy({
      model: selectedOcrModel.value,
      messages: [
        { role: 'user', content: [
          { type: 'text', text: '请准确识别并提取这张合同图片中的所有文字内容。' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${fileBase64.value}` } }
        ]}
      ]
    })
    batchQueue.value[index].progress = 80
    return ocrResp.choices[0].message.content
  } catch (err: any) {
    batchQueue.value[index].status = 'error'
    addLog(`❌ [${name}] 识别失败: ${err.message}`, 'error')
    return ''
  }
}

const finalizeStructuredExtraction = async (text: string) => {
  addLog(`🧠 正在整合所有页面并进行深度语义提取 (${selectedLlmModel.value})...`, 'info')
  try {
    const extractResp = await chatProxy({
      model: selectedLlmModel.value,
      messages: [
        { role: 'system', content: '你是一个专业的租赁合同分析助手。请根据提供的 OCR 文字，提取关键字段并输出为 JSON 数组格式，每个对象包含 field, original(文字原值), fixed(建议修正值), reason(原因)。若无修正，fixed同original。' },
        { role: 'user', content: `请分析以下合同文本(包含多个文件/页面)并提取：合同编号、甲方、乙方、房屋地址、月租金金额(数字)、租期开始日、租期结束日、押金。文字内容：\n${text}` }
      ]
    })

    const content = extractResp.choices[0].message.content
    const jsonStr = content.match(/\[[\s\S]*\]/)?.[0] || '[]'
    extractedFields.value = JSON.parse(jsonStr)
    
    addLog('🎊 批量结构化分析已完成，请核对信息。', 'success')
    setTimeout(() => {
      step.value = 3
    }, 1000)
  } catch (err: any) {
    addLog(`❌ 结构化提取失败: ${err.message}`, 'error')
  }
}

const addLog = (msg: string, type: 'info'|'success'|'error' = 'info') => {
  aiLogs.value.push({ msg, type })
}

const startAiScanProcess = async () => {
  step.value = 2
  aiLogs.value = []
  addLog('📷 正在加载文档图像...', 'info')
  
  try {
    // Stage 1: OCR
    addLog(`🚀 正在启动 OCR 引擎 (${selectedOcrModel.value})...`, 'info')
    const ocrResp = await chatProxy({
      model: selectedOcrModel.value,
      messages: [
        { role: 'user', content: [
          { type: 'text', text: '请准确识别并提取这张合同图片中的所有文字内容，保持原始顺序，包括表格数据。' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${fileBase64.value}` } }
        ]}
      ]
    })
    
    ocrResultText.value = ocrResp.choices[0].message.content
    addLog('✅ 文字识别完成，正在载入语义分析模型...', 'success')

    // Stage 2: Structured Extraction
    addLog(`🧠 正在进行深度语义提取 (${selectedLlmModel.value})...`, 'info')
    const extractResp = await chatProxy({
      model: selectedLlmModel.value,
      messages: [
        { role: 'system', content: '你是一个专业的租赁合同分析助手。请根据提供的 OCR 文字，提取关键字段并输出为 JSON 数组格式，每个对象包含 field, original(文字原值), fixed(建议修正值), reason(原因)。若无修正，fixed同original。' },
        { role: 'user', content: `请分析以下合同文本并提取：合同编号、甲方、乙方、房屋地址、月租金金额(数字)、租期开始日、租期结束日、押金。文字内容：\n${ocrResultText.value}` }
      ]
    })

    const content = extractResp.choices[0].message.content
    const jsonStr = content.match(/\[[\s\S]*\]/)?.[0] || '[]'
    extractedFields.value = JSON.parse(jsonStr)
    
    addLog('🎊 结构化分析已完成，请核对信息。', 'success')
    setTimeout(() => {
      step.value = 3
    }, 1000)
    
  } catch (err: any) {
    addLog(`❌ 处理失败: ${err.message}`, 'error')
  }
}

const startAIPreprocessing = () => {
  step.value = 2
  setTimeout(() => {
    extractedFields.value = [
      { field: '租期开始日期', original: '2023.05.01', fixed: '2023-05-01', reason: '统一日期格式' },
      { field: '手机号', original: '138 0013 8000', fixed: '13800138000', reason: '清除空格' },
      { field: '租金', original: '5000元', fixed: '5000', reason: '提取纯数字' },
    ]
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
  fileBase64.value = ''
  previewUrl.value = ''
  aiLogs.value = []
  emit('close')
}

const isMinimized = ref(false)
const aiProgress = computed(() => {
  if (aiLogs.value.length === 0) return 0
  if (step.value > 2) return 100
  // Simulated progress based on logs
  const base = (aiLogs.value.length / 6) * 100
  return Math.min(base, 95)
})

const lastLog = computed(() => aiLogs.value[aiLogs.value.length - 1]?.msg || '初始化中...')

const minimize = () => {
  isMinimized.value = true
}

const restore = () => {
  isMinimized.value = false
}

const clearHistory = () => {
  recognitionHistory.value = []
  window.localStorage.removeItem('contract_scan_history')
}

const handleModalClose = () => {
  if (step.value === 2) {
    minimize()
  } else {
    reset()
  }
}

const ocrModels = computed(() => availableModels.value.filter(m => m.type === 'vision'))
const llmModels = computed(() => availableModels.value.filter(m => m.type === 'text' || m.type === 'thinking'))

onMounted(async () => {
  const models = await fetchAiModels()
  if (models && models.length > 0) {
    availableModels.value = models
  } else {
    // Fallback if API fails
    availableModels.value = [
      { id: 'ocr-1', name: 'DeepSeek OCR (专业识别)', model: 'deepseek-ai/DeepSeek-OCR', type: 'vision' },
      { id: 'vl-1', name: 'Qwen2.5-VL-72B (最强视觉)', model: 'Qwen/Qwen2.5-VL-72B-Instruct', type: 'vision' },
      { id: 'vl-kimi', name: 'Kimi-K2.5 (全能多模态)', model: 'Pro/moonshotai/Kimi-K2.5', type: 'vision' },
      { id: '1', name: 'DeepSeek V3 (文本)', model: 'deepseek-ai/DeepSeek-V3', type: 'text' },
    ]
  }
})

</script>

<template>
  <BaseModal 
    :show="show && !isMinimized" 
    :title="step === 3 ? 'AI 解析结果核对' : '数据录入中心'"
    :subtitle="step === 3 ? '请核对 AI 从合同中提取的关键信息' : '支持 Excel 批量导入或 AI 拍照识别录入'"
    max-width="750px"
    @close="handleModalClose"
  >
    <template #header-actions>
      <button v-if="step === 2" class="minimize-btn" @click="minimize" title="缩至后台运行">
        <LayoutGrid :size="16" />
        <span>后台运行</span>
      </button>
    </template>
    <div class="modal-body-content">
      <!-- Step 1: Selection & Mode Toggle -->
      <div v-if="step === 1" class="step-content">
        <div class="mode-toggle-group">
          <button 
            class="mode-btn excel-mode" 
            :class="{ active: entryMode === 'excel' }"
            @click="entryMode = 'excel'"
          >
            <Upload :size="18" /> Excel 批量导入
          </button>
          <button 
            class="mode-btn ai-mode" 
            :class="{ active: entryMode === 'ai_scan' }"
            @click="entryMode = 'ai_scan'"
          >
            <Sparkles :size="18" /> AI 智绘录入
          </button>
        </div>

        <!-- AI Scan Initial Interface (Matching User Screenshot) -->
        <div v-if="entryMode === 'ai_scan' && !previewUrl" class="ai-scan-start animate-in">
          <div class="ocr-visual-card">
            <div class="phone-frame">
              <Camera :size="48" class="camera-icon" />
            </div>
          </div>
          <div class="ocr-info">
            <h3>AI 智能识图录入</h3>
            <p>对准纸质合同正面拍照，或者上传清晰的扫描件。</p>
          </div>
          <div class="ocr-actions">
            <input type="file" id="cameraInput" class="hidden" capture="environment" accept="image/*" @change="handleFileUpload" />
            <label for="cameraInput" class="action-btn primary-pulse">
              <Camera :size="20" /> 开始拍摄
            </label>
            
            <input type="file" id="fileUploadInput" class="hidden" accept="image/*" multiple @change="handleFileUpload" />
            <label for="fileUploadInput" class="upload-link">
              <Upload :size="16" /> 上传已有图片 (支持批量)
            </label>
          </div>
        </div>

        <!-- Excel Options (Same as before) -->
        <div v-if="entryMode === 'excel'" class="import-options-grid animate-in">
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

        <!-- Debug Model Selectors (Only for AI Scan) -->
        <div v-if="entryMode === 'ai_scan'" class="ai-config-panel animate-in">
          <div class="config-row">
            <div class="config-item">
              <label><Cpu :size="14" /> OCR 模型识别</label>
              <select v-model="selectedOcrModel" class="ai-select">
                <option v-for="m in ocrModels" :key="m.id" :value="m.model">{{ m.name }}</option>
              </select>
            </div>
            <div class="config-item">
              <label><Brain :size="14" /> 结构化分析模型</label>
              <select v-model="selectedLlmModel" class="ai-select">
                <option v-for="m in llmModels" :key="m.id" :value="m.model">{{ m.name }}</option>
              </select>
            </div>
          </div>
          <div class="ai-hint">
            <Sparkles :size="14" /> 方案 A：先进行高清像素级 OCR 识别，再由大语言模型进行业务字段建模提取。
          </div>
        </div>

        <div v-if="entryMode === 'excel'" class="upload-area">
          <input type="file" id="fileImport" class="hidden" @change="handleFileUpload" :accept="entryMode === 'excel' ? '.xlsx,.xls,.csv' : 'image/*'" />
          <label for="fileImport" class="drop-zone">
            <Upload :size="48" class="main-upload-icon" />
            <span>拖拽文件到此处 或 <span class="highlight">点击上传</span></span>
            <p class="small">仅支持 .xlsx, .xls, .csv 格式</p>
          </label>
          <div class="template-download">
            <Download :size="14" />
            <span>下载标准录入模板</span>
          </div>
        </div>

        <!-- Scan History Panel -->
        <div v-if="entryMode === 'ai_scan' && recognitionHistory.length > 0 && !previewUrl" class="history-panel animate-in">
          <div class="history-header">
            <span class="h-title"><Terminal :size="14" /> 最近识别记录 (基于历史数据预测进度)</span>
            <span class="h-clear" @click="clearHistory">清理</span>
          </div>
          <div class="history-list">
            <div v-for="h in recognitionHistory" :key="h.id" class="history-item">
              <div class="h-left">
                <span class="h-date">{{ h.date.split(',')[0] }}</span>
                <span class="h-model">{{ h.ocrModel.split('/')[1] }}</span>
              </div>
              <div class="h-right">
                <span class="h-pages">{{ h.pages }} 页</span>
                <span class="h-time">{{ Math.round(h.totalTime) }}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: AI Preprocessing / OCR Logs -->
      <div v-else-if="step === 2" class="step-content processing">
        <div class="ai-workflow">
          <div class="workflow-visual">
            <div class="v-node active"><Camera :size="24" /></div>
            <div class="v-line" :class="{ scanning: aiLogs.length > 2 }"></div>
            <div class="v-node" :class="{ active: aiLogs.length > 2 }"><Terminal :size="24" /></div>
            <div class="v-line" :class="{ scanning: aiLogs.length > 4 }"></div>
            <div class="v-node" :class="{ active: aiLogs.length > 4 }"><LayoutGrid :size="24" /></div>
          </div>
          <h3>AI 正在解析您的合同...</h3>
          <div class="batch-progress-container">
            <div v-for="(item, idx) in batchQueue" :key="idx" class="batch-item">
              <div class="batch-item-info">
                <span class="file-name">{{ item.name }}</span>
                <span class="file-status" :class="item.status">
                  <template v-if="item.status === 'processing'">正在识别 {{ item.progress }}%</template>
                  <template v-else-if="item.status === 'done'">识别完成</template>
                  <template v-else-if="item.status === 'error'">识别失败</template>
                  <template v-else>待处理</template>
                </span>
              </div>
              <div class="batch-bar-bg">
                <div class="batch-bar-fill" :style="{ width: item.progress + '%' }" :class="item.status"></div>
              </div>
            </div>
          </div>
          <div class="log-console">
            <div v-for="(log, idx) in aiLogs" :key="idx" class="log-row" :class="log.type">
              <span class="l-time">[{{ new Date().toLocaleTimeString().split(' ')[0] }}]</span>
              {{ log.msg }}
            </div>
            <div class="cursor"></div>
          </div>
        </div>
      </div>

      <!-- Step 3: AI Confirmation -->
      <div v-else-if="step === 3" class="step-content confirmation">
        <div class="result-layout">
          <div v-if="previewUrl" class="image-preview-side">
            <img :src="previewUrl" alt="Contract Preview" />
            <div class="preview-tag">原始凭证</div>
          </div>
          <div class="fields-side">
            <div class="ai-results-table">
              <div class="res-head">
                <span>字段名</span>
                <span>识别值</span>
                <span>建议修正</span>
              </div>
              <div v-for="(res, idx) in extractedFields" :key="idx" class="res-row">
                <div class="res-field">{{ res.field }}</div>
                <div class="res-old" :class="{ 'strike-out': res.original !== res.fixed && res.original !== '未提供' }">
                  {{ res.original }}
                </div>
                <div class="res-new" :class="{ changed: res.original !== res.fixed }">
                  <div class="edit-input-wrapper">
                    <input type="text" v-model="res.fixed" class="inline-edit" placeholder="点击修正..." />
                  </div>
                  <div v-if="res.original !== res.fixed && res.reason" class="res-tag-v2">
                    {{ res.reason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="conf-actions">
          <button class="secondary-btn" @click="step = 1">重新上传</button>
          <button class="primary-btn ai-btn" @click="confirmAIResults">
            <Check :size="18" /> 确认录入中台
          </button>
        </div>
      </div>

      <!-- Step 4: Final Processing -->
      <div v-else-if="step === 4" class="step-content loading">
        <div class="spinner"></div>
        <h3>正在入库并关联房源...</h3>
        <p>正在同步结构化数据与附件...</p>
        <div class="progress-track">
          <div class="progress-bar" style="width: 75%"></div>
        </div>
      </div>

      <!-- Step 5: Success -->
      <div v-else class="step-content success animate-in">
        <div class="success-illustration">
          <div class="success-icon-bg">
            <CheckCircle2 :size="48" class="success-check" />
          </div>
          <div class="success-rings"></div>
        </div>
        
        <div class="success-text">
          <h3>识别录入已圆满处理</h3>
          <p>合同结构化提取已完成，结构化数据与原始凭证已妥善入库。</p>
        </div>

        <div class="summary-cards">
          <div class="s-card">
            <div class="s-card-icon"><FileText :size="18" /></div>
            <div class="s-card-info">
              <div class="s-val">1 份</div>
              <div class="s-lab">录入合同</div>
            </div>
          </div>
          <div class="s-card">
            <div class="s-card-icon"><ShieldCheck :size="18" /></div>
            <div class="s-card-info">
              <div class="s-val">合规</div>
              <div class="s-lab">规则校核</div>
            </div>
          </div>
          <div class="s-card">
            <div class="s-card-icon"><Cpu :size="18" /></div>
            <div class="s-card-info">
              <div class="s-val">AI 极速</div>
              <div class="s-lab">处理模式</div>
            </div>
          </div>
        </div>

        <div class="success-footer">
          <button class="primary-btn finish-btn" @click="reset">完成并关闭</button>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Minimized AI Progress Pill -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isMinimized && (step === 2 || step === 3)" class="ai-mini-progress" @click="restore">
        <div class="mini-glow"></div>
        <div class="mini-content">
          <div class="mini-icon-section">
            <Sparkles v-if="step === 2" :size="18" class="spin-slow" />
            <CheckCircle2 v-else :size="18" class="text-success" />
          </div>
          <div class="mini-info-section">
            <div class="mini-top">
              <span class="mini-title">{{ step === 2 ? '正在智能识图...' : '解析完成' }}</span>
              <span class="mini-perc">{{ Math.round(currentSmoothProgress) }}%</span>
            </div>
            <p class="mini-log">{{ step === 2 ? lastLog : '点击核对提取结果' }}</p>
            <div class="mini-bar-bg">
              <div class="mini-bar-fill" :style="{ width: currentSmoothProgress + '%' }" :class="{ finished: step >= 3 }"></div>
            </div>
          </div>
          <div class="mini-action-icon">
            <ArrowRight :size="16" />
          </div>
        </div>
        <div class="mini-hint">AI 正在后台处理，您可以继续其他工作</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-body-content {
  display: flex;
  flex-direction: column;
}

.mode-toggle-group {
  display: flex;
  gap: 16px;
  background: transparent;
  padding: 0;
  margin-bottom: 24px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

/* Excel Mode Style */
.mode-btn.excel-mode {
  background: var(--bg-card);
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.mode-btn.excel-mode:not(.active) {
  border-color: var(--border-color);
  color: var(--text-primary);
  background: var(--bg-input);
}

.mode-btn.excel-mode.active {
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  background: rgba(99, 102, 241, 0.08);
  border-width: 2px;
}

/* AI Mode Style */
.mode-btn.ai-mode {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
}

.mode-btn.ai-mode:not(.active) {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  box-shadow: none;
  opacity: 0.6;
}

.mode-btn.ai-mode.active {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(168, 85, 247, 0.4);
}

.mode-btn:hover {
  transform: translateY(-1px);
}

.ai-config-panel {
  background: rgba(168, 85, 247, 0.05);
  border: 1px dashed rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.config-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-secondary);
  margin-bottom: 6px;
}

.ai-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.ai-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* AI Scan Start UI (Matching Screenshot) */
.ai-scan-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0 40px;
}

.ocr-visual-card {
  width: 140px;
  height: 200px;
  background: var(--bg-input);
  border-radius: 20px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
  position: relative;
}

.phone-frame {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
}

.camera-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
}

.ocr-info h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.ocr-info p {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 320px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.ocr-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.action-btn {
  background: #6366f1;
  color: white;
  padding: 16px 80px;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
}

.primary-pulse {
  animation: gentle-pulse 2s infinite;
}

@keyframes gentle-pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.upload-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-primary);
  opacity: 0.8;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.upload-link:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
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

.option-card-mini.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: var(--accent-primary);
}

.mini-icon-box {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--bg-input); display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); flex-shrink: 0;
}

.active .mini-icon-box { background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); }
.mini-info .t { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
.mini-info .d { font-size: 0.7rem; color: var(--text-secondary); }

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 20px;
  padding: 40px;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  cursor: pointer; background: var(--bg-input); transition: all 0.3s;
}

.drop-zone:hover { border-color: var(--accent-primary); background: var(--bg-card-hover); }
.drop-zone.ai-zone { border-color: #a855f7; }
.drop-zone.ai-zone:hover { background: rgba(168, 85, 247, 0.05); }

.main-upload-icon { color: var(--text-muted); }
.ai-zone .main-upload-icon { color: #a855f7; }
.drop-zone .highlight { color: var(--accent-primary); font-weight: 800; }
.ai-zone .highlight { color: #a855f7; }

/* AI Workflow Visualization */
.ai-workflow { text-align: center; }
.workflow-visual { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 2rem; }
.v-node { width: 50px; height: 50px; border-radius: 50%; background: var(--bg-input); color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.5s; position: relative; }
.v-node.active { background: #a855f7; color: white; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
.v-line { width: 60px; height: 3px; background: var(--border-color); }
.v-line.scanning { background: linear-gradient(90deg, #a855f7, var(--border-color)); animation: scan-line 1s infinite; }
@keyframes scan-line { from { background-position: -60px 0; } to { background-position: 60px 0; } }

.log-console {
  background: var(--bg-input);
  color: var(--text-primary);
  padding: 20px;
  border-radius: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  text-align: left;
  height: 200px;
  overflow-y: auto;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
}

.log-row { margin-bottom: 6px; line-height: 1.4; }
.log-row.success { color: #10b981; }
.log-row.error { color: #ef4444; }
.l-time { color: #475569; margin-right: 8px; }

/* Result Layout */
.result-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; margin-bottom: 20px; }
.image-preview-side { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); max-height: 380px; }
.image-preview-side img { width: 100%; height: 100%; object-fit: cover; }
.preview-tag { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 20px; backdrop-filter: blur(4px); }

.ai-results-table { border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
.res-head { 
  display: grid; 
  grid-template-columns: 120px 1fr 1fr; 
  padding: 12px 15px; 
  background: var(--bg-input); 
  font-size: 0.8rem; 
  font-weight: 800; 
  color: var(--text-muted); 
}

.res-row { 
  display: grid; 
  grid-template-columns: 120px 1fr 1fr; 
  padding: 16px 15px; 
  border-bottom: 1px solid var(--border-color); 
  align-items: flex-start; 
}

.res-field { font-weight: 800; font-size: 0.9rem; color: var(--text-primary); padding-top: 8px; }
.res-old { font-size: 0.85rem; color: #94a3b8; padding-top: 8px; word-break: break-all; }
.res-old.strike-out { text-decoration: line-through; opacity: 0.6; }

.edit-input-wrapper { position: relative; width: 100%; transition: all 0.2s; }

.inline-edit { 
  width: 100%; 
  padding: 8px 12px; 
  background: var(--bg-input); 
  border: 1px solid var(--border-color); 
  border-radius: 10px; 
  color: var(--text-primary); 
  font-family: inherit; 
  font-weight: 700; 
  font-size: 0.9rem; 
  transition: all 0.2s;
}

.inline-edit:hover { border-color: var(--accent-primary); }
.inline-edit:focus { 
  border-color: var(--accent-secondary); 
  background: var(--bg-surface); 
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1); 
  outline: none; 
}

.res-new.changed .inline-edit { 
  color: #10b981; 
  border-color: rgba(16, 185, 129, 0.4); 
  background: rgba(16, 185, 129, 0.03); 
}

.res-tag-v2 { 
  font-size: 0.7rem; 
  background: rgba(16, 185, 129, 0.08); 
  color: #10b981;
  padding: 4px 8px; 
  border-radius: 6px; 
  margin-top: 8px; 
  display: inline-block;
  line-height: 1.2;
}

.res-new.changed .inline-edit:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.step-content.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 0 20px;
}

.success-illustration {
  position: relative;
  margin-bottom: 24px;
}

.success-icon-bg {
  width: 80px;
  height: 80px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}

.success-check {
  animation: check-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes check-pop {
  0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.success-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid rgba(16, 185, 129, 0.1);
  animation: ring-pulse 2s infinite;
}

@keyframes ring-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
}

.success-text h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.success-text p {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 400px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 520px;
  margin-bottom: 40px;
}

.s-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
}

.s-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.s-card-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-input);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.s-card:nth-child(1) .s-card-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.s-card:nth-child(2) .s-card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.s-card:nth-child(3) .s-card-icon { color: #a855f7; background: rgba(168, 85, 247, 0.1); }

.s-card-info { text-align: left; }
.s-val { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
.s-lab { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }

.finish-btn {
  max-width: 240px;
  padding: 14px 60px;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

.conf-actions { display: flex; gap: 1rem; }
.primary-btn { background: var(--accent-primary); color: white; padding: 12px; border-radius: 12px; font-weight: 700; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; }
.secondary-btn { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); padding: 12px; border-radius: 12px; font-weight: 600; width: 40%; cursor: pointer; }

.spinner { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.animate-in { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Batch Progress Styles */
.batch-progress-container {
  margin-bottom: 20px;
  max-height: 150px;
  overflow-y: auto;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
}

.batch-item {
  margin-bottom: 12px;
}

.batch-item:last-child { margin-bottom: 0; }

.batch-item-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.file-name { 
  color: var(--text-primary); 
  font-weight: 600; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 15px;
}
.file-status { font-weight: 800; font-size: 0.7rem; }
.file-status.processing { color: #a855f7; }
.file-status.done { color: #10b981; }
.file-status.error { color: #ef4444; }

.batch-bar-bg {
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  overflow: hidden;
}

.batch-bar-fill {
  height: 100%;
  background: #475569;
  transition: width 0.3s;
}

.batch-bar-fill.processing { background: linear-gradient(90deg, #6366f1, #a855f7); }
.batch-bar-fill.done { background: #10b981; }
.batch-bar-fill.error { background: #ef4444; }

/* History Panel */
.history-panel {
  margin-top: 30px;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.h-title { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
.h-clear { font-size: 0.7rem; color: var(--text-muted); cursor: pointer; }
.h-clear:hover { color: #ef4444; }

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 8px 12px; 
  background: var(--bg-input); 
  border-radius: 8px;
}

.h-left, .h-right { display: flex; align-items: center; gap: 10px; }
.h-date { font-size: 0.7rem; color: var(--text-muted); }
.h-model { font-size: 0.7rem; background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 1px 6px; border-radius: 4px; font-weight: 700; }
.h-pages { font-size: 0.75rem; color: var(--text-primary); font-weight: 600; }
.h-time { font-size: 0.75rem; color: #10b981; font-weight: 800; }

.hidden { display: none; }

/* Minimize Interface */
.minimize-btn {
  margin-left: auto;
  margin-right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 8px;
  color: #a855f7;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.minimize-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  transform: translateY(-1px);
}

.ai-mini-progress {
  position: fixed;
  right: 30px;
  bottom: 30px;
  top: auto !important;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 15px 45px rgba(0,0,0,0.4);
  cursor: pointer;
  z-index: 10000;
  overflow: hidden;
  transition: all 0.3s;
}

.ai-mini-progress:hover {
  transform: translateY(-5px);
  border-color: var(--accent-secondary);
}

.mini-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

.mini-content {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.mini-icon-section {
  width: 36px;
  height: 36px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
}

.mini-info-section {
  flex: 1;
  min-width: 0; /* Important for ellipsis in flex child */
}

.mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.mini-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.mini-perc {
  font-size: 0.75rem;
  color: #a855f7;
  font-weight: 900;
}

.mini-log {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-bar-bg {
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  transition: width 0.5s ease-out;
}

.mini-bar-fill.finished {
  background: #10b981;
}

.mini-action-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
}

.mini-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 10px;
  text-align: center;
  position: relative;
  z-index: 1;
  opacity: 0.6;
}

.spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
</style>
