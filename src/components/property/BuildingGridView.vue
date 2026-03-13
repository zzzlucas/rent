<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  X, Phone, Edit3, Check, Eye, EyeOff, ChevronRight, Star, Wallet, Copy, 
  LogIn, LogOut 
} from 'lucide-vue-next'
import AIAssistant from './AIAssistant.vue'
import { 
  propertyTemplates, 
  activeApplyingTemplateId, 
  showToast, 
  followedPropertyIds, 
  toggleFollowProperty,
  applyTemplateToRooms,
  fetchTemplates
} from '../../store'
import { getProperties, getRooms, terminateLease, updateRoom } from '../../api/property'
import LeaseModal from './LeaseModal.vue'

const selectedBlock = ref<string>('')
const selectedRoom = ref<any>(null)
const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const selectedRoomIds = ref<Set<string>>(new Set())
const isDrawerEditing = ref(false)
const tempRoomData = ref<Room | null>(null)
const isLoading = ref(false)
const showLeaseModal = ref(false)

// Room data structure with 'isManaged' flag
interface Room {
  id: string
  number: string
  area: string | number
  status: 'vacant' | 'occupied' | 'maintenance'
  type: string
  isManaged: boolean
  paymentStatus?: 'normal' | 'near_due' | 'overdue'
  amenities?: string[]
  // Tenant details
  tenantName?: string
  tenantPhone?: string
  tenantIdCard?: string
  tenantGender?: 'male' | 'female'
  hasPets?: boolean
  // New features
  remark?: string
  smsReminder?: boolean
  // New lease fields
  rent?: number
  deposit?: number
  paymentType?: string // e.g., '押一付一'
  checkInDate?: string
  leaseEndDate?: string
  activeLeaseId?: number
  raw?: any
}

interface FloorData {
  floor: number
  rooms: Room[]
}

const buildingData = ref<Record<string, FloorData[]>>({})
const propertiesList = ref<any[]>([])

const fetchBuildingData = async () => {
  isLoading.value = true
  try {
    const propsRes = await getProperties()
    if (propsRes.code === 0) {
      propertiesList.value = propsRes.data
      if (propertiesList.value.length > 0 && !selectedBlock.value) {
        selectedBlock.value = propertiesList.value[0].id.toString()
      }
    }

    const roomsRes = await getRooms({ pageSize: -1 })
    if (roomsRes.code === 0 && roomsRes.data) {
      const allRooms = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data.list || [])
      const grouped: Record<string, Record<number, Room[]>> = {}
      
      allRooms.forEach((r: any) => {
        const pId = r.propertyId.toString()
        if (!grouped[pId]) grouped[pId] = {}
        if (!grouped[pId][r.floor]) grouped[pId][r.floor] = []
        
        const activeLease = r.contracts?.find((c: any) => c.status === 1)
        grouped[pId][r.floor].push({
          id: r.id.toString(),
          number: r.roomNumber,
          area: r.area?.toString() || '0',
          status: r.status === 1 ? 'occupied' : r.status === 2 ? 'maintenance' : 'vacant',
          type: r.roomType || (r.towards ? `${r.towards}向` : '标准间'),
          isManaged: true,
          rent: r.rentPrice / 100,
          deposit: r.standardDeposit / 100,
          paymentType: r.paymentType,
          amenities: r.tags ? r.tags.split(',') : [],
          tenantName: activeLease?.customer?.name,
          tenantPhone: activeLease?.customer?.phone,
          tenantIdCard: activeLease?.customer?.idCard,
          activeLeaseId: activeLease?.id,
          raw: r, // Keep raw for modal
          paymentStatus: 'normal'
        })
      })

      // Convert to FloorData[] format
      const finalData: Record<string, FloorData[]> = {}
      Object.keys(grouped).forEach(pId => {
        const floors = Object.keys(grouped[pId]).map(f => ({
          floor: parseInt(f),
          rooms: grouped[pId][parseInt(f)].sort((a, b) => a.number.localeCompare(b.number))
        })).sort((a, b) => b.floor - a.floor)
        finalData[pId] = floors
      })
      
      buildingData.value = finalData
    }
  } catch (error: any) {
    showToast(error.message || '加载房源数据失败', 'error')
  } finally {
    isLoading.value = false
  }
}

// onMounted is now defined below

const currentRooms = computed(() => buildingData.value[selectedBlock.value] || [])

const getStatusClass = (room: Room) => {
  if (!room.isManaged) return 'status-unmanaged'
  if (room.status === 'occupied') {
    return {
      'status-occupied': true,
      'pay-normal': room.paymentStatus === 'normal',
      'pay-warning': room.paymentStatus === 'near_due',
      'pay-danger': room.paymentStatus === 'overdue'
    }
  }
  return {
    'status-vacant': room.status === 'vacant',
    'status-maintenance': room.status === 'maintenance'
  }
}

const openRoomDetail = (room: Room) => {
  if (isEditMode.value) {
    toggleRoomSelection(room.id)
    return
  }
  if (!room.isManaged) return
  selectedRoom.value = room
  isDrawerOpen.value = true
  isDrawerEditing.value = false
}

const startEditing = () => {
  tempRoomData.value = JSON.parse(JSON.stringify(selectedRoom.value))
  isDrawerEditing.value = true
}

const saveRoomDetail = async () => {
  if (!tempRoomData.value) return
  
  try {
    const data = {
      roomNumber: tempRoomData.value.number,
      area: tempRoomData.value.area,
      roomType: tempRoomData.value.type,
      rentPrice: Math.round((tempRoomData.value.rent || 0) * 100),
      standardDeposit: Math.round((tempRoomData.value.deposit || 0) * 100),
      paymentType: tempRoomData.value.paymentType,
      tags: tempRoomData.value.amenities?.join(','),
      status: tempRoomData.value.status === 'occupied' ? 1 : tempRoomData.value.status === 'maintenance' ? 2 : 0,
      remark: tempRoomData.value.remark
    }
    
    const res = await updateRoom(Number(tempRoomData.value.id), data)
    if (res.code === 0) {
      showToast('保存成功')
      isDrawerEditing.value = false
      fetchBuildingData()
    }
  } catch (error: any) {
    showToast(error.message || '保存失败', 'error')
  }
}

// Batch Editing Logic
const toggleRoomSelection = (roomId: string) => {
  if (selectedRoomIds.value.has(roomId)) {
    selectedRoomIds.value.delete(roomId)
  } else {
    selectedRoomIds.value.add(roomId)
  }
}

const toggleFloorSelection = (floorData: FloorData) => {
  const allSelected = floorData.rooms.every(r => selectedRoomIds.value.has(r.id))
  if (allSelected) {
    floorData.rooms.forEach(r => selectedRoomIds.value.delete(r.id))
  } else {
    floorData.rooms.forEach(r => selectedRoomIds.value.add(r.id))
  }
}

const batchManage = (managed: boolean) => {
  const block = buildingData.value[selectedBlock.value]
  block.forEach(floor => {
    floor.rooms.forEach(room => {
      if (selectedRoomIds.value.has(room.id)) {
        room.isManaged = managed
      }
    })
  })
  selectedRoomIds.value.clear()
}

const exitEditMode = () => {
  isEditMode.value = false
  selectedRoomIds.value.clear()
  activeApplyingTemplateId.value = null
}

const blockStats = computed(() => {
  const data = currentRooms.value
  let occupied = 0, vacant = 0, maintenance = 0, unmanaged = 0
  let payNormal = 0, payWarning = 0, payDanger = 0
  data.forEach(f => {
    f.rooms.forEach(r => {
      if (!r.isManaged) unmanaged++
      else if (r.status === 'occupied') {
        occupied++
        if (r.paymentStatus === 'normal') payNormal++
        else if (r.paymentStatus === 'near_due') payWarning++
        else payDanger++
      }
      else if (r.status === 'vacant') vacant++
      else maintenance++
    })
  })
  return { occupied, vacant, maintenance, unmanaged, payNormal, payWarning, payDanger, total: 560 }
})

// Payment Logic
const isPaymentModalOpen = ref(false)
const paymentAmount = ref(0)
const paymentNote = ref('')
const drawerWidth = ref(420)

const startResize = (e: MouseEvent) => {
  const startX = e.clientX
  const startWidth = drawerWidth.value
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    const diff = startX - moveEvent.clientX
    drawerWidth.value = Math.max(380, Math.min(1000, startWidth + diff))
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'default'
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor = 'ew-resize'
}

const handleOverlayClick = () => {
  // 保持开启，防止误触关闭丢失数据。仅能通过关闭按钮关闭。
  return
}

const openPayment = () => {
  paymentAmount.value = selectedRoom.value.rent || 0
  paymentNote.value = ''
  isPaymentModalOpen.value = true
}

const confirmPayment = () => {
  if (paymentAmount.value >= (selectedRoom.value.rent || 0)) {
    selectedRoom.value.paymentStatus = 'normal'
  } else {
    selectedRoom.value.paymentStatus = 'near_due' // Still owes some
  }
  
  // Sync back to buildingData
  const block = buildingData.value[selectedBlock.value]
  for (const floor of block) {
    const roomIndex = floor.rooms.findIndex(r => r.id === selectedRoom.value.id)
    if (roomIndex !== -1) {
      floor.rooms[roomIndex] = { ...selectedRoom.value }
      break
    }
  }
  
  isPaymentModalOpen.value = false
  showToast(`已确认收租 ¥${paymentAmount.value}。${paymentAmount.value < selectedRoom.value.rent ? '金额不足，已标记为待继续缴费。' : '本期已清。'}`)
}

// Template Logic
const isTemplateModalOpen = ref(false)

const applyTemplate = (tpl: any) => {
  tempRoomData.value.type = tpl.type
  tempRoomData.value.area = tpl.area
  tempRoomData.value.rent = tpl.rent
  tempRoomData.value.deposit = tpl.deposit
  tempRoomData.value.paymentType = tpl.paymentType
  tempRoomData.value.amenities = [...tpl.amenities]
  isTemplateModalOpen.value = false
  showToast(`已应用模板 "${tpl.name}"`)
}

onMounted(async () => {
  await fetchBuildingData()
  
  // Logic for batch apply from Template View
  if (activeApplyingTemplateId.value) {
    // Ensure templates are loaded if not already
    if (propertyTemplates.value.length === 0) {
      await fetchTemplates()
    }
    
    const tpl = propertyTemplates.value.find(t => t.id.toString() === activeApplyingTemplateId.value?.toString())
    if (tpl) {
      isEditMode.value = true
      setTimeout(() => {
        showToast(`已载入模板 "${tpl.name}"。请勾选想要应用的房间，然后点击底部“确认批量应用”。`, 'info')
      }, 500)
    }
  }
})

const batchApplyTemplate = async () => {
  const tplId = activeApplyingTemplateId.value
  if (!tplId || selectedRoomIds.value.size === 0) return
  
  const roomIds = Array.from(selectedRoomIds.value).map(id => Number(id))
  const success = await applyTemplateToRooms(tplId, roomIds)
  
  if (success) {
    activeApplyingTemplateId.value = null
    selectedRoomIds.value.clear()
    isEditMode.value = false
    fetchBuildingData()
  }
}

const toggleSmsQuick = () => {
  if (!selectedRoom.value) return
  selectedRoom.value.smsReminder = !selectedRoom.value.smsReminder
  // ... rest of logic
}

const openLease = () => {
  showLeaseModal.value = true
}

const handleTerminateLease = async () => {
  if (!selectedRoom.value?.activeLeaseId) return
  if (!confirm(`确认要为 ${selectedRoom.value.number} 办理退租吗？将终止当前合同。`)) return
  
  try {
    const res = await terminateLease(selectedRoom.value.activeLeaseId)
    if (res.code === 0) {
      showToast('退租办理成功', 'success')
      isDrawerOpen.value = false
      fetchBuildingData()
    }
  } catch (error: any) {
    showToast(error.message || '操作失败', 'error')
  }
}
</script>

<template>
  <div class="building-grid-view" :class="{ 'edit-mode-active': isEditMode }">
    <div class="view-header">
      <div class="header-left">
        <div class="title-row">
          <h2>房态图看板 <span class="muted">秀湖花苑</span></h2>
          <div class="mode-badge" v-if="isEditMode">
            <Edit3 :size="14" /> 编辑模式
          </div>
        </div>
        <div class="controls-row">
          <div class="block-selector">
            <button 
              v-for="p in propertiesList" 
              :key="p.id"
              :class="{ active: selectedBlock === p.id.toString() }" 
              @click="selectedBlock = p.id.toString()"
            >
              {{ p.name }}
            </button>
          </div>
          <button v-if="!isEditMode" class="edit-toggle-btn" @click="isEditMode = true">
            <Edit3 :size="16" /> 批量编辑房源
          </button>
          <div v-else class="edit-actions">
            <span class="selection-count">已选 {{ selectedRoomIds.size }} 间</span>
            <button class="action-btn manage" @click="batchManage(true)">
              <Eye :size="16" /> 设为管理
            </button>
            <button class="action-btn unmanage" @click="batchManage(false)">
              <EyeOff :size="16" /> 设为非管理
            </button>
            <div class="divider-v"></div>
            <button v-if="activeApplyingTemplateId" class="save-btn batch-tpl-btn" @click="batchApplyTemplate">
               确认批量应用模板
            </button>
            <button class="save-btn" @click="exitEditMode">
              <Check :size="16" /> 完成
            </button>
          </div>
        </div>
      </div>
      
      <div class="legend-stats glass">
        <div class="stat-item"><span class="dot normal"></span> 履约中 {{ blockStats.payNormal }}</div>
        <div class="stat-item"><span class="dot warning"></span> 待缴费 {{ blockStats.payWarning }}</div>
        <div class="stat-item"><span class="dot overdue"></span> 已逾期 {{ blockStats.payDanger }}</div>
        <div class="divider-v"></div>
        <div class="stat-item"><span class="dot vacant"></span> 待租 {{ blockStats.vacant }}</div>
        <div class="stat-item"><span class="dot maintenance"></span> 维修 {{ blockStats.maintenance }}</div>
        <div class="stat-item unmanaged"><span class="dot unmanaged"></span> 非业主 {{ blockStats.unmanaged }}</div>
      </div>
    </div>

    <div class="grid-container-wrapper glass">
      <div class="grid-scroll-area">
        <table class="building-table">
          <thead>
            <tr>
              <th class="floor-col-header">楼层</th>
              <th v-for="n in 28" :key="n" class="room-col-header">{{ n < 10 ? '0' + n : n }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="floorData in currentRooms" :key="floorData.floor" class="floor-row">
              <td class="floor-label" :class="{ 'clickable': isEditMode }" @click="isEditMode && toggleFloorSelection(floorData)">
                <div class="floor-tag">
                  <div v-if="isEditMode" class="checkbox-ui" :class="{ checked: floorData.rooms.every(r => selectedRoomIds.has(r.id)) }"></div>
                  {{ floorData.floor }}F
                </div>
              </td>
              <td v-for="room in floorData.rooms" :key="room.id" class="room-cell-wrapper">
                <div 
                  class="room-cell" 
                  :class="[getStatusClass(room), { selected: selectedRoomIds.has(room.id) }]"
                  @click="openRoomDetail(room)"
                >
                  <span class="room-num">{{ room.number }}</span>
                  <span class="room-area">{{ room.area }}㎡</span>
                  
                  <div v-if="isEditMode" class="edit-overlay">
                    <div class="checkbox-ui" :class="{ checked: selectedRoomIds.has(room.id) }"></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Room Detail Drawer (Reuse) -->
    <div v-if="isDrawerOpen" class="drawer-overlay" @click="handleOverlayClick">
      <div 
        class="detail-drawer glass animate-slide-left" 
        :style="{ width: drawerWidth + 'px' }"
        @click.stop
      >
        <div class="resize-info" v-if="drawerWidth > 450">
          已进入固定模式（点击遮罩层不再关闭）
        </div>
        <div class="resize-handle" @mousedown="startResize"></div>
        <div class="drawer-header">
          <div class="room-title">
            <span class="room-num-badge" :class="getStatusClass(selectedRoom)">{{ selectedRoom.number }}</span>
            <div class="title-meta">
              <h3>房源详情</h3>
              <span class="location-tag">{{ selectedBlock }}号楼 · {{ selectedRoom.type }}</span>
            </div>
          </div>
          <div class="header-right-btns">
            <button 
              class="icon-btn star-toggle" 
              :class="{ 'is-active': followedPropertyIds.has(selectedRoom.id) }"
              @click="toggleFollowProperty(selectedRoom.id)"
              :title="followedPropertyIds.has(selectedRoom.id) ? '取消关注' : '加入关注清单'"
            >
              <Star :size="20" :fill="followedPropertyIds.has(selectedRoom.id) ? 'var(--accent-warning)' : 'none'" />
            </button>
            <button class="close-btn" @click="isDrawerOpen = false"><X :size="20" /></button>
          </div>
        </div>

        <div class="drawer-body">
          <div v-if="!isDrawerEditing" class="top-action-group">
            <button v-if="selectedRoom.status === 'occupied'" class="pay-rent-btn action-item" @click="openPayment">
              <Wallet :size="16" /> 登记本月收租
            </button>
            <button v-if="selectedRoom.status === 'vacant'" class="pay-rent-btn action-item primary" @click="openLease">
              <LogIn :size="16" /> 办理签约入住
            </button>
            <button v-if="selectedRoom.status === 'occupied'" class="pay-rent-btn action-item danger" @click="handleTerminateLease">
              <LogOut :size="16" /> 办理退租
            </button>
          </div>

          <!-- View Mode -->
          <template v-if="!isDrawerEditing">
            <!-- Stats Row -->
            <div class="drawer-stats-grid">
              <div class="d-stat">
                <span class="d-label">月租金</span>
                <span class="d-val highlight">¥{{ selectedRoom.rent?.toLocaleString() }}</span>
              </div>
              <div class="d-stat">
                <span class="d-label">当前状态</span>
                <span class="d-val" :class="selectedRoom.paymentStatus">
                  {{ selectedRoom.paymentStatus === 'normal' ? '正常履约' : selectedRoom.paymentStatus === 'near_due' ? '待缴费' : '已逾期' }}
                </span>
              </div>
            </div>

            <section class="info-group">
              <div class="group-header">
                <h4>租约信息</h4>
                <button class="edit-link" @click="startEditing"><Edit3 :size="14" /> 编辑</button>
              </div>
              <div class="kv-list">
                <div class="kv-item">
                  <span class="k">租赁模式</span>
                  <span class="v">{{ selectedRoom.paymentType || '未设置' }}</span>
                </div>
                <div class="kv-item">
                  <span class="k">起租日期</span>
                  <span class="v">{{ selectedRoom.checkInDate || '待入驻' }}</span>
                </div>
                <div class="kv-item">
                  <span class="k">到期日期</span>
                  <span class="v" :class="{ 'warning': true }">{{ selectedRoom.leaseEndDate || '待定' }}</span>
                </div>
                <div class="kv-item">
                  <span class="k">押金金额</span>
                  <span class="v">¥{{ selectedRoom.deposit?.toLocaleString() || '0' }}</span>
                </div>
              </div>
            </section>
            
            <section class="info-group" v-if="selectedRoom.status === 'occupied'">
              <div class="group-header">
                <h4>租客信息</h4>
              </div>
              <div class="tenant-card-rich">
                <div class="t-main">
                  <div class="t-avatar" :class="selectedRoom.tenantGender">{{ selectedRoom.tenantName?.charAt(0) || '?' }}</div>
                  <div class="t-details">
                    <span class="t-name">
                      {{ selectedRoom.tenantName || '未知租客' }}
                      <span class="gender-tag" :class="selectedRoom.tenantGender">
                        {{ selectedRoom.tenantGender === 'male' ? '♂' : '♀' }}
                      </span>
                    </span>
                    <span class="t-tag">主承租人 · {{ selectedRoom.hasPets ? '有宠物' : '无宠物' }}</span>
                  </div>
                </div>
                <div class="t-contact">
                  <a :href="'tel:' + selectedRoom.tenantPhone" class="contact-btn">
                    <Phone :size="14" /> {{ selectedRoom.tenantPhone || '暂无号码' }}
                  </a>
                  <span class="t-identity">身份证 {{ selectedRoom.tenantIdCard || '未登记' }}</span>
                </div>
                <!-- Quick SMS Toggle -->
                <div class="sms-quick-toggle" :class="{ active: selectedRoom.smsReminder }" @click="toggleSmsQuick">
                  <div class="sms-label">
                    <span class="dot-indicator" v-if="selectedRoom.smsReminder"></span>
                    到期短信提醒
                  </div>
                  <div class="mini-switch" :class="{ on: selectedRoom.smsReminder }"></div>
                </div>
              </div>
            </section>

            <section class="info-group">
              <div class="group-header">
                <h4>房源备注</h4>
              </div>
              <div class="remark-content">
                {{ selectedRoom.remark || '暂无备注信息' }}
              </div>
            </section>

            <section class="info-group">
              <div class="group-header">
                <h4>房源配套</h4>
              </div>
              <div class="amenities-grid">
                <div class="amen-item active">空调</div>
                <div class="amen-item active">洗衣机</div>
                <div class="amen-item active">热水器</div>
                <div class="amen-item active">宽带</div>
                <div class="amen-item">冰箱</div>
              </div>
            </section>
          </template>

          <!-- Edit Mode -->
          <template v-else>
            <div class="edit-scroll-area">
              <section class="edit-section">
                <h4 class="edit-title">租客管理</h4>
                <div class="input-wrap">
                  <label>姓名</label>
                  <input v-model="tempRoomData.tenantName" type="text" placeholder="录入租客姓名" />
                </div>
                <div class="edit-grid mt-3">
                  <div class="input-wrap">
                    <label>性别</label>
                    <div class="radio-pill-group">
                      <button :class="{ active: tempRoomData.tenantGender === 'male' }" @click="tempRoomData.tenantGender = 'male'">男</button>
                      <button :class="{ active: tempRoomData.tenantGender === 'female' }" @click="tempRoomData.tenantGender = 'female'">女</button>
                    </div>
                  </div>
                  <div class="input-wrap">
                    <label>宠物</label>
                    <div class="radio-pill-group">
                      <button :class="{ active: tempRoomData.hasPets }" @click="tempRoomData.hasPets = true">有</button>
                      <button :class="{ active: !tempRoomData.hasPets }" @click="tempRoomData.hasPets = false">无</button>
                    </div>
                  </div>
                </div>
                <div class="edit-grid mt-3">
                  <div class="input-wrap">
                    <label>手机号</label>
                    <input v-model="tempRoomData.tenantPhone" type="tel" placeholder="138..." />
                  </div>
                  <div class="input-wrap">
                    <label>身份证号</label>
                    <input v-model="tempRoomData.tenantIdCard" type="text" placeholder="身份证号" />
                  </div>
                </div>
              </section>

              <section class="edit-section">
                <div class="edit-header-row">
                  <h4 class="edit-title">房源配置</h4>
                  <button class="template-apply-btn" @click="isTemplateModalOpen = true">
                    <Copy :size="14" /> 从模板导入
                  </button>
                </div>
                <div class="edit-grid">
                  <div class="input-wrap">
                    <label>房号</label>
                    <input v-model="tempRoomData.number" type="text" />
                  </div>
                  <div class="input-wrap">
                    <label>面积 (㎡)</label>
                    <input v-model="tempRoomData.area" type="number" step="0.01" />
                  </div>
                </div>
                <div class="input-wrap mt-3">
                  <label>房屋类型</label>
                  <select v-model="tempRoomData.type">
                    <option value="标准间">标准间</option>
                    <option value="大套间">大套间</option>
                    <option value="三室两厅">三室两厅</option>
                  </select>
                </div>
              </section>

              <section class="edit-section">
                <h4 class="edit-title">商务条款</h4>
                <div class="edit-grid">
                  <div class="input-wrap">
                    <label>月租金 (元)</label>
                    <input v-model="tempRoomData.rent" type="number" />
                  </div>
                  <div class="input-wrap">
                    <label>押金 (元)</label>
                    <input v-model="tempRoomData.deposit" type="number" />
                  </div>
                </div>
                <div class="input-wrap mt-3">
                  <label>支付方式</label>
                  <div class="radio-pill-group">
                    <button 
                      v-for="p in ['押一付一', '押一付三', '半年付', '年付']" 
                      :key="p"
                      :class="{ active: tempRoomData.paymentType === p }"
                      @click="tempRoomData.paymentType = p"
                    >
                      {{ p }}
                    </button>
                  </div>
                </div>
                <div class="input-wrap mt-3">
                  <div class="switch-row" @click="tempRoomData.smsReminder = !tempRoomData.smsReminder">
                    <label>到期短信自动提醒</label>
                    <div class="switch" :class="{ on: tempRoomData.smsReminder }"></div>
                  </div>
                </div>
              </section>

              <section class="edit-section">
                <h4 class="edit-title">备注说明</h4>
                <div class="input-wrap">
                  <textarea v-model="tempRoomData.remark" class="full-remark" placeholder="录入关于房源或租客的备注信息..."></textarea>
                </div>
              </section>

              <section class="edit-section">
                <h4 class="edit-title">租期设置</h4>
                <div class="edit-grid">
                  <div class="input-wrap">
                    <label>起租日期</label>
                    <input v-model="tempRoomData.checkInDate" type="date" />
                  </div>
                  <div class="input-wrap">
                    <label>到期日期</label>
                    <input v-model="tempRoomData.leaseEndDate" type="date" />
                  </div>
                </div>
              </section>

              <section class="edit-section">
                <h4 class="edit-title">状态更新</h4>
                <div class="status-selector-grid">
                  <button 
                    v-for="s in (['vacant', 'occupied', 'maintenance'] as const)" 
                    :key="s"
                    class="status-pill"
                    :class="[s, { active: tempRoomData.status === s }]"
                    @click="tempRoomData.status = s"
                  >
                    {{ s === 'vacant' ? '待租' : s === 'occupied' ? '已租' : '维修' }}
                  </button>
                </div>
              </section>
            </div>
            
            <div class="drawer-footer-sticky">
              <button class="btn-cancel" @click="isDrawerEditing = false">丢弃更改</button>
              <button class="btn-save" @click="saveRoomDetail">确认保存</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Template Selection Modal -->
  <div v-if="isTemplateModalOpen" class="modal-overlay">
    <div class="template-select-dialog glass card-animate-in">
      <div class="dialog-header border-none">
        <h3>选择配置模板</h3>
        <button class="close-btn" @click="isTemplateModalOpen = false"><X :size="18" /></button>
      </div>
      <div class="template-list-compact">
        <div 
          v-for="tpl in propertyTemplates" 
          :key="tpl.id" 
          class="tpl-item-compact"
          @click="applyTemplate(tpl)"
        >
          <div class="tpl-item-main">
            <span class="tpl-name-compact">{{ tpl.name }}</span>
            <span class="tpl-meta-compact">{{ tpl.type }} | ¥{{ tpl.rent }}/月</span>
          </div>
          <ChevronRight :size="16" color="var(--text-muted)" />
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Payment Dialog -->
  <div v-if="isPaymentModalOpen" class="payment-modal-overlay">
    <div class="payment-dialog glass card-animate-in">
      <div class="dialog-header">
        <h3>确认收租记录</h3>
        <button @click="isPaymentModalOpen = false"><X :size="18"/></button>
      </div>
      <div class="dialog-body">
        <div class="payment-summary">
          <div class="summary-item">
            <span class="label">本月应收</span>
            <span class="val">¥{{ selectedRoom.rent }}</span>
          </div>
          <div class="status-indicator" :class="paymentAmount >= selectedRoom.rent ? 'full' : 'partial'">
            {{ paymentAmount >= selectedRoom.rent ? '足额缴纳' : '部分补缴' }}
          </div>
        </div>
        
        <div class="form-item">
          <label>实收金额 (元)</label>
          <div class="amount-input-group">
            <span class="currency">¥</span>
            <input v-model="paymentAmount" type="number" step="0.01" />
          </div>
          <div class="preset-amounts">
            <button @click="paymentAmount = selectedRoom.rent">足额</button>
            <button @click="paymentAmount = Math.floor(selectedRoom.rent / 2)">50%</button>
          </div>
        </div>
        
        <div class="form-item mt-3">
          <label>备注</label>
          <textarea v-model="paymentNote" placeholder="可选填，如：微信转账、现金等"></textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn-cancel-plain" @click="isPaymentModalOpen = false">取消</button>
        <button class="btn-confirm-pay" @click="confirmPayment">确认录入</button>
      </div>
    </div>
  </div>

  <!-- AI Assistant -->
  <AIAssistant :data="blockStats" />

  <LeaseModal 
    :show="showLeaseModal" 
    :room="selectedRoom?.raw" 
    @close="showLeaseModal = false" 
    @success="fetchBuildingData(); isDrawerOpen = false" 
  />
</template>

<style scoped>
.building-grid-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: calc(100vh - 160px);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.mode-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.block-selector {
  display: flex;
  background: var(--bg-input);
  padding: 0.25rem;
  border-radius: 8px;
}

.block-selector button {
  padding: 0.4rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.block-selector button:hover:not(.active) {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-primary);
}

.block-selector button.active {
  background: var(--accent-primary);
  color: white;
}

.edit-toggle-btn {
  background: var(--bg-input);
  color: var(--text-secondary);
  padding: 0.4rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
}

.edit-toggle-btn:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-input);
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  border: 1px dashed var(--accent-primary);
}

.selection-count {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0.5rem;
}

.action-btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.action-btn.manage { color: var(--accent-success); background: rgba(16, 185, 129, 0.1); transition: all 0.2s; }
.action-btn.manage:hover { background: var(--accent-success); color: white; }
.action-btn.unmanage { color: var(--text-muted); background: var(--bg-input); transition: all 0.2s; }
.action-btn.unmanage:hover { background: var(--text-muted); color: white; }

.save-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.legend-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
  font-weight: 600;
  max-width: 100%;
  flex-wrap: wrap;
}

.stat-item { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
.stat-item.unmanaged { color: var(--text-muted); }

.dot { width: 8px; height: 8px; border-radius: 2px; }
.dot.normal { background: var(--accent-success); }
.dot.warning { background: var(--accent-warning); }
.dot.overdue { background: var(--accent-danger); }
.dot.vacant { background: transparent; border: 1px dashed var(--text-muted); }
.dot.maintenance { background: #7f1d1d; }
.dot.unmanaged { background: var(--status-unmanaged-bg); border: 1px solid var(--border-color); }

.grid-container-wrapper {
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  flex: 1;
  overflow: hidden;
  display: flex;
  min-width: 0;
  width: 100%;
}

.grid-scroll-area {
  overflow: auto;
  flex: 1;
  padding: 0 1rem 1rem 1rem;
  -webkit-overflow-scrolling: touch;
}

.building-table { 
  border-collapse: separate; 
  border-spacing: 4px; 
  table-layout: fixed;
  width: max-content;
}

.floor-col-header {
  width: 48px;
}

.room-col-header {
  width: 64px;
}

.building-table thead th {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--bg-main);
  padding: 1rem 0;
  font-size: 0.85rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}
.floor-tag {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--status-occupied-bg);
  color: var(--status-occupied-text);
  border-radius: 8px;
  font-weight: 800;
  position: relative;
}

.floor-label.clickable:hover .floor-tag {
  background: var(--accent-primary);
}

.room-cell {
  width: 64px;
  height: 42px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.status-occupied { background: var(--status-occupied-bg); color: var(--status-occupied-text); }
.pay-normal { background: var(--status-normal-bg); color: var(--text-primary); border: 1px solid var(--border-color); }
.pay-warning { background: var(--status-warning-bg); color: var(--text-primary); border: 1px solid var(--border-color); }
.pay-danger { background: var(--status-danger-bg); color: var(--text-primary); border: 1px solid var(--border-color); }

[data-theme='dark'] .pay-normal, 
[data-theme='dark'] .pay-warning, 
[data-theme='dark'] .pay-danger,
:root:not([data-theme='light']) .pay-normal,
:root:not([data-theme='light']) .pay-warning,
:root:not([data-theme='light']) .pay-danger {
  color: white;
}

.status-vacant { background: var(--status-vacant-bg); color: var(--status-vacant-text); border: 1px dashed var(--border-color); }
.status-maintenance { background: #7f1d1d; color: #fecaca; }
.status-unmanaged { 
  background: var(--status-unmanaged-bg); 
  color: var(--text-muted); 
  border: 1px solid var(--border-color);
  opacity: 0.4;
}

.room-cell.selected {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  transform: scale(0.95);
}

.room-num { font-size: 0.85rem; font-weight: 700; }
.room-area { font-size: 0.6rem; opacity: 0.7; }

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
}

.checkbox-ui {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transition: all 0.2s;
}

.checkbox-ui.checked {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.floor-tag .checkbox-ui {
  position: absolute;
  top: 4px;
  right: 4px;
}

/* Global .glass used from index.css */
.drawer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; }
/* Drawer Styles Upgraded */
.detail-drawer { 
  position: absolute; 
  top: 0; 
  right: 0; 
  height: 100%; 
  background: var(--bg-surface); 
  display: flex; 
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
  min-width: 380px;
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 10;
}

.resize-handle:hover {
  background: var(--accent-primary);
}

.resize-info {
  position: absolute;
  top: 10px;
  left: 20px;
  font-size: 0.65rem;
  background: var(--accent-primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  opacity: 0.8;
  pointer-events: none;
  z-index: 15;
}

.drawer-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.room-title {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.room-num-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.title-meta h3 { font-size: 1rem; margin-bottom: 2px; }
.location-tag { font-size: 0.75rem; color: var(--text-muted); }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drawer-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: var(--bg-input);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.d-stat { display: flex; flex-direction: column; gap: 4px; }
.d-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.d-val { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.d-val.highlight { color: var(--accent-success); font-family: 'Outfit', sans-serif; font-size: 1.4rem; }
.d-val.normal { color: #10b981; }
.d-val.near_due { color: #f59e0b; }
.d-val.overdue { color: #ef4444; }

.info-group { display: flex; flex-direction: column; gap: 1.25rem; }
.group-header { display: flex; justify-content: space-between; align-items: center; }
.group-header h4 { font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

.edit-link { font-size: 0.75rem; color: var(--accent-primary); display: flex; align-items: center; gap: 4px; font-weight: 600; }

.kv-list { display: flex; flex-direction: column; gap: 1rem; }
.kv-item { display: flex; justify-content: space-between; align-items: center; }
.k { font-size: 0.85rem; color: var(--text-muted); }
.v { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.v.warning { color: #f87171; }

.tenant-card-rich {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.t-main { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.t-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; }
.t-avatar.female { background: #ec4899; }
.t-avatar.male { background: #3b82f6; }
.t-details { display: flex; flex-direction: column; }
.t-name { font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.gender-tag { font-size: 0.8rem; font-weight: 800; }
.gender-tag.male { color: #3b82f6; }
.gender-tag.female { color: #ec4899; }
.t-tag { font-size: 0.65rem; background: var(--bg-input); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); width: fit-content; margin-top: 4px; }

.t-contact { display: flex; flex-direction: column; gap: 8px; }
.contact-btn { background: var(--bg-surface); color: var(--text-primary); font-size: 0.8rem; font-weight: 700; padding: 0.6rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none; border: 1px solid var(--border-color); }
.t-identity { font-size: 0.75rem; color: var(--text-muted); text-align: center; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px; }

.sms-quick-toggle {
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.sms-quick-toggle:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
}

.sms-quick-toggle.active {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
}

.sms-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sms-quick-toggle.active .sms-label {
  color: var(--text-primary);
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}

.top-action-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.action-item {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.action-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-item.primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.action-item.primary:hover {
  background: #4f46e5;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.action-item.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
}

.action-item.danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.mini-switch {
  width: 36px;
  height: 20px;
  background: var(--border-color);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--bg-surface);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mini-switch.on { background: var(--accent-primary); }
.mini-switch.on::after { left: 18px; }

.remark-content {
  background: var(--bg-input);
  padding: 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  white-space: pre-wrap;
}

.pay-rent-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #fff !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
}

.pay-rent-btn:hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
}

.pay-rent-btn.top-action {
  margin-bottom: -1rem;
}

.pay-rent-btn:hover { transform: translateY(-2px); }

.amenities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 8px; }
.amen-item { font-size: 0.7rem; padding: 6px; text-align: center; border-radius: 6px; background: var(--bg-input); color: var(--text-muted); border: 1px solid var(--border-color); }
.amen-item.active { border-color: rgba(99, 102, 241, 0.3); color: var(--accent-primary); background: rgba(99, 102, 241, 0.05); }

/* Edit Mode Styles */
.edit-scroll-area { display: flex; flex-direction: column; gap: 2rem; }
.edit-section { display: flex; flex-direction: column; gap: 1rem; }
.edit-title { font-size: 0.85rem; font-weight: 800; color: var(--accent-primary); border-left: 3px solid var(--accent-primary); padding-left: 10px; }

.edit-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-apply-btn {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(99, 102, 241, 0.05);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.template-apply-btn:hover { background: rgba(99, 102, 241, 0.1); }

.edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.input-wrap { display: flex; flex-direction: column; gap: 6px; }
.input-wrap label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
.input-wrap input, .input-wrap select, .input-wrap textarea { 
  background: var(--bg-input); 
  border: 1px solid var(--border-color); 
  padding: 0.85rem 1rem; 
  border-radius: 12px; 
  color: var(--text-primary); 
  font-size: 0.95rem; 
  outline: none; 
  transition: all 0.2s;
  width: 100%;
}
.input-wrap input:focus, .input-wrap select:focus, .input-wrap textarea:focus { 
  border-color: var(--accent-primary); 
  background: rgba(99, 102, 241, 0.06);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-wrap textarea {
  font-family: inherit;
  line-height: 1.6;
}

.mt-3 { margin-top: 0.75rem; }

.radio-pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
.radio-pill-group button { font-size: 0.75rem; padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border-color); color: var(--text-muted); transition: all 0.2s; }
.radio-pill-group button.active { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }

.status-selector-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.status-pill { padding: 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-muted); }
.status-pill.active.vacant { background: var(--accent-success); color: #fff; }
.status-pill.active.occupied { background: #475569; color: #fff; }
.status-pill.active.maintenance { background: var(--accent-danger); color: #fff; }

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-input);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.switch {
  width: 44px;
  height: 24px;
  background: var(--border-color);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--bg-surface);
  border-radius: 50%;
  transition: all 0.3s;
}

.switch.on { background: var(--accent-primary); }
.switch.on::after { left: 22px; }

.full-remark {
  min-height: 120px;
  resize: vertical;
}

.drawer-footer-sticky { margin-top: auto; padding-top: 2rem; display: flex; gap: 1rem; position: sticky; bottom: 0; background: var(--bg-surface); }
.btn-cancel { flex: 1; padding: 1rem; border-radius: 12px; background: rgba(255,255,255,0.05); color: var(--text-secondary); font-weight: 700; }
.btn-save { 
  flex: 2; 
  padding: 1rem; 
  border-radius: 12px; 
  background: var(--accent-primary); 
  color: #fff; 
  font-weight: 700; 
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); 
  transition: all 0.2s;
}

.btn-save:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.header-right-btns {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-toggle {
  color: var(--text-muted);
  transition: all 0.3s;
}

.star-toggle:hover {
  color: var(--accent-warning);
  transform: scale(1.15);
}

.star-toggle.is-active {
  color: var(--accent-warning);
}

.close-btn { color: var(--text-muted); transition: color 0.2s; }
.close-btn:hover { color: var(--text-primary); }

/* Payment Modal */
.payment-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-dialog {
  width: 360px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.dialog-body { padding: 1.5rem; }

.payment-summary {
  background: var(--bg-input);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label { font-size: 0.7rem; color: var(--text-muted); display: block; }
.summary-item .val { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }

.status-indicator { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; }
.status-indicator.full { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.status-indicator.partial { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

.amount-input-group {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0 1rem;
  margin-top: 8px;
}
.amount-input-group:focus-within { border-color: var(--accent-primary); }
.currency { font-weight: 700; color: var(--text-muted); }
.amount-input-group input { background: transparent; border: none; outline: none; padding: 0.8rem; color: var(--text-primary); font-size: 1.1rem; width: 100%; font-weight: 700; }

.preset-amounts { display: flex; gap: 8px; margin-top: 10px; }
.preset-amounts button { font-size: 0.7rem; background: rgba(255,255,255,0.05); color: var(--text-secondary); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-color); }

.dialog-body textarea {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.8rem;
  color: var(--text-primary);
  resize: none;
  height: 80px;
  margin-top: 8px;
}

.dialog-footer { padding: 1.25rem; display: flex; gap: 10px; background: var(--bg-input); }
.btn-cancel-plain { flex: 1; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
.btn-confirm-pay { 
  flex: 2; 
  background: var(--accent-primary); 
  color: #fff; 
  padding: 0.8rem; 
  border-radius: 10px; 
  font-weight: 700; 
  transition: all 0.2s;
}

.btn-confirm-pay:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.card-animate-in {
  animation: cardScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardScaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}


/* Template Modal Compact */
.template-select-dialog {
  width: 440px;
  border-radius: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  padding-bottom: 1rem;
}

.border-none { border-bottom: none !important; }

.template-list-compact {
  padding: 0 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tpl-item-compact {
  padding: 1.5rem;
  background: var(--bg-input);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tpl-item-compact:hover {
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tpl-item-main { display: flex; flex-direction: column; gap: 4px; }
.tpl-name-compact { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
.tpl-meta-compact { font-size: 0.75rem; color: var(--text-muted); }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar Style */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
</style>
