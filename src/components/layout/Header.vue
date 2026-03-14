<script setup lang="ts">
import { ref } from 'vue'
import { 
  Bell, 
  Search, 
  Plus,
  ShieldCheck,
  Upload,
  HelpCircle,
  UserPlus,
  Zap,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-vue-next'
import DataImportModal from '../property/DataImportModal.vue'
import DebtCollectionModal from '../property/DebtCollectionModal.vue'
import TenantModal from '../property/TenantModal.vue'
import RoomModal from '../property/RoomModal.vue'
import { theme, toggleTheme } from '../../store'

const showImportModal = ref(false)
const showDebtModal = ref(false)
const showTenantModal = ref(false)
</script>

<template>
  <header class="header glass">
    <div class="header-left-mobile">
      <ShieldCheck :size="24" color="#6366f1" />
      <span class="mobile-logo-text">RentMaster</span>
    </div>

    <div class="search-bar">
      <Search :size="18" class="search-icon" />
      <input type="text" placeholder="搜索房源、租客或流水号..." />
    </div>

    <div class="header-actions">

      <div class="import-group">
        <button class="secondary-btn-header" @click="showImportModal = true">
          <LayoutGrid :size="16" />
          <span>数据导入</span>
        </button>

      </div>

      <button class="secondary-btn-header" @click="showTenantModal = true">
        <UserPlus :size="16" />
        <span>登记新租客</span>
      </button>

      <button class="secondary-btn-header action-remind" @click="showDebtModal = true">
        <Zap :size="16" />
        <span>一键催缴</span>
      </button>



      <DataImportModal :show="showImportModal" @close="showImportModal = false" />
      <DebtCollectionModal :show="showDebtModal" @close="showDebtModal = false" />
      <TenantModal :show="showTenantModal" @close="showTenantModal = false" />

      <div class="divider-v"></div>

      <div class="utility-actions">
        <button class="icon-btn theme-toggle" @click="toggleTheme" title="切换主题">
          <Sun v-if="theme === 'dark'" :size="20" />
          <Moon v-else :size="20" />
        </button>

        <button class="icon-btn notification-btn">
          <Bell :size="20" />
          <span class="badge"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-left-mobile {
  display: none;
  align-items: center;
  gap: 8px;
  margin-right: 1rem;
}

.mobile-logo-text {
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  width: 400px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  background: var(--bg-surface);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.search-icon {
  color: var(--text-muted);
  margin-right: 0.75rem;
}

input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  width: 100%;
  font-size: 0.9rem;
}

input::placeholder {
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.add-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.icon-btn {
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
}

.icon-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.badge {
  border: 2px solid var(--bg-main);
}

.divider-v {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.utility-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.secondary-btn-header {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  font-size: 0.85rem;
}
.secondary-btn-header:hover { 
  background: var(--bg-card-hover); 
  border-color: var(--accent-primary);
}

.action-remind:hover {
  border-color: var(--accent-warning);
  color: var(--accent-warning);
}

@media (max-width: 1024px) {
  .header-left-mobile {
    display: flex;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }
  
  .header-left-mobile span {
    display: none;
  }

  .search-bar {
    width: 40px;
    padding: 0.5rem;
    justify-content: center;
    border: none;
    background: transparent;
  }

  .search-bar input, .add-btn span {
    display: none;
  }

  .search-icon {
    margin-right: 0;
  }

  .add-btn {
    padding: 0.6rem;
  }
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
