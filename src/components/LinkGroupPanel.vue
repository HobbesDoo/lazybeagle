<template>
  <teleport to="body">
    <div v-if="isOpen" class="lgp-overlay" @click.self="close">
      <div class="lgp-panel" :style="panelStyle" ref="panelRef" role="dialog" aria-modal="true">
        <header class="lgp-header" ref="headerRef">
          <div class="lgp-title-row">
            <IconRenderer v-if="icon" :icon="icon" :size="14" />
            <div class="lgp-title">{{ title || 'Links' }}</div>
          </div>
          <div class="lgp-header-controls">
            <button v-if="canScrollUp" class="nav-button header" @click="scrollBy(-1)" aria-label="Scroll up">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button v-if="canScrollDown" class="nav-button header" @click="scrollBy(1)" aria-label="Scroll down">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="lgp-close" @click="close" aria-label="Close">×</button>
          </div>
        </header>
        <div class="lgp-grid" ref="bodyRef" @scroll="updateScrollState">
          <button v-for="(link, idx) in links" :key="idx" class="lgp-item" @click="handleItemClick($event, link, idx)"
            :title="link.description || link.name">
            <div class="lgp-icon">
              <img v-if="link.iconUrl" :src="link.iconUrl" :alt="`${link.name} icon`" />
              <IconRenderer v-else-if="link.icon" :icon="link.icon" :size="22" />
              <IconRenderer v-else :url="link.url" :size="22" />
              <div v-if="(link.type || 'LINK') === 'GROUP'" class="group-indicator inside" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div class="lgp-name">{{ link.name }}</div>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import configService from '../services/config.js'
import IconRenderer from './IconRenderer.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  anchorRect: { type: Object, default: null },
  links: { type: Array, default: () => [] },
  openInNewTab: { type: Boolean, default: true },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  panel: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'openGroup', 'openApp'])
const panelRef = ref(null)
const headerRef = ref(null)
const bodyRef = ref(null)

const panelStyle = computed(() => {
  const rect = props.anchorRect
  const margin = 6
  const grid = configService.get('dashboard.grid') || { columns: 6, rows: 4, gap: 16, padding: 24 }
  const columns = Number(grid.columns) || 6
  const rows = Number(grid.rows) || 4
  const gap = Number(grid.gap) || 16
  const padding = Number(grid.padding) || 24

  // Compute ideal width/height from grid units if provided
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
    console.log('[LinkGroupPanel] sizing', {
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
  } catch { /* empty */ }
  let top = 80
  let maxHeight = maxCap
  let transform = 'translateY(0)'

  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const showBelow = spaceBelow >= spaceAbove

    if (showBelow) {
      top = rect.bottom + margin // directly under the icon
      maxHeight = Math.min(maxCap, Math.max(160, spaceBelow))
      transform = 'translateY(0)'
    } else {
      top = rect.top - margin // anchor to the top edge of the icon
      maxHeight = Math.min(maxCap, Math.max(160, spaceAbove))
      transform = 'translateY(-100%)' // pop exactly above the icon
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

const setHeaderHeightVar = () => {
  const panelEl = panelRef.value
  const headerEl = headerRef.value
  if (!panelEl || !headerEl) return
  const h = Math.ceil(headerEl.getBoundingClientRect().height)
  panelEl.style.setProperty('--panel-header-height', `${h}px`)
}

const open = (link) => {
  if (!link?.url) return
  if (props.openInNewTab) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = link.url
  }
  emit('close')
}

const normalizeChildren = (items = []) => {
  return (items || [])
    .filter((l) => {
      const type = String(l?.type || 'LINK').toUpperCase()
      return l && l.name && (l.url || type === 'GROUP' || type === 'APP')
    })
    .map((l) => ({
      name: l.name,
      url: l.url,
      description: l.description || '',
      icon: l.icon || '',
      iconUrl: l.iconUrl || l.icon_url || '',
      type: String(l.type || 'LINK').toUpperCase(),
      links: l.links || [],
      provider: l.provider || l.app || '',
      providerProps: l.props || l.providerProps || {},
      panel: l.panel || {},
    }))
}

const handleItemClick = (evt, link) => {
  const type = String(link?.type || 'LINK').toUpperCase()
  const hasChildren = Array.isArray(link?.links) && link.links.length > 0
  if (type === 'GROUP' || (!link?.url && hasChildren)) {
    const rect = evt.currentTarget.getBoundingClientRect()
    emit('openGroup', {
      anchorRect: rect,
      links: normalizeChildren(link.links || []),
      title: link.description || link.name,
      icon: link.icon || '',
      panel: link.panel || {},
    })
  } else if (type === 'APP') {
    const rect = evt.currentTarget.getBoundingClientRect()
    emit('openApp', {
      anchorRect: rect,
      provider: link.provider || '',
      props: link.providerProps || {},
      title: link.description || link.name,
      icon: link.icon || '',
      panel: link.panel || {},
    })
  } else {
    open(link)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  nextTick(updateScrollState)
  nextTick(setHeaderHeightVar)
  window.addEventListener('resize', setHeaderHeightVar)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', setHeaderHeightVar)
})
</script>

<style scoped>
.lgp-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.lgp-panel {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  color: #fff;
  overflow: hidden;
}

.lgp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.lgp-header-controls {
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

.lgp-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lgp-title {
  font-size: 0.8rem;
  font-weight: 600;
}

.lgp-close {
  background: transparent;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.lgp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 110px));
  gap: 6px;
  padding: 8px;
  /* Fill remaining height under header for consistent scrolling */
  max-height: calc(var(--panel-max-height, 60vh) - var(--panel-header-height, 40px));
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  /* Left-align grid within the panel and let items fill tracks */
  justify-content: start;
  align-content: start;
  justify-items: stretch;
}

.lgp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  color: inherit;
}

.lgp-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.lgp-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.lgp-icon img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
}

.lgp-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Group chevron indicator to match top-level style */
.group-indicator {
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
}

.group-indicator.inside {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
