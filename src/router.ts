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
    path: '/templates',
    name: 'templates',
    component: () => import('./views/TemplateListView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./views/SettingsView.vue')
  },
  {
    path: '/collection-hub',
    name: 'collection_hub',
    component: () => import('./views/CollectionHubView.vue')
  },
  {
    path: '/p/:id',
    name: 'public_payment',
    component: () => import('./views/PublicPaymentView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
