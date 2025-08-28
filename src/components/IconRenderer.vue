<!--
  IconRenderer Component

  A flexible icon renderer that supports:
  - Lucide icons (lucide:icon-name)
  - Font Awesome icons (fa:icon-name)
  - Emojis (plain text)
  - Custom SVG icons
-->

<template>
  <span class="icon-renderer" :class="iconClass">
    <!-- Lucide Icons -->
    <component
      v-if="iconType === 'lucide'"
      :is="lucideIcon"
      :size="size"
      :stroke-width="strokeWidth"
      :class="['lucide-icon', colorClass]"
    />

    <!-- Font Awesome Icons -->
    <i
      v-else-if="iconType === 'fontawesome'"
      :class="['fa', fontAwesomeClass, colorClass]"
      :style="{ fontSize: size + 'px' }"
    ></i>

    <!-- Emoji or Plain Text -->
    <span
      v-else
      :class="['emoji-icon', colorClass]"
      :style="{ fontSize: size + 'px', lineHeight: 1 }"
    >
      {{ icon }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

// Props
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
  variant: {
    type: String,
    default: 'default', // 'default', 'muted', 'primary', 'success', 'warning', 'danger'
    validator: (value) =>
      ['default', 'muted', 'primary', 'success', 'warning', 'danger'].includes(value),
  },
})

// Computed properties
const iconType = computed(() => {
  if (props.icon.startsWith('lucide:')) return 'lucide'
  if (
    props.icon.startsWith('fa:') ||
    props.icon.startsWith('fas:') ||
    props.icon.startsWith('far:')
  )
    return 'fontawesome'
  return 'emoji'
})

const iconName = computed(() => {
  if (iconType.value === 'lucide') {
    return props.icon.replace('lucide:', '')
  }
  if (iconType.value === 'fontawesome') {
    return props.icon.replace(/^(fa|fas|far):/, '')
  }
  return props.icon
})

const lucideIcon = computed(() => {
  if (iconType.value !== 'lucide') return null

  // Convert kebab-case to PascalCase for Lucide component names
  const pascalCase = iconName.value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return LucideIcons[pascalCase] || LucideIcons.HelpCircle
})

const fontAwesomeClass = computed(() => {
  if (iconType.value !== 'fontawesome') return ''

  const prefix = props.icon.startsWith('far:') ? 'far' : 'fas'
  return `${prefix} fa-${iconName.value}`
})

const colorClass = computed(() => {
  const variants = {
    default: 'text-current',
    muted: 'text-muted',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }
  return variants[props.variant] || variants.default
})

const iconClass = computed(() => {
  return ['icon-container', `icon-${iconType.value}`, `icon-variant-${props.variant}`]
})
</script>

<style scoped>
.icon-renderer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container {
  transition: all 0.2s ease;
}

/* Lucide Icons */
.lucide-icon {
  display: block;
}

/* Font Awesome Icons */
.fa {
  display: block;
}

/* Emoji Icons */
.emoji-icon {
  display: block;
  font-style: normal;
}

/* Color Variants */
.text-current {
  color: currentColor;
}

.text-muted {
  color: #6b7280;
}

.text-primary {
  color: #3b82f6;
}

.text-success {
  color: #10b981;
}

.text-warning {
  color: #f59e0b;
}

.text-danger {
  color: #ef4444;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .text-muted {
    color: #9ca3af;
  }
}

/* Icon type specific styles */
.icon-lucide {
  /* Lucide icons are already well-styled */
}

.icon-fontawesome {
  /* Font Awesome specific adjustments if needed */
}

.icon-emoji {
  /* Emoji specific adjustments */
  filter: grayscale(0);
}

/* Hover effects */
.icon-container:hover {
  transform: scale(1.05);
}

/* Size variants */
.icon-renderer.small {
  font-size: 16px;
}

.icon-renderer.medium {
  font-size: 20px;
}

.icon-renderer.large {
  font-size: 24px;
}
</style>
