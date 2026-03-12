<script setup lang="ts">
import { X, MapPin, User, Calendar, CreditCard, ShieldCheck, Wrench } from 'lucide-vue-next'

interface Property {
  id: string
  title: string
  address: string
  price: number
  status: 'occupied' | 'vacant' | 'maintenance'
  thumbnail: string
  tenant?: string
  lastPaid?: string
}

defineProps<{
  property: Property | null
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="property" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content glass animate-scale-up">
      <button class="close-btn" @click="emit('close')">
        <X :size="20" />
      </button>

      <div class="modal-body">
        <div class="modal-header-image">
          <img :src="property.thumbnail" :alt="property.title" />
          <div class="status-badge" :class="property.status">
            {{ property.status === 'occupied' ? '已出租' : property.status === 'vacant' ? '待租' : '维修中' }}
          </div>
        </div>

        <div class="info-section">
          <div class="main-info">
            <h2>{{ property.title }}</h2>
            <div class="address">
              <MapPin :size="16" />
              <span>{{ property.address }}</span>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <div class="label">月租金</div>
              <div class="val highlight">¥{{ property.price.toLocaleString() }}</div>
            </div>
            <div class="detail-item">
              <div class="label">当前租客</div>
              <div class="val">{{ property.tenant || '无' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">上次缴费</div>
              <div class="val">{{ property.lastPaid || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">房源性质</div>
              <div class="val">整租 · 三室一厅</div>
            </div>
          </div>

          <div class="action-tabs">
            <div class="tab-btn active"><User :size="16" /> 租客信息</div>
            <div class="tab-btn"><CreditCard :size="16" /> 账单历史</div>
            <div class="tab-btn"><Wrench :size="16" /> 维修记录</div>
            <div class="tab-btn"><ShieldCheck :size="16" /> 合同文件</div>
          </div>

          <div class="tab-content">
            <template v-if="property.status === 'occupied'">
              <div class="tenant-profile">
                <div class="avatar large">{{ property.tenant?.charAt(0) }}</div>
                <div class="t-details">
                  <div class="t-name">{{ property.tenant }}</div>
                  <div class="t-meta">联系电话: 138****8888</div>
                  <div class="t-meta">租赁起止: 2023.05.20 - 2024.05.19</div>
                </div>
                <button class="contact-btn">联系租客</button>
              </div>
            </template>
            <template v-else>
              <div class="empty-state">
                <p>当前房源为空置状态，可前往发布租房信息。</p>
              </div>
            </template>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="emit('close')">关闭预览</button>
          <button class="primary-btn">编辑房源信息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 800px;
  background: var(--bg-sidebar);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: white;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--accent-danger);
}

.modal-header-image {
  height: 300px;
  position: relative;
}

.modal-header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}

.status-badge.occupied { background: rgba(16, 185, 129, 0.8); color: white; }
.status-badge.vacant { background: rgba(245, 158, 11, 0.8); color: white; }
.status-badge.maintenance { background: rgba(239, 68, 68, 0.8); color: white; }

.info-section {
  padding: 2rem;
}

.main-info h2 {
  font-size: 1.85rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.detail-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.detail-item .val {
  font-weight: 700;
  font-size: 1.1rem;
}

.detail-item .val.highlight {
  color: var(--accent-primary);
}

.action-tabs {
  display: flex;
  gap: 1.5rem;
  margin-top: 2.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  padding-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.tab-btn.active {
  color: var(--text-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-primary);
}

.tab-content {
  padding: 2rem 0;
  min-height: 120px;
}

.tenant-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar.large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.t-details .t-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.t-details .t-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.contact-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: 1px solid var(--border-color);
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.primary-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.secondary-btn {
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.glass {
  background: rgba(17, 17, 20, 0.95);
  backdrop-filter: blur(20px);
}
</style>
