<template>
  <teleport to="body">
    <div v-if="isOpen" class="app-overlay" @click.self="close">
      <div class="app-panel" :style="panelStyle" ref="panelRef" role="dialog" aria-modal="true">
        <header class="app-header" ref="headerRef">
          <div class="app-title-row">
            <IconRenderer v-if="icon" :icon="icon" :size="14" />
            <div class="app-title">{{ effectiveTitle }}</div>
          </div>
          <div class="app-header-controls">
            <button
              v-if="canScrollUp"
              class="nav-button header"
              @click="scrollBy(-1)"
              aria-label="Scroll up"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button
              v-if="canScrollDown"
              class="nav-button header"
              @click="scrollBy(1)"
              aria-label="Scroll down"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="app-close" @click="close" aria-label="Close">×</button>
          </div>
        </header>
        <div class="app-body" ref="bodyRef" @scroll="updateScrollState">
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const headerRef = ref(null)
const bodyRef = ref(null)

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
  const panelCfg = props.panel || {}
  const gw =
    panelCfg.gridWidth != null
      ? Number(panelCfg.gridWidth)
      : panelCfg.width != null && Number(panelCfg.width) <= columns
        ? Number(panelCfg.width)
        : null
  const gh =
    panelCfg.gridHeight != null
      ? Number(panelCfg.gridHeight)
      : panelCfg.height != null && Number(panelCfg.height) <= rows
        ? Number(panelCfg.height)
        : null
  const availableW = window.innerWidth - padding * 2
  const availableH = window.innerHeight - padding * 2
  const colWidth = (availableW - gap * (columns - 1)) / columns
  const rowHeight = (availableH - gap * (rows - 1)) / rows
  const desiredWidth = gw ? Math.max(colWidth * gw + gap * (gw - 1), 320) : null
  const desiredMaxHeight = gh ? Math.max(rowHeight * gh + gap * (gh - 1), 200) : null

  const widthOverridePx =
    panelCfg.width != null && Number(panelCfg.width) > columns ? Number(panelCfg.width) : null
  const maxHeightOverridePx = panelCfg.maxHeight != null ? Number(panelCfg.maxHeight) : null

  const baseWidth = desiredWidth || widthOverridePx || 520
  const baseMax = desiredMaxHeight || maxHeightOverridePx || Math.min(window.innerHeight * 0.6, 420)
  const width = Math.min(window.innerWidth - 2 * margin, baseWidth)
  const maxCap = Math.min(window.innerHeight - 2 * margin, baseMax)

  try {
    console.log('[AppProviderPanel] sizing', {
      panel: props.panel,
      grid: { columns, rows, gap, padding },
      computed: {
        desiredWidth,
        desiredMaxHeight,
        widthOverridePx,
        maxHeightOverridePx,
        width,
        maxCap,
      },
    })
  } catch {
    /* ignore */
  }
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
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    maxHeight: `${maxHeight}px`,
    transform,
    '--panel-max-height': `${maxHeight}px`,
  }
})

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}

const close = () => emit('close')

const setHeaderHeightVar = () => {
  const panelEl = panelRef.value
  const headerEl = headerRef.value
  if (!panelEl || !headerEl) return
  const h = Math.ceil(headerEl.getBoundingClientRect().height)
  panelEl.style.setProperty('--panel-header-height', `${h}px`)
}

onMounted(() => {
  console.log('[AppProviderPanel] mounted', {
    provider: props.provider,
    providerProps: props.providerProps,
    anchorRect: props.anchorRect,
  })
  window.addEventListener('keydown', onKey)
  nextTick(updateScrollState)
  nextTick(setHeaderHeightVar)
  window.addEventListener('resize', setHeaderHeightVar)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', setHeaderHeightVar)
})

watch(
  () => props.provider,
  (p) => {
    console.log('[AppProviderPanel] provider changed →', p)
  },
)

const canScrollUp = ref(false)
const canScrollDown = ref(false)
const updateScrollState = () => {
  const el = bodyRef.value
  if (!el) return
  canScrollUp.value = el.scrollTop > 0
  canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1
}
const scrollBy = (dir) => {
  const el = bodyRef.value
  if (!el) return
  const amount = Math.round(el.clientHeight * 0.9)
  el.scrollTo({ top: el.scrollTop + dir * amount, behavior: 'smooth' })
  setTimeout(updateScrollState, 300)
}
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
.app-header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-button.header {
  background: transparent;
  border: none;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
}
.nav-button.header:hover {
  opacity: 1;
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
  /* Fill remaining height under header to ensure scroll area exists on iPad */
  max-height: calc(var(--panel-max-height, 60vh) - var(--panel-header-height, 40px));
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
}
.app-body::-webkit-scrollbar {
  width: 6px;
}
.app-body::-webkit-scrollbar-track {
  background: transparent;
}
.app-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}
.app-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.app-fallback {
  padding: 8px;
  opacity: 0.9;
}
</style>
