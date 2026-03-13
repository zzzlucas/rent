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
  Target
} from 'lucide-vue-next'

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
  
  const logs = [
    '正在扫描房源实时状态...',
    '分析财务流水与租约到期分布...',
    '对比行业基准运营数据...',
    '生成智能化改进建议...'
  ]
  
  let i = 0
  const logInterval = setInterval(() => {
    if (i < logs.length) {
      analysisLogs.value.push(logs[i])
      i++
    } else {
      clearInterval(logInterval)
      finalizeAnalysis()
    }
  }, 600)
}

const finalizeAnalysis = () => {
  const occupancyRate = (props.data.occupied / (props.data.total - props.data.unmanaged) * 100).toFixed(1)
  const overdueRate = (props.data.payDanger / props.data.occupied * 100).toFixed(1)
  
  analysisResult.value = {
    score: 85,
    summary: `当前园区运营状况良好，出租率达到 ${occupancyRate}%。但注意到有 ${props.data.payDanger} 间房源存在逾期风险，建议优先跟进。`,
    insights: [
      {
        type: 'success',
        title: '出租率表现强劲',
        desc: `高于行业平均水平 (82%)，建议维持当前的定价策略。`,
        icon: TrendingUp
      },
      {
        type: 'warning',
        title: '逾期风险预警',
        desc: `当前逾期率为 ${overdueRate}%，${props.data.payDanger}间房源欠费超过一周，建议启动智能催收。`,
        icon: AlertCircle
      },
      {
        type: 'info',
        title: '维护效率分析',
        desc: `有 ${props.data.maintenance} 间房源进行中，平均预计修复时间 1.5 天。`,
        icon: CheckCircle2
      }
    ],
    suggestedActions: [
      '对 305/402 房源发送催租短信',
      '将 15 天未修复房源升级为紧急任务',
      '上调 A栋 高楼层房源挂牌价 (预计 +5%)'
    ],
    forecast: [
      { month: '4月', value: '¥285,400', growth: '+2.4%' },
      { month: '5月', value: '¥292,100', growth: '+3.1%' },
      { month: '6月', value: '¥305,000', growth: '+4.5%' }
    ]
  }
  isAnalyzing.value = false
}

const formattedSummary = computed(() => {
  if (!analysisResult.value) return ''
  return analysisResult.value.summary.replace(/(\d+(\.\d+)?%?)/g, '<span class="text-highlight">$1</span>')
})

const analysisLogs = ref<string[]>([])

// 对话逻辑 (Chat simulation)
const chatMessages = ref([
  { role: 'assistant', text: '您好！我是您的催收小助理。我已经分析了刚才的回执记录，发现有位租客在 10 分钟内点击了 5 次链接但未支付，这通常意味着对方有支付压力但在犹豫。需要我生成一套温和的催收话术吗？' }
])
const userMessage = ref('')

const sendMessage = () => {
  if (!userMessage.value.trim()) return
  
  chatMessages.value.push({ role: 'user', text: userMessage.value })
  const input = userMessage.value
  userMessage.value = ''
  
  // 模拟 AI 回复
  setTimeout(() => {
    let response = '我正在处理您的请求...'
    if (input.includes('方案') || input.includes('建议')) {
      response = '根据该租客的信用历史，建议采用“分期分摊”方案。我们可以先要求支付 50% 的欠费，剩余部分随下月租金一起。'
    } else {
      response = '明白，已为您调整策略。目前该房源的催缴优先级已提升，我将在明早 10:00 自动进行第二次带回执的通知发送。'
    }
    chatMessages.value.push({ role: 'assistant', text: response })
  }, 1000)
}

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
                    stroke-dasharray="85, 100"
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
               <div class="chat-header">对话催收小助理</div>
               <div class="chat-scroll">
                  <div v-for="(m, i) in chatMessages" :key="i" class="chat-msg" :class="m.role">
                    {{ m.text }}
                  </div>
               </div>
               <div class="chat-input-area">
                 <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="询问催缴策略或要求 AI ...">
                 <button @click="sendMessage"><SendHorizontal :size="16" /></button>
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
  background: #1f2937;
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
  background: rgba(0, 0, 0, 0.2);
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

/* Animations */
.panel-enter-active, .panel-leave-active { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }

.animate-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

</style>
