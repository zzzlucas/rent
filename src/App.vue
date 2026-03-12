<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import propertyImg from './assets/property-thumb.png'
import PropertyDetailModal from './components/property/PropertyDetailModal.vue'
import { ArrowUpRight, CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'
import { toasts } from './store'

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
    <Sidebar />
    <main class="main-content">
      <Header />
      <div class="content-viewport">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </main>

    <!-- Global Modals -->
    <PropertyDetailModal 
      :property="selectedProperty" 
      @close="selectedProperty = null" 
    />

    <!-- Global Toast Notifications -->
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item glass" 
          :class="toast.type"
        >
          <div class="toast-icon">
            <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
            <AlertCircle v-else-if="toast.type === 'error'" :size="18" />
            <AlertCircle v-else-if="toast.type === 'warning'" :size="18" />
            <Info v-else :size="18" />
          </div>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
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

/* Toast Styles */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-item {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 25px -10px rgba(0,0,0,0.5);
  pointer-events: auto;
}

.toast-item.success { border-left: 4px solid #10b981; color: #fff; }
.toast-item.error { border-left: 4px solid #ef4444; color: #fff; }
.toast-item.warning { border-left: 4px solid #f59e0b; color: #fff; }
.toast-item.info { border-left: 4px solid #6366f1; color: #fff; }

.toast-message { font-size: 0.9rem; font-weight: 600; }

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from { transform: translateX(100%) scale(0.9); opacity: 0; }
.toast-leave-to { transform: translateX(100%) scale(0.9); opacity: 0; }

.view-container {
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
  transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 之前的大屏 (1280px+) */
@media (min-width: 1280px) {
  .view-container { max-width: 1280px; }
}

/* 新增：超宽屏/2K屏 (1536px+) */
@media (min-width: 1536px) {
  .view-container { max-width: 1480px; }
}

/* 新增：超大显示器 (1920px+) */
@media (min-width: 1920px) {
  .view-container { max-width: 1720px; }
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
