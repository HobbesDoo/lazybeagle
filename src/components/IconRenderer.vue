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

    <!-- Asset-based SVG/PNG Icons (served from public/icons/{svg,png}) -->
    <img
      v-else-if="iconType === 'asset-svg' || iconType === 'asset-png'"
      :src="assetUrl"
      :alt="iconName"
      class="asset-icon"
      :style="{ width: size + 'px', height: size + 'px' }"
    />

    <!-- Favicon fallback (when no icon specified but a URL is provided) -->
    <img
      v-else-if="iconType === 'favicon' && faviconSrc"
      :src="faviconSrc"
      :alt="'favicon'"
      class="asset-icon"
      :style="{ width: size + 'px', height: size + 'px' }"
      @error="handleFaviconError"
    />

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
import { computed, ref, watch } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

// Props
const props = defineProps({
  icon: {
    type: String,
    default: '',
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
  url: {
    type: String,
    default: '',
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
  if (props.icon) {
    if (props.icon.startsWith('lucide:')) return 'lucide'
    if (
      props.icon.startsWith('fa:') ||
      props.icon.startsWith('fas:') ||
      props.icon.startsWith('far:')
    )
      return 'fontawesome'
    if (props.icon.startsWith('asset:svg:')) return 'asset-svg'
    if (props.icon.startsWith('asset:png:')) return 'asset-png'
  }
  if (!props.icon && props.url) return 'favicon'
  return 'emoji'
})

const iconName = computed(() => {
  if (iconType.value === 'lucide') {
    return props.icon.replace('lucide:', '')
  }
  if (iconType.value === 'fontawesome') {
    return props.icon.replace(/^(fa|fas|far):/, '')
  }
  if (iconType.value === 'asset-svg') {
    return props.icon.replace('asset:svg:', '')
  }
  if (iconType.value === 'asset-png') {
    return props.icon.replace('asset:png:', '')
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

const assetUrl = computed(() => {
  if (iconType.value === 'asset-svg') {
    return `/icons/svg/${iconName.value}.svg`
  }
  if (iconType.value === 'asset-png') {
    return `/icons/png/${iconName.value}.png`
  }
  return ''
})

// Favicon handling
const primaryFaviconUrl = computed(() => {
  if (!props.url) return ''
  try {
    const u = new URL(props.url)
    return `${u.origin}/favicon.ico`
  } catch {
    return ''
  }
})

const googleFaviconUrl = computed(() => {
  if (!props.url) return ''
  console.log('Google Favicon URL:', props.url, props.size)
  try {
    const u = new URL(props.url)
    const targetSize = Math.max(Number(props.size) || 128, 128)
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=${targetSize}`
  } catch {
    return ''
  }
})

const duckDuckGoFaviconUrl = computed(() => {
  if (!props.url) return ''
  try {
    const u = new URL(props.url)
    return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`
  } catch {
    return ''
  }
})

const faviconCandidates = computed(() => {
  return [primaryFaviconUrl.value, googleFaviconUrl.value, duckDuckGoFaviconUrl.value].filter(
    (u) => !!u,
  )
})

const faviconIndex = ref(0)
const faviconSrc = ref('')

watch(
  () => [faviconCandidates.value.join('|')],
  () => {
    faviconIndex.value = 0
    faviconSrc.value = faviconCandidates.value[0] || ''
  },
  { immediate: true },
)

const handleFaviconError = (e) => {
  console.error('Favicon error:', e)
  const next = faviconIndex.value + 1
  if (next < faviconCandidates.value.length) {
    faviconIndex.value = next
    faviconSrc.value = faviconCandidates.value[next]
  } else {
    faviconSrc.value = ''
  }
}
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
  display: block;
}

.icon-fontawesome {
  display: block;
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
