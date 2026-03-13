<script setup lang="ts">
import { computed } from 'vue'
import { 
  Zap, 
  Search, 
  Filter, 
  TrendingUp, 
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  Phone
} from 'lucide-vue-next'
import { collectionStats } from '../store'
import AIAssistant from '../components/property/AIAssistant.vue'

// Mock categories for the collection dashboard
const stats = computed(() => {
  const allRecords = Object.values(collectionStats.value)
  const totalSent = allRecords.length
  const totalRead = allRecords.filter(r => r.isRead).length
  const readRate = totalSent === 0 ? 0 : Math.round((totalRead / totalSent) * 100)
  
  return [
    { label: '累计催缴次数', value: totalSent, icon: MessageSquare, color: '#6366f1' },
    { label: '已读回执率', value: `${readRate}%`, icon: Eye, color: '#10b981' },
    { label: '本月发送', value: totalSent, icon: Calendar, color: '#f59e0b' },
    { label: '异常多次查看', value: 0, icon: TrendingUp, color: '#ef4444' },
  ]
})

const historyList = computed(() => {
  // Combine mock house info with real store data
  const houseMap: any = {
    '1': { title: '秀湖花苑 8号楼 1202', tenant: '张先生', phone: '138****0001' },
    '2': { title: '秀湖花苑 12号楼 504', tenant: '李女士', phone: '139****8888' },
    '3': { title: '秀湖花苑 3号楼 201', tenant: '王阿姨', phone: '135****1111' },
    '4': { title: '秀湖花苑 15号楼 1508', tenant: '赵医生', phone: '186****2222' },
  }

  return Object.values(collectionStats.value).map(record => ({
    ...record,
    ...houseMap[record.id]
  })).sort((a, b) => b.sentAt.localeCompare(a.sentAt))
})
</script>

<template>
  <div class="collection-hub">
    <header class="page-top">
      <div class="title-wrap">
        <div class="zap-badge">
          <Zap :size="24" fill="white" />
        </div>
        <div>
          <h1>智能催缴中心</h1>
          <p>全自动链路追踪，实时掌控租客回执状态</p>
        </div>
      </div>
      <div class="actions">
        <button class="export-btn">导出催缴证据表</button>
        <button class="primary-btn">
          <Zap :size="16" />
          发起新催缴
        </button>
      </div>
    </header>

    <!-- Stats Dashboard -->
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card glass">
        <div class="stat-icon" :style="{ backgroundColor: s.color + '15', color: s.color }">
          <component :is="s.icon" :size="20" />
        </div>
        <div class="stat-info">
          <span class="l">{{ s.label }}</span>
          <span class="v">{{ s.value }}</span>
        </div>
        <ArrowUpRight :size="16" class="arrow" />
      </div>
    </div>

    <!-- Collection History -->
    <div class="history-section glass">
      <div class="section-header">
        <h2>催缴历史记录 (Evidence Log)</h2>
        <div class="filters">
          <div class="search">
            <Search :size="16" />
            <input type="text" placeholder="搜索房源或租客..." />
          </div>
          <button class="filter-btn"><Filter :size="14" /> 状态筛选</button>
        </div>
      </div>

      <div class="history-list">
        <div v-if="historyList.length === 0" class="empty-state">
          <MessageSquare :size="48" />
          <p>暂无催缴记录，请从“仪表盘”或“房源列表”发起一键催缴</p>
        </div>

        <div v-for="h in historyList" :key="h.sentAt" class="history-item">
          <div class="item-main">
            <div class="house-info">
              <span class="h-title">{{ h.title }}</span>
              <div class="tenant-meta">
                <span>{{ h.tenant }}</span>
                <span class="divider"></span>
                <span>{{ h.phone }}</span>
              </div>
            </div>
          </div>

          <div class="item-timeline">
            <div class="step sent">
              <div class="dot active"></div>
              <div class="step-info">
                <span class="s-label">短信已发出</span>
                <span class="s-time">{{ h.sentAt }}</span>
              </div>
            </div>
            <div class="line" :class="{ active: h.isRead }"></div>
            <div class="step read">
              <div class="dot" :class="{ active: h.isRead }"></div>
              <div class="step-info">
                <span class="s-label">{{ h.isRead ? '链路回执：租客已读' : '等待租客阅读' }}</span>
                <span class="s-time" v-if="h.isRead">{{ h.readAt }}</span>
                <span class="s-time" v-else>未触达/未点击</span>
              </div>
            </div>
          </div>

          <div class="item-actions">
            <button class="detail-btn">
              查看详情
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Assistant Placement (Custom Bottom-Left) -->
    <div class="collection-ai-wrapper">
      <AIAssistant :data="{ 
        occupied: 10, 
        vacant: 2, 
        maintenance: 1, 
        unmanaged: 0, 
        payNormal: 8, 
        payWarning: 1, 
        payDanger: 1, 
        total: 12 
      }" />
    </div>
  </div>
</template>

<style scoped>
.collection-hub {
  padding-bottom: 3rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-wrap {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.zap-badge {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px -4px rgba(245, 158, 11, 0.4);
}

.title-wrap h1 { font-size: 1.75rem; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: -0.02em; }
.title-wrap p { margin: 4px 0 0; color: var(--text-muted); font-size: 0.95rem; }

.actions { display: flex; gap: 1rem; }

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.export-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  border: 1px solid var(--glass-border);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info { display: flex; flex-direction: column; }
.stat-info .l { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
.stat-info .v { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); font-family: 'Outfit', sans-serif; }

.arrow { position: absolute; top: 1rem; right: 1rem; color: var(--text-muted); opacity: 0.3; }

/* History */
.history-section {
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 { font-size: 1.1rem; font-weight: 800; margin: 0; }

.filters { display: flex; gap: 1rem; }
.search { 
  display: flex; align-items: center; gap: 8px; 
  background: var(--bg-input); border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 10px; width: 240px;
}
.search input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 0.85rem; width: 100%; }
.filter-btn {
  background: var(--bg-input); border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
}

.history-list { padding: 1rem 0; }

.history-item {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.history-item:last-child { border-bottom: none; }
.history-item:hover { background: rgba(255, 255, 255, 0.02); }

.item-main { flex: 1.5; }
.house-info { display: flex; flex-direction: column; gap: 4px; }
.h-title { font-weight: 700; font-size: 1.05rem; }
.tenant-meta { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); }
.divider { width: 4px; height: 4px; background: var(--border-color); border-radius: 50%; }

/* Timeline Visual */
.item-timeline {
  flex: 3;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step { display: flex; align-items: center; gap: 12px; min-width: 140px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); position: relative; }
.dot.active { background: #10b981; box-shadow: 0 0 10px #10b98180; }
.dot.active::after {
  content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
  border: 2px solid #10b98130; border-radius: 50%;
}

.line { flex: 1; height: 2px; background: var(--border-color); border-radius: 1px; margin: 0 4px; }
.line.active { background: #10b981; }

.step-info { display: flex; flex-direction: column; }
.s-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); }
.s-time { font-size: 0.7rem; color: var(--text-muted); font-family: 'Outfit'; }

.item-actions { flex: 1; display: flex; justify-content: flex-end; }
.detail-btn {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.85rem; font-weight: 700; color: var(--accent-primary);
  background: none; border: none; cursor: pointer;
}

.empty-state {
  padding: 4rem; text-align: center; color: var(--text-muted);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}

/* AI Assistant Custom Position */
.collection-ai-wrapper :deep(.ai-assistant-wrapper) {
  left: 2rem;
  right: auto;
  bottom: 2rem;
}

.collection-ai-wrapper :deep(.analysis-panel) {
  left: 0;
  right: auto;
  transform-origin: bottom left;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>
