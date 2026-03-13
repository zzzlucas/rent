<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  show: boolean
  title?: string
  subtitle?: string
  maxWidth?: string
  showClose?: boolean
}

withDefaults(defineProps<Props>(), {
  maxWidth: '600px',
  showClose: true
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="base-modal-overlay" @click.self="emit('close')">
        <div 
          class="base-modal-container glass animate-modal-in" 
          :style="{ maxWidth }"
        >
          <!-- Close Button (Always top-right) -->
          <button v-if="showClose" class="close-btn" @click="emit('close')" aria-label="Close">
            <X :size="20" />
          </button>

          <!-- Header (Optional) -->
          <header v-if="title" class="base-modal-header">
            <div class="header-text">
              <h3>{{ title }}</h3>
              <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
            </div>
          </header>

          <!-- Content -->
          <div class="base-modal-body custom-scrollbar">
            <slot></slot>
          </div>

          <!-- Footer Slot -->
          <footer v-if="$slots.footer" class="base-modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.base-modal-container {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--glass-shadow);
  position: relative;
  max-height: 90vh; /* Keep some gap to screen edges */
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
}

.base-modal-header {
  padding: 2rem 4rem 1.5rem 2rem; /* Extra right padding for close button */
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-text h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.base-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.base-modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.animate-modal-in {
  animation: modalScaleIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes modalScaleIn {
  from {
    transform: scale(0.95) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
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
</style>
