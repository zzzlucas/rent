<script setup lang="ts">
import { 
  User, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText, 
  Clock, 
  Download,
  ExternalLink,
  ShieldCheck,
  Phone,
  ArrowRight
} from 'lucide-vue-next'
import BaseDrawer from '../common/BaseDrawer.vue'

const props = defineProps<{
  show: boolean
  contract: any
}>()

defineEmits(['close', 'terminate'])
</script>

<template>
  <BaseDrawer
    :show="show"
    @close="$emit('close')"
  >
    <template #header>
      <div class="drawer-header-content">
        <h3>合同详情</h3>
        <div class="drawer-header-meta">
          <span class="meta-item">NO.{{ String(contract.id).padStart(6, '0') }}</span>
          <span class="meta-divider">·</span>
          <span class="meta-item">{{ contract.period }}</span>
        </div>
      </div>
    </template>

    <div v-if="contract" class="detail-container">
      <!-- Status Badge (Compact) -->
      <div class="drawer-section">
        <div class="status-banner" :class="contract.status">
          <div class="status-main">
            <div class="status-dot"></div>
            <span class="status-text">
              {{ contract.status === 'active' ? '正在履行中' : contract.status === 'expiring' ? '即将到期' : '已失效' }}
            </span>
          </div>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">租客信息</div>
        <div class="drawer-card user-card-mini">
          <div class="u-avatar">
            <User :size="24" />
          </div>
          <div class="u-details">
            <div class="u-name">{{ contract.tenant }}</div>
            <div class="u-phone">
              <Phone :size="12" />
              {{ contract.raw?.customer?.phone || '暂无联系电话' }}
            </div>
          </div>
          <button class="contact-btn">联系租客</button>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">房源信息</div>
        <div class="drawer-card prop-card-mini">
          <div class="p-icon">
            <MapPin :size="20" />
          </div>
          <div class="p-info">
            <div class="p-addr">{{ contract.property }}</div>
            <div class="p-type">{{ contract.raw?.room?.roomType || '精装单间' }} · {{ contract.raw?.room?.area || 0 }}㎡</div>
          </div>
          <ExternalLink :size="16" class="link-icon" />
        </div>
      </div>

      <!-- Financial Terms -->
      <div class="drawer-section">
        <div class="drawer-section-title">合同条款</div>
        <div class="terms-grid">
          <div class="term-item">
            <div class="t-label"><CreditCard :size="14" /> 月租金</div>
            <div class="t-val highlight">¥{{ contract.rent.toLocaleString() }}</div>
          </div>
          <div class="term-item">
            <div class="t-label"><ShieldCheck :size="14" /> 押金金额</div>
            <div class="t-val">¥{{ (contract.raw?.deposit / 100).toLocaleString() }}</div>
          </div>
          <div class="term-item full">
            <div class="t-label"><Calendar :size="14" /> 租期范围</div>
            <div class="t-val">{{ contract.period }}</div>
          </div>
          <div class="term-item">
            <div class="t-label"><Clock :size="14" /> 支付方式</div>
            <div class="t-val">{{ contract.raw?.room?.paymentType || '押一付三' }}</div>
          </div>
          <div class="term-item">
            <div class="t-label"><FileText :size="14" /> 合同类型</div>
            <div class="t-val">电子签署 / 纸质扫描</div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="drawer-section">
        <div class="drawer-section-title">合同附件 ({{ (contract.raw?.attachments?.length || 0) + 1 }})</div>
        <div class="attachments-list">
          <div class="attachment-item">
            <div class="file-icon"><FileText :size="18" /></div>
            <div class="file-info">
              <div class="f-name">租赁合同正本_扫描件.pdf</div>
              <div class="f-meta">2.4MB · AI 识别录入</div>
            </div>
            <button class="f-dl"><Download :size="16" /></button>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="drawer-section">
        <div class="drawer-section-title">履约变更记录</div>
        <div class="timeline">
          <div class="time-node">
            <div class="node-dot"></div>
            <div class="node-content">
              <div class="node-time">2024-03-14 09:20</div>
              <div class="node-msg">AI 智能识别录入成功</div>
            </div>
          </div>
          <div class="time-node">
            <div class="node-dot"></div>
            <div class="node-content">
              <div class="node-time">2024-03-14 09:15</div>
              <div class="node-msg">上传合同原始凭证</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <button class="btn-secondary" @click="$emit('terminate', contract.id)">解除合同</button>
        <button class="btn-primary">编辑合同条款</button>
      </div>
    </template>
  </BaseDrawer>
</template>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.status-banner {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-banner.active { background: rgba(16, 185, 129, 0.05); color: #10b981; }
.status-banner.expiring { background: rgba(245, 158, 11, 0.05); color: #f59e0b; }
.status-banner.expired { background: rgba(239, 68, 68, 0.05); color: #ef4444; }

.status-main { display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
.status-text { font-weight: 800; font-size: 0.85rem; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.user-card-mini, .prop-card-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem !important; /* Overriding drawer-card default padding for mini cards */
}

.u-avatar, .p-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-input); color: var(--accent-primary);
}

.u-name { font-weight: 800; font-size: 0.9rem; color: var(--text-primary); }
.u-phone { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-top: 1px; }

.contact-btn {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.08);
  color: var(--accent-primary);
  font-size: 0.7rem;
  font-weight: 700;
}

.p-addr { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
.p-type { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
.link-icon { margin-left: auto; color: var(--text-muted); opacity: 0.6; }

.terms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.term-item {
  padding: 1rem;
  background: var(--bg-input);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.term-item.full { grid-column: span 2; }
.t-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 6px; }
.t-val { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
.t-val.highlight { color: var(--accent-primary); font-size: 1.1rem; }

.attachments-list { display: flex; flex-direction: column; gap: 0.5rem; }
.attachment-item {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
  background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);
}

.file-icon { color: var(--accent-primary); }
.f-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
.f-meta { font-size: 0.75rem; color: var(--text-muted); }
.f-dl { margin-left: auto; color: var(--text-muted); }

.timeline { display: flex; flex-direction: column; padding-left: 0.5rem; border-left: 1px solid var(--border-color); }
.time-node { position: relative; padding-left: 1.5rem; padding-bottom: 1.5rem; }
.node-dot { position: absolute; left: -4.5px; top: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); border: 2px solid var(--bg-surface); }
.node-time { font-size: 0.7rem; color: var(--text-muted); }
.node-msg { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-top: 2px; }

.drawer-footer { display: flex; gap: 1rem; width: 100%; }
.drawer-footer button { flex: 1; padding: 0.85rem; border-radius: 12px; font-weight: 700; transition: all 0.2s; }
.btn-secondary { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-secondary); }
.btn-primary { background: var(--accent-primary); color: white; border: none; }
</style>
