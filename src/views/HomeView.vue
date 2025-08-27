<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import SearchCard from '../components/SearchCard.vue'
import ClockCard from '../components/ClockCard.vue'
import WeatherCard from '../components/WeatherCard.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import WebLinkCard from '../components/WebLinkCard.vue'
import BackgroundService from '../services/background.js'
import configService from '../services/config.js'

// Reactive state
const showSettingsPanel = ref(false)
const currentBackground = ref('')
const backgroundService = new BackgroundService(configService)
const enabledServices = ref([])

// Settings from config service
const settings = reactive({
  backgroundTheme: 'nature',
  weatherLocation: 'Surrey, Canada',
  timeFormat: '12',
  gridColumns: 6,
  gridRows: 4,
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
  console.log('All services from config:', configService.config.services)
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

// Cleanup
onUnmounted(() => {
  backgroundService.stopRotation()
})
</script>

<template>
  <div class="dashboard" :style="{ backgroundImage: `url(${currentBackground})` }">
    <!-- Settings Icon -->
    <button class="settings-icon" @click="toggleSettingsPanel" aria-label="Open settings">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6"></path>
        <path d="m21 12-6 0m-6 0-6 0"></path>
        <path d="m16.24 7.76-4.24 4.24m-4.24 4.24-4.24-4.24"></path>
        <path d="M16.24 16.24 12 12m-4.24-4.24L3.52 3.52"></path>
      </svg>
    </button>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Clock Card - Top Center -->
      <div class="clock-section">
        <ClockCard :time-format="settings.timeFormat" />
      </div>

      <!-- Search Card - Center -->
      <div class="search-section">
        <SearchCard />
      </div>

      <!-- Weather Card - Top Right -->
      <div class="weather-section">
        <WeatherCard :location="settings.weatherLocation" units="metric" :refresh-interval="10" />
      </div>

      <!-- Quick Links - Bottom -->
      <div class="links-section">
        <div
          v-if="enabledServices.length === 0"
          style="color: white; text-align: center; padding: 20px"
        >
          No enabled services found. Services count: {{ enabledServices.length }}
        </div>
        <WebLinkCard
          v-for="service in enabledServices"
          :key="service.name"
          :service-name="service.name"
          :url="service.url"
          :description="service.description"
          :icon="service.icon"
          :grid-width="service.grid_width || 1"
          :grid-height="service.grid_height || 1"
          variant="default"
        />
      </div>
    </div>

    <!-- Settings Panel -->
    <SettingsPanel
      :is-open="showSettingsPanel"
      @close="closeSettingsPanel"
      @settings-changed="handleSettingsChange"
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
    '. search .'
    'links links links';
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
  padding: 80px 48px 48px;
  align-items: center;
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

.links-section {
  grid-area: links;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-bottom: 24px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-areas:
      'clock weather'
      'search search'
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
      'links';
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
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
