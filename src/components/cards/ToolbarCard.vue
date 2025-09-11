<template>
  <BaseCard class="toolbar-card" frameless :shadow="false" :bordered="false" :grid-width="12" :grid-height="1">
    <div class="toolbar-inner">
      <!-- Navigation: shows pages and highlights selected -->
      <nav class="toolbar-nav" aria-label="Pages">
        <button
          v-for="(p, idx) in pages"
          :key="p.id || p.name || idx"
          class="nav-chip"
          :class="{ active: isSelected(p) }"
          @click="$emit('navigate', p.id ?? p.name ?? idx)"
        >
          {{ p.title || p.name || `Page ${idx + 1}` }}
        </button>
      </nav>

      <!-- Commands: edit toggle + settings -->
      <div class="toolbar-actions">
        <button class="icon-btn" :aria-pressed="editing" @click="$emit('toggle-edit')" :title="editing ? 'Exit edit mode' : 'Enter edit mode'">
          <IconRenderer :icon="editing ? 'lucide:mouse-pointer-2' : 'lucide:pencil'" :size="18" />
          <span class="btn-label">{{ editing ? 'Done' : 'Edit' }}</span>
        </button>

        <button class="icon-btn" @click="$emit('open-settings')" title="Open settings">
          <IconRenderer icon="lucide:settings" :size="18" />
          <span class="btn-label">Settings</span>
        </button>

        <slot name="commands" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'
import IconRenderer from '@/components/IconRenderer.vue'

const props = defineProps({
  pages: { type: Array, default: () => [] },
  selectedPage: { type: Object, default: () => null },
  editing: { type: Boolean, default: false },
})

const isSelected = (p) => {
  if (!props.selectedPage || !p) return false
  const a = props.selectedPage
  return (
    (a.id && p.id && a.id === p.id) ||
    (a.name && p.name && a.name === p.name) ||
    a === p
  )
}
</script>

<style scoped>
.toolbar-card {
  padding: 0;
}
.toolbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
}
.toolbar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
}
.nav-chip {
  appearance: none;
  border: 1px solid transparent;
  background: rgba(0,0,0,0.05);
  color: inherit;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all .15s ease-in-out;
}
.nav-chip:hover { background: rgba(0,0,0,0.08); }
.nav-chip.active {
  background: #3b82f6;
  color: #fff;
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all .15s ease-in-out;
}
.icon-btn:hover { filter: brightness(0.98); }
.btn-label { font-size: 0.875rem; }

@media (prefers-color-scheme: dark) {
  .nav-chip { background: rgba(255,255,255,0.08); }
  .nav-chip:hover { background: rgba(255,255,255,0.12); }
  .icon-btn { background: rgba(17,24,39,0.6); border-color: rgba(255,255,255,0.08); }
}

@media (max-width: 640px) {
  .btn-label { display: none; }
}
</style>
