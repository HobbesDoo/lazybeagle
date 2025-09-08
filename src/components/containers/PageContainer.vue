<template>
  <section class="page-container">
    <!-- Placeholder header area for future page switching -->
    <header class="page-header" v-if="selectedPage">
      <h2 class="sr-only">{{ selectedPage.title || selectedPage.name || 'Selected Page' }}</h2>
    </header>

    <main class="page-body">
      <PageCard v-if="selectedPage" :items="itemsToRender" />
      <div v-else class="empty-state">No selected page.</div>
    </main>
  </section>
  
</template>

<script setup>
import { computed } from 'vue'
import PageCard from '../cards/PageCard.vue'

// Mocked cards for the selected page. Parent will eventually
// provide data (YAML/DB) and/or pass component objects in items.
import AppCard from '../cards/AppCard.vue'
import ClockCard from '../cards/ClockCard.vue'
import ToolbarCard from '../cards/ToolbarCard.vue'

const props = defineProps({
  // Collection of page definitions; only the one with selected=true is shown
  // Optional shape suggestion for future:
  // { id, name, title, selected: boolean, items?: Array<...> }
  pages: { type: Array, default: () => [] }
})

const selectedPage = computed(() => props.pages.find(p => p && (p.selected || p.Selected)))

// If parent does not provide items on the selected page yet, use a static mock
const mockItems = computed(() => {
  if (!selectedPage.value) return []
  return [
    { i: 'clock', x: 0, y: 0, w: 3, h: 2, component: ClockCard },
    { i: 'apps',  x: 3, y: 0, w: 6, h: 4, component: AppCard },
    { i: 'tools', x: 9, y: 0, w: 3, h: 3, component: ToolbarCard }
  ]
})

const itemsToRender = computed(() => selectedPage.value?.items ?? mockItems.value)
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.page-body {
  display: block;
}
.empty-state {
  opacity: 0.7;
  font-style: italic;
}
/* Visually hidden heading for a11y */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
