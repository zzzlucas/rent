<script setup lang="ts">
import { 
  Bell, 
  Search, 
  Plus,
  ShieldCheck
} from 'lucide-vue-next'
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
      <button class="add-btn">
        <Plus :size="18" />
        <span>添加房源</span>
      </button>

      <button class="icon-btn notification-btn">
        <Bell :size="20" />
        <span class="badge"></span>
      </button>
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  width: 400px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--accent-danger);
  border-radius: 50%;
  border: 2px solid var(--bg-main);
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
  background: rgba(10, 10, 12, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
