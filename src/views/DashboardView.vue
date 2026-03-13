<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PropertyCard from '../components/property/PropertyCard.vue'
import propertyImg from '../assets/property-thumb.png'
import { 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users2, 
  Clock3, 
  Coins, 
  Activity 
} from 'lucide-vue-next'
import { followedPropertyIds } from '../store'

const router = useRouter()

const mockProperties = [
  {
    id: '1',
    title: '秀湖花苑 8号楼 1202',
    address: '嘉兴市秀洲区秀洲路888号',
    price: 3500,
    status: 'occupied' as const,
    thumbnail: propertyImg,
    tenant: '张先生',
    lastPaid: '03-01'
  },
  {
    id: '2',
    title: '秀湖花苑 12号楼 504',
    address: '嘉兴市秀洲区秀洲路888号',
    price: 4200,
    status: 'vacant' as const,
    thumbnail: propertyImg
  },
  {
    id: '3',
    title: '秀湖花苑 3号楼 201',
    address: '嘉兴市秀洲区秀洲路888号',
    price: 2800,
    status: 'maintenance' as const,
    thumbnail: propertyImg
  },
  {
    id: '4',
    title: '秀湖花苑 15号楼 1508',
    address: '嘉兴市秀洲区秀洲路888号',
    price: 5200,
    status: 'occupied' as const,
    thumbnail: propertyImg,
    tenant: '李小姐',
    lastPaid: '03-10'
  }
]

const maintenanceRequests = [
  { id: 1, title: '空调不制冷', property: '秀湖花苑 8号楼 1202', date: '2小时前', priority: 'high' },
  { id: 2, title: '入户门锁更换', property: '秀湖花苑 12号楼 504', date: '5小时前', priority: 'medium' },
  { id: 3, title: '厨房下水道堵塞', property: '秀湖花苑 3号楼 201', date: '昨天', priority: 'low' },
]

const navigateTo = (path: string) => {
  router.push(path)
}

const displayedFollowedProperties = computed(() => {
  return mockProperties.filter(p => followedPropertyIds.value.has(p.id))
})
</script>

<template>
  <div class="view-container">
    <section class="page-header animate-slide-up">
      <h1>数据概览 <span class="muted">Dashboard</span></h1>
      <p>用心管理每一寸空间。目前共有 342 个房源正在您的悉心运营中。</p>
    </section>
    
    <div class="stats-grid animate-fade-in" style="animation-delay: 0.1s">
      <div class="stat-card glass">
        <div class="stat-card-header">
          <Building2 :size="18" class="stat-icon purple" />
          <div class="trend up"><TrendingUp :size="12" /> 2.1%</div>
        </div>
        <div class="stat-value">342</div>
        <div class="stat-label">房源总数</div>
        <div class="stat-sub">本月新增 4 个</div>
      </div>
      
      <div class="stat-card glass">
        <div class="stat-card-header">
          <Activity :size="18" class="stat-icon blue" />
          <div class="trend up"><TrendingUp :size="12" /> 0.8%</div>
        </div>
        <div class="stat-value">92.4%</div>
        <div class="stat-label">当前出租率</div>
        <div class="stat-sub">优于去年同期</div>
      </div>

      <div class="stat-card glass highlight" @click="navigateTo('/finance')" style="cursor: pointer">
        <div class="stat-card-header">
          <Coins :size="18" class="stat-icon" />
          <div class="trend up"><TrendingUp :size="12" /> 5.2%</div>
        </div>
        <div class="stat-value">¥115,600</div>
        <div class="stat-label">本月预估营收</div>
        <div class="stat-sub">已实收 ¥82,400</div>
      </div>

      <div class="stat-card glass">
        <div class="stat-card-header">
          <Users2 :size="18" class="stat-icon green" />
          <div class="trend up"><TrendingUp :size="12" /> 2份</div>
        </div>
        <div class="stat-value">316</div>
        <div class="stat-label">活跃租约</div>
        <div class="stat-sub">本月到期 12 份</div>
      </div>

      <div class="stat-card glass">
        <div class="stat-card-header">
          <Clock3 :size="18" class="stat-icon yellow" />
          <div class="trend down"><TrendingDown :size="12" /> 0.5天</div>
        </div>
        <div class="stat-value">12.5 <span class="unit">天</span></div>
        <div class="stat-label">平均周转时长</div>
        <div class="stat-sub">空置率持续下降</div>
      </div>

      <div class="stat-card glass">
        <div class="stat-card-header">
          <Activity :size="18" class="stat-icon indigo" />
        </div>
        <div class="stat-value">18 <span class="unit">位</span></div>
        <div class="stat-label">待带看预约</div>
        <div class="stat-sub">意向客户稳步增长</div>
      </div>
    </div>

    <div class="dashboard-secondary-grid">
      <section class="section-area animate-fade-in" style="animation-delay: 0.2s">
        <div class="section-header">
          <h2>关注房源 <span class="count">{{ displayedFollowedProperties.length }}</span></h2>
          <button class="text-link" @click="navigateTo('/properties')">查看全部</button>
        </div>
        <div class="properties-grid" v-if="displayedFollowedProperties.length > 0">
          <PropertyCard 
            v-for="(p, index) in displayedFollowedProperties" 
            :key="p.id" 
            :property="p" 
            class="animate-slide-up"
            :style="{ animationDelay: (0.3 + index * 0.1) + 's' }"
            style="cursor: pointer"
          />
        </div>
        <div v-else class="empty-follow glass">
          <p>暂无关注房源。您可以在房态看板或列表中点击星标加入关注。</p>
        </div>
      </section>

      <aside class="dashboard-aside animate-fade-in" style="animation-delay: 0.4s">
        <section class="section-area">
          <div class="section-header">
            <h2>待处理报修</h2>
            <button class="text-link" @click="navigateTo('/maintenance')">全部</button>
          </div>
          <div class="maintenance-list">
            <div v-for="req in maintenanceRequests" :key="req.id" class="maintenance-item glass" @click="navigateTo('/maintenance')">
              <div class="priority-dot" :class="req.priority"></div>
              <div class="req-info">
                <div class="req-title">{{ req.title }}</div>
                <div class="req-meta">{{ req.property }} · {{ req.date }}</div>
              </div>
              <ArrowUpRight :size="18" class="detail-icon" />
            </div>
          </div>
        </section>

        <section class="section-area quick-stats">
          <div class="section-header">
            <h2>本月财务简报</h2>
          </div>
          <div class="finance-mini-card glass" @click="navigateTo('/finance')" style="cursor: pointer">
            <div class="mini-stat">
              <span class="label">已收租金</span>
              <span class="value success">¥842,000</span>
            </div>
            <div class="mini-stat">
              <span class="label">待收租金</span>
              <span class="value warning">¥403,600</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 68%"></div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: var(--text-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header .muted {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

/* 在 1536px 及以上的大屏显示器上，确保 6 个卡片并排一列 */
@media (min-width: 1536px) {
  .stats-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.stat-card {
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-primary);
  box-shadow: var(--glass-shadow);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-icon {
  padding: 8px;
  background: var(--bg-input);
  border-radius: 10px;
  color: var(--text-primary);
}

.stat-icon.purple { color: #a855f7; background: rgba(168, 85, 247, 0.1); }
.stat-icon.blue { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.stat-icon.green { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-icon.yellow { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.stat-icon.indigo { color: #6366f1; background: rgba(99, 102, 241, 0.1); }

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}
.trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.stat-card.highlight {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 850;
  margin-bottom: 0.25rem;
  letter-spacing: -0.04em;
  background: var(--text-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-value .unit {
  font-size: 1rem;
  font-weight: 600;
  -webkit-text-fill-color: var(--text-muted);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.stat-sub {
  font-size: 0.7rem;
  color: var(--text-secondary);
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dashboard-secondary-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  margin-top: 4rem;
}

@media (max-width: 1279px) {
  .dashboard-secondary-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.section-area {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header .count {
  font-size: 0.9rem;
  background: var(--bg-card);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  color: var(--text-secondary);
}

.text-link {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.text-link:hover {
  color: #818cf8;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.maintenance-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.2s;
}

.maintenance-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
  transform: translateX(5px);
}

.priority-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 1rem;
}

.priority-dot.high { background: var(--accent-danger); box-shadow: 0 0 10px var(--accent-danger); }
.priority-dot.medium { background: var(--accent-warning); }
.priority-dot.low { background: var(--accent-success); }

.req-info {
  flex: 1;
}

.req-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.req-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.detail-icon {
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.2s;
}

.maintenance-item:hover .detail-icon {
  opacity: 1;
  color: var(--accent-primary);
}

.finance-mini-card {
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.mini-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.mini-stat .label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.mini-stat .value {
  font-weight: 700;
}

.mini-stat .value.success { color: var(--accent-success); }
.mini-stat .value.warning { color: var(--accent-warning); }

.progress-bar {
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 3px;
}

.empty-follow {
  padding: 3rem;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-color);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Animations */
.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s ease-out forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
