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
        <!-- Search Engine Icon -->
        <div class="search-engine-icon">
          <img
            :src="currentSearchEngine.icon"
            :alt="currentSearchEngine.name"
            class="engine-icon"
          />
        </div>

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

    <!-- Search Engine Selector -->
    <div class="search-engines">
      <button
        v-for="engine in searchEngines"
        :key="engine.id"
        :class="['engine-button', { 'engine-active': currentSearchEngine.id === engine.id }]"
        @click="selectSearchEngine(engine)"
        :title="engine.name"
      >
        <img :src="engine.icon" :alt="engine.name" class="engine-button-icon" />
        <span class="engine-name">{{ engine.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Search engines configuration
const searchEngines = ref([
  {
    id: 'google',
    name: 'Google',
    icon: 'https://www.google.com/favicon.ico',
    url: 'https://www.google.com/search?q=',
    placeholder: 'Search Google or type a URL',
  },
  {
    id: 'bing',
    name: 'Bing',
    icon: 'https://www.bing.com/favicon.ico',
    url: 'https://www.bing.com/search?q=',
    placeholder: 'Search with Bing',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    icon: 'https://duckduckgo.com/favicon.ico',
    url: 'https://duckduckgo.com/?q=',
    placeholder: 'Search DuckDuckGo',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'https://www.youtube.com/favicon.ico',
    url: 'https://www.youtube.com/results?search_query=',
    placeholder: 'Search YouTube',
  },
])

// Reactive state
const searchQuery = ref('')
const currentSearchEngine = ref(searchEngines.value[0])
const showSuggestions = ref(false)
const suggestions = ref([])
const searchInput = ref(null)

// Computed properties
const searchPlaceholder = computed(() => currentSearchEngine.value.placeholder)

// Recent searches (stored in localStorage)
const recentSearches = ref([])

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

// Select a search engine
const selectSearchEngine = (engine) => {
  currentSearchEngine.value = engine
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

// Perform search
const performSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) return

  // Check if it's a URL
  const isUrl = /^https?:\/\//.test(query) || /^\w+\.\w+/.test(query)

  if (isUrl) {
    const url = query.startsWith('http') ? query : `https://${query}`
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    // Perform search with selected engine
    const searchUrl = currentSearchEngine.value.url + encodeURIComponent(query)
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }

  // Save to recent searches
  saveToRecentSearches(query)

  // Clear input
  searchQuery.value = ''
  showSuggestions.value = false
}

// Load preferred search engine
const loadPreferences = () => {
  const preferredEngine = localStorage.getItem('preferred-search-engine')
  if (preferredEngine) {
    const engine = searchEngines.value.find((e) => e.id === preferredEngine)
    if (engine) {
      currentSearchEngine.value = engine
    }
  }
}

// Initialize component
onMounted(() => {
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

.search-engine-icon {
  flex-shrink: 0;
  margin-right: 12px;
}

.engine-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
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

.search-engines {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.engine-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
}

.engine-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.engine-active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.engine-button-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.engine-name {
  font-weight: 500;
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

  .suggestions-dropdown {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .suggestion-item {
    color: #d1d5db;
  }

  .engine-button {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
  }

  .engine-button:hover {
    background: rgba(31, 41, 55, 0.9);
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

  .search-engines {
    gap: 8px;
  }

  .engine-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
