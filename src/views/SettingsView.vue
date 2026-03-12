<template>
  <div class="view-container animate-fade-in">
    <section class="page-header">
      <h1>系统设置 <span class="muted">Settings</span></h1>
    </section>
    <div class="placeholder-content glass">
      <div class="placeholder-icon">⚙️</div>
      <h2>偏好设置</h2>
      <p>货币单位、通知项、主题颜色等功能开发中...</p>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header .muted {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  text-align: center;
  margin-top: 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
</style>
