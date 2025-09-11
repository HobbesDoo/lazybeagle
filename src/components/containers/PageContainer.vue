<template>
  <section class="page-container">
    <!-- Toolbar at the top -->
    <ToolbarCard
      class="page-toolbar"
      :pages="pages"
      :selected-page="selectedPage"
      :editing="isEditing"
      @toggle-edit="toggleEdit"
      @open-settings="openSettings"
      @navigate="handleNavigate"
    />

    <!-- Main content area with selected page grid -->
    <main class="page-body">
      <PageCard
        v-if="selectedPage"
        :items="itemsToRender"
        :is-draggable="isEditing"
        :is-resizable="isEditing"
      />
      <div v-else class="empty-state">No selected page.</div>
    </main>

    <!-- Slide-in settings panel -->
    <SettingsPanel :is-open="settingsOpen" @close="settingsOpen = false" />
  </section>
  
</template>

<script setup>
import { computed, ref } from 'vue'
import PageCard from '../cards/PageCard.vue'
import ToolbarCard from '../cards/ToolbarCard.vue'
import SettingsPanel from '../SettingsPanel.vue'

// Mocked cards for the selected page. Parent will eventually
// provide data (YAML/DB) and/or pass component objects in items.
import AppCard from '../cards/AppCard.vue'
import ClockCard from '../cards/ClockCard.vue'

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
    { i: 'apps',  x: 3, y: 0, w: 6, h: 4, component: AppCard }
  ]
})

const itemsToRender = computed(() => selectedPage.value?.items ?? mockItems.value)

// Edit mode toggles drag/resize on PageCard
const isEditing = ref(false)
const toggleEdit = () => { isEditing.value = !isEditing.value }

// Settings panel control
const settingsOpen = ref(false)
const openSettings = () => { settingsOpen.value = true }

// Navigation event (placeholder: update selection on provided pages array if mutable)
const handleNavigate = (pageIdOrName) => {
  // Consumers can listen to this component's event in the future.
  // For now, if pages are plain objects in-props, avoid mutating directly.
  // Emit upward if needed later.
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.page-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
}
.page-body {
  flex: 1;
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

@media (max-width: 768px) {
  .page-container {
    min-height: 100svh;
  }
}
</style>
