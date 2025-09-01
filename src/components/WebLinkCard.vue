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
    :clickable="!(links && links.length)"
    :bordered="true"
    :shadow="true"
    :frameless="true"
    :content-align="'center'"
    :content-v-align="'middle'"
    @click="handleClick"
    :style="{}"
  >
    <!-- Container mode: render multiple links if provided -->
    <div v-if="links && links.length" class="links-grid" @click.stop>
      <button
        v-for="(item, index) in normalizedLinks"
        :key="index"
        class="link-item"
        @click="handleItemClick($event, item, index)"
        :title="item.description || item.name"
      >
        <div class="app-icon">
          <img
            v-if="item.iconUrl"
            :src="item.iconUrl"
            :alt="`${item.name} icon`"
            class="icon-image"
          />
          <IconRenderer v-else-if="item.icon" :icon="item.icon" :size="28" />
          <IconRenderer v-else :url="item.url" :size="28" />
          <div
            v-if="item.type === 'GROUP'"
            class="group-indicator inside"
            :class="{ open: isPanelOpen && openGroupIndex === index }"
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
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
  <template v-for="(p, i) in panels" :key="i">
    <AppProviderPanel
      v-if="p.kind === 'app'"
      :is-open="true"
      :anchor-rect="p.anchorRect"
      :title="p.title"
      :icon="p.icon"
      :provider="p.provider"
      :provider-props="p.props"
      :panel="p.panel"
      @close="closePanelAt(i)"
    />
    <LinkGroupPanel
      v-else
      :is-open="true"
      :anchor-rect="p.anchorRect"
      :links="p.links"
      :open-in-new-tab="openInNewTab"
      :title="p.title"
      :icon="p.icon"
      :panel="p.panel"
      @close="closePanelAt(i)"
      @openGroup="handlePanelOpenGroup(i, $event)"
      @openApp="handlePanelOpenApp(i, $event)"
    />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import IconRenderer from './IconRenderer.vue'
import BaseCard from './BaseCard.vue'
import LinkGroupPanel from './LinkGroupPanel.vue'
import AppProviderPanel from './AppProviderPanel.vue'

const props = defineProps({
  /**
   * The service name to display
   */
  serviceName: {
    type: String,
    default: '',
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
    default: '',
    validator: (value) => {
      if (!value) return true
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
  if (!props.url) return
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
    .filter((l) => {
      const type = String(l?.type || 'LINK').toUpperCase()
      return l && l.name && (l.url || type === 'GROUP' || type === 'APP')
    })
    .map((l) => ({
      name: l.name,
      url: l.url,
      description: l.description || '',
      icon: l.icon || '',
      iconUrl: l.iconUrl || l.icon_url || '',
      type: (l.type || 'LINK').toUpperCase(),
      links: l.links || [],
      provider: l.provider || l.app || '',
      providerProps: l.props || l.providerProps || {},
      panel: l.panel || {},
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

// GROUP support (nested panels)
import { ref } from 'vue'
const panels = ref([])
const openGroupIndex = ref(-1) // track top-level open group for indicator state
const isPanelOpen = computed(() => panels.value.length > 0)

const normalizeChildren = (items = []) => {
  return (items || [])
    .filter((l) => {
      const type = String(l?.type || 'LINK').toUpperCase()
      return l && l.name && (l.url || type === 'GROUP' || type === 'APP')
    })
    .map((l) => ({
      name: l.name,
      url: l.url,
      description: l.description || '',
      icon: l.icon || '',
      iconUrl: l.iconUrl || l.icon_url || '',
      type: (l.type || 'LINK').toUpperCase(),
      links: l.links || [],
      provider: l.provider || l.app || '',
      providerProps: l.props || l.providerProps || {},
      panel: l.panel || {},
    }))
}

const pushPanel = (panel) => {
  panels.value.push(panel)
}

const closePanelAt = (index) => {
  if (index === 0) {
    openGroupIndex.value = -1
  }
  // Close the selected panel and any deeper ones
  panels.value.splice(index)
}

const handlePanelOpenGroup = (parentIndex, payload) => {
  // Remove any deeper panels beyond parentIndex, then push child
  if (panels.value.length > parentIndex + 1) {
    panels.value.splice(parentIndex + 1)
  }
  pushPanel({
    anchorRect: payload.anchorRect,
    links: payload.links,
    title: payload.title,
    icon: payload.icon,
  })
}

const handlePanelOpenApp = (parentIndex, payload) => {
  console.log('[WebLinkCard] nested openApp', parentIndex, payload)
  if (panels.value.length > parentIndex + 1) {
    panels.value.splice(parentIndex + 1)
  }
  pushPanel({
    kind: 'app',
    anchorRect: payload.anchorRect,
    provider: payload.provider,
    props: payload.props || {},
    title: payload.title,
    icon: payload.icon,
    panel: payload.panel || {},
  })
}

const handleItemClick = (evt, item, index) => {
  const itemType = item.type || 'LINK'
  if (itemType === 'GROUP') {
    const rect = evt.currentTarget.getBoundingClientRect()
    pushPanel({
      anchorRect: rect,
      links: normalizeChildren(item.links || []),
      title: item.description || item.name,
      icon: item.icon || '',
      panel: item.panel || {},
    })
    openGroupIndex.value = index
  } else if (itemType === 'APP') {
    const rect = evt.currentTarget.getBoundingClientRect()
    console.log('[WebLinkCard] opening APP panel', {
      provider: item.provider,
      title: item.name,
      icon: item.icon,
      rect,
    })
    pushPanel({
      kind: 'app',
      anchorRect: rect,
      provider: item.provider,
      props: {
        ...(item.providerProps || {}),
        baseUrl: undefined, // filled by provider from services unless overridden
      },
      title: item.name,
      icon: item.icon || '',
    })
  } else {
    openLink(item.url)
  }
}
</script>

<style scoped>
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 110px));
  gap: 6px;
  padding: 8px;
  width: 100%;
  height: 100%;
  overflow-y: auto; /* allow labels to remain visible when tight on height */
  overscroll-behavior: contain;
  padding-bottom: calc(26px + env(safe-area-inset-bottom, 0px));
  align-content: center;
  justify-content: center;
  justify-items: center;
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

.group-indicator {
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
}

.app-icon {
  position: relative;
}
.group-indicator.inside {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.group-indicator.inside.open {
  transform: rotate(90deg);
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
