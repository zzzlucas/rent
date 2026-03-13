<script setup lang="ts">
import { MapPin, User, Calendar } from 'lucide-vue-next'

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
  property: Property
}>()

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'occupied': return '已出租'
    case 'vacant': return '待租'
    case 'maintenance': return '维修中'
    default: return status
  }
}
</script>

<template>
  <div class="property-card glass">
    <div class="thumbnail">
      <img :src="property.thumbnail" :alt="property.title" />
      <div class="status-badge" :class="property.status">
        {{ getStatusLabel(property.status) }}
      </div>
    </div>
    
    <div class="card-body">
      <h3 class="title">{{ property.title }}</h3>
      <div class="address">
        <MapPin :size="14" />
        <span>{{ property.address }}</span>
      </div>
      
      <div class="price-row">
        <span class="currency">¥</span>
        <span class="amount">{{ property.price.toLocaleString() }}</span>
        <span class="period">/月</span>
      </div>

      <div class="footer-meta" v-if="property.status === 'occupied'">
        <div class="meta-item">
          <User :size="14" />
          <span>{{ property.tenant }}</span>
        </div>
        <div class="meta-item">
          <Calendar :size="14" />
          <span>{{ property.lastPaid }} 付</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.property-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-primary);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.thumbnail {
  position: relative;
  height: 180px;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
}

.status-badge.occupied {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-badge.vacant {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-badge.maintenance {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.card-body {
  padding: 1.25rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.address {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 1.25rem;
}

.currency {
  font-size: 0.9rem;
  color: var(--accent-primary);
  margin-right: 2px;
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.period {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-left: 2px;
}

.footer-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}
</style>
