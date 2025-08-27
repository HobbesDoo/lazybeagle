<!--
  SettingsPanel Component

  A slide-in settings panel that appears from the right side of the screen.
  Allows users to configure dashboard settings like background themes, weather location, etc.
-->

<template>
  <!-- Backdrop -->
  <div v-if="isOpen" class="settings-backdrop" @click="closePanel"></div>

  <!-- Settings Panel -->
  <div :class="['settings-panel', { 'settings-panel-open': isOpen }]">
    <!-- Panel Header -->
    <header class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <button class="close-button" @click="closePanel" aria-label="Close settings">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>

    <!-- Panel Content -->
    <div class="settings-content">
      <!-- Tab Navigation -->
      <nav class="settings-tabs">
        <button
          :class="['tab-button', { 'tab-active': activeTab === 'general' }]"
          @click="activeTab = 'general'"
        >
          General
        </button>
        <button
          :class="['tab-button', { 'tab-active': activeTab === 'api' }]"
          @click="activeTab = 'api'"
        >
          API Keys
        </button>
        <button
          :class="['tab-button', { 'tab-active': activeTab === 'import' }]"
          @click="activeTab = 'import'"
        >
          Import/Export
        </button>
      </nav>

      <!-- General Settings Tab -->
      <div v-if="activeTab === 'general'" class="tab-content">
        <!-- Background Theme Section -->
        <section class="settings-section">
          <h3 class="section-title">Background Theme</h3>
          <div class="theme-grid">
            <button
              v-for="theme in backgroundThemes"
              :key="theme.id"
              :class="['theme-option', { 'theme-selected': settings.backgroundTheme === theme.id }]"
              @click="updateSetting('backgroundTheme', theme.id)"
            >
              <div
                class="theme-preview"
                :style="{ backgroundImage: `url(${theme.preview})` }"
              ></div>
              <span class="theme-name">{{ theme.name }}</span>
            </button>
          </div>

          <!-- Background Rotation Settings -->
          <div class="input-group">
            <label class="checkbox-option">
              <input
                type="checkbox"
                v-model="settings.backgroundRotation"
                @change="updateSetting('backgroundRotation', settings.backgroundRotation)"
              />
              <span class="checkbox-label">Auto-rotate backgrounds</span>
            </label>
          </div>

          <div v-if="settings.backgroundRotation" class="input-group">
            <label for="rotation-interval" class="input-label">Rotation interval (minutes)</label>
            <input
              id="rotation-interval"
              v-model.number="settings.backgroundInterval"
              type="number"
              min="5"
              max="120"
              class="settings-input"
              @blur="updateSetting('backgroundInterval', settings.backgroundInterval)"
            />
          </div>
        </section>

        <!-- Weather Location Section -->
        <section class="settings-section">
          <h3 class="section-title">Weather Location</h3>
          <div class="input-group">
            <label for="weather-location" class="input-label">City</label>
            <input
              id="weather-location"
              v-model="settings.weatherLocation"
              type="text"
              class="settings-input"
              placeholder="Enter city name"
              @blur="updateSetting('weatherLocation', settings.weatherLocation)"
            />
          </div>
        </section>

        <!-- Time Format Section -->
        <section class="settings-section">
          <h3 class="section-title">Time Format</h3>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                value="12"
                :checked="settings.timeFormat === '12'"
                @change="updateSetting('timeFormat', '12')"
              />
              <span class="radio-label">12 Hour</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                value="24"
                :checked="settings.timeFormat === '24'"
                @change="updateSetting('timeFormat', '24')"
              />
              <span class="radio-label">24 Hour</span>
            </label>
          </div>
        </section>

        <!-- Grid Layout Section -->
        <section class="settings-section">
          <h3 class="section-title">Grid Layout</h3>
          <div class="input-group">
            <label for="grid-columns" class="input-label">Columns</label>
            <input
              id="grid-columns"
              v-model.number="settings.gridColumns"
              type="number"
              min="2"
              max="8"
              class="settings-input"
              @blur="updateSetting('gridColumns', settings.gridColumns)"
            />
          </div>
          <div class="input-group">
            <label for="grid-rows" class="input-label">Rows</label>
            <input
              id="grid-rows"
              v-model.number="settings.gridRows"
              type="number"
              min="2"
              max="8"
              class="settings-input"
              @blur="updateSetting('gridRows', settings.gridRows)"
            />
          </div>
        </section>
      </div>

      <!-- API Keys Tab -->
      <div v-if="activeTab === 'api'" class="tab-content">
        <section class="settings-section">
          <h3 class="section-title">Unsplash API</h3>
          <p class="section-description">
            Get your API keys from
            <a href="https://unsplash.com/developers" target="_blank" rel="noopener"
              >Unsplash Developers</a
            >
          </p>
          <div class="input-group">
            <label for="unsplash-access" class="input-label">Access Key</label>
            <div class="password-input">
              <input
                id="unsplash-access"
                v-model="settings.unsplashAccessKey"
                :type="showApiKeys ? 'text' : 'password'"
                class="settings-input"
                placeholder="Enter your Unsplash access key"
                @blur="updateSetting('unsplashAccessKey', settings.unsplashAccessKey)"
              />
              <button type="button" class="toggle-visibility" @click="showApiKeys = !showApiKeys">
                <svg
                  v-if="showApiKeys"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="input-group">
            <label for="unsplash-secret" class="input-label">Secret Key (Optional)</label>
            <input
              id="unsplash-secret"
              v-model="settings.unsplashSecretKey"
              :type="showApiKeys ? 'text' : 'password'"
              class="settings-input"
              placeholder="Enter your Unsplash secret key"
              @blur="updateSetting('unsplashSecretKey', settings.unsplashSecretKey)"
            />
          </div>
        </section>

        <section class="settings-section">
          <h3 class="section-title">OpenWeatherMap API</h3>
          <p class="section-description">
            Get your API key from
            <a href="https://openweathermap.org/api" target="_blank" rel="noopener"
              >OpenWeatherMap</a
            >
          </p>
          <div class="input-group">
            <label for="weather-api" class="input-label">API Key</label>
            <input
              id="weather-api"
              v-model="settings.openweatherApiKey"
              :type="showApiKeys ? 'text' : 'password'"
              class="settings-input"
              placeholder="Enter your OpenWeatherMap API key"
              @blur="updateSetting('openweatherApiKey', settings.openweatherApiKey)"
            />
          </div>
        </section>
      </div>

      <!-- Import/Export Tab -->
      <div v-if="activeTab === 'import'" class="tab-content">
        <section class="settings-section">
          <h3 class="section-title">Configuration Management</h3>
          <p class="section-description">Manage your dashboard configuration files and settings.</p>
          <div class="config-actions">
            <button class="action-button" @click="exportConfig">Export Config as YAML</button>
            <button class="action-button secondary" @click="reloadFromYaml">
              Reload from config.yaml
            </button>
            <button class="action-button danger" @click="clearAndReload">Clear All & Reload</button>
          </div>
        </section>

        <section class="settings-section">
          <h3 class="section-title">Import Configuration</h3>
          <p class="section-description">Import settings from a YAML configuration file.</p>
          <div class="input-group">
            <label for="yaml-import" class="input-label">YAML Configuration</label>
            <textarea
              id="yaml-import"
              v-model="yamlImport"
              class="yaml-textarea"
              placeholder="Paste your YAML configuration here..."
              rows="10"
            ></textarea>
          </div>
          <button class="action-button" @click="importConfig" :disabled="!yamlImport.trim()">
            Import Configuration
          </button>
        </section>
      </div>
    </div>

    <!-- Panel Footer -->
    <footer class="settings-footer">
      <button class="reset-button" @click="resetSettings">Reset to Default</button>
      <button class="save-button" @click="saveSettings">Save Changes</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import configService from '../services/config.js'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'settings-changed'])

// Current settings (reactive)
const settings = reactive({
  // API Keys
  unsplashAccessKey: '',
  unsplashSecretKey: '',
  openweatherApiKey: '',

  // Dashboard settings
  backgroundTheme: 'nature',
  backgroundRotation: true,
  backgroundInterval: 30,
  weatherLocation: 'New York',
  timeFormat: '12',
  gridColumns: 6,
  gridRows: 4,
})

// UI state
const activeTab = ref('general')
const showApiKeys = ref(false)
const yamlImport = ref('')

// Background theme options
const backgroundThemes = ref([
  {
    id: 'nature',
    name: 'Nature',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
  },
  {
    id: 'urban',
    name: 'Urban',
    preview: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=120&fit=crop',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=120&fit=crop',
  },
  {
    id: 'space',
    name: 'Space',
    preview: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=120&fit=crop',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    preview: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&h=120&fit=crop',
  },
  {
    id: 'mountains',
    name: 'Mountains',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
  },
])

// Load settings from config service
const loadSettings = async () => {
  await configService.loadConfig()

  // Map config to settings
  settings.unsplashAccessKey = configService.getApiKey('unsplash', 'access_key') || ''
  settings.unsplashSecretKey = configService.getApiKey('unsplash', 'secret_key') || ''
  settings.openweatherApiKey = configService.getApiKey('openweather', 'api_key') || ''

  const dashboardSettings = configService.getDashboardSettings()
  settings.backgroundTheme = dashboardSettings.background.theme
  settings.backgroundRotation = dashboardSettings.background.rotation_enabled
  settings.backgroundInterval = dashboardSettings.background.rotation_interval
  settings.weatherLocation = dashboardSettings.weather.location
  settings.timeFormat = dashboardSettings.time.format
  settings.gridColumns = dashboardSettings.grid.columns
  settings.gridRows = dashboardSettings.grid.rows
}

// Initialize settings
onMounted(async () => {
  await loadSettings()
})

// Watch for settings changes and emit to parent
watch(
  settings,
  (newSettings) => {
    emit('settings-changed', { ...newSettings })
  },
  { deep: true },
)

// Update a specific setting
const updateSetting = (key, value) => {
  settings[key] = value

  // Update config service
  if (key === 'unsplashAccessKey') {
    configService.setApiKey('unsplash', 'access_key', value)
  } else if (key === 'unsplashSecretKey') {
    configService.setApiKey('unsplash', 'secret_key', value)
  } else if (key === 'openweatherApiKey') {
    configService.setApiKey('openweather', 'api_key', value)
  } else if (key === 'backgroundTheme') {
    configService.set('dashboard.background.theme', value)
  } else if (key === 'backgroundRotation') {
    configService.set('dashboard.background.rotation_enabled', value)
  } else if (key === 'backgroundInterval') {
    configService.set('dashboard.background.rotation_interval', value)
  } else if (key === 'weatherLocation') {
    configService.set('dashboard.weather.location', value)
  } else if (key === 'timeFormat') {
    configService.set('dashboard.time.format', value)
  } else if (key === 'gridColumns') {
    configService.set('dashboard.grid.columns', value)
  } else if (key === 'gridRows') {
    configService.set('dashboard.grid.rows', value)
  }
}

// Export configuration as YAML
const exportConfig = () => {
  const yamlContent = configService.exportAsYaml()
  if (yamlContent) {
    // Create download link
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lazybeagle-config.yaml'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Import configuration from YAML
const importConfig = () => {
  if (yamlImport.value.trim()) {
    const success = configService.importFromYaml(yamlImport.value)
    if (success) {
      // Reload settings from config
      loadSettings()
      yamlImport.value = ''
      alert('Configuration imported successfully!')
    } else {
      alert('Failed to import configuration. Please check the YAML format.')
    }
  }
}

// Reload configuration from YAML file
const reloadFromYaml = async () => {
  try {
    await configService.reloadFromYaml()
    await loadSettings()
    alert('Configuration reloaded from config.yaml successfully!')
  } catch (error) {
    console.error('Failed to reload from YAML:', error)
    alert('Failed to reload configuration. Check the console for details.')
  }
}

// Clear localStorage completely and reload from YAML
const clearAndReload = async () => {
  if (confirm('This will clear all your saved settings and reload from config.yaml. Continue?')) {
    try {
      // Clear localStorage
      localStorage.removeItem('lazybeagle-config')
      console.log('Cleared localStorage')

      // Force reload from YAML
      await configService.reloadFromYaml()
      await loadSettings()

      alert('All settings cleared and reloaded from config.yaml successfully!')
    } catch (error) {
      console.error('Failed to clear and reload:', error)
      alert('Failed to clear and reload. Check the console for details.')
    }
  }
}

// Close panel
const closePanel = () => {
  emit('close')
}

// Reset settings to default
const resetSettings = () => {
  configService.resetToDefaults()
  loadSettings()
}

// Save settings
const saveSettings = () => {
  closePanel()
}
</script>

<style scoped>
.settings-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.settings-panel-open {
  transform: translateX(0);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.tab-button {
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.tab-active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.tab-content {
  padding: 24px;
}

.settings-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-option {
  background: none;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.theme-option:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.theme-selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.theme-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.settings-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

.settings-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type='radio'] {
  margin: 0;
}

.radio-label {
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-option input[type='checkbox'] {
  margin: 0;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

.section-description {
  margin: 0 0 16px 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.section-description a {
  color: #3b82f6;
  text-decoration: none;
}

.section-description a:hover {
  text-decoration: underline;
}

.password-input {
  position: relative;
}

.toggle-visibility {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.toggle-visibility:hover {
  color: #374151;
}

.yaml-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
  min-height: 200px;
  transition: border-color 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

.yaml-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-button {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.action-button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.action-button.secondary {
  background: #6b7280;
  border-color: #6b7280;
}

.action-button.secondary:hover:not(:disabled) {
  background: #4b5563;
  border-color: #4b5563;
}

.action-button.danger {
  background: #dc2626;
  border-color: #dc2626;
}

.action-button.danger:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.config-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.config-actions .action-button {
  flex: 1;
  min-width: 140px;
}

@media (max-width: 480px) {
  .config-actions {
    flex-direction: column;
  }

  .config-actions .action-button {
    min-width: unset;
  }
}

.settings-footer {
  padding: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.reset-button,
.save-button {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
}

.reset-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.save-button {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.save-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .settings-panel {
    background: rgba(17, 24, 39, 0.95);
    border-left-color: rgba(255, 255, 255, 0.1);
  }

  .settings-title {
    color: #f9fafb;
  }

  .section-title {
    color: #f9fafb;
  }

  .theme-name {
    color: #d1d5db;
  }

  .input-label {
    color: #d1d5db;
  }

  .settings-input {
    background: rgba(55, 65, 81, 0.8);
    border-color: #4b5563;
    color: #f9fafb;
  }

  .radio-label {
    color: #d1d5db;
  }

  .reset-button {
    border-color: #4b5563;
    color: #d1d5db;
  }
}

/* Responsive */
@media (max-width: 480px) {
  .settings-panel {
    width: 100vw;
  }

  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
