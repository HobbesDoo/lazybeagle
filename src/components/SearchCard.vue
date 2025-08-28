<!--
  SearchCard Component

  Main search component that provides web search functionality with a clean, minimal design.
  Features a centered search input with search engine selection and suggestions.
-->

<template>
  <div class="search-card">
    <!-- Search Input -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <!-- Provider Button (replaces engine icon) -->
        <button
          v-if="currentSearchEngine"
          class="provider-button"
          @click="toggleProviderDropdown"
          :title="`Search with ${currentSearchEngine.name}`"
        >
          <span v-if="currentSearchEngine.icon.startsWith('http')" class="provider-icon">
            <img :src="currentSearchEngine.icon" :alt="currentSearchEngine.name" />
          </span>
          <span v-else class="provider-emoji">{{ currentSearchEngine.icon }}</span>
          <svg
            class="dropdown-arrow"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>

        <!-- Search Input -->
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="searchPlaceholder"
          @keydown.enter="performSearch"
          @input="handleInput"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
        />

        <!-- Search Button -->
        <button class="search-button" @click="performSearch" :disabled="!searchQuery.trim()">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>

      <!-- Provider Dropdown -->
      <div v-if="showProviderDropdown" class="provider-dropdown">
        <button
          v-for="engine in searchEngines"
          :key="engine.id"
          class="provider-item"
          @click="selectSearchEngine(engine)"
          :class="{
            'provider-active': currentSearchEngine && currentSearchEngine.id === engine.id,
          }"
        >
          <span v-if="engine.icon.startsWith('http')" class="provider-item-icon">
            <img :src="engine.icon" :alt="engine.name" />
          </span>
          <span v-else class="provider-item-emoji">{{ engine.icon }}</span>
          <span class="provider-name">{{ engine.name }}</span>
          <span v-if="currentSearchEngine && currentSearchEngine.id === engine.id" class="checkmark"
            >✓</span
          >
        </button>
      </div>

      <!-- Search Suggestions -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @mousedown="selectSuggestion(suggestion)"
        >
          <svg
            class="suggestion-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>{{ suggestion }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import configService from '../services/config.js'

// Search engines configuration - loaded from config
const searchEngines = ref([])

// Reactive state
const searchQuery = ref('')
const currentSearchEngine = ref(null)
const showSuggestions = ref(false)
const showProviderDropdown = ref(false)
const suggestions = ref([])
const searchInput = ref(null)

// Computed properties
const searchPlaceholder = computed(() => currentSearchEngine.value?.placeholder || 'Search...')

// Recent searches (stored in localStorage)
const recentSearches = ref([])

// Load search engines from config
const loadSearchEngines = async () => {
  await configService.loadConfig()
  searchEngines.value = configService.config.search_engines || []
  console.log('Loaded search engines from config:', searchEngines.value)

  // Set default search engine if none is set
  if (searchEngines.value.length > 0 && !currentSearchEngine.value) {
    const defaultEngineId =
      configService.config.layout?.search?.settings?.default_engine || 'google'
    const engine =
      searchEngines.value.find((e) => e.id === defaultEngineId) || searchEngines.value[0]
    currentSearchEngine.value = engine
  }
}

// Load recent searches from localStorage
const loadRecentSearches = () => {
  const saved = localStorage.getItem('recent-searches')
  if (saved) {
    recentSearches.value = JSON.parse(saved)
  }
}

// Save search to recent searches
const saveToRecentSearches = (query) => {
  if (!query.trim()) return

  // Remove if already exists
  const filtered = recentSearches.value.filter((item) => item !== query)

  // Add to beginning
  recentSearches.value = [query, ...filtered].slice(0, 10) // Keep only 10 recent searches

  // Save to localStorage
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
}

// Handle input changes
const handleInput = () => {
  if (searchQuery.value.trim()) {
    // Filter recent searches based on input
    suggestions.value = recentSearches.value
      .filter((item) => item.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .slice(0, 5)
  } else {
    suggestions.value = recentSearches.value.slice(0, 5)
  }
}

// Toggle provider dropdown
const toggleProviderDropdown = () => {
  showProviderDropdown.value = !showProviderDropdown.value
  showSuggestions.value = false // Close suggestions when opening provider dropdown
}

// Select a search engine
const selectSearchEngine = (engine) => {
  currentSearchEngine.value = engine
  showProviderDropdown.value = false // Close dropdown after selection
  // Save preference
  localStorage.setItem('preferred-search-engine', engine.id)
}

// Select a suggestion
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  performSearch()
}

// Hide suggestions with delay to allow click events
const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

// Define emits for parent communication
const emit = defineEmits(['openSearchPopup'])

// Perform search
const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query || !currentSearchEngine.value) return

  // Close any open dropdowns
  showSuggestions.value = false
  showProviderDropdown.value = false

  // Check if it's a URL
  const isUrl = /^https?:\/\//.test(query) || /^\w+\.\w+/.test(query)

  if (isUrl) {
    const url = query.startsWith('http') ? query : `https://${query}`
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    const engine = currentSearchEngine.value

    if (engine.display_type === 'popup' && engine.api_type) {
      // Handle API-based search with popup
      try {
        const results = await performApiSearch(engine.api_type, query)
        emit('openSearchPopup', {
          provider: engine,
          query: query,
          results: results,
        })
      } catch (error) {
        console.error('API search failed:', error)
        // Fallback to showing error in popup
        emit('openSearchPopup', {
          provider: engine,
          query: query,
          results: [],
          error: error.message,
        })
      }
    } else {
      // Handle traditional search engines (new tab)
      const searchUrl = engine.url + encodeURIComponent(query)
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Save to recent searches
  saveToRecentSearches(query)

  // Clear input
  searchQuery.value = ''
}

// Perform API search for Sonarr/Radarr
const performApiSearch = async (apiType, query) => {
  const serviceConfig = configService.getServiceByType(apiType)
  if (!serviceConfig?.url || !serviceConfig?.api_key) {
    throw new Error(`${apiType} service not configured`)
  }

  const baseUrl = serviceConfig.url.replace(/\/$/, '')
  const apiKey = serviceConfig.api_key
  const endpoint = apiType === 'sonarr' ? '/api/v3/series/lookup' : '/api/v3/movie/lookup'

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

  return await response.json()
}

// Load preferred search engine
const loadPreferences = () => {
  const preferredEngine = localStorage.getItem('preferred-search-engine')
  if (preferredEngine && searchEngines.value.length > 0) {
    const engine = searchEngines.value.find((e) => e.id === preferredEngine)
    if (engine) {
      currentSearchEngine.value = engine
    }
  }
}

// Initialize component
onMounted(async () => {
  await loadSearchEngines()
  loadRecentSearches()
  loadPreferences()

  // Focus search input
  if (searchInput.value) {
    searchInput.value.focus()
  }
})
</script>

<style scoped>
.search-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 4px 4px 4px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

.search-input-wrapper:focus-within {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.provider-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 12px;
}

.provider-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.provider-icon img {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.provider-emoji {
  font-size: 16px;
  line-height: 1;
}

.dropdown-arrow {
  color: rgba(31, 41, 55, 0.6);
  transition: transform 0.2s ease;
}

.provider-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  overflow: hidden;
  z-index: 20;
}

.provider-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.9rem;
  color: #374151;
}

.provider-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.provider-active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.provider-item-icon img {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.provider-item-emoji {
  font-size: 20px;
  line-height: 1;
}

.provider-name {
  flex: 1;
  font-weight: 500;
}

.checkmark {
  color: #10b981;
  font-weight: bold;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.125rem;
  color: #1f2937;
  padding: 14px 0;
  font-weight: 400;
}

.search-input::placeholder {
  color: rgba(31, 41, 55, 0.6);
}

.search-button {
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.search-button:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}

.search-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  overflow: hidden;
  z-index: 10;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.9rem;
  color: #374151;
}

.suggestion-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.suggestion-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-input-wrapper {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .search-input {
    color: #f9fafb;
  }

  .search-input::placeholder {
    color: rgba(249, 250, 251, 0.6);
  }

  .provider-button {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .provider-button:hover {
    background: rgba(31, 41, 55, 0.9);
  }

  .dropdown-arrow {
    color: rgba(249, 250, 251, 0.6);
  }

  .provider-dropdown {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .provider-item {
    color: #d1d5db;
  }

  .suggestions-dropdown {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .suggestion-item {
    color: #d1d5db;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-card {
    padding: 24px 16px;
  }

  .search-input {
    font-size: 1rem;
  }

  .provider-button {
    padding: 6px 10px;
  }

  .provider-emoji {
    font-size: 14px;
  }

  .provider-item-emoji {
    font-size: 18px;
  }
}
</style>
