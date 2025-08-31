<!--
  WeatherCard Component

  Displays current weather information with a clean, minimal design.
  Fetches weather data from OpenWeatherMap API and shows temperature, conditions, and location.
-->

<template>
  <BaseCard
    :grid-width="gridWidth"
    :grid-height="gridHeight"
    :grid-column-start="gridColumnStart"
    :grid-row-start="gridRowStart"
    :bordered="true"
    :shadow="true"
    :frameless="true"
    :style="{}"
  >
    <div class="weather-card">
      <!-- Loading State -->
      <div v-if="loading" class="weather-loading">
        <div class="loading-spinner"></div>
        <span class="loading-text">Loading weather...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="weather-error">
        <svg
          class="error-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="error-text">Weather unavailable</span>
        <button class="retry-button" @click="fetchWeather">Retry</button>
      </div>

      <!-- Weather Data -->
      <div v-else-if="weatherData" class="weather-content">
        <!-- Location Header -->
        <div class="location-header">
          <span class="location-name">{{ weatherData.name }}</span>
        </div>

        <!-- Main Temperature Display -->
        <div class="main-temperature">
          <span class="temperature-large">{{ Math.round(weatherData.main.temp) }}°</span>
        </div>

        <!-- Weather Icon and Description -->
        <div class="weather-status">
          <img
            :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`"
            :alt="weatherData.weather[0].description"
            class="weather-icon-main"
          />
          <span class="weather-condition">
            {{
              weatherData.weather[0].description.charAt(0).toUpperCase() +
              weatherData.weather[0].description.slice(1)
            }}
          </span>
        </div>

        <!-- High/Low Temperature -->
        <div class="temp-range">
          <span class="temp-high">H:{{ Math.round(weatherData.main.temp_max) }}°</span>
          <span class="temp-low">L:{{ Math.round(weatherData.main.temp_min) }}°</span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import configService from '../services/config.js'
import BaseCard from './BaseCard.vue'

const props = defineProps({
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
   * City name for weather lookup
   */
  location: {
    type: String,
    default: 'Surrey, CA',
  },

  /**
   * OpenWeatherMap API key
   */
  apiKey: {
    type: String,
    default: 'fc315fbd1c64cd2f058a9d33789a1993', // You'll need to provide your own API key
  },

  /**
   * Temperature unit: 'metric' (Celsius), 'imperial' (Fahrenheit), 'kelvin'
   */
  units: {
    type: String,
    default: 'metric',
    validator: (value) => ['metric', 'imperial', 'kelvin'].includes(value),
  },

  /**
   * Auto-refresh interval in minutes
   */
  refreshInterval: {
    type: Number,
    default: 10,
  },
})

// Reactive state
const weatherData = ref(null)
const loading = ref(false)
const error = ref(false)
const intervalId = ref(null)

// API configuration
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// Get API key from config service
const getApiKey = () => {
  const configKey = configService.getApiKey('openweather', 'api_key')
  return props.apiKey || configKey || 'demo_key'
}

// Fetch weather data
const fetchWeather = async () => {
  // Get location from props or config service
  const location = props.location || configService.get('dashboard.weather.location') || 'New York'

  if (!location) return

  loading.value = true
  error.value = false

  try {
    const apiKey = getApiKey()

    // Check if we have a valid API key
    if (apiKey === 'demo_key') {
      console.warn('Using demo weather data - add your OpenWeatherMap API key in settings')
      throw new Error('No valid API key available')
    }

    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${props.units}`,
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    weatherData.value = data
  } catch (err) {
    console.error('Failed to fetch weather:', err)
    error.value = true

    // Use mock data for demo purposes if API fails
    weatherData.value = {
      name: location,
      main: {
        temp: 18,
        feels_like: 20,
        humidity: 65,
      },
      weather: [
        {
          description: 'partly cloudy',
          icon: '02d',
        },
      ],
      visibility: 10000,
    }
  } finally {
    loading.value = false
  }
}

// Set up auto-refresh
const setupAutoRefresh = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }

  if (props.refreshInterval > 0) {
    intervalId.value = setInterval(fetchWeather, props.refreshInterval * 60 * 1000)
  }
}

// Watch for location changes
watch(
  () => props.location,
  () => {
    if (props.location) {
      fetchWeather()
    }
  },
)

// Watch for refresh interval changes
watch(() => props.refreshInterval, setupAutoRefresh)

// Watch for config changes (API key updates)
watch(
  () => configService.config.api_keys?.openweather?.api_key,
  () => {
    // Refetch weather when API key changes
    fetchWeather()
  },
)

// Watch for location changes from settings
watch(
  () => configService.config.dashboard?.weather?.location,
  (newLocation) => {
    if (newLocation && newLocation !== props.location) {
      // Update location and refetch weather
      fetchWeather()
    }
  },
)

// Lifecycle
onMounted(() => {
  fetchWeather()
  setupAutoRefresh()
})

// Cleanup
const cleanup = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
}

// Expose cleanup for parent components
defineExpose({ cleanup })
</script>

<style scoped>
.weather-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px; /* slightly smaller to avoid clipping in tight grid rows */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 200px;
  width: 100%;
}

/* Loading State */
.weather-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.weather-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  color: rgba(239, 68, 68, 0.8);
}

.error-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Weather Content */
.weather-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0;
}

.location-header {
  margin-bottom: 4px;
}

.location-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
}

.main-temperature {
  margin-bottom: 6px;
}

.temperature-large {
  font-size: 3.5rem;
  font-weight: 200;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.weather-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.weather-icon-main {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
  flex-shrink: 0;
}

.weather-condition {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-transform: capitalize;
}

.temp-range {
  display: flex;
  gap: 16px;
  align-items: center;
}

.temp-high,
.temp-low {
  font-size: 0.675rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-variant-numeric: tabular-nums;
}

.temp-high {
  color: rgba(255, 255, 255, 0.9);
}

.temp-low {
  color: rgba(255, 255, 255, 0.7);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .weather-card {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .weather-card {
    padding: 16px 12px;
    min-height: 160px;
  }

  .temperature-large {
    font-size: 3rem;
  }

  .weather-icon-main {
    width: 28px;
    height: 28px;
  }

  .location-name {
    font-size: 0.8rem;
  }

  .weather-condition {
    font-size: 0.8rem;
  }

  .temp-high,
  .temp-low {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .weather-card {
    padding: 12px 8px;
    min-height: 140px;
  }

  .temperature-large {
    font-size: 2.5rem;
  }

  .weather-icon-main {
    width: 24px;
    height: 24px;
  }

  .location-name {
    font-size: 0.75rem;
  }

  .weather-condition {
    font-size: 0.75rem;
  }

  .temp-high,
  .temp-low {
    font-size: 0.75rem;
  }

  .temp-range {
    gap: 12px;
  }
}

/* Smooth transitions */
.weather-content {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
