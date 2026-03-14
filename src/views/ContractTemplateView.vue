<script setup lang="ts">
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Copy,
  Clock,
  CheckCircle2
} from 'lucide-vue-next'
import { ref } from 'vue'

const templates = ref([
  { id: 1, name: '标准租赁合同 (2024版)', category: '长租', lastUpdate: '2024-03-01', status: 'active' },
  { id: 2, name: '短租月结协议', category: '短租', lastUpdate: '2024-02-15', status: 'active' },
  { id: 3, name: '商业办公租赁合同', category: '商业', lastUpdate: '2024-01-20', status: 'draft' },
])

const searchQuery = ref('')
</script>

<template>
  <div class="contract-templates-view animate-in">
    <header class="view-header">
      <div class="header-info">
        <h1>合同模板库</h1>
        <p>在此管理您的电子合同标准化模板，支持 AI 字段自动映射。</p>
      </div>
      <div class="header-actions">
        <button class="primary-btn">
          <Plus :size="18" />
          <span>创建新模板</span>
        </button>
      </div>
    </header>

    <div class="stats-grid">
      <div v-for="s in [
        { label: '在线模板', val: '5', icon: FileText, color: '#6366f1' },
        { label: '最近更新', val: '3月1日', icon: Clock, color: '#10b981' },
        { label: '使用中房源', val: '128', icon: CheckCircle2, color: '#a855f7' }
      ]" :key="s.label" class="stat-card glass">
        <div class="stat-icon" :style="{ color: s.color }">
          <component :is="s.icon" :size="20" />
        </div>
        <div class="stat-info">
          <div class="stat-val">{{ s.val }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <div class="filter-bar glass">
      <div class="search-wrap">
        <Search :size="18" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜模板名称、适用场景..." 
          class="search-input"
        />
      </div>
      <div class="tab-group">
        <button class="tab-btn active">全部</button>
        <button class="tab-btn">租赁合同</button>
        <button class="tab-btn">解除协议</button>
      </div>
    </div>

    <div class="template-grid">
      <div v-for="t in templates" :key="t.id" class="template-card glass">
        <div class="card-top">
          <div class="type-badge">{{ t.category }}</div>
          <button class="icon-btn"><MoreHorizontal :size="18" /></button>
        </div>
        <div class="card-main">
          <div class="file-icon"><FileText :size="32" /></div>
          <h3>{{ t.name }}</h3>
          <p>更新于 {{ t.lastUpdate }}</p>
        </div>
        <div class="card-footer">
          <div class="status-pill" :class="t.status">
            {{ t.status === 'active' ? '在线' : '草稿' }}
          </div>
          <div class="action-links">
            <button class="link-btn"><Copy :size="14" /> 引用</button>
            <button class="link-btn primary">预览</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contract-templates-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.header-info p {
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 16px;
  gap: 2rem;
  border: 1px solid var(--border-color);
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 12px;
  color: var(--text-primary);
}

.tab-group {
  display: flex;
  gap: 8px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.tab-btn.active {
  background: var(--bg-surface);
  color: var(--accent-primary);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.template-card {
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: var(--bg-input);
  border-radius: 6px;
  color: var(--text-muted);
}

.card-main {
  text-align: center;
  padding: 1rem 0;
}

.file-icon {
  margin-bottom: 1rem;
  color: var(--accent-primary);
}

.card-main h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-main p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-pill.draft {
  background: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.action-links {
  display: flex;
  gap: 12px;
}

.link-btn {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-btn.primary {
  color: var(--accent-primary);
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}

.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
