<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  show: boolean
  title?: string
  width?: number
  closeOnOverlay?: boolean
  showClose?: boolean
}

withDefaults(defineProps<Props>(), {
  width: 420,
  closeOnOverlay: true,
  showClose: true
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div 
        v-if="show" 
        class="base-drawer-overlay"
        @click.self="closeOnOverlay && emit('close')"
      >
        <div 
          class="base-drawer-container glass animate-slide-left" 
          :style="{ width: width + 'px' }"
          @click.stop
        >
          <slot name="resize-handle"></slot>
          
          <div class="base-drawer-header">
            <div class="header-content">
              <slot name="header">
                <h3 v-if="title">{{ title }}</h3>
              </slot>
            </div>
            <div class="header-actions">
              <slot name="header-actions"></slot>
              <button v-if="showClose" class="close-btn" @click="emit('close')" aria-label="Close">
                <X :size="20" />
              </button>
            </div>
          </div>

          <div class="base-drawer-body custom-scrollbar">
            <slot></slot>
          </div>

          <footer v-if="$slots.footer" class="base-drawer-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  z-index: 1500;
  display: flex;
  justify-content: flex-end;
}

.base-drawer-container {
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--glass-shadow);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
}

.base-drawer-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-content h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.base-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1rem;
}

.base-drawer-footer {
  padding: 1.25rem 1rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.animate-slide-left {
  animation: slideLeft 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Global Drawer Utility Classes */
:deep(.drawer-section) {
  margin-bottom: 1.5rem;
}

:deep(.drawer-section:last-child) {
  margin-bottom: 0;
}

:deep(.drawer-section-title) {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.drawer-card) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
}

:deep(.drawer-header-meta) {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
