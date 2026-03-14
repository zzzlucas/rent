<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal
    :show="show"
    :title="title"
    max-width="400px"
    @close="emit('cancel')"
  >
    <div class="confirm-content">
      <div class="confirm-icon-wrapper" :class="type || 'warning'">
        <AlertTriangle :size="32" />
      </div>
      <p class="confirm-message">{{ message }}</p>
    </div>

    <template #footer>
      <div class="confirm-footer">
        <button class="btn-secondary" @click="emit('cancel')">
          {{ cancelText || '取消' }}
        </button>
        <button 
          class="btn-primary" 
          :class="type || 'warning'"
          @click="emit('confirm')"
        >
          {{ confirmText || '确认' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-content {
  padding: 1.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.confirm-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
}

.confirm-icon-wrapper.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.confirm-icon-wrapper.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-icon-wrapper.info {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
  font-weight: 500;
}

.confirm-footer {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.confirm-footer button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-secondary {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-primary {
  border: none;
  color: white;
}

.btn-primary.warning { background: #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2); }
.btn-primary.warning:hover { background: #d97706; transform: translateY(-1px); }

.btn-primary.danger { background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
.btn-primary.danger:hover { background: #dc2626; transform: translateY(-1px); }

.btn-primary.info { background: #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
.btn-primary.info:hover { background: #4f46e5; transform: translateY(-1px); }
</style>
