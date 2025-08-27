<!--
  WebLinkCard Component

  A specialized card component for displaying web links with icons.
  Extends BaseCard to provide clickable links to external services.
-->

<template>
  <BaseCard
    :title="title"
    :grid-width="gridWidth"
    :grid-height="gridHeight"
    :variant="variant"
    :clickable="true"
    @click="handleClick"
  >
    <div class="web-link-content">
      <!-- Service Icon -->
      <div class="service-icon" v-if="icon || iconUrl">
        <img v-if="iconUrl" :src="iconUrl" :alt="`${serviceName} icon`" class="icon-image" />
        <span v-else class="icon-text">{{ icon }}</span>
      </div>

      <!-- Service Info -->
      <div class="service-info">
        <h4 class="service-name">{{ serviceName }}</h4>
        <p v-if="description" class="service-description">{{ description }}</p>
        <div class="service-url">{{ displayUrl }}</div>
      </div>

      <!-- Status Indicator -->
      <div v-if="showStatus" :class="['status-indicator', statusClass]" :title="statusText"></div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
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

/**
 * Computed title for the card (uses serviceName if no explicit title)
 */
const title = computed(() => props.serviceName)

/**
 * Computed display URL (shortened for UI)
 */
const displayUrl = computed(() => {
  try {
    const url = new URL(props.url)
    return url.hostname
  } catch {
    return props.url
  }
})

/**
 * Computed status CSS class
 */
const statusClass = computed(() => {
  return `status-${props.status}`
})

/**
 * Computed status text for tooltip
 */
const statusText = computed(() => {
  const statusMap = {
    online: 'Service is online',
    offline: 'Service is offline',
    unknown: 'Service status unknown',
  }
  return statusMap[props.status] || 'Unknown status'
})

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
</script>

<style scoped>
.web-link-content {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 4px 0;
}

.service-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--icon-background, #f3f4f6);
}

.icon-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}

.icon-text {
  font-size: 1.5rem;
  font-weight: 500;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  line-height: 1.25;
}

.service-description {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-url {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: auto;
}

.status-online {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-offline {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-unknown {
  background-color: #6b7280;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .service-icon {
    --icon-background: #374151;
  }

  .service-name {
    --text-primary: #f9fafb;
  }

  .service-description {
    --text-secondary: #d1d5db;
  }

  .service-url {
    --text-muted: #9ca3af;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .web-link-content {
    gap: 8px;
  }

  .service-icon {
    width: 32px;
    height: 32px;
  }

  .icon-image {
    width: 24px;
    height: 24px;
  }

  .icon-text {
    font-size: 1.25rem;
  }

  .service-name {
    font-size: 0.875rem;
  }

  .service-description {
    font-size: 0.75rem;
  }
}
</style>
