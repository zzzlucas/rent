import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue')
  },
  {
    path: '/building-grid',
    name: 'building_grid',
    component: () => import('./components/property/BuildingGridView.vue')
  },
  {
    path: '/properties',
    name: 'properties',
    component: () => import('./components/property/PropertyListView.vue')
  },
  {
    path: '/tenants',
    name: 'tenants',
    component: () => import('./components/property/TenantListView.vue')
  },
  {
    path: '/contracts',
    name: 'contracts',
    component: () => import('./components/property/ContractManagement.vue')
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('./components/property/MaintenanceView.vue')
  },
  {
    path: '/finance',
    name: 'finance',
    component: () => import('./components/property/FinanceView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
