<script setup lang="ts">
import { Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-vue-next'

const tickets = [
  { id: 1, title: '空调不制冷', property: '秀湖花苑 8号楼 1202', tenant: '张先生', date: '2024-03-12', status: 'pending', priority: 'high' },
  { id: 2, title: '入户门锁更换', property: '秀湖花苑 12号楼 504', tenant: '李四', date: '2024-03-12', status: 'in_progress', priority: 'medium' },
  { id: 3, title: '厨房下水道堵塞', property: '秀湖花苑 3号楼 201', tenant: '赵六', date: '2024-03-11', status: 'completed', priority: 'low' },
  { id: 4, title: '卫生间漏水', property: '秀湖花苑 15号楼 1508', tenant: '李小姐', date: '2024-03-10', status: 'pending', priority: 'high' },
]

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending': return { label: '待处理', icon: Clock, color: 'var(--accent-warning)' }
    case 'in_progress': return { label: '处理中', icon: Wrench, color: 'var(--accent-primary)' }
    case 'completed': return { label: '已完成', icon: CheckCircle2, color: 'var(--accent-success)' }
    default: return { label: '未知', icon: AlertCircle, color: 'var(--text-muted)' }
  }
}
</script>

<template>
  <div class="maintenance-view">
    <div class="stats-row">
      <div class="mini-card glass">
        <span class="val">12</span>
        <span class="lab">待处理</span>
      </div>
      <div class="mini-card glass">
        <span class="val">5</span>
        <span class="lab">进行中</span>
      </div>
      <div class="mini-card glass">
        <span class="val">86</span>
        <span class="lab">本月完成</span>
      </div>
    </div>

    <div class="tickets-container glass">
      <div class="ticket-header">
        <h2>报修单列表</h2>
        <div class="actions">
          <button class="primary-btn">发布新任务</button>
        </div>
      </div>

      <div class="tickets-list">
        <div v-for="t in tickets" :key="t.id" class="ticket-item" :class="t.status">
          <div class="ticket-status-icon">
            <component :is="getStatusInfo(t.status).icon" :size="20" :color="getStatusInfo(t.status).color" />
          </div>
          
          <div class="ticket-main">
            <div class="t-title">{{ t.title }}</div>
            <div class="t-meta">
              <span class="prop">{{ t.property }}</span>
              <span class="divider">|</span>
              <span class="tenant">租客: {{ t.tenant }}</span>
            </div>
          </div>

          <div class="ticket-date">{{ t.date }}</div>
          
          <div class="ticket-badge">
            <span class="status-label" :style="{ color: getStatusInfo(t.status).color }">
              {{ getStatusInfo(t.status).label }}
            </span>
          </div>

          <button class="action-link">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.mini-card {
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-card .val {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.mini-card .lab {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.tickets-container {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 2rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.ticket-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}

.ticket-status-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  margin-right: 1.5rem;
}

.ticket-main {
  flex: 1;
}

.t-title {
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.t-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  gap: 0.75rem;
}

.ticket-date {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0 2rem;
}

.ticket-badge {
  min-width: 100px;
  text-align: center;
}

.status-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.action-link {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.85rem;
  margin-left: 2rem;
}

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}
</style>
