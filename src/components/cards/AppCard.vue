<template>
  <BaseCard :title="title" :clickable="!!url" @click="handleClick" :grid-width="gridWidth" :grid-height="gridHeight">
    <div class="app-card">
      <div class="app-header">
        <IconRenderer v-if="icon" :icon="icon" :size="28" class="app-icon" />
        <div class="app-titles">
          <h4 class="app-title">{{ title }}</h4>
          <p v-if="subtitle" class="app-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="$slots.default" class="app-content">
        <slot />
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'
import IconRenderer from '@/components/IconRenderer.vue'

const props = defineProps({
  title: { type: String, default: 'App' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  url: { type: String, default: '' },
  gridWidth: { type: Number, default: 3 },
  gridHeight: { type: Number, default: 2 },
})

const handleClick = () => {
  if (props.url) {
    window.open(props.url, '_blank', 'noopener')
  }
}
</script>

<style scoped>
.app-card { display: flex; flex-direction: column; gap: 12px; }
.app-header { display: flex; align-items: center; gap: 12px; }
.app-title { margin: 0; font-size: 1rem; }
.app-subtitle { margin: 0; font-size: .85rem; opacity: .7; }
.app-content { margin-top: 4px; }
</style>
