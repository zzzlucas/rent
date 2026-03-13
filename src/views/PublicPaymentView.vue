<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  CreditCard, 
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-vue-next'
import { markAsRead } from '../store'

const route = useRoute()
const id = route.params.id as string

// Mock logic: Fetch data based on ID
// In a real app, this would be an API call
const paymentData = {
  '1': { title: '秀湖花苑 8号楼 1202', tenant: '张先生', amount: 3500, debtDays: 3, deadline: '2026-03-10' },
  '2': { title: '秀湖花苑 12号楼 504', tenant: '李女士', amount: 4200, debtDays: 1, deadline: '2026-03-12' },
  '3': { title: '秀湖花苑 3号楼 201', tenant: '王阿姨', amount: 2800, debtDays: 0, deadline: '2026-03-15' },
  '4': { title: '秀湖花苑 15号楼 1508', tenant: '赵医生', amount: 5200, debtDays: 5, deadline: '2026-03-08' },
}[id] || { title: '您的租房账单', tenant: '租客', amount: 0, debtDays: 0, deadline: '-' }

onMounted(() => {
  // 埋点触发：标记为已读
  if (id) {
    markAsRead(id)
  }
})
</script>

<template>
  <div class="public-payment-container">
    <div class="header-banner">
      <div class="logo">
        <Building2 :size="24" />
        <span>RentMaster 租务管家</span>
      </div>
    </div>

    <main class="content">
      <div class="payment-card">
        <div class="status-badge" :class="{ 'urgent': paymentData.debtDays > 0 }">
          <AlertCircle v-if="paymentData.debtDays > 0" :size="16" />
          <ShieldCheck v-else :size="16" />
          <span>{{ paymentData.debtDays > 0 ? '待支付账单已逾期' : '待支付账单' }}</span>
        </div>

        <h1 class="amount">
          <small>¥</small>{{ paymentData.amount.toLocaleString() }}
        </h1>
        
        <p class="tenant-name">尊敬的 {{ paymentData.tenant }}，您好</p>
        <p class="summary-text">您承租的房源本期租金尚未结算，请及时处理以免产生逾期费用或影响您的信用记录。</p>

        <div class="detail-list">
          <div class="detail-item">
            <span class="label">承租房源</span>
            <span class="value">{{ paymentData.title }}</span>
          </div>
          <div class="detail-item">
            <span class="label">应交日期</span>
            <span class="value">{{ paymentData.deadline }}</span>
          </div>
          <div class="detail-item">
            <span class="label">逾期天数</span>
            <span class="value" :class="{ 'warning-text': paymentData.debtDays > 0 }">
              {{ paymentData.debtDays }} 天
            </span>
          </div>
        </div>

        <div class="payment-methods">
          <button class="pay-btn alipay">
            <CreditCard :size="18" />
            前往支付宝在线缴费
          </button>
          <button class="pay-btn wechat">
            <ExternalLink :size="18" />
            使用微信支付
          </button>
        </div>
      </div>

      <div class="footer-note">
        <Clock :size="14" />
        <span>账单核对如有疑问，请及时联系房管人员。</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.public-payment-container {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

[data-theme='dark'] .public-payment-container {
  background-color: #0f172a;
  color: #f1f5f9;
}

.header-banner {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

[data-theme='dark'] .header-banner {
  background: #1e293b;
  border-bottom-color: #334155;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  color: #3b82f6;
  font-size: 1.1rem;
}

.content {
  flex: 1;
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.payment-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

[data-theme='dark'] .payment-card {
  background: #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.status-badge.urgent {
  background: #fef2f2;
  color: #ef4444;
}

.amount {
  font-size: 3rem;
  font-weight: 900;
  margin: 0.5rem 0;
  color: #1e293b;
  letter-spacing: -0.05em;
}

[data-theme='dark'] .amount {
  color: #f1f5f9;
}

.amount small {
  font-size: 1.5rem;
  margin-right: 4px;
}

.tenant-name {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.summary-text {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.detail-list {
  width: 100%;
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

[data-theme='dark'] .detail-list {
  background: #0f172a;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-item .label {
  color: #94a3b8;
}

.detail-item .value {
  font-weight: 600;
}

.warning-text {
  color: #ef4444;
}

.payment-methods {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pay-btn {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.pay-btn:active {
  transform: scale(0.98);
}

.pay-btn.alipay {
  background: #00A1E9;
  color: white;
}

.pay-btn.wechat {
  background: #07C160;
  color: white;
}

.footer-note {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
}
</style>
