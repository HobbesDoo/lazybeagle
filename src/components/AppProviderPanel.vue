<template>
  <teleport to="body">
    <div v-if="isOpen" class="app-overlay" @click.self="close">
      <div class="app-panel" :style="panelStyle" ref="panelRef" role="dialog" aria-modal="true">
        <header class="app-header">
          <div class="app-title-row">
            <IconRenderer v-if="icon" :icon="icon" :size="14" />
            <div class="app-title">{{ effectiveTitle }}</div>
          </div>
          <button class="app-close" @click="close" aria-label="Close">×</button>
        </header>
        <div class="app-body">
          <Suspense>
            <template #default>
              <component :is="resolvedComponent" v-bind="providerPropsWithService" @close="close" />
            </template>
            <template #fallback>
              <div class="app-fallback">Loading provider…</div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import configService from '../services/config.js'
import IconRenderer from './IconRenderer.vue'
import { getProviderComponent } from '../providers/registry.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  anchorRect: { type: Object, default: null },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  provider: { type: String, required: true },
  providerProps: { type: Object, default: () => ({}) },
  panel: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close'])
const panelRef = ref(null)

const providerLabel = computed(() => (props.provider || '').toString())

const resolvedComponent = computed(() => getProviderComponent(props.provider))

// Merge providerProps with service-level defaults (e.g., url, username, etc.)
const providerPropsWithService = computed(() => {
  const svc = configService.getServiceByType(props.provider) || {}
  const merged = {
    baseUrl: svc.url,
    username: svc.username || svc.user,
    password: svc.password,
    rpcPath: svc.rpc_path,
    ...(props.providerProps || {}),
  }
  return merged
})

const effectiveTitle = computed(() => {
  return props.providerProps?.description || props.title || providerLabel.value
})

const panelStyle = computed(() => {
  const rect = props.anchorRect
  const margin = 6
  const grid = configService.get('dashboard.grid') || { columns: 6, rows: 4, gap: 16, padding: 24 }
  const columns = Number(grid.columns) || 6
  const rows = Number(grid.rows) || 4
  const gap = Number(grid.gap) || 16
  const padding = Number(grid.padding) || 24

  // Support grid units for panel sizing
  const gw = Number(props.panel?.gridWidth) || null
  const gh = Number(props.panel?.gridHeight) || null
  const availableW = window.innerWidth - padding * 2
  const availableH = window.innerHeight - padding * 2
  const colWidth = (availableW - gap * (columns - 1)) / columns
  const rowHeight = (availableH - gap * (rows - 1)) / rows
  const desiredWidth = gw ? Math.max(colWidth * gw + gap * (gw - 1), 320) : null
  const desiredMaxHeight = gh ? Math.max(rowHeight * gh + gap * (gh - 1), 200) : null

  const widthOverridePx = Number(props.panel?.width) || null
  const maxHeightOverridePx = Number(props.panel?.maxHeight) || null

  const baseWidth = desiredWidth || widthOverridePx || 520
  const baseMax = desiredMaxHeight || maxHeightOverridePx || Math.min(window.innerHeight * 0.6, 420)
  const width = Math.min(window.innerWidth - 2 * margin, baseWidth)
  const maxCap = Math.min(window.innerHeight - 2 * margin, baseMax)
  let top = 80
  let maxHeight = maxCap
  let transform = 'translateY(0)'

  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const showBelow = spaceBelow >= spaceAbove

    if (showBelow) {
      top = rect.bottom + margin
      maxHeight = Math.min(maxCap, Math.max(160, spaceBelow))
      transform = 'translateY(0)'
    } else {
      top = rect.top - margin
      maxHeight = Math.min(maxCap, Math.max(160, spaceAbove))
      transform = 'translateY(-100%)'
    }
  }

  const left = Math.min(rect ? rect.left : margin, window.innerWidth - width - margin)
  return {
    top: `${Math.max(margin, top)}px`,
    left: `${Math.max(margin, left)}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    transform,
  }
})

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}

const close = () => emit('close')

onMounted(() => {
  console.log('[AppProviderPanel] mounted', {
    provider: props.provider,
    providerProps: props.providerProps,
    anchorRect: props.anchorRect,
  })
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})

watch(
  () => props.provider,
  (p) => {
    console.log('[AppProviderPanel] provider changed →', p)
  },
)
</script>

<style scoped>
.app-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.app-panel {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  color: #fff;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.app-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.app-title {
  font-size: 0.8rem;
  font-weight: 600;
}

.app-close {
  background: transparent;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.app-body {
  display: block;
  padding: 8px;
  max-height: 60vh;
  overflow: auto;
}

.app-fallback {
  padding: 8px;
  opacity: 0.9;
}
</style>
