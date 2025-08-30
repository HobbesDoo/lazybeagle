<!--
  WebLinkCard Component

  A specialized card component for displaying web links with icons.
  Extends BaseCard to provide clickable links to external services.
-->

<template>
  <BaseCard
    :grid-width="gridWidth"
    :grid-height="gridHeight"
    :grid-column-start="gridColumnStart"
    :grid-row-start="gridRowStart"
    :variant="variant"
    :clickable="true"
    :bordered="false"
    :shadow="false"
    @click="handleClick"
    :style="{
      '--card-background': 'transparent',
      '--card-border-color': 'transparent',
      '--card-shadow': 'none',
    }"
  >
    <!-- Container mode: render multiple links if provided -->
    <div v-if="links && links.length" class="links-grid" @click.stop>
      <button
        v-for="(item, idx) in normalizedLinks"
        :key="idx"
        class="link-item"
        @click="openLink(item.url)"
        :title="item.description || item.name"
      >
        <div class="app-icon">
          <img
            v-if="item.iconUrl"
            :src="item.iconUrl"
            :alt="`${item.name} icon`"
            class="icon-image"
          />
          <IconRenderer v-else :icon="item.icon || '🔗'" :size="28" />
        </div>
        <div class="app-name">{{ item.name }}</div>
      </button>
    </div>

    <!-- Fallback: single-link tile (backwards compatible) -->
    <div v-else class="web-link-card">
      <div class="app-icon">
        <img v-if="iconUrl" :src="iconUrl" :alt="`${serviceName} icon`" class="icon-image" />
        <IconRenderer v-else :icon="icon || '🔗'" :size="32" />
      </div>
      <div class="app-name">{{ serviceName }}</div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import IconRenderer from './IconRenderer.vue'
import BaseCard from './BaseCard.vue'

const props = defineProps({
  /**
   * The service name to display
   */
  serviceName: {
    type: String,
    required: true,
  },

  /**
   * Optional list of links to render inside the card
   * Each item: { name, url, description?, icon?, iconUrl? }
   */
  links: {
    type: Array,
    default: () => [],
  },

  /**
   * The URL to navigate to when clicked
   */
  url: {
    type: String,
    required: true,
    validator: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
  },

  /**
   * Optional description of the service
   */
  description: {
    type: String,
    default: '',
  },

  /**
   * Icon URL for the service
   */
  iconUrl: {
    type: String,
    default: '',
  },

  /**
   * Text-based icon (emoji or initials) if no iconUrl
   */
  icon: {
    type: String,
    default: '',
  },

  /**
   * Grid width (inherited from BaseCard)
   */
  gridWidth: {
    type: Number,
    default: 1,
  },

  /**
   * Grid height (inherited from BaseCard)
   */
  gridHeight: {
    type: Number,
    default: 1,
  },

  /**
   * Optional explicit starting column and row
   */
  gridColumnStart: {
    type: Number,
    default: null,
  },
  gridRowStart: {
    type: Number,
    default: null,
  },

  /**
   * Card variant (inherited from BaseCard)
   */
  variant: {
    type: String,
    default: 'default',
  },

  /**
   * Whether to show status indicator
   */
  showStatus: {
    type: Boolean,
    default: false,
  },

  /**
   * Service status ('online', 'offline', 'unknown')
   */
  status: {
    type: String,
    default: 'unknown',
    validator: (value) => ['online', 'offline', 'unknown'].includes(value),
  },

  /**
   * Whether to open link in new tab
   */
  openInNewTab: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click'])

// Legacy computed values removed (not used in container mode)

/**
 * Handle card click - navigate to URL
 */
const handleClick = () => {
  if (props.openInNewTab) {
    window.open(props.url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = props.url
  }

  emit('click', {
    serviceName: props.serviceName,
    url: props.url,
  })
}

/**
 * Normalized links when container mode is used
 */
const normalizedLinks = computed(() => {
  return (props.links || [])
    .filter((l) => l && l.url && l.name)
    .map((l) => ({
      name: l.name,
      url: l.url,
      description: l.description || '',
      icon: l.icon || '',
      iconUrl: l.iconUrl || l.icon_url || '',
    }))
})

const openLink = (url) => {
  if (!url) return
  if (props.openInNewTab) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}
</script>

<style scoped>
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  padding: 8px;
  width: 100%;
  height: 100%;
  overflow: hidden; /* hide overflow for now */
  align-content: flex-start;
}

.link-item {
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

.link-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.web-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 16px;
  background: transparent;
}

.web-link-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
}

.app-icon {
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

.icon-image {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
}

.icon-emoji {
  font-size: 32px;
  line-height: 1;
}

.app-name {
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

/* Responsive design */
@media (max-width: 768px) {
  .app-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
  }

  .icon-image {
    width: 30px;
    height: 30px;
  }

  .icon-emoji {
    font-size: 26px;
  }

  .app-name {
    font-size: 0.8rem;
    max-width: 70px;
  }
}
</style>
