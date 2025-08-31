/**
 * Configuration Service for LazyBeagle Dashboard
 *
 * Handles reading and writing YAML configuration files
 * Provides reactive configuration management with validation
 */

import yaml from 'js-yaml'
import { ref, reactive, watch } from 'vue'

/**
 * Default configuration structure
 */
const DEFAULT_CONFIG = {
  api_keys: {
    unsplash: {
      access_key: '',
      secret_key: '',
    },
    openweather: {
      api_key: '',
    },
  },
  dashboard: {
    background: {
      theme: 'nature',
      rotation_enabled: true,
      rotation_interval: 30,
      quality: 80,
      blur_overlay: 0.3,
    },
    time: {
      format: '12',
      timezone: 'auto',
    },
    weather: {
      location: 'New York',
      units: 'metric',
      refresh_interval: 10,
    },
    grid: {
      columns: 6,
      rows: 4,
      gap: 16,
      padding: 24,
    },
  },
  layout: {
    clock: {
      enabled: true,
      position: 'clock',
      settings: {
        show_seconds: false,
        show_date: true,
        show_temperature: true,
      },
    },
    search: {
      enabled: true,
      position: 'search',
      settings: {
        default_engine: 'google',
        show_suggestions: true,
        max_suggestions: 5,
      },
    },
    weather: {
      enabled: true,
      position: 'weather',
      settings: {
        show_details: true,
        show_forecast: false,
      },
    },
    quick_links: {
      enabled: true,
      position: 'links',
      cards: [
        {
          name: 'Google',
          url: 'https://google.com',
          description: 'Search',
          icon: '🌐',
          enabled: true,
        },
        {
          name: 'YouTube',
          url: 'https://youtube.com',
          description: 'Videos',
          icon: '📺',
          enabled: true,
        },
      ],
    },
  },
  services: [],
  links: [],
  search_engines: [
    {
      id: 'google',
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      icon: 'https://www.google.com/favicon.ico',
      placeholder: 'Search Google or type a URL',
      default: true,
    },
  ],
  themes: {
    nature: {
      name: 'Nature',
      keywords: ['nature', 'forest', 'mountains', 'landscape', 'trees', 'wilderness'],
      collections: ['1114848', '1065976'],
    },
  },
}

/**
 * Configuration Service Class
 */
export class ConfigService {
  constructor() {
    this.config = reactive({ ...DEFAULT_CONFIG })
    this.isLoaded = ref(false)
    this.isLoading = ref(false)
    this.error = ref(null)

    // Auto-save configuration changes
    watch(
      () => this.config,
      () => {
        this.saveToLocalStorage()
      },
      { deep: true },
    )
  }

  /**
   * Load configuration from YAML file
   */
  async loadConfig(forceReload = false) {
    this.isLoading.value = true
    this.error.value = null

    try {
      // ALWAYS load from YAML first, then merge with localStorage changes
      console.log('Loading config from YAML file...')

      // Helper to fetch YAML, returning null on 404
      const fetchYamlIfExists = async (path) => {
        const res = await fetch(path)
        if (!res.ok) {
          if (res.status === 404) return null
          throw new Error(`Failed to load ${path}: ${res.statusText}`)
        }
        const text = await res.text()
        return yaml.load(text)
      }

      // Load base and optional partials
      const baseConfig = await fetchYamlIfExists('/config.yaml')
      if (!baseConfig) throw new Error('Missing /config.yaml')
      console.log('Loaded base YAML config:', baseConfig)

      const [clockCfg, searchCfg, upcomingCfg, weatherCfg, linksCfg, servicesCfg] =
        await Promise.all([
          fetchYamlIfExists('/clock.yaml'),
          fetchYamlIfExists('/search.yaml'),
          fetchYamlIfExists('/upcomingReleases.yaml'),
          fetchYamlIfExists('/weather.yaml'),
          fetchYamlIfExists('/links.yaml'),
          fetchYamlIfExists('/services.yaml'),
        ])

      // Normalize partials into expected structure for deep merge
      const normalizePartials = () => {
        const out = {}
        // Components might come as layout or direct key; accept both
        if (clockCfg) {
          out.layout = out.layout || {}
          out.layout.clock = clockCfg.layout?.clock || clockCfg.clock || clockCfg
        }
        if (searchCfg) {
          out.layout = out.layout || {}
          out.layout.search = searchCfg.layout?.search || searchCfg.search || searchCfg
          // Move search engines list from search.yaml into root config
          if (searchCfg.search_engines || searchCfg.searchEngines) {
            out.search_engines = searchCfg.search_engines || searchCfg.searchEngines
          }
        }
        if (upcomingCfg) {
          out.layout = out.layout || {}
          out.layout.upcoming_releases =
            upcomingCfg.layout?.upcoming_releases || upcomingCfg.upcoming_releases || upcomingCfg
        }
        if (weatherCfg) {
          // Weather may affect dashboard.weather and/or layout.weather
          if (weatherCfg.dashboard?.weather || weatherCfg.weather) {
            out.dashboard = out.dashboard || {}
            out.dashboard.weather = weatherCfg.dashboard?.weather || weatherCfg.weather
          }
          if (weatherCfg.layout?.weather || weatherCfg.weather?.layout) {
            out.layout = out.layout || {}
            out.layout.weather = weatherCfg.layout?.weather || weatherCfg.weather?.layout
          }
        }
        if (linksCfg) {
          out.links = linksCfg.links || linksCfg
        }
        if (servicesCfg) {
          out.services = servicesCfg.services || servicesCfg
        }
        return out
      }

      const yamlConfig = this.deepMerge(baseConfig, normalizePartials())
      console.log('Loaded merged YAML from partials:', yamlConfig)

      // Merge with defaults to ensure all properties exist
      const mergedConfig = this.mergeWithDefaults(yamlConfig)
      console.log('Merged YAML config:', mergedConfig)
      console.log('Services in YAML config:', mergedConfig.services)
      console.log('Links in YAML config:', mergedConfig.links)
      console.log('Links in YAML config:', mergedConfig.links)

      // Apply the YAML config first
      Object.assign(this.config, mergedConfig)

      // Then apply any localStorage overrides (for user modifications like API keys)
      if (!forceReload) {
        const localConfig = this.loadFromLocalStorage()
        if (localConfig) {
          console.log('Applying localStorage overrides for API keys and settings...')
          // Only override specific user settings, not the entire services/links arrays
          if (localConfig.api_keys) {
            Object.assign(this.config.api_keys, localConfig.api_keys)
          }
          if (localConfig.dashboard) {
            Object.assign(this.config.dashboard, localConfig.dashboard)
          }
          // DON'T override services/links - keep them from YAML
        }
      }

      this.isLoaded.value = true
    } catch (error) {
      console.error('Failed to load configuration:', error)
      this.error.value = error.message

      // Use default configuration
      Object.assign(this.config, DEFAULT_CONFIG)
      this.isLoaded.value = true
    } finally {
      this.isLoading.value = false
    }

    return this.config
  }

  /**
   * Force reload configuration from YAML file (ignores localStorage)
   */
  async reloadFromYaml() {
    return this.loadConfig(true)
  }

  /**
   * Save configuration to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('lazybeagle-config', JSON.stringify(this.config))
    } catch (error) {
      console.error('Failed to save config to localStorage:', error)
    }
  }

  /**
   * Load configuration from localStorage
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('lazybeagle-config')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error)
    }
    return null
  }

  /**
   * Export configuration as YAML string
   */
  exportAsYaml() {
    try {
      return yaml.dump(this.config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
      })
    } catch (error) {
      console.error('Failed to export config as YAML:', error)
      return null
    }
  }

  /**
   * Import configuration from YAML string
   */
  importFromYaml(yamlString) {
    try {
      const importedConfig = yaml.load(yamlString)
      const mergedConfig = this.mergeWithDefaults(importedConfig)
      Object.assign(this.config, mergedConfig)
      this.saveToLocalStorage()
      return true
    } catch (error) {
      console.error('Failed to import YAML config:', error)
      this.error.value = error.message
      return false
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults() {
    Object.assign(this.config, DEFAULT_CONFIG)
    localStorage.removeItem('lazybeagle-config')
  }

  /**
   * Merge imported config with defaults to ensure all properties exist
   */
  mergeWithDefaults(importedConfig) {
    return this.deepMerge(DEFAULT_CONFIG, importedConfig || {})
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  /**
   * Get a specific configuration value using dot notation
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config)
  }

  /**
   * Set a specific configuration value using dot notation
   */
  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {}
      return obj[key]
    }, this.config)

    target[lastKey] = value
  }

  /**
   * Get API key for a service
   */
  getApiKey(serviceType, keyType = 'api_key') {
    // Prefer API key embedded in services.yaml entries
    const services = this.config.services || []
    const svc = services.find((s) => {
      const type = (s.api_type || s.type || '').toLowerCase()
      return type === String(serviceType).toLowerCase()
    })
    if (svc && svc[keyType]) return svc[keyType]

    // Special case Unsplash keys (access_key/secret_key)
    if (serviceType.toLowerCase() === 'unsplash') {
      if (svc && (svc.access_key || svc.secret_key)) {
        return keyType === 'secret_key' ? svc.secret_key : svc.access_key
      }
    }

    // Fallback to legacy api_keys map under dashboard config
    return this.get(`api_keys.${serviceType}.${keyType}`)
  }

  /**
   * Set API key for a service
   */
  setApiKey(service, keyType, value) {
    this.set(`api_keys.${service}.${keyType}`, value)
  }

  /**
   * Get dashboard settings
   */
  getDashboardSettings() {
    return this.config.dashboard
  }

  /**
   * Update dashboard settings
   */
  updateDashboardSettings(settings) {
    Object.assign(this.config.dashboard, settings)
  }

  /**
   * Get layout configuration
   */
  getLayout() {
    return this.config.layout
  }

  /**
   * Update layout configuration
   */
  updateLayout(layout) {
    Object.assign(this.config.layout, layout)
  }

  /**
   * Get enabled services
   */
  getEnabledServices() {
    const services = this.config.services || []
    console.log('getEnabledServices called, all services:', services)
    console.log(
      'Services details:',
      services.map((s) => ({ name: s.name, enabled: s.enabled })),
    )
    const enabled = services.filter((service) => service.enabled)
    console.log('Filtered enabled services:', enabled)
    console.log('Enabled services count:', enabled.length)
    return enabled
  }

  /**
   * Get enabled links (pure hyperlinks, not data providers)
   */
  getEnabledLinks() {
    const links = this.config.links || []
    console.log('getEnabledLinks called, all links:', links)
    const enabled = links.filter((link) => link.enabled)
    console.log('Filtered enabled links:', enabled)
    return enabled
  }

  /**
   * Get service configuration by type (e.g., 'sonarr', 'radarr')
   */
  getServiceByType(serviceType) {
    const services = this.config.services || []
    const lower = String(serviceType).toLowerCase()

    // Prefer api_type match
    let found = services.find((s) => String(s.api_type || s.type || '').toLowerCase() === lower)
    if (found) return found

    // Fallback: name variations by display name
    const variations = {
      sonarr: ['tv shows', 'sonarr'],
      radarr: ['movies', 'radarr'],
      readarr: ['books', 'readarr'],
      openweather: ['openweather', 'weather'],
      unsplash: ['unsplash'],
    }
    const validNames = variations[lower] || [lower]
    return services.find((s) => validNames.includes(String(s.name || '').toLowerCase()))
  }

  /**
   * Enable/disable a service
   */
  toggleService(serviceName, enabled) {
    const arr =
      (this.config.links && this.config.links.length ? this.config.links : this.config.services) ||
      []
    const service = arr.find((s) => s.name === serviceName)
    if (service) {
      service.enabled = enabled
    }
  }

  /**
   * Get search engines
   */
  getSearchEngines() {
    return this.config.search_engines
  }

  /**
   * Get default search engine
   */
  getDefaultSearchEngine() {
    const defaultEngineId = this.config.layout?.search?.settings?.default_engine || 'google'
    return (
      this.config.search_engines.find((engine) => engine.id === defaultEngineId) ||
      this.config.search_engines[0]
    )
  }

  /**
   * Get theme configuration
   */
  getTheme(themeId) {
    return this.config.themes[themeId]
  }

  /**
   * Get all themes
   */
  getAllThemes() {
    return this.config.themes
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = []

    // Validate required API keys
    if (!this.get('api_keys.unsplash.access_key')) {
      errors.push('Unsplash access key is required for background images')
    }

    // Validate dashboard settings
    const theme = this.get('dashboard.background.theme')
    if (!this.config.themes[theme]) {
      errors.push(`Invalid background theme: ${theme}`)
    }

    // Validate grid settings
    const columns = this.get('dashboard.grid.columns')
    const rows = this.get('dashboard.grid.rows')
    if (columns < 1 || columns > 12) {
      errors.push('Grid columns must be between 1 and 12')
    }
    if (rows < 1 || rows > 12) {
      errors.push('Grid rows must be between 1 and 12')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Clear localStorage and reload from YAML
   */
  async clearLocalStorageAndReload() {
    localStorage.removeItem('lazybeagle-config')
    return this.loadConfig(true)
  }
}

// Create singleton instance
export const configService = new ConfigService()

// Export default
export default configService
