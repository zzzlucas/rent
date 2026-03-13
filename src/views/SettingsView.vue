<script setup lang="ts">
import { ref } from 'vue'
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  User, 
  Globe, 
  Smartphone,
  Check,
  Moon,
  Sun,
  Users,
  Key,
  MoreVertical,
  UserPlus,
  Briefcase
} from 'lucide-vue-next'
import { showToast } from '../store'

const activeTab = ref('general')
const tabs = [
  { id: 'general', label: '通用设置', icon: Globe },
  { id: 'users', label: '子用户管理', icon: Users },
  { id: 'business', label: '业务偏好', icon: Briefcase },
  { id: 'notification', label: '通知偏好', icon: Bell },
  { id: 'appearance', label: '界面视觉', icon: Palette },
  { id: 'security', label: '账号安全', icon: Shield },
  { id: 'profile', label: '个人信息', icon: User },
]

// Mock Sub-users
const subUsers = ref([
  { id: 1, name: '张小辉', role: '财务专员', email: 'zh@example.com', status: 'active', lastLogin: '10分钟前', avatar: '张' },
  { id: 2, name: '王丽', role: '房源管家', email: 'wl@example.com', status: 'active', lastLogin: '今天 09:30', avatar: '王' },
  { id: 3, name: '陈强', role: '维修工人', email: 'cq@example.com', status: 'disabled', lastLogin: '3天前', avatar: '陈' },
])

const isUserModalOpen = ref(false)
const newUser = ref({ name: '', role: '房源管家', email: '', status: 'active' })

const getRoleBadgeColor = (role: string) => {
  if (role === '财务专员') return '#10b981'
  if (role === '房源管家') return '#6366f1'
  return '#94a3b8'
}

const toggleUserStatus = (user: any) => {
  user.status = user.status === 'active' ? 'disabled' : 'active'
}

// Mock Settings State
const settings = ref({
  language: 'zh-CN',
  currency: 'CNY',
  timezone: 'UTC+8',
  smsNotify: true,
  emailNotify: false,
  pushNotify: true,
  themeColor: '#6366f1',
  compactMode: false,
  darkMode: true,
  // Business Prefs
  autoFollowOverdue: true,
  overdueThreshold: 1,
  autoSmsDebt: false,
  smsTemplate: '您好，您的房租已逾期，请及时缴纳以免产生滞纳金。'
})

const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9']

const saveSettings = () => {
  showToast('设置已保存并同步到云端')
}
</script>

<template>
  <div class="settings-view animate-fade-in">
    <header class="page-header">
      <h1>系统设置 <span class="muted">Settings</span></h1>
      <p>管理您的账户偏好、系统阈值及视觉风格</p>
    </header>

    <div class="settings-layout">
      <!-- Settings Sidebar -->
      <aside class="settings-nav glass">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="18" />
          <span>{{ tab.label }}</span>
        </button>
      </aside>

      <!-- Settings Content -->
      <main class="settings-main glass">
        <!-- General Section -->
        <div v-if="activeTab === 'general'" class="section-container">
          <h2 class="section-title">通用设置</h2>
          <div class="form-group">
            <label>语言 / Language</label>
            <select v-model="settings.language">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div class="form-group">
            <label>本位币单位</label>
            <select v-model="settings.currency">
              <option value="CNY">人民币 (¥)</option>
              <option value="USD">美元 ($)</option>
              <option value="EUR">欧元 (€)</option>
            </select>
            <p class="help-text">导出报表和台账时使用的默认货币符号</p>
          </div>
          <div class="form-group">
            <label>时区设置</label>
            <select v-model="settings.timezone">
              <option value="UTC+8">北京时间 (UTC+8)</option>
              <option value="UTC+0">格林威治 (UTC+0)</option>
            </select>
          </div>
        </div>

        <!-- Sub-user Management Section -->
        <div v-if="activeTab === 'users'" class="section-container">
          <div class="section-header-row">
            <h2 class="section-title">子用户管理</h2>
            <button class="add-user-btn" @click="isUserModalOpen = true">
              <UserPlus :size="16" /> 添加新账户
            </button>
          </div>
          
          <div class="user-list">
            <div v-for="user in subUsers" :key="user.id" class="user-card-item">
              <div class="u-info">
                <div class="u-avatar">{{ user.avatar }}</div>
                <div class="u-details">
                  <span class="u-name">{{ user.name }}</span>
                  <span class="u-email">{{ user.email }}</span>
                </div>
              </div>
              <div class="u-role">
                <span class="role-badge" :style="{ color: getRoleBadgeColor(user.role), background: getRoleBadgeColor(user.role) + '15' }">
                  {{ user.role }}
                </span>
              </div>
              <div class="u-status">
                <span :class="['status-dot', user.status]"></span>
                {{ user.status === 'active' ? '活跃' : '已禁用' }}
              </div>
              <div class="u-last">最后在线: {{ user.lastLogin }}</div>
              <div class="u-actions">
                <button class="icon-btn-lite" @click="toggleUserStatus(user)">
                  <Shield :size="14" :color="user.status === 'active' ? '#f87171' : '#10b981'" />
                </button>
                <button class="icon-btn-lite"><Key :size="14" /></button>
                <button class="icon-btn-lite"><MoreVertical :size="14" /></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Section -->
        <div v-if="activeTab === 'notification'" class="section-container">
          <h2 class="section-title">通知偏好</h2>
          <div class="setting-item-row">
            <div class="info">
              <div class="title">短信提醒</div>
              <div class="desc">房租到期前3天自动给租客发送催缴短信</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.smsNotify }" @click="settings.smsNotify = !settings.smsNotify"></div>
            </div>
          </div>
          <div class="setting-item-row">
            <div class="info">
              <div class="title">邮件周报</div>
              <div class="desc">每周一早上发送上周运营及财务报表</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.emailNotify }" @click="settings.emailNotify = !settings.emailNotify"></div>
            </div>
          </div>
          <div class="setting-item-row">
            <div class="info">
              <div class="title">桌面推送</div>
              <div class="desc">有新的报修订单或合同到期时弹出提醒</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.pushNotify }" @click="settings.pushNotify = !settings.pushNotify"></div>
            </div>
          </div>
        </div>

        <!-- Business Preferences Section -->
        <div v-if="activeTab === 'business'" class="section-container">
          <h2 class="section-title">业务偏好</h2>
          
          <div class="setting-item-row">
            <div class="info">
              <div class="title">逾期自动关注</div>
              <div class="desc">房租逾期后自动将该房源加入“关注房源”</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.autoFollowOverdue }" @click="settings.autoFollowOverdue = !settings.autoFollowOverdue"></div>
            </div>
          </div>

          <div class="form-group sub-options" v-if="settings.autoFollowOverdue">
            <label>生效条件</label>
            <div class="select-with-text">
              逾期次数达到 
              <select v-model="settings.overdueThreshold" class="mini-select">
                <option :value="1">1 次</option>
                <option :value="2">2 次</option>
                <option :value="3">3 次及以上</option>
              </select>
              后触发
            </div>
          </div>

          <div class="setting-item-row">
            <div class="info">
              <div class="title">自动开启 SMS 催收</div>
              <div class="desc">确认逾期后，自动启动短信催收流程</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.autoSmsDebt }" @click="settings.autoSmsDebt = !settings.autoSmsDebt"></div>
            </div>
          </div>

          <div class="form-group-full sub-options" v-if="settings.autoSmsDebt">
            <label>默认催收文本预览</label>
            <textarea 
              v-model="settings.smsTemplate" 
              class="glass-textarea" 
              placeholder="请输入短信催收模板..."
            ></textarea>
            <p class="help-text">系统将在逾期后的第 1、3、7 天自动发送此内容</p>
          </div>
        </div>

        <!-- Appearance Section -->
        <div v-if="activeTab === 'appearance'" class="section-container">
          <h2 class="section-title">界面视觉</h2>
          <div class="form-group">
            <label>品牌主题色</label>
            <div class="color-picker-grid">
              <div 
                v-for="c in colors" 
                :key="c" 
                class="color-circle" 
                :style="{ background: c }"
                @click="settings.themeColor = c"
              >
                <Check v-if="settings.themeColor === c" :size="14" color="#fff" />
              </div>
            </div>
          </div>
          <div class="setting-item-row">
            <div class="info">
              <div class="title">深色模式</div>
              <div class="desc">当前已默认开启沉浸式深色主题</div>
            </div>
            <div class="control">
              <button class="mode-toggle">
                <Moon v-if="settings.darkMode" :size="20" />
                <Sun v-else :size="20" />
              </button>
            </div>
          </div>
          <div class="setting-item-row">
            <div class="info">
              <div class="title">紧凑布局</div>
              <div class="desc">减少页面边距，单屏展示更多数据表格内容</div>
            </div>
            <div class="control">
              <div class="switch" :class="{ on: settings.compactMode }" @click="settings.compactMode = !settings.compactMode"></div>
            </div>
          </div>
        </div>

        <div v-if="['security', 'profile'].includes(activeTab)" class="section-container center-empty">
          <Settings :size="48" class="placeholder-icon" />
          <h3>该模块正在同步数据...</h3>
          <p>请稍后再试或联系系统管理员</p>
        </div>

        <div class="settings-footer" v-if="activeTab !== 'users'">
          <button class="btn-primary" @click="saveSettings">保存更改</button>
        </div>
      </main>
    </div>

    <!-- User Add Modal -->
    <div v-if="isUserModalOpen" class="modal-overlay" @click="isUserModalOpen = false">
      <div class="modal-content glass animate-scale-up" @click.stop>
        <div class="modal-header">
          <h2>添加新房源管家</h2>
          <button class="close-btn" @click="isUserModalOpen = false"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group-full">
            <label>真实姓名</label>
            <input v-model="newUser.name" placeholder="请输入员工姓名" />
          </div>
          <div class="form-group-full">
            <label>登录邮箱/账号</label>
            <input v-model="newUser.email" placeholder="example@rent.com" />
          </div>
          <div class="form-group-full">
            <label>系统角色</label>
            <select v-model="newUser.role">
              <option>房源管家</option>
              <option>财务专员</option>
              <option>维修工人</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="isUserModalOpen = false">取消</button>
          <button class="confirm-btn" @click="isUserModalOpen = false">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--text-primary);
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: var(--text-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header h1 .muted {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-muted);
  -webkit-text-fill-color: var(--text-muted);
  margin-left: 0.5rem;
}

.page-header p { color: var(--text-muted); font-size: 1rem; }

.settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar Nav */
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  color: var(--text-muted);
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
}

.nav-item:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.nav-item.active { background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); }

/* Main Content */
.settings-main {
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.section-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; flex: 1; margin-bottom: 0; border: none; }
.section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }

.add-user-btn { background: var(--accent-primary); color: #fff; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; }

.user-list { display: flex; flex-direction: column; gap: 12px; }
.user-card-item {
  display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem;
  background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border-color); transition: all 0.2s;
}
.user-card-item:hover { background: var(--bg-card-hover); border-color: var(--accent-primary); }

.u-info { display: flex; align-items: center; gap: 1rem; width: 220px; }
.u-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; }
.u-details { display: flex; flex-direction: column; }
.u-name { font-weight: 700; font-size: 0.95rem; }
.u-email { font-size: 0.75rem; color: var(--text-muted); }

.role-badge { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; }

.u-status { font-size: 0.8rem; display: flex; align-items: center; gap: 8px; color: var(--text-muted); width: 80px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.active { background: #10b981; box-shadow: 0 0 8px #10b981; }
.status-dot.disabled { background: #64748b; }

.u-last { font-size: 0.75rem; color: var(--text-muted); width: 140px; }
.u-actions { display: flex; gap: 4px; }
.icon-btn-lite { width: 32px; height: 32px; border-radius: 8px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; }
.icon-btn-lite:hover { background: var(--bg-card-hover); color: var(--text-primary); }

.form-group-full { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem; }
.form-group-full label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
.form-group-full input, .form-group-full select, .glass-textarea { background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.8rem 1rem; border-radius: 12px; color: var(--text-primary); outline: none; }
.glass-textarea { width: 100%; height: 100px; resize: none; font-size: 0.9rem; line-height: 1.6; background: var(--bg-input); }

.sub-options {
  margin-left: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-input);
  border-left: 2px solid var(--accent-primary);
  border-radius: 0 16px 16px 0;
  margin-top: -1rem;
  margin-bottom: 2rem;
}

.select-with-text {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  font-weight: 500;
}

.mini-select {
  width: 100px !important;
  padding: 0.4rem 0.8rem !important;
}

.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 2rem; max-width: 400px; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
.form-group select, .form-group input {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  color: var(--text-primary);
  outline: none;
}
.help-text { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

.setting-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-input);
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}
.setting-item-row:hover { border-color: var(--accent-primary); background: var(--bg-card-hover); }

.setting-item-row .title { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
.setting-item-row .desc { font-size: 0.8rem; color: var(--text-muted); }

/* Switches */
.switch {
  width: 48px;
  height: 24px;
  background: var(--bg-input);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}
.switch::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; background: #fff; border-radius: 50%;
  transition: all 0.3s;
}
.switch.on { background: var(--accent-primary); }
.switch.on::after { left: 26px; background: white; }

.color-picker-grid { display: flex; gap: 12px; }
.color-circle {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: transform 0.2s;
}
.color-circle:hover { transform: scale(1.2); }

.mode-toggle { width: 48px; height: 48px; border-radius: 12px; background: var(--bg-input); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; }

.settings-footer { margin-top: auto; padding-top: 2rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
.btn-primary { background: var(--accent-primary); color: #fff; padding: 0.8rem 2.5rem; border-radius: 12px; font-weight: 700; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }

.center-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; opacity: 0.5; }
.placeholder-icon { margin-bottom: 1.5rem; }

.glass { 
  background: var(--glass-bg); 
  backdrop-filter: blur(20px); 
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background: var(--bg-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--glass-shadow);
}

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }
.modal-body { padding: 2rem; }
.modal-footer { padding: 1.5rem 2rem; background: var(--bg-input); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; }

.cancel-btn { padding: 0.75rem 1.5rem; border-radius: 10px; color: var(--text-secondary); font-weight: 600; }
.confirm-btn { background: var(--accent-primary); color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; }
.close-btn { color: var(--text-muted); }
.close-btn:hover { color: var(--text-primary); }

@media (max-width: 1024px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-nav { flex-direction: row; overflow-x: auto; }
  .nav-item { white-space: nowrap; }
}
</style>
