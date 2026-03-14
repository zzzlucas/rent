<script setup lang="ts">
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Wrench, 
  Wallet, 
  Settings,
  ShieldCheck,
  FileText,
  Grid2X2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-vue-next'
import { ref } from 'vue'

import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}


const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'building_grid', label: '房态看板', icon: Grid2X2 },
  { id: 'properties', label: '房源列表', icon: Home },
  { id: 'templates', label: '房源模板', icon: Copy },
  { id: 'tenants', label: '租客管理', icon: Users },
  { id: 'contracts', label: '合同中心', icon: FileText },
  { id: 'contract_templates', label: '合同模板', icon: Copy },
  { id: 'collection_hub', label: '智能催缴', icon: Zap },
  { id: 'maintenance', label: '报修/维护', icon: Wrench },
  { id: 'finance', label: '财务报表', icon: Wallet },
]
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="logo-area">
      <div class="logo-icon">
        <ShieldCheck :size="28" color="#6366f1" />
      </div>
      <span class="logo-text" v-if="!isCollapsed">RentMaster</span>
    </div>

    <!-- Collapse Toggle Button -->
    <button class="collapse-toggle" @click="toggleCollapse">
      <component :is="isCollapsed ? ChevronRight : ChevronLeft" :size="14" />
    </button>

    <nav class="nav-links">
      <router-link 
        v-for="item in navItems" 
        :key="item.id"
        :to="{ name: item.id }"
        class="nav-item"
        :class="{ active: route.name === item.id }"
        :title="isCollapsed ? item.label : ''"
      >
        <component :is="item.icon" :size="20" class="icon" />
        <span class="label" v-if="!isCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item settings-btn" :class="{ active: route.name === 'settings' }" :title="isCollapsed ? '系统设置' : ''">
        <Settings :size="20" class="icon" />
        <span class="label" v-if="!isCollapsed">系统设置</span>
      </router-link>
      <div class="user-profile">
        <div class="avatar">L</div>
        <div class="user-info" v-if="!isCollapsed">
          <span class="username">Lucas</span>
          <span class="role">超级管理员</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 500;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
  padding: 1.5rem 0.75rem;
}

.collapse-toggle {
  position: absolute;
  right: -12px;
  top: 86px;
  width: 24px;
  height: 24px;
  background: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.collapse-toggle:hover {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.75rem 1.75rem;
  overflow: hidden;
}

.sidebar.collapsed .logo-area {
  justify-content: center;
  padding: 0.5rem 0 2.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px; /* Space for scrollbar */
  margin-right: -4px;
}

/* Custom subtle scrollbar for sidebar nav */
.nav-links::-webkit-scrollbar {
  width: 4px;
}

.nav-links::-webkit-scrollbar-track {
  background: transparent;
}

.nav-links::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.nav-links:hover::-webkit-scrollbar-thumb {
  background: var(--text-muted);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  padding: 0.85rem;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-primary);
  font-weight: 700;
}

.nav-item.active .icon {
  color: var(--accent-primary);
}

.icon {
  transition: color 0.2s ease;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--bg-sidebar); /* Ensure background is solid when scrolled */
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-input);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.sidebar.collapsed .user-profile {
  padding: 0.5rem;
  justify-content: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
}

.role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .collapse-toggle { display: none; }
  .sidebar.collapsed { width: 100%; padding: 0 1rem; }
  .sidebar {
    width: 100%;
    height: var(--mobile-nav-height);
    position: fixed;
    bottom: 0;
    top: auto;
    flex-direction: row;
    padding: 0 1rem;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border-right: none;
    border-top: 1px solid var(--border-color);
  }

  .logo-area, .user-profile, .sidebar-footer {
    display: none;
  }

  .nav-links {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    gap: 0;
  }

  .nav-item {
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    border-radius: 0;
    background: transparent !important;
  }

  .nav-item .icon {
    width: 22px;
    height: 22px;
  }

  .nav-item.active {
    background: transparent;
  }
}
</style>
