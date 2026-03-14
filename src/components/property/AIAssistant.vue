<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { 
  Sparkles, 
  X, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Brain, 
  ArrowRight,
  Bot,
  SendHorizontal,
  Zap,
  Target,
  BarChart3
} from 'lucide-vue-next'
import { chatProxy } from '../../api/ai'

const props = withDefaults(defineProps<{
  type?: 'asset' | 'collection'
  data: {
    occupied: number
    vacant: number
    maintenance: number
    unmanaged: number
    payNormal: number
    payWarning: number
    payDanger: number
    total: number
  }
}>(), {
  type: 'asset'
})

const isOpen = ref(false)
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)

const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && !analysisResult.value) {
    runAnalysis()
  }
}

const runAnalysis = () => {
  isAnalyzing.value = true
  analysisResult.value = null
  analysisLogs.value = []
  
  // 立即开始分析，不再等待模拟日志跑完
  finalizeAnalysis()
  
  const logs = [
    '正在扫描房源实时状态...',
    '分析财务流水与租约到期分布...',
    '对比行业基准运营数据...',
    '生成智能化改进建议...'
  ]
  
  let i = 0
  const logInterval = setInterval(() => {
    if (i < logs.length && isAnalyzing.value) {
      analysisLogs.value.push(logs[i])
      i++
    } else {
      clearInterval(logInterval)
    }
  }, 400)
}

const finalizeAnalysis = async () => {
  const prompt = `你是一个专业的房产评估与运营顾问。请根据以下数据进行分析：
  数据：
  - 总房源: ${props.data.total}
  - 已出租: ${props.data.occupied}
  - 空置中: ${props.data.vacant}
  - 维护中: ${props.data.maintenance}
  - 未管护: ${props.data.unmanaged}
  - 缴费正常: ${props.data.payNormal}
  - 缴费预警: ${props.data.payWarning}
  - 缴费欠费(危险): ${props.data.payDanger}

  请返回一个 JSON 对象，结构如下：
  {
    "score": 0-100之间的数字,
    "summary": "一段简短的运营概况",
    "insights": [
      { "type": "success|warning|info", "title": "标题", "desc": "描述" }
    ],
    "suggestedActions": ["建议1", "建议2", "建议3"],
    "forecast": [
      { "month": "月份", "value": "预估金额", "growth": "增长率" }
    ]
  }
  只返回 JSON，不要有其他描述。`

  try {
    const response = await chatProxy({
      messages: [
        { role: 'system', content: 'You are a professional property management AI assistant. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      stream: true
    })
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    
    // 增强型部分 JSON 修复工具
    const tryRepairJson = (json: string) => {
      let toParse = json.trim()
      if (!toParse.startsWith('{')) return null
      
      // 1. 处理未闭合的引号（如果在字符串中间截断）
      const quoteCount = (toParse.match(/"/g) || []).length
      if (quoteCount % 2 !== 0) toParse += '"'
      
      // 2. 补齐闭合符号
      const stack: string[] = []
      for (const char of toParse) {
        if (char === '{') stack.push('}')
        else if (char === '[') stack.push(']')
        else if (char === '}' || char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop()
        }
      }
      while (stack.length > 0) toParse += stack.pop()

      try { return JSON.parse(toParse) } catch (e) { return null }
    }

    if (reader) {
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          
          const dataStr = trimmed.slice(6).trim()
          if (dataStr === '[DONE]') continue
          try {
            const data = JSON.parse(dataStr)
            const content = data.choices?.[0]?.delta?.content || ''
            if (!content) continue
            fullContent += content

            const clean = fullContent.replace(/```json/g, '').replace(/```/g, '').trim()
            const partial = tryRepairJson(clean)
            if (partial) {
              // 只要解析到了分数或概要，就立即切换到内容视图，不再显示加载动画
              if (isAnalyzing.value && (partial.score || partial.summary)) {
                isAnalyzing.value = false
              }
              
              if (partial.insights) {
                partial.insights.forEach((ins: any) => {
                  if (ins.type === 'success') ins.icon = TrendingUp
                  else if (ins.type === 'warning') ins.icon = AlertCircle
                  else if (ins.type === 'info') ins.icon = CheckCircle2
                })
              }
              analysisResult.value = partial
            }
          } catch (e) {}
        }
      }
    }

    // 最后再确保解析一次完整的
    let cleanContent = fullContent.replace(/```json/g, '').replace(/```/g, '').trim()
    try {
      const finalParsed = JSON.parse(cleanContent)
      if (finalParsed.insights) {
        finalParsed.insights.forEach((ins: any) => {
          if (ins.type === 'success') ins.icon = TrendingUp
          else if (ins.type === 'warning') ins.icon = AlertCircle
          else ins.icon = CheckCircle2
        })
      }
      analysisResult.value = finalParsed
    } catch (e) {}
  } catch (error) {
    console.error('AI Analysis failed:', error)
    // Fallback to minimal info if AI fails
    analysisResult.value = {
      score: 70,
      summary: '由于网络波动，无法通过 AI 生成深度报告。基础数据：入住率已达 ' + (props.data.occupied / props.data.total * 100).toFixed(1) + '%。',
      insights: [
        { type: 'info', title: '离线分析', desc: '请检查后端 AI 配置', icon: CheckCircle2 }
      ],
      suggestedActions: ['重试 AI 分析', '联系系统管理员'],
      forecast: []
    }
  } finally {
    isAnalyzing.value = false
  }
}

const formattedSummary = computed(() => {
  if (!analysisResult.value) return ''
  return analysisResult.value.summary.replace(/(\d+(\.\d+)?%?)/g, '<span class="text-highlight">$1</span>')
})

const analysisLogs = ref<string[]>([])

// 对话逻辑 (Chat simulation)
const chatMessages = ref([
  { role: 'assistant', text: '您好！我是 RentMaster AI 经营顾问。我已经同步了当前的房态数据，您可以询问我关于资产运营建议、风险评估或租务处理的相关问题。' }
])
const userMessage = ref('')

const sendMessage = async () => {
  if (!userMessage.value.trim() || isChatting.value) return
  
  const text = userMessage.value
  chatMessages.value.push({ role: 'user', text })
  userMessage.value = ''
  isChatting.value = true

  // Preparation for streaming
  const assistantMsg = { role: 'assistant', text: '' }
  chatMessages.value.push(assistantMsg)

  try {
    const context = `当前大楼运营情况：总房源 ${props.data.total}，入住率 ${(props.data.occupied / props.data.total * 100).toFixed(1)}%，欠费风险 ${props.data.payDanger} 间。`
    const messages = [
      { role: 'system', content: '你是 RentMaster AI 房产经营顾问。' + context },
      ...chatMessages.value.slice(0, -1).map(m => ({ role: m.role, content: m.text })),
    ]

    const response = await chatProxy({ messages, stream: true })
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (reader) {
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last partial line in buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          
          const dataStr = trimmed.slice(6).trim()
          if (dataStr === '[DONE]') continue
          
          try {
            const data = JSON.parse(dataStr)
            const content = data.choices?.[0]?.delta?.content || ''
            assistantMsg.text += content
          } catch (e) {
            console.warn('Failed to parse SSE line:', line, e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    assistantMsg.text = '对不起，我遇到了一些技术困难，暂时无法回答。'
  } finally {
    isChatting.value = false
  }
}
const isChatting = ref(false)
const chatScrollRef = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    }
  }, 100)
}

watch(chatMessages, () => {
  scrollToBottom()
}, { deep: true })

// Watch for data changes to re-analyze if open
watch(() => props.data, () => {
  if (isOpen.value) {
    runAnalysis()
  }
}, { deep: true })

</script>

<template>
  <div class="ai-assistant-wrapper">
    <!-- Floating Button -->
    <button 
      class="ai-float-btn" 
      :class="[props.type, { active: isOpen }]"
      @click="togglePanel"
      :title="props.type === 'collection' ? '催收小助理在线分析' : 'AI 智能分析'"
    >
      <div class="btn-glow"></div>
      <component 
        v-if="!isOpen" 
        :is="props.type === 'collection' ? Zap : Sparkles" 
        :size="24" 
        class="icon-pulse" 
      />
      <X v-else :size="24" />
    </button>

    <!-- Analysis Panel -->
    <Transition name="panel">
      <div v-if="isOpen" class="analysis-panel glass" :class="props.type">
        <div class="panel-header">
          <div class="ai-brand">
            <div class="bot-icon">
              <component :is="props.type === 'collection' ? Target : Bot" :size="20" />
            </div>
            <div>
              <h3>{{ props.type === 'collection' ? 'RentMaster 催收小助理' : 'RentMaster AI' }}</h3>
              <p>{{ props.type === 'collection' ? '专业链路回执与策略分析' : '智能资产运营助手' }}</p>
            </div>
          </div>
          <button class="close-panel" @click="isOpen = false">
            <X :size="18" />
          </button>
        </div>

        <div class="panel-body">
          <div v-if="isAnalyzing" class="analyzing-state">
            <div class="brain-loader">
              <Brain :size="40" class="pulse-icon" />
            </div>
            <div class="log-container">
              <TransitionGroup name="log">
                <p v-for="(log, idx) in analysisLogs" :key="idx" class="analysis-log">
                  <span class="log-dot"></span> {{ log }}
                </p>
              </TransitionGroup>
            </div>
            <div class="progress-bar mt-auto">
              <div class="progress-fill"></div>
            </div>
          </div>

          <div v-else-if="analysisResult" class="analysis-content animate-in">
            <!-- Score Gauge Section -->
            <div class="score-section">
              <div class="score-circle">
                <svg viewBox="0 0 36 36" class="circular-chart primary">
                  <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path class="circle"
                    :stroke-dasharray="analysisResult.score + ', 100'"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage">{{ analysisResult.score }}</text>
                </svg>
                <div class="score-label">健康度评分</div>
              </div>
              <div class="summary-text" v-html="formattedSummary"></div>
            </div>

            <!-- Insights List -->
            <div class="insights-grid">
              <div 
                v-for="(insight, idx) in analysisResult.insights" 
                :key="idx" 
                class="insight-card"
                :class="insight.type"
              >
                <div class="i-icon-wrap">
                  <component :is="insight.icon" :size="18" />
                </div>
                <div class="i-text">
                  <h5>{{ insight.title }}</h5>
                  <p>{{ insight.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Suggested Actions -->
            <div class="actions-section">
              <div class="section-title">
                <Bot :size="16" />
                建议立即采取的操作
              </div>
              <div class="action-items">
                <div v-for="(action, idx) in analysisResult.suggestedActions" :key="idx" class="action-tag-item">
                  <span class="a-dot"></span>
                  {{ action }}
                </div>
              </div>
            </div>

            <!-- Revenue Forecast -->
            <div class="forecast-section">
              <div class="section-title">
                <BarChart3 :size="16" />
                营收趋势预测 (Q2)
              </div>
              <div class="forecast-list">
                <div v-for="item in analysisResult.forecast" :key="item.month" class="forecast-item">
                  <span class="f-month">{{ item.month }}</span>
                  <div class="f-bar-wrap">
                    <div class="f-bar" :style="{ width: (parseInt(item.value.replace(/[^0-9]/g, '')) / 3500) + '%' }"></div>
                  </div>
                  <span class="f-val">{{ item.value }}</span>
                  <span class="f-growth">{{ item.growth }}</span>
                </div>
              </div>
            </div>

            <!-- Chat Interface -->
            <div class="chat-interface">
               <div class="chat-header">对话房产助手</div>
               <div class="chat-scroll" ref="chatScrollRef">
                  <div v-for="(m, i) in chatMessages" :key="i" class="chat-msg" :class="m.role">
                    {{ m.text }}
                  </div>
                  <div v-if="isChatting" class="chat-msg assistant typing">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
               </div>
               <div class="chat-input-area">
                 <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="询问经营策略或数据详情...">
                 <button @click="sendMessage" :disabled="isChatting">
                   <SendHorizontal :size="16" />
                 </button>
               </div>
            </div>

            <button class="action-btn-main">
              生成完整运营分析报告 <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'

// Basic helper for simple text formatting
const formatSummary = (text: string) => {
  return text.replace(/(\d+(\.\d+)?%?)/g, '<span class="text-highlight">$1</span>')
}
</script>

<style scoped>
.ai-assistant-wrapper {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1000;
}

.ai-float-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-float-btn:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6);
}

.ai-float-btn.collection {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.4);
}

.ai-float-btn.collection .btn-glow {
  background: linear-gradient(45deg, #f59e0b, #fbbf24, #f59e0b);
}

.ai-float-btn.active {
  background: var(--bg-surface);
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  transform: rotate(90deg);
}

.btn-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(45deg, #6366f1, #a855f7, #6366f1);
  background-size: 200% 200%;
  animation: shimmer 3s linear infinite;
  z-index: -1;
  opacity: 0.6;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.icon-pulse {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Panel Styles */
.analysis-panel {
  position: absolute;
  right: 0;
  bottom: 80px;
  width: 420px;
  max-height: 80vh;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--glass-shadow);
  transform-origin: bottom right;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
}

.panel-header {
  padding: 1.5rem;
  background: var(--bg-input);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.ai-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bot-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.analysis-panel.collection .bot-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.analysis-panel.collection .score-section {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.1);
}

.analysis-panel.collection .circle {
  stroke: #f59e0b;
}

.analysis-panel.collection .chat-header {
  color: #f59e0b;
}

.analysis-panel.collection .chat-msg.user {
  background: #f59e0b;
}

.analysis-panel.collection .chat-input-area button {
  background: #f59e0b;
}

.analysis-panel.collection .action-btn-main {
  background: #f59e0b;
}

.ai-brand h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary); }
.ai-brand p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

.close-panel {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.close-panel:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Analyzing State */
.analyzing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  min-height: 300px;
  text-align: center;
  gap: 1.5rem;
}

.log-container {
  height: 120px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.analysis-log {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.log-dot {
  width: 4px;
  height: 4px;
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-primary);
}

.log-enter-active {
  transition: all 0.3s ease;
}
.log-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.mt-auto { margin-top: auto; }

.pulse-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  width: 30%;
  animation: progress-move 2s infinite ease-in-out;
}

@keyframes progress-move {
  0% { transform: translateX(-100%); width: 30%; }
  50% { width: 60%; }
  100% { transform: translateX(200%); width: 30%; }
}

/* Analysis Content */
.score-section {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.score-circle {
  width: 80px;
  flex-shrink: 0;
  text-align: center;
}

.circular-chart { display: block; margin: 0 auto; max-width: 80px; max-height: 80px; }
.circle-bg { fill: none; stroke: var(--bg-input); stroke-width: 2.8; }
.circle { fill: none; stroke-width: 2.8; stroke-linecap: round; animation: progress 1.5s ease-out forwards; stroke: var(--accent-primary); }

@keyframes progress { 0% { stroke-dasharray: 0 100; } }

.percentage { fill: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.6rem; font-weight: 800; text-anchor: middle; }
.score-label { font-size: 0.65rem; color: #94a3b8; font-weight: 600; margin-top: 4px; }

.summary-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

/* Insights */
.insights-grid { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.insight-card {
  display: flex; gap: 1rem; padding: 1.25rem; border-radius: 16px; 
  background: var(--bg-input); border: 1px solid var(--border-color);
  transition: all 0.2s;
}
.insight-card:hover { transform: translateX(5px); background: rgba(255, 255, 255, 0.04); }

.i-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.insight-card.success .i-icon-wrap { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.insight-card.warning .i-icon-wrap { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.insight-card.info .i-icon-wrap { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

.i-text h5 { margin: 0 0 0.25rem; font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.i-text p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }

/* Actions Section */
.actions-section { margin-bottom: 2rem; }
.action-items { display: flex; flex-direction: column; gap: 0.75rem; }
.action-tag-item {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
  background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px; font-size: 0.85rem; color: var(--text-primary); font-weight: 600;
  transition: all 0.2s; cursor: pointer;
}
.action-tag-item:hover { background: rgba(99, 102, 241, 0.15); transform: scale(1.02); }
.a-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 8px #6366f1; }

:deep(.text-highlight) {
  color: var(--text-primary);
  font-weight: 800;
  text-decoration: underline var(--accent-primary) 4px;
}

/* Forecast */
.forecast-section { margin-bottom: 2rem; }
.section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #94a3b8; margin-bottom: 1.25rem; }

.forecast-list { display: flex; flex-direction: column; gap: 1rem; }
.forecast-item { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; }
.f-month { width: 40px; color: #94a3b8; }
.f-bar-wrap { flex: 1; height: 8px; background: var(--bg-input); border-radius: 4px; overflow: hidden; }
.f-bar { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 4px; }
.f-val { font-weight: 700; color: var(--text-primary); width: 70px; text-align: right; }
.f-growth { color: var(--accent-success); font-weight: 700; font-size: 0.75rem; width: 45px; }

.action-btn-main {
  width: 100%; padding: 1rem; border-radius: 12px; background: var(--accent-primary); color: #fff; border: none;
  font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}
.action-btn-main:hover { background: var(--accent-secondary); transform: translateY(-2px); }

/* Chat Interface Styles */
.chat-interface {
  background: var(--bg-input);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.chat-header {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.chat-scroll {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 4px;
}

.chat-msg {
  font-size: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 90%;
  line-height: 1.5;
  white-space: pre-wrap;
}

.chat-msg.assistant {
  background: var(--bg-input);
  color: var(--text-primary);
  border-bottom-left-radius: 2px;
}

.chat-msg.user {
  background: var(--accent-primary);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.chat-input-area input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
}

.chat-input-area button {
  background: var(--accent-primary);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-msg.assistant.typing {
  display: flex;
  gap: 4px;
  padding: 0.5rem 1rem;
}
.chat-msg.assistant.typing .dot {
  width: 4px;
  height: 4px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}
.chat-msg.assistant.typing .dot:nth-child(2) { animation-delay: 0.2s; }
.chat-msg.assistant.typing .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* Animations */
.panel-enter-active, .panel-leave-active { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }

.animate-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

</style>
