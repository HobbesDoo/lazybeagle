<template>
  <teleport to="body">
    <div v-if="isOpen" class="lgp-overlay" @click.self="close">
      <div class="lgp-panel" :style="panelStyle" ref="panelRef" role="dialog" aria-modal="true">
        <header class="lgp-header">
          <div class="lgp-title-row">
            <IconRenderer v-if="icon" :icon="icon" :size="14" />
            <div class="lgp-title">{{ title || 'Links' }}</div>
          </div>
          <button class="lgp-close" @click="close" aria-label="Close">×</button>
        </header>
        <div class="lgp-grid">
          <button
            v-for="(link, idx) in links"
            :key="idx"
            class="lgp-item"
            @click="open(link)"
            :title="link.description || link.name"
          >
            <div class="lgp-icon">
              <img v-if="link.iconUrl" :src="link.iconUrl" :alt="`${link.name} icon`" />
              <IconRenderer v-else :icon="link.icon || '🔗'" :size="22" />
            </div>
            <div class="lgp-name">{{ link.name }}</div>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import IconRenderer from './IconRenderer.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  anchorRect: { type: Object, default: null },
  links: { type: Array, default: () => [] },
  openInNewTab: { type: Boolean, default: true },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const panelRef = ref(null)

const panelStyle = computed(() => {
  const rect = props.anchorRect
  const margin = 6
  const width = Math.min(window.innerWidth - 2 * margin, 520)
  const maxCap = Math.min(window.innerHeight * 0.6, 420)
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
    maxHeight: `${maxHeight}px`,
    transform,
  }
})

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}

const close = () => emit('close')

const open = (link) => {
  if (!link?.url) return
  if (props.openInNewTab) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = link.url
  }
  emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
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
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
  padding: 10px;
  max-height: 60vh;
  overflow: auto;
}

.lgp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  color: inherit;
}

.lgp-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.lgp-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lgp-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
}

.lgp-name {
  font-size: 0.85rem;
  text-align: center;
}
</style>
