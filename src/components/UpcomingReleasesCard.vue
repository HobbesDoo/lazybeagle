<!--
  UpcomingReleasesCard Component

  Displays upcoming releases from Sonarr/Radarr calendar API
  Shows posters with smart date formatting
-->

<template>
  <BaseCard
    :title="title"
    :grid-width="gridWidth"
    :grid-height="gridHeight"
    :grid-column-start="gridColumnStart"
    :grid-row-start="gridRowStart"
    variant="default"
    :loading="loading"
  >
    <div class="upcoming-releases">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="releases.length === 0 && !loading" class="no-releases">
        No upcoming releases found
      </div>

      <div
        v-else
        class="releases-grid"
        ref="releasesGridRef"
        :style="{ '--poster-item-width': posterItemWidth + 'px' }"
      >
        <div
          v-for="release in displayReleases"
          :key="release.id"
          class="release-item"
          :class="{ 'placeholder-item': release.isPlaceholder }"
          :title="release.isPlaceholder ? '' : release.title"
        >
          <!-- Poster -->
          <div class="poster-container">
            <!-- Try to load poster, but always show placeholder as backup -->
            <div class="poster-placeholder" :class="{ 'empty-placeholder': release.isPlaceholder }">
              <img
                v-if="release.poster && !release.isPlaceholder"
                :src="release.poster"
                :alt="release.title"
                class="poster-image"
                @error="handleImageError"
                @load="handleImageLoad"
              />
              <span v-if="!release.isPlaceholder" class="placeholder-icon">{{
                serviceType === 'sonarr' ? '📺' : '🎬'
              }}</span>
            </div>
          </div>

          <!-- Release Info -->
          <div v-if="!release.isPlaceholder" class="release-info">
            <!--div class="release-title">{{ release.title }}</div -->
            <div class="release-date">{{ formatDate(release.airDate) }}</div>
          </div>
          <div v-else class="release-info placeholder-info">
            <!-- div class="release-title">&nbsp;</div -->
            <div class="release-date">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseCard from './BaseCard.vue'
import configService from '../services/config.js'

const props = defineProps({
  /**
   * Service type: 'sonarr' or 'radarr'
   */
  serviceType: {
    type: String,
    required: true,
    validator: (value) => ['sonarr', 'radarr'].includes(value),
  },

  /**
   * Card title
   */
  title: {
    type: String,
    default: 'Upcoming Releases',
  },

  /**
   * Grid width in cells
   */
  gridWidth: {
    type: Number,
    default: 2,
  },

  /**
   * Grid height in cells
   */
  gridHeight: {
    type: Number,
    default: 2,
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
   * Maximum number of releases to show
   */
  maxReleases: {
    type: Number,
    default: 4,
  },

  /**
   * Refresh interval in minutes
   */
  refreshInterval: {
    type: Number,
    default: 30,
  },
})

// Reactive state
const releases = ref([])
const loading = ref(false)
const error = ref(null)

// Sizing: poster width scales with container height to preserve 2:3 aspect ratio
const releasesGridRef = ref(null)
const posterItemWidth = ref(120)
let resizeObserver = null

const recomputePosterWidth = () => {
  const el = releasesGridRef.value
  if (!el) return
  const height = el.clientHeight || 0
  // Reserve space for title/date text below poster and padding
  const reserved = 56 // px
  const candidate = (2 / 3) * Math.max(0, height - reserved)
  // Clamp to sensible bounds
  const clamped = Math.max(90, Math.min(220, Math.floor(candidate)))
  posterItemWidth.value = clamped
}

// Computed properties
const displayReleases = computed(() => {
  const actualReleases = releases.value.slice(0, props.maxReleases)
  const placeholders = []

  // Add placeholder items to maintain consistent layout
  for (let i = actualReleases.length; i < props.maxReleases; i++) {
    placeholders.push({
      id: `placeholder-${i}`,
      title: '',
      airDate: '',
      poster: null,
      isPlaceholder: true,
    })
  }

  return [...actualReleases, ...placeholders]
})

// Get service configuration
const getServiceConfig = () => {
  const services = configService.config.links || configService.config.services || []
  const serviceName = props.serviceType === 'sonarr' ? 'TV Shows' : 'Movies'
  return services.find(
    (service) => service.name === serviceName || service.url.includes(props.serviceType),
  )
}

// Format date with smart formatting - handle timezones properly
const formatDate = (dateString) => {
  // Parse the date and convert to local timezone
  const date = new Date(dateString)
  const now = new Date()

  // Get local dates (ignoring time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const releaseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Debug logging to check timezone issues
  console.log(
    `Date debug: Original: ${dateString}, Parsed: ${date.toISOString()}, Local: ${date.toLocaleDateString()}`,
  )

  const diffTime = releaseDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  //if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays > 1 && diffDays <= 7) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

  // Format as "Month Day"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
  // The placeholder icon will remain visible
}

// Handle successful image loading
const handleImageLoad = (event) => {
  // Hide the placeholder icon when image loads
  const icon = event.target.parentNode?.querySelector('.placeholder-icon')
  if (icon) {
    icon.style.display = 'none'
  }
}

// Fetch upcoming releases from API
const fetchReleases = async () => {
  loading.value = true
  error.value = null

  try {
    const serviceConfig = getServiceConfig()
    if (!serviceConfig) {
      throw new Error(`${props.serviceType} service not configured`)
    }

    const baseUrl = serviceConfig.url.replace(/\/$/, '')
    const endpoint = props.serviceType === 'sonarr' ? '/api/v3/calendar' : '/api/v3/calendar'

    // Get API key
    const apiKey = configService.getApiKey(props.serviceType, 'api_key')
    if (!apiKey) {
      throw new Error(`API key not configured for ${props.serviceType}`)
    }

    // Get releases for the next 30 days
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const url = `${baseUrl}${endpoint}?start=${startDate}&end=${endDate}&unmonitored=false`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API request failed: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // For Sonarr, we need to fetch series data separately since calendar API doesn't include full series info
    if (props.serviceType === 'sonarr') {
      const uniqueSeriesIds = [...new Set(data.map((item) => item.seriesId))]
      console.log('Fetching series data for IDs:', uniqueSeriesIds)

      // Fetch series data for each unique series ID
      const seriesPromises = uniqueSeriesIds.map(async (seriesId) => {
        try {
          const seriesResponse = await fetch(`${baseUrl}/api/v3/series/${seriesId}`, {
            headers: {
              'X-Api-Key': apiKey,
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          })
          if (seriesResponse.ok) {
            const seriesData = await seriesResponse.json()
            return { seriesId, seriesData }
          }
        } catch (err) {
          console.warn(`Failed to fetch series ${seriesId}:`, err)
        }
        return { seriesId, seriesData: null }
      })

      const seriesResults = await Promise.all(seriesPromises)

      // Attach series data to episodes
      seriesResults.forEach(({ seriesId, seriesData }) => {
        if (seriesData) {
          data.forEach((episode) => {
            if (episode.seriesId === seriesId) {
              episode.series = seriesData
            }
          })
        }
      })
    }

    // Transform data based on service type
    releases.value = data
      .map((item) => {
        const posterUrl = getPosterUrl(item)
        if (posterUrl) {
          console.log(`${props.serviceType} poster URL:`, posterUrl)
        } else {
          console.log(`${props.serviceType} no poster URL for:`, item.title || item.series?.title)
        }

        // Debug the item structure for Sonarr (only first few items)
        if (props.serviceType === 'sonarr' && releases.value.length < 3) {
          console.log(`${props.serviceType} item structure:`, {
            id: item.id,
            title: item.title,
            seriesTitle: item.series?.title,
            seasonNumber: item.seasonNumber,
            episodeNumber: item.episodeNumber,
          })
        }

        return {
          id: item.id,
          title:
            props.serviceType === 'sonarr'
              ? `${item.series?.title || 'Unknown Series'} - S${String(item.seasonNumber || 0).padStart(2, '0')}E${String(item.episodeNumber || 0).padStart(2, '0')}`
              : item.title,
          airDate:
            props.serviceType === 'sonarr'
              ? item.airDate || item.airDateUtc
              : item.digitalRelease || item.inCinemas || item.releaseDate,
          poster: posterUrl,
        }
      })
      .filter((item) => {
        if (!item.airDate) return false

        // Only show episodes airing today or in the future (handle timezone properly)
        const airDate = new Date(item.airDate)
        const now = new Date()

        // Get local dates (ignoring time) for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const releaseDate = new Date(airDate.getFullYear(), airDate.getMonth(), airDate.getDate())

        return releaseDate >= today
      })

    // Sort by air date
    releases.value.sort((a, b) => new Date(a.airDate) - new Date(b.airDate))
  } catch (err) {
    console.error('Failed to fetch releases:', err)

    // Provide helpful error messages for common issues
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error.value = `CORS error: ${props.serviceType} server may need CORS configuration. Check browser console for details.`
    } else if (err.message.includes('401')) {
      error.value = `Authentication failed: Check your ${props.serviceType} API key`
    } else if (err.message.includes('404')) {
      error.value = `API endpoint not found: Check your ${props.serviceType} URL and version`
    } else {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

// Get poster URL from item data - using correct API response structure
const getPosterUrl = (item) => {
  if (props.serviceType === 'sonarr') {
    // For Sonarr, try to get poster from series images
    const poster = item.series?.images?.find((img) => img.coverType === 'poster')
    if (poster?.remoteUrl) {
      return poster.remoteUrl
    }
    // Fallback: try item images directly
    const itemPoster = item.images?.find((img) => img.coverType === 'poster')
    if (itemPoster?.remoteUrl) {
      return itemPoster.remoteUrl
    }
  } else {
    // For Radarr, use movie poster from images array
    const poster = item.images?.find((img) => img.coverType === 'poster')
    if (poster?.remoteUrl) {
      return poster.remoteUrl
    }
  }

  return null
}

// Setup refresh interval
let refreshTimer = null

const setupRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  if (props.refreshInterval > 0) {
    refreshTimer = setInterval(fetchReleases, props.refreshInterval * 60 * 1000)
  }
}

// Lifecycle
onMounted(async () => {
  await configService.loadConfig()
  await fetchReleases()
  setupRefreshTimer()
  // Observe size to recompute poster width on container changes
  resizeObserver = new ResizeObserver(() => recomputePosterWidth())
  if (releasesGridRef.value) resizeObserver.observe(releasesGridRef.value)
  // Initial compute (next tick to ensure DOM painted)
  setTimeout(recomputePosterWidth, 0)
})

// Watch for refresh interval changes
watch(() => props.refreshInterval, setupRefreshTimer)

// Cleanup
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (resizeObserver && releasesGridRef.value) {
    try {
      resizeObserver.unobserve(releasesGridRef.value)
    } catch {
      // ignore
    }
    resizeObserver = null
  }
})
</script>

<style scoped>
.upcoming-releases {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.error-message {
  color: #ef4444;
  text-align: center;
  padding: 20px;
  font-size: 0.875rem;
}

.no-releases {
  color: #6b7280;
  text-align: center;
  padding: 20px;
  font-size: 0.875rem;
}

.releases-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: var(--poster-item-width, 120px);
  gap: 12px;
  padding: 8px;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  justify-content: start;
  align-items: start;
  min-height: 200px; /* Ensure consistent height */
}

.release-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: var(--poster-item-width, 120px);
}

.poster-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.poster-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  z-index: 2;
}

.placeholder-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.placeholder-item {
  opacity: 0.3;
}

.empty-placeholder {
  background: rgba(255, 255, 255, 0.05);
}

.placeholder-info {
  opacity: 0;
}

.release-info {
  text-align: center;
  width: 100%;
}

.release-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  line-height: 1.2;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.release-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .releases-grid {
    gap: 8px;
    padding: 4px;
  }

  .release-item {
    width: 100px;
  }

  .release-title {
    font-size: 0.7rem;
  }

  .release-date {
    font-size: 0.65rem;
  }
}
</style>
