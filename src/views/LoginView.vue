<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, sendCode, smsLogin } from '../api/auth'
import { ShieldCheck, User, Lock, ArrowRight, Loader2, Phone, Smartphone } from 'lucide-vue-next'
import { showToast } from '../store'

const router = useRouter()
const username = ref('admin')
const password = ref('123456')
const isLoading = ref(false)
const loginType = ref<'password' | 'sms'>('password')
const phone = ref('')
const smsCode = ref('')
const countdown = ref(0)
const timer = ref<any>(null)

const startCountdown = () => {
  countdown.value = 60
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!phone.value) {
    showToast('请输入手机号', 'error')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号', 'error')
    return
  }

  try {
    const res = await sendCode(phone.value)
    showToast('验证码已发送', 'success')
    startCountdown()
    // if (res.data && res.data.code) {
    //   smsCode.value = res.data.code // 方便测试
    // }
  } catch (error: any) {
    showToast(error.message || '发送验证码失败', 'error')
  }
}

const handleLogin = async () => {
  if (loginType.value === 'password') {
    if (!username.value || !password.value) {
      showToast('请输入用户名和密码', 'error')
      return
    }
  } else {
    if (!phone.value || !smsCode.value) {
      showToast('请输入手机号和验证码', 'error')
      return
    }
  }

  isLoading.value = true
  try {
    let res: any
    if (loginType.value === 'password') {
      res = await login({
        username: username.value,
        password: password.value
      })
    } else {
      res = await smsLogin({
        phone: phone.value,
        code: smsCode.value
      })
    }
    
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      showToast('登录成功', 'success')
      router.push({ name: 'dashboard' })
    } else {
      showToast('登录失败：未获取到Token', 'error')
    }
  } catch (error: any) {
    showToast(error.message || '登录发生错误', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card glass animate-slide-up">
      <div class="logo-area">
        <div class="logo-icon">
          <ShieldCheck :size="48" color="#6366f1" />
        </div>
        <h1 class="logo-text">RentMaster</h1>
        <p class="subtitle">专业的内控式物业管理系统</p>
      </div>

      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          密码登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'sms' }"
          @click="loginType = 'sms'"
        >
          验证码登录
        </div>
      </div>

      <div class="login-form">
        <template v-if="loginType === 'password'">
          <div class="input-group">
            <label>用户名</label>
            <div class="input-wrapper">
              <User :size="18" class="icon" />
              <input 
                v-model="username" 
                type="text" 
                placeholder="请输入管理员账号" 
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <div class="input-group">
            <label>密码</label>
            <div class="input-wrapper">
              <Lock :size="18" class="icon" />
              <input 
                v-model="password" 
                type="password" 
                placeholder="请输入密码" 
                @keyup.enter="handleLogin"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="input-group">
            <label>手机号</label>
            <div class="input-wrapper">
              <Phone :size="18" class="icon" />
              <input 
                v-model="phone" 
                type="tel" 
                placeholder="请输入手机号" 
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <div class="input-group">
            <label>验证码</label>
            <div class="input-wrapper">
              <Smartphone :size="18" class="icon" />
              <input 
                v-model="smsCode" 
                type="text" 
                placeholder="请输入6位验证码" 
                maxlength="6"
                @keyup.enter="handleLogin"
              />
              <button 
                class="send-code-btn" 
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
        </template>

        <button 
          class="login-btn" 
          :disabled="isLoading"
          @click="handleLogin"
        >
          <span v-if="!isLoading">进入系统</span>
          <Loader2 v-else class="animate-spin" :size="20" />
          <ArrowRight v-if="!isLoading" :size="18" />
        </button>

        <div class="login-footer">
          <p v-if="loginType === 'password'">测试账号: admin / 123456</p>
          <p v-else>欢迎使用短信登录</p>
        </div>
      </div>
    </div>
    
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  overflow: hidden;
  z-index: 9999;
}

.login-card {
  width: 420px;
  padding: 3rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.logo-area {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-icon {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.login-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}

.tab-item {
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0.25rem;
  position: relative;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #94a3b8;
}

.tab-item.active {
  color: #6366f1;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366f1;
  border-radius: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.send-code-btn {
  position: absolute;
  right: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.send-code-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.send-code-btn:disabled {
  color: #64748b;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 1.25rem;
  color: #64748b;
}

.input-wrapper input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem 1rem 1rem 3.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.login-btn {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.1rem;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.login-btn:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.5);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  color: #64748b;
  font-size: 0.85rem;
}

/* Background Blobs */
.bg-blobs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(80px);
  opacity: 0.15;
  border-radius: 50%;
}

.blob-1 {
  background: #6366f1;
  top: -100px;
  left: -100px;
  animation: float 20s infinite alternate;
}

.blob-2 {
  background: #a855f7;
  bottom: -100px;
  right: -100px;
  animation: float 25s infinite alternate-reverse;
}

.blob-3 {
  background: #3b82f6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s infinite;
}

@keyframes float {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 100px); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>
