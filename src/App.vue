<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import PropertyCard from './components/property/PropertyCard.vue'
import PropertyListView from './components/property/PropertyListView.vue'
import TenantListView from './components/property/TenantListView.vue'
import MaintenanceView from './components/property/MaintenanceView.vue'
import FinanceView from './components/property/FinanceView.vue'
import ContractManagement from './components/property/ContractManagement.vue'
import BuildingGridView from './components/property/BuildingGridView.vue'
import PropertyDetailModal from './components/property/PropertyDetailModal.vue'
import propertyImg from './assets/property-thumb.png'
import { ArrowUpRight } from 'lucide-vue-next'

const currentView = ref('dashboard')
const selectedProperty = ref<any>(null)

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

const openProperty = (p: any) => {
  selectedProperty.value = p
}
</script>

<template>
  <div class="app-container">
    <Sidebar :active="currentView" @navigate="(view: string) => currentView = view" />
    <main class="main-content">
      <Header />
      <div class="content-viewport">
        <!-- Dashboard View -->
        <div v-if="currentView === 'dashboard'" class="view-container">
          <section class="page-header animate-slide-up">
            <h1>数据概览 <span class="muted">Dashboard</span></h1>
            <p>管理您的房产帝国。当前共有 342 个房源。</p>
          </section>
          
          <div class="stats-grid animate-fade-in" style="animation-delay: 0.1s">
            <div class="stat-card glass">
              <div class="stat-value">342</div>
              <div class="stat-label">房源总数</div>
            </div>
            <div class="stat-card glass">
              <div class="stat-value">92.4%</div>
              <div class="stat-label">出租率</div>
            </div>
            <div class="stat-card glass highlight" @click="currentView = 'finance'" style="cursor: pointer">
              <div class="stat-value">¥1,245,600</div>
              <div class="stat-label">本月预估营收</div>
            </div>
          </div>

          <div class="dashboard-secondary-grid">
            <section class="section-area animate-fade-in" style="animation-delay: 0.2s">
              <div class="section-header">
                <h2>关注房源 <span class="count">4</span></h2>
                <button class="text-link" @click="currentView = 'properties'">查看全部</button>
              </div>
              <div class="properties-grid">
                <PropertyCard 
                  v-for="(p, index) in mockProperties" 
                  :key="p.id" 
                  :property="p" 
                  class="animate-slide-up"
                  :style="{ animationDelay: (0.3 + index * 0.1) + 's' }"
                  @click="openProperty(p)"
                  style="cursor: pointer"
                />
              </div>
            </section>

            <aside class="dashboard-aside animate-fade-in" style="animation-delay: 0.4s">
              <section class="section-area">
                <div class="section-header">
                  <h2>待处理报修</h2>
                  <button class="text-link" @click="currentView = 'maintenance'">全部</button>
                </div>
                <div class="maintenance-list">
                  <div v-for="req in maintenanceRequests" :key="req.id" class="maintenance-item glass" @click="currentView = 'maintenance'">
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
                <div class="finance-mini-card glass" @click="currentView = 'finance'" style="cursor: pointer">
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

        <!-- Property List View -->
        <div v-else-if="currentView === 'properties'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>房源管理 <span class="muted">Properties</span></h1>
            <p>共查找到 342 条房源记录。</p>
          </section>
          <PropertyListView :properties="[...mockProperties]" />
        </div>

        <!-- Building Grid View -->
        <div v-else-if="currentView === 'building_grid'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>房态看板 <span class="muted">Building Preview</span></h1>
            <p>实时监控秀湖花苑 1 号楼、2 号楼入住状态。</p>
          </section>
          <BuildingGridView />
        </div>

        <!-- Tenants View -->
        <div v-else-if="currentView === 'tenants'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>租客管理 <span class="muted">Tenants</span></h1>
            <p>管理您的租客信息与缴费状态。</p>
          </section>
          <TenantListView />
        </div>

        <!-- Maintenance View -->
        <div v-else-if="currentView === 'maintenance'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>报修维护 <span class="muted">Maintenance</span></h1>
            <p>追踪与管理所有房源的维护工单。</p>
          </section>
          <MaintenanceView />
        </div>

        <!-- Finance View -->
        <div v-else-if="currentView === 'finance'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>财务报表 <span class="muted">Finances</span></h1>
            <p>追踪租金流水，分析营收构成与成本支出。</p>
          </section>
          <FinanceView />
        </div>

        <!-- Contracts View -->
        <div v-else-if="currentView === 'contracts'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>合同中心 <span class="muted">Contracts</span></h1>
            <p>管理租赁合同，支持 AI 识图自动录入。</p>
          </section>
          <ContractManagement />
        </div>

        <!-- Settings View -->
        <div v-else-if="currentView === 'settings'" class="view-container animate-fade-in">
          <section class="page-header">
            <h1>系统设置 <span class="muted">Settings</span></h1>
          </section>
          <div class="placeholder-content glass">
            <div class="placeholder-icon">⚙️</div>
            <h2>偏好设置</h2>
            <p>货币单位、通知项、主题颜色等功能开发中...</p>
          </div>
        </div>

        <!-- Placeholder Views -->
        <div v-else class="view-container animate-fade-in">
          <section class="page-header">
            <h1>{{ currentView.toUpperCase() }}</h1>
            <div class="placeholder-content glass">
              <div class="placeholder-icon">🛠️</div>
              <h2>模块正在建设中</h2>
              <p>这个部分的功能（{{ currentView }}）正在全力开发中，敬请期待。</p>
              <button class="primary-btn" @click="currentView = 'dashboard'">回到仪表盘</button>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Global Modals -->
    <PropertyDetailModal 
      :property="selectedProperty" 
      @close="selectedProperty = null" 
    />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  min-width: 0;
  max-width: 100%;
}

.content-viewport {
  padding: 2.5rem;
  overflow-y: auto;
  max-height: calc(100vh - var(--header-height));
  transition: padding 0.3s;
  min-width: 0;
}

@media (max-width: 1024px) {
  .content-viewport {
    padding: 1.5rem;
    padding-bottom: calc(var(--mobile-nav-height) + 2rem);
    max-height: none;
  }
}

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
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.85rem;
  }
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card.highlight {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.dashboard-secondary-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  margin-top: 4rem;
}

@media (max-width: 1280px) {
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 3px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  text-align: center;
  margin-top: 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.placeholder-content h2 {
  margin-bottom: 1rem;
}

.placeholder-content p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
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
