<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import SearchCard from '../components/SearchCard.vue'
import ClockCard from '../components/ClockCard.vue'
import WeatherCard from '../components/WeatherCard.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import WebLinkCard from '../components/WebLinkCard.vue'
import UpcomingReleasesCard from '../components/UpcomingReleasesCard.vue'
import SearchResultsPopup from '../components/SearchResultsPopup.vue'
import AddMediaModal from '../components/AddMediaModal.vue'
import BackgroundService from '../services/background.js'
import configService from '../services/config.js'
import IconRenderer from '../components/IconRenderer.vue'
import GridContainer from '../components/GridContainer.vue'

// Reactive state
const showSettingsPanel = ref(false)
const currentBackground = ref('')
const backgroundService = new BackgroundService(configService)
const enabledServices = ref([])

// Search popup state
const showSearchPopup = ref(false)
const searchPopupData = ref({
  provider: null,
  query: '',
  results: [],
  error: null,
})
const isSearchLoading = ref(false)

// Add media modal state
const showAddModal = ref(false)
const addModalData = ref({
  title: '',
  year: null,
  overview: '',
  posterUrl: null,
  providerType: 'sonarr',
})

// Settings from config service
const settings = reactive({
  backgroundTheme: 'nature',
  weatherLocation: 'Surrey, Canada',
  timeFormat: '12',
  gridColumns: 6,
  gridRows: 4,
})

// Layout mapping for card positions/sizes from config
const layout = computed(() => configService.config.dashboard?.layout?.cards || {})

// Background style for GridContainer
const gridBackground = computed(() => {
  if (!currentBackground.value) return null
  return `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${currentBackground.value}) center/cover no-repeat fixed`
})

// Load settings from config service
const loadSettings = async () => {
  await configService.loadConfig()

  const dashboardSettings = configService.getDashboardSettings()
  settings.backgroundTheme = dashboardSettings.background.theme
  settings.weatherLocation = dashboardSettings.weather.location
  settings.timeFormat = dashboardSettings.time.format
  settings.gridColumns = dashboardSettings.grid.columns
  settings.gridRows = dashboardSettings.grid.rows

  // Load enabled services
  enabledServices.value = configService.getEnabledServices()
  console.log('Loaded enabled services:', enabledServices.value)
  console.log('All links from config:', configService.config.links)
  console.log('Config loaded?', configService.isLoaded.value)
}

// Update background based on theme
const updateBackground = async (themeId) => {
  try {
    const background = await backgroundService.getBackgroundForTheme(
      themeId || settings.backgroundTheme,
    )
    currentBackground.value = background.url
  } catch (error) {
    console.error('Failed to load background:', error)
    // Fallback to a default gradient
    currentBackground.value = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
}

// Handle settings changes
const handleSettingsChange = (newSettings) => {
  Object.assign(settings, newSettings)

  // Update background if theme changed
  if (newSettings.backgroundTheme) {
    updateBackground(newSettings.backgroundTheme)
  }

  // Update config service with new settings
  if (newSettings.weatherLocation) {
    configService.set('dashboard.weather.location', newSettings.weatherLocation)
  }
}

// Toggle settings panel
const toggleSettingsPanel = () => {
  showSettingsPanel.value = !showSettingsPanel.value
}

// Close settings panel
const closeSettingsPanel = () => {
  showSettingsPanel.value = false
}

// Initialize component
onMounted(async () => {
  await loadSettings()
  updateBackground()

  // Start background rotation based on config
  const dashboardSettings = configService.getDashboardSettings()
  const rotationEnabled = dashboardSettings.background.rotation_enabled
  const rotationInterval = dashboardSettings.background.rotation_interval

  if (rotationEnabled) {
    backgroundService.startRotation(settings.backgroundTheme, rotationInterval, (background) => {
      currentBackground.value = background.url
    })
  }
})

// Search popup handlers
const handleOpenSearchPopup = (data) => {
  searchPopupData.value = data
  showSearchPopup.value = true
  isSearchLoading.value = false
}

const handleCloseSearchPopup = () => {
  showSearchPopup.value = false
  searchPopupData.value = {
    provider: null,
    query: '',
    results: [],
    error: null,
  }
}

const handleRetrySearch = async () => {
  if (!searchPopupData.value.provider || !searchPopupData.value.query) return

  isSearchLoading.value = true

  try {
    const provider = searchPopupData.value.provider
    const query = searchPopupData.value.query

    // Re-perform the API search
    const serviceConfig = configService.getServiceByType(provider.api_type)
    if (!serviceConfig?.url || !serviceConfig?.api_key) {
      throw new Error(`${provider.api_type} service not configured`)
    }

    const baseUrl = serviceConfig.url.replace(/\/$/, '')
    const apiKey = serviceConfig.api_key
    const endpoint =
      provider.api_type === 'sonarr' ? '/api/v3/series/lookup' : '/api/v3/movie/lookup'

    const response = await fetch(`${baseUrl}${endpoint}?term=${encodeURIComponent(query)}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const results = await response.json()

    searchPopupData.value = {
      ...searchPopupData.value,
      results: results,
      error: null,
    }
  } catch (error) {
    console.error('Retry search failed:', error)
    searchPopupData.value = {
      ...searchPopupData.value,
      results: [],
      error: error.message,
    }
  } finally {
    isSearchLoading.value = false
  }
}

const handleAddMedia = (mediaData) => {
  console.log('Add media requested:', mediaData)

  // Extract poster URL from the media data
  const posterUrl = (() => {
    if (mediaData.images && mediaData.images.length > 0) {
      const poster = mediaData.images.find((img) => img.coverType === 'poster')
      return poster?.remoteUrl || null
    }
    return mediaData.remotePoster || null
  })()

  // Set up modal data
  addModalData.value = {
    ...mediaData,
    posterUrl: posterUrl,
    year:
      mediaData.year ||
      (mediaData.firstAired ? new Date(mediaData.firstAired).getFullYear() : null) ||
      (mediaData.releaseDate ? new Date(mediaData.releaseDate).getFullYear() : null),
  }

  // Show the add modal
  showAddModal.value = true
}

const handleCloseAddModal = () => {
  showAddModal.value = false
  addModalData.value = {
    title: '',
    year: null,
    overview: '',
    posterUrl: null,
    providerType: 'sonarr',
  }
}

const handleMediaAdded = (result) => {
  console.log('Media added successfully:', result)
  // Optionally refresh upcoming releases cards or show notification
}

// Cleanup
onUnmounted(() => {
  backgroundService.stopRotation()
})
</script>

<template>
  <div class="dashboard">
    <!-- Settings Icon -->
    <button
      class="settings-icon"
      @click="toggleSettingsPanel"
      aria-label="Open settings"
      style="color: #fff"
    >
      <IconRenderer icon="lucide:menu" :size="28" :stroke-width="2.5" />
    </button>

    <GridContainer
      :columns="settings.gridColumns"
      :rows="settings.gridRows"
      :gap="settings.gridGap"
      :padding="settings.gridPadding"
      :background="gridBackground || undefined"
    >
      <ClockCard
        :time-format="settings.timeFormat"
        :grid-width="layout.clock?.width || 2"
        :grid-height="layout.clock?.height || 2"
        :grid-column-start="layout.clock?.col || null"
        :grid-row-start="layout.clock?.row || null"
      />

      <SearchCard
        :grid-width="layout.search?.width || 3"
        :grid-height="layout.search?.height || 1"
        :grid-column-start="layout.search?.col || null"
        :grid-row-start="layout.search?.row || null"
        @openSearchPopup="handleOpenSearchPopup"
      />

      <WeatherCard
        :location="settings.weatherLocation"
        units="metric"
        :refresh-interval="10"
        :grid-width="layout.weather?.width || 2"
        :grid-height="layout.weather?.height || 2"
        :grid-column-start="layout.weather?.col || null"
        :grid-row-start="layout.weather?.row || null"
      />

      <UpcomingReleasesCard
        service-type="sonarr"
        title="Upcoming TV"
        :grid-width="layout.upcoming_tv?.width || 2"
        :grid-height="layout.upcoming_tv?.height || 2"
        :grid-column-start="layout.upcoming_tv?.col || null"
        :grid-row-start="layout.upcoming_tv?.row || null"
      />
      <UpcomingReleasesCard
        service-type="radarr"
        title="Upcoming Movies"
        :grid-width="layout.upcoming_movies?.width || 2"
        :grid-height="layout.upcoming_movies?.height || 2"
        :grid-column-start="layout.upcoming_movies?.col || null"
        :grid-row-start="layout.upcoming_movies?.row || null"
      />
      <WebLinkCard
        :grid-width="layout.links?.width || 4"
        :grid-height="layout.links?.height || 4"
        :links="
          enabledServices.map((s) => ({
            name: s.name,
            url: s.url,
            description: s.description,
            icon: s.icon,
            iconUrl: s.icon_url,
          }))
        "
      />
    </GridContainer>

    <!-- Settings Panel -->
    <SettingsPanel
      :is-open="showSettingsPanel"
      @close="closeSettingsPanel"
      @settings-changed="handleSettingsChange"
    />

    <!-- Search Results Popup -->
    <SearchResultsPopup
      :is-visible="showSearchPopup"
      :search-data="searchPopupData"
      :is-loading="isSearchLoading"
      @close="handleCloseSearchPopup"
      @retry="handleRetrySearch"
      @addMedia="handleAddMedia"
    />

    <!-- Add Media Modal -->
    <AddMediaModal
      :is-visible="showAddModal"
      :media-data="addModalData"
      @close="handleCloseAddModal"
      @added="handleMediaAdded"
    />
  </div>
</template>

<style scoped>
.dashboard {
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
}

.dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
}

.settings-icon {
  position: fixed;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.settings-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.content-grid {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: grid;
  grid-template-areas:
    '. clock weather'
    '. search releases'
    'links links links';
  grid-template-columns: 1fr 2fr 2fr;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
  padding: 80px 48px 48px;
  align-items: start;
}

.clock-section {
  grid-area: clock;
  display: flex;
  justify-content: center;
}

.search-section {
  grid-area: search;
  display: flex;
  justify-content: center;
  align-items: center;
}

.weather-section {
  grid-area: weather;
  display: flex;
  justify-content: center;
}

.releases-section {
  grid-area: releases;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.links-section {
  grid-area: links;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-bottom: 24px;
  max-width: 100%;
  align-items: flex-start;
  align-content: flex-start;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-areas:
      'clock weather'
      'search releases'
      'links links';
    grid-template-columns: 1fr 1fr;
    padding: 80px 32px 32px;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-areas:
      'clock'
      'weather'
      'search'
      'releases'
      'links';
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    padding: 80px 24px 24px;
    gap: 16px;
  }

  .settings-icon {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }

  .links-section {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .content-grid {
    padding: 60px 16px 16px;
  }

  .links-section {
    gap: 8px;
  }
}
</style>
