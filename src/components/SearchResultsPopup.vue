<!--
  SearchResultsPopup Component

  A sliding popup that displays search results from Sonarr/Radarr APIs.
  Slides up from the bottom of the screen with smooth animations.
-->

<template>
  <div v-if="isVisible" class="search-popup-overlay" @click="handleOverlayClick">
    <div class="search-popup" :class="{ 'popup-visible': isVisible }">
      <!-- Header -->
      <div class="popup-header">
        <div class="header-info">
          <IconRenderer
            v-if="searchData.provider?.icon"
            :icon="searchData.provider.icon"
            :size="28"
          />
          <div class="header-text">
            <h2 class="popup-title">{{ searchData.provider?.name }} Search</h2>
            <p class="search-query">"{{ searchData.query }}"</p>
          </div>
        </div>
        <button class="close-button" @click="closePopup">
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
      </div>

      <!-- Content -->
      <div class="popup-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Searching {{ searchData.provider?.name }}...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="searchData.error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Search Failed</h3>
          <p>{{ searchData.error }}</p>
          <button class="retry-button" @click="retrySearch">Try Again</button>
        </div>

        <!-- No Results -->
        <div v-else-if="searchData.results && searchData.results.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No Results Found</h3>
          <p>
            No {{ searchData.provider?.api_type === 'sonarr' ? 'TV shows' : 'movies' }} found for
            "{{ searchData.query }}"
          </p>
        </div>

        <!-- Results -->
        <div
          v-else-if="searchData.results && searchData.results.length > 0"
          class="results-container"
        >
          <div class="results-header">
            <h3>
              {{ searchData.results.length }} Result{{ searchData.results.length !== 1 ? 's' : '' }}
              Found
            </h3>
          </div>

          <div class="results-grid">
            <MediaResultCard
              v-for="(result, index) in searchData.results"
              :key="result.id || result.tmdbId || result.tvdbId || index"
              :result="result"
              :provider-type="searchData.provider?.api_type"
              @add-media="handleAddMedia"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, defineEmits } from 'vue'
import IconRenderer from './IconRenderer.vue'
import MediaResultCard from './MediaResultCard.vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  searchData: {
    type: Object,
    default: () => ({
      provider: null,
      query: '',
      results: [],
      error: null,
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['close', 'retry', 'addMedia'])

// Handle overlay click (close on backdrop click)
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closePopup()
  }
}

// Close popup
const closePopup = () => {
  emit('close')
}

// Retry search
const retrySearch = () => {
  emit('retry')
}

// Handle add media request
const handleAddMedia = (mediaData) => {
  emit('addMedia', mediaData)
}

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    closePopup()
  }
}

// Watch for visibility changes to handle body scroll
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  },
)
</script>

<style scoped>
.search-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.search-popup {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  width: calc(100% - 48px);
  max-width: 900px;
  max-height: 85vh;
  margin: 0 24px;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
}

.popup-visible {
  transform: translateY(0);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.provider-icon {
  font-size: 32px;
  line-height: 1;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.search-query {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #374151;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 8px 0;
}

.error-state p {
  color: #6b7280;
  margin: 0 0 24px 0;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #2563eb;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.no-results p {
  color: #6b7280;
  margin: 0;
}

/* Results */
.results-container {
  padding-top: 24px;
}

.results-header {
  margin-bottom: 24px;
}

.results-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.results-grid {
  display: grid;
  gap: 16px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-popup {
    background: rgba(31, 41, 55, 0.95);
  }

  .popup-title {
    color: #f9fafb;
  }

  .search-query {
    color: #9ca3af;
  }

  .close-button {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    color: #9ca3af;
  }

  .close-button:hover {
    background: rgba(31, 41, 55, 0.9);
    color: #d1d5db;
  }

  .popup-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .error-state h3 {
    color: #ef4444;
  }

  .error-state p,
  .no-results p {
    color: #9ca3af;
  }

  .no-results h3,
  .results-header h3 {
    color: #f9fafb;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-popup {
    width: calc(100% - 24px);
    margin: 0 12px;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
  }

  .popup-header {
    padding: 20px;
  }

  .popup-title {
    font-size: 1.25rem;
  }

  .provider-icon {
    font-size: 28px;
  }

  .popup-content {
    padding: 0 20px 20px;
  }

  .loading-state,
  .error-state,
  .no-results {
    padding: 32px 16px;
  }
}

@media (max-width: 480px) {
  .search-popup {
    width: calc(100% - 16px);
    margin: 0 8px;
  }
}
</style>
