<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Phone, Edit3, Check, Eye, EyeOff } from 'lucide-vue-next'

const selectedBlock = ref<'1' | '2'>('1')
const selectedRoom = ref<any>(null)
const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const selectedRoomIds = ref<Set<string>>(new Set())

// Room data structure with 'isManaged' flag
interface Room {
  id: string
  number: string
  area: string
  status: 'vacant' | 'occupied' | 'maintenance'
  type: string
  isManaged: boolean
}

interface FloorData {
  floor: number
  rooms: Room[]
}

// Generate mock room data
const generateRooms = (block: string) => {
  const floors: FloorData[] = []
  for (let f = 20; f >= 1; f--) {
    const floorRooms: Room[] = []
    for (let r = 1; r <= 28; r++) {
      const roomNum = `${f}${r < 10 ? '0' + r : r}`
      const random = Math.random()
      let status: 'vacant' | 'occupied' | 'maintenance' = 'occupied'
      if (random > 0.8) status = 'vacant'
      else if (random > 0.95) status = 'maintenance'
      
      floorRooms.push({
        id: `${block}-${roomNum}`,
        number: roomNum,
        area: (Math.random() * 40 + 60).toFixed(2),
        status,
        type: r % 4 === 0 ? '大套间' : '标准间',
        isManaged: Math.random() > 0.3 // Simulate that landlord owns ~70% of rooms
      })
    }
    floors.push({ floor: f, rooms: floorRooms })
  }
  return floors
}

// State management for building data
const buildingData = ref({
  '1': generateRooms('1'),
  '2': generateRooms('2')
})

const currentRooms = computed(() => buildingData.value[selectedBlock.value])

const getStatusClass = (room: Room) => {
  if (!room.isManaged) return 'status-unmanaged'
  return {
    'status-occupied': room.status === 'occupied',
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
}

const blockStats = computed(() => {
  const data = currentRooms.value
  let occupied = 0, vacant = 0, maintenance = 0, unmanaged = 0
  data.forEach(f => {
    f.rooms.forEach(r => {
      if (!r.isManaged) unmanaged++
      else if (r.status === 'occupied') occupied++
      else if (r.status === 'vacant') vacant++
      else maintenance++
    })
  })
  return { occupied, vacant, maintenance, unmanaged, total: 560 }
})
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
            <button :class="{ active: selectedBlock === '1' }" @click="selectedBlock = '1'">1号楼</button>
            <button :class="{ active: selectedBlock === '2' }" @click="selectedBlock = '2'">2号楼</button>
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
            <button class="save-btn" @click="exitEditMode">
              <Check :size="16" /> 完成
            </button>
          </div>
        </div>
      </div>
      
      <div class="legend-stats glass">
        <div class="stat-item"><span class="dot occupied"></span> 已租 {{ blockStats.occupied }}</div>
        <div class="stat-item"><span class="dot vacant"></span> 待租 {{ blockStats.vacant }}</div>
        <div class="stat-item"><span class="dot maintenance"></span> 维修 {{ blockStats.maintenance }}</div>
        <div class="stat-item unmanaged"><span class="dot unmanaged"></span> 非业主 {{ blockStats.unmanaged }}</div>
        <div class="divider-v"></div>
        <div class="stat-total">总计 560</div>
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
    <div v-if="isDrawerOpen" class="drawer-overlay" @click="isDrawerOpen = false">
      <div class="detail-drawer glass animate-slide-left" @click.stop>
        <div class="drawer-header">
          <div class="room-tag" :class="getStatusClass(selectedRoom)">
            {{ selectedRoom.number }}室
          </div>
          <button class="close-btn" @click="isDrawerOpen = false"><X :size="20" /></button>
        </div>
        <div class="drawer-body">
          <section class="info-section">
            <h3 class="section-title">房源信息</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">面积</span><span class="val">{{ selectedRoom.area }} ㎡</span></div>
              <div class="info-item">
                <span class="label">所属楼栋</span>
                <span class="val">{{ selectedBlock }}号楼</span>
              </div>
              <div class="info-item"><span class="label">户型</span><span class="val">{{ selectedRoom.type }}</span></div>
              <div class="info-item"><span class="label">状态</span><span class="val">{{ selectedRoom.isManaged ? '托管中' : '非业主' }}</span></div>
            </div>
          </section>
          
          <template v-if="selectedRoom.isManaged && selectedRoom.status === 'occupied'">
             <section class="info-section">
              <h3 class="section-title">当前租客</h3>
              <div class="tenant-mini-card">
                <div class="avatar">张</div>
                <div class="t-info">
                  <div class="t-name">张大壮</div>
                  <div class="t-phone"><Phone :size="12" /> 138-****-1234</div>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>
  </div>
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
  background: rgba(255, 255, 255, 0.05);
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

.block-selector button.active {
  background: var(--accent-primary);
  color: white;
}

.edit-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
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
  border-color: var(--accent-primary);
  color: white;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
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

.action-btn.manage { color: var(--accent-success); background: rgba(16, 185, 129, 0.1); }
.action-btn.unmanage { color: var(--text-muted); background: rgba(255, 255, 255, 0.05); }

.save-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
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
.dot.occupied { background: #475569; }
.dot.vacant { background: #10b981; }
.dot.maintenance { background: #ef4444; }
.dot.unmanaged { background: #1e293b; border: 1px solid #334155; }

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
  background: #111114;
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
  background: #334155;
  color: white;
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

.status-occupied { background: #475569; color: #cbd5e1; }
.status-vacant { background: #10b981; color: white; }
.status-maintenance { background: #ef4444; color: white; }
.status-unmanaged { 
  background: #111827; 
  color: #374151; 
  border: 1px solid #1f2937;
  opacity: 0.6;
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

.glass { background: rgba(17, 17, 20, 0.98); backdrop-filter: blur(20px); }
.drawer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; }
.detail-drawer { position: absolute; top: 0; right: 0; width: 360px; height: 100%; background: var(--bg-sidebar); padding: 2rem; }

/* Scrollbar Style */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
