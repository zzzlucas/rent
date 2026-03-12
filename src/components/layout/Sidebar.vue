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
  Copy
} from 'lucide-vue-next'

import { useRoute } from 'vue-router'

const route = useRoute()


const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'building_grid', label: '房态看板', icon: Grid2X2 },
  { id: 'properties', label: '房源列表', icon: Home },
  { id: 'tenants', label: '租客管理', icon: Users },
  { id: 'contracts', label: '合同中心', icon: FileText },
  { id: 'templates', label: '房源模板', icon: Copy },
  { id: 'maintenance', label: '报修/维护', icon: Wrench },
  { id: 'finance', label: '财务报表', icon: Wallet },
]
</script>

<template>
  <aside class="sidebar">
    <div class="logo-area">
      <div class="logo-icon">
        <ShieldCheck :size="28" color="#6366f1" />
      </div>
      <span class="logo-text">RentMaster</span>
    </div>

    <nav class="nav-links">
      <router-link 
        v-for="item in navItems" 
        :key="item.id"
        :to="{ name: item.id }"
        class="nav-item"
        :class="{ active: route.name === item.id }"
      >
        <component :is="item.icon" :size="20" class="icon" />
        <span class="label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item settings-btn" :class="{ active: route.name === 'settings' }">
        <Settings :size="20" class="icon" />
        <span class="label">系统设置</span>
      </router-link>
      <div class="user-profile">
        <div class="avatar">L</div>
        <div class="user-info">
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
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem 2rem;
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
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-primary);
  font-weight: 600;
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
  gap: 1.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
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
  .sidebar {
    width: 100%;
    height: var(--mobile-nav-height);
    position: fixed;
    bottom: 0;
    top: auto;
    flex-direction: row;
    padding: 0 1rem;
    background: rgba(17, 17, 20, 0.95);
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
