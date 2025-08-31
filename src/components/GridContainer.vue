<!--
  GridContainer Component

  Main grid container that manages the layout of cards on the home network landing page.
  Provides a responsive CSS Grid layout that fills the entire viewport without scrolling.
  Cards can specify their grid size and will be automatically positioned.
-->

<template>
  <div class="grid-container" :style="gridStyle">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Number of columns in the grid
   */
  columns: {
    type: Number,
    default: 6,
    validator: (value) => value >= 1 && value <= 12,
  },

  /**
   * Number of rows in the grid
   */
  rows: {
    type: Number,
    default: 4,
    validator: (value) => value >= 1 && value <= 12,
  },

  /**
   * Gap between grid items (in pixels)
   */
  gap: {
    type: Number,
    default: 16,
  },

  /**
   * Padding around the grid container (in pixels)
   */
  padding: {
    type: Number,
    default: 24,
  },

  /**
   * Optional CSS background for the grid container
   */
  background: {
    type: String,
    default: '',
  },
})

/**
 * Computed style for the grid container
 */
const gridStyle = computed(() => {
  return {
    '--grid-columns': props.columns,
    '--grid-rows': props.rows,
    '--grid-gap': `${props.gap}px`,
    '--grid-padding': `${props.padding}px`,
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gridTemplateRows: `repeat(${props.rows}, 1fr)`,
    gap: `${props.gap}px`,
    padding: `${props.padding}px`,
    background: props.background || undefined,
  }
})
</script>

<style scoped>
.grid-container {
  /* Full viewport layout */
  height: 100dvh; /* better on iOS Safari */
  min-height: -webkit-fill-available;
  width: 100vw;
  overflow-x: hidden;
  overflow-y: auto; /* avoid content being cut off on iPad */
  -webkit-overflow-scrolling: touch; /* momentum scroll on iOS */
  overscroll-behavior: contain;

  /* CSS Grid setup */
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 6), 1fr);
  grid-template-rows: repeat(var(--grid-rows, 4), 1fr);
  gap: var(--grid-gap, 16px);
  padding: var(--grid-padding, 24px);
  padding-bottom: calc(var(--grid-padding, 24px) + env(safe-area-inset-bottom, 0px) + 58px);
  scroll-padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 58px);

  /* Background and styling */
  background: var(--grid-background, #f8fafc);
  box-sizing: border-box;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    --grid-columns: 4;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
    --grid-columns: 2;
    --grid-rows: 6;
    gap: 12px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(8, 1fr);
    --grid-columns: 1;
    --grid-rows: 8;
    gap: 8px;
    padding: 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .grid-container {
    --grid-background: #111827;
  }
}

/* Ensure proper grid item sizing */
.grid-container > * {
  min-width: 0;
  min-height: 0;
}
</style>
