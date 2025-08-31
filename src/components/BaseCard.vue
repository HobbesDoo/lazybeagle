<!--
  BaseCard Component

  A flexible card component that serves as a container for various widgets.
  Supports different grid sizes (1x1, 1x3, 2x2, etc.) and can be extended
  for specific use cases like web links, service status, etc.
-->

<template>
  <div :class="cardClasses" :style="cardStyle" @click="handleClick">
    <!-- Card Header (optional) -->
    <header v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </header>

    <!-- Card Content -->
    <main class="card-content">
      <slot>
        <p v-if="!$slots.default" class="card-placeholder">Card content goes here</p>
      </slot>
    </main>

    <!-- Card Footer (optional) -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </footer>

    <!-- Loading overlay -->
    <div v-if="loading" class="card-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Card title displayed in header
   */
  title: {
    type: String,
    default: '',
  },

  /**
   * Grid width (number of columns to span)
   */
  gridWidth: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 12,
  },

  /**
   * Grid height (number of rows to span)
   */
  gridHeight: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 12,
  },

  gridColumnStart: { type: Number, default: null },
  gridRowStart: { type: Number, default: null },

  /**
   * Whether the card is clickable
   */
  clickable: {
    type: Boolean,
    default: false,
  },

  /**
   * Loading state
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * Card variant/theme
   */
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'primary', 'secondary', 'success', 'warning', 'danger'].includes(value),
  },

  /**
   * Whether the card should have a border
   */
  bordered: {
    type: Boolean,
    default: true,
  },

  /**
   * Whether the card should have a shadow
   */
  shadow: {
    type: Boolean,
    default: true,
  },

  /**
   * Remove outer background/border/shadow chrome
   */
  frameless: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

/**
 * Computed classes for the card
 */
const cardClasses = computed(() => {
  return [
    'base-card',
    `card-variant-${props.variant}`,
    {
      'card-clickable': props.clickable,
      'card-bordered': props.bordered && !props.frameless,
      'card-shadow': props.shadow && !props.frameless,
      'card-loading-state': props.loading,
    },
  ]
})

/**
 * Computed style for grid positioning
 */
const cardStyle = computed(() => {
  const style = {
    '--card-grid-width': props.gridWidth,
    '--card-grid-height': props.gridHeight,
  }
  if (props.frameless) {
    style['--card-background'] = 'transparent'
  }
  style.gridColumn = props.gridColumnStart
    ? `${props.gridColumnStart} / span ${props.gridWidth}`
    : `span ${props.gridWidth}`
  style.gridRow = props.gridRowStart
    ? `${props.gridRowStart} / span ${props.gridHeight}`
    : `span ${props.gridHeight}`
  return style
})

/**
 * Handle card click events
 */
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped>
.base-card {
  /* Grid positioning */
  grid-column: span var(--card-grid-width, 1);
  grid-row: span var(--card-grid-height, 1);

  /* Layout */
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 120px;

  /* Appearance */
  background: var(--card-background, transparent);
  border-radius: var(--card-border-radius, 12px);
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

/* Border variants */
.card-bordered {
  border: 1px solid var(--card-border-color, #e5e7eb);
}

/* Shadow variants */
.card-shadow {
  box-shadow: var(--card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06));
}

/* Clickable state */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(
    --card-shadow-hover,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06)
  );
}

.card-clickable:active {
  transform: translateY(0);
}

/* Card sections */
.card-header {
  padding: var(--card-header-padding, 16px 16px 0);
  border-bottom: var(--card-header-border, none);
}

.card-title {
  margin: 0;
  font-size: var(--card-title-font-size, 1.125rem);
  font-weight: var(--card-title-font-weight, 600);
  color: var(--card-title-color, #111827);
  line-height: 1.25;
}

.card-content {
  flex: 1;
  padding: var(--card-content-padding, 16px);
  display: flex;
  flex-direction: column;
}

.card-footer {
  padding: var(--card-footer-padding, 0 16px 16px);
  border-top: var(--card-footer-border, none);
}

.card-placeholder {
  margin: 0;
  color: var(--card-placeholder-color, #6b7280);
  font-style: italic;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Loading state */
.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Card variants */
.card-variant-default {
  --card-background: #ffffff;
  --card-border-color: #e5e7eb;
}

.card-variant-primary {
  --card-background: #eff6ff;
  --card-border-color: #3b82f6;
  --card-title-color: #1e40af;
}

.card-variant-secondary {
  --card-background: #f8fafc;
  --card-border-color: #64748b;
  --card-title-color: #475569;
}

.card-variant-success {
  --card-background: #f0fdf4;
  --card-border-color: #22c55e;
  --card-title-color: #166534;
}

.card-variant-warning {
  --card-background: #fffbeb;
  --card-border-color: #f59e0b;
  --card-title-color: #92400e;
}

.card-variant-danger {
  --card-background: #fef2f2;
  --card-border-color: #ef4444;
  --card-title-color: #b91c1c;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .card-variant-default {
    --card-background: #1f2937;
    --card-border-color: #374151;
    --card-title-color: #f9fafb;
    --card-placeholder-color: #9ca3af;
  }

  .card-loading {
    background: rgba(31, 41, 55, 0.8);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-card {
    min-height: 100px;
  }

  .card-header {
    padding: var(--card-header-padding-mobile, 12px 12px 0);
  }

  .card-content {
    padding: var(--card-content-padding-mobile, 12px);
  }

  .card-footer {
    padding: var(--card-footer-padding-mobile, 0 12px 12px);
  }

  .card-title {
    font-size: var(--card-title-font-size-mobile, 1rem);
  }
}
</style>
