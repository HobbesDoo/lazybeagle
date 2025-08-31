<!--
  AddMediaModal Component

  A modal for adding TV shows (Sonarr) or movies (Radarr) with proper configuration options.
  Handles both service types with appropriate form fields and validation.
-->

<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" :class="{ 'modal-visible': isVisible }">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-info">
          <div class="media-poster-small">
            <img
              v-if="mediaData.posterUrl"
              :src="mediaData.posterUrl"
              :alt="mediaData.title"
              class="poster-image-small"
              @error="handleImageError"
            />
            <div v-else class="poster-placeholder-small">
              <span class="placeholder-icon-small">{{
                mediaData.providerType === 'sonarr' ? '📺' : '🎬'
              }}</span>
            </div>
          </div>
          <div class="header-text">
            <h2 class="modal-title">{{ mediaData.title }}</h2>
            <p class="media-year" v-if="mediaData.year">({{ mediaData.year }})</p>
            <p class="modal-subtitle">
              Add to {{ mediaData.providerType === 'sonarr' ? 'Sonarr' : 'Radarr' }}
            </p>
          </div>
        </div>
        <button class="close-button" @click="closeModal">
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
      <div class="modal-content">
        <!-- Loading State -->
        <div v-if="isLoadingOptions" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading options...</p>
        </div>

        <!-- Form -->
        <div v-else class="add-form">
          <!-- Synopsis -->
          <div v-if="mediaData.overview" class="form-section">
            <label class="form-label">Synopsis</label>
            <div class="synopsis-container">
              <p class="synopsis-text">{{ truncatedSynopsis }}</p>
              <button
                v-if="mediaData.overview.length > 200"
                class="expand-synopsis-button"
                @click="toggleSynopsis"
              >
                {{ showFullSynopsis ? 'Show Less' : 'Show More' }}
              </button>
            </div>
          </div>

          <!-- Monitor Options (Sonarr only) -->
          <div v-if="mediaData.providerType === 'sonarr'" class="form-section">
            <label class="form-label" for="monitor-select">Monitor</label>
            <select v-model="formData.monitor" id="monitor-select" class="form-select">
              <option value="all">All Episodes</option>
              <option value="future">Future Episodes</option>
              <option value="missing">Missing Episodes</option>
              <option value="existing">Existing Episodes</option>
              <option value="firstSeason">First Season</option>
              <option value="latestSeason">Latest Season</option>
              <option value="none">None</option>
            </select>
          </div>

          <!-- Quality Profile -->
          <div class="form-section">
            <label class="form-label" for="quality-select">Quality Profile</label>
            <select v-model="formData.qualityProfileId" id="quality-select" class="form-select">
              <option value="" disabled>Select quality profile...</option>
              <option v-for="profile in qualityProfiles" :key="profile.id" :value="profile.id">
                {{ profile.name }}
              </option>
            </select>
          </div>

          <!-- Root Folder -->
          <div class="form-section">
            <label class="form-label" for="root-folder">Root Folder</label>
            <div class="root-folder-display">
              <span class="folder-path">{{ rootFolderPath }}</span>
              <span class="folder-separator">/</span>
              <span class="folder-name">{{ folderName }}</span>
            </div>
          </div>

          <!-- Search Options -->
          <div class="form-section">
            <div class="checkbox-container">
              <input
                type="checkbox"
                id="search-checkbox"
                v-model="formData.searchForMissing"
                class="form-checkbox"
              />
              <label for="search-checkbox" class="checkbox-label">
                {{
                  mediaData.providerType === 'sonarr'
                    ? 'Start searching for missing episodes'
                    : 'Start searching for movie'
                }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Cancel</button>
        <button class="add-button" @click="handleAdd" :disabled="!canAdd || isAdding">
          <div v-if="isAdding" class="button-spinner"></div>
          <span v-else>Add {{ mediaData.title }}</span>
        </button>
      </div>

      <!-- Success/Error Message -->
      <div
        v-if="addResult"
        class="result-message"
        :class="{ success: addResult.success, error: !addResult.success }"
      >
        <div class="result-icon">{{ addResult.success ? '✅' : '❌' }}</div>
        <div class="result-text">
          <h4>{{ addResult.success ? 'Success!' : 'Error' }}</h4>
          <p>{{ addResult.message }}</p>
        </div>
        <button class="result-close" @click="closeResult">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import configService from '../services/config.js'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  mediaData: {
    type: Object,
    default: () => ({
      title: '',
      year: null,
      overview: '',
      posterUrl: null,
      providerType: 'sonarr',
    }),
  },
})

// Emits
const emit = defineEmits(['close', 'added'])

// Reactive state
const showFullSynopsis = ref(false)
const isLoadingOptions = ref(false)
const isAdding = ref(false)
const addResult = ref(null)

// Form data
const formData = ref({
  monitor: 'all',
  qualityProfileId: '',
  searchForMissing: true,
})

// Options from API
const qualityProfiles = ref([])
const rootFolders = ref([])

// Computed properties
const truncatedSynopsis = computed(() => {
  if (!props.mediaData.overview) return ''
  if (showFullSynopsis.value || props.mediaData.overview.length <= 200) {
    return props.mediaData.overview
  }
  return props.mediaData.overview.substring(0, 200) + '...'
})

const rootFolder = computed(() => {
  return rootFolders.value[0] || null
})

const rootFolderPath = computed(() => {
  if (rootFolder.value?.path) return rootFolder.value.path
  // Fallbacks by provider
  if (props.mediaData.providerType === 'readarr') return '/data/media/books'
  if (props.mediaData.providerType === 'radarr') return '/data/media/movies'
  if (props.mediaData.providerType === 'sonarr') return '/data/media/tv'
  return '/data/media'
})

const folderName = computed(() => {
  if (!props.mediaData.title) return ''
  // Clean up title for folder name
  const cleanTitle = props.mediaData.title.replace(/[^\w\s-]/g, '').trim()
  const yearSuffix = props.mediaData.year ? ` (${props.mediaData.year})` : ''
  return cleanTitle + yearSuffix
})

const canAdd = computed(() => {
  return formData.value.qualityProfileId && !isAdding.value
})

// Methods
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const closeModal = () => {
  emit('close')
}

const toggleSynopsis = () => {
  showFullSynopsis.value = !showFullSynopsis.value
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const closeResult = () => {
  addResult.value = null
}

// Load options from API
const loadOptions = async () => {
  if (!props.isVisible || !props.mediaData.providerType) return

  isLoadingOptions.value = true

  try {
    const serviceConfig = configService.getServiceByType(props.mediaData.providerType)
    if (!serviceConfig?.url || !serviceConfig?.api_key) {
      throw new Error(`${props.mediaData.providerType} service not configured`)
    }

    const baseUrl = serviceConfig.url.replace(/\/$/, '')
    const apiKey = serviceConfig.api_key
    const apiVersion = props.mediaData.providerType === 'readarr' ? 'v1' : 'v3'

    // Load quality profiles and root folders in parallel (use correct API version)
    const [qualityResponse, rootFolderResponse] = await Promise.all([
      fetch(`${baseUrl}/api/${apiVersion}/qualityprofile`, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      }),
      fetch(`${baseUrl}/api/${apiVersion}/rootfolder`, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      }),
    ])

    if (qualityResponse.ok) {
      qualityProfiles.value = await qualityResponse.json()

      // Set default quality profile (prefer provider default flag or reasonable heuristic)
      let defaultProfile = qualityProfiles.value.find((p) => p.default === true)
      if (!defaultProfile) {
        if (props.mediaData.providerType === 'sonarr') {
          defaultProfile = qualityProfiles.value.find((p) => /1080p|HD-1080p/i.test(p.name || ''))
        } else if (props.mediaData.providerType === 'radarr') {
          defaultProfile = qualityProfiles.value.find((p) => /4K|Ultra[- ]HD/i.test(p.name || ''))
        } else if (props.mediaData.providerType === 'readarr') {
          defaultProfile = qualityProfiles.value[0]
        }
      }
      formData.value.qualityProfileId = (defaultProfile || qualityProfiles.value[0] || {}).id || ''
    }

    if (rootFolderResponse.ok) {
      rootFolders.value = await rootFolderResponse.json()
    }
  } catch (error) {
    console.error('Failed to load options:', error)
  } finally {
    isLoadingOptions.value = false
  }
}

// Handle add media
const handleAdd = async () => {
  if (!canAdd.value) return

  isAdding.value = true
  addResult.value = null

  try {
    const serviceConfig = configService.getServiceByType(props.mediaData.providerType)
    const baseUrl = serviceConfig.url.replace(/\/$/, '')
    const apiKey = serviceConfig.api_key

    let endpoint = '/api/v3/movie'
    if (props.mediaData.providerType === 'sonarr') endpoint = '/api/v3/series'
    if (props.mediaData.providerType === 'readarr') endpoint = '/api/v1/book'

    // Prepare payload (spread source data first, then enforce required fields)
    const payload = {
      ...props.mediaData, // include ids, titleSlug, images, etc.
      title: props.mediaData.title,
      qualityProfileId: Number(formData.value.qualityProfileId),
      rootFolderPath: rootFolderPath.value,
      addOptions: {
        searchForMissing: formData.value.searchForMissing,
      },
      monitored: true,
    }

    // Add Sonarr-specific fields
    if (props.mediaData.providerType === 'sonarr') {
      payload.seasonFolder = true
      payload.seriesType = 'standard'
      payload.rootFolderPath = rootFolderPath.value
      payload.qualityProfileId = Number(formData.value.qualityProfileId)
      payload.monitored = true
      payload.monitoringOptions = {
        monitor: formData.value.monitor,
      }
    }

    // Add Radarr-specific fields
    if (props.mediaData.providerType === 'radarr') {
      payload.minimumAvailability = 'released'
      payload.monitored = true
    }

    // Add Readarr-specific fields
    if (props.mediaData.providerType === 'readarr') {
      if (!formData.value.qualityProfileId && qualityProfiles.value.length > 0) {
        formData.value.qualityProfileId = qualityProfiles.value[0].id
      }
      payload.qualityProfileId = Number(formData.value.qualityProfileId)
      payload.rootFolderPath = rootFolderPath.value
      payload.monitored = true
      payload.addOptions = { searchForMissing: true, searchForMissingBooks: true }
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const result = await response.json()
      addResult.value = {
        success: true,
        message: `${props.mediaData.title} has been successfully added to ${props.mediaData.providerType === 'sonarr' ? 'Sonarr' : 'Radarr'}!`,
      }

      emit('added', result)

      // Auto-close after success
      setTimeout(() => {
        closeModal()
      }, 2000)
    } else {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }
  } catch (error) {
    console.error('Failed to add media:', error)
    addResult.value = {
      success: false,
      message: `Failed to add ${props.mediaData.title}: ${error.message}`,
    }
  } finally {
    isAdding.value = false
  }
}

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal()
  }
}

// Watchers
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      loadOptions()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
      // Reset form
      showFullSynopsis.value = false
      addResult.value = null
    }
  },
)

// Initialize
onMounted(() => {
  if (props.isVisible) {
    loadOptions()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

.modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.modal-visible {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-header {
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
  flex: 1;
  min-width: 0;
}

.media-poster-small {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.poster-image-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
}

.placeholder-icon-small {
  font-size: 24px;
  opacity: 0.6;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.media-year {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #9ca3af;
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
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #374151;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.synopsis-container {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.synopsis-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.expand-synopsis-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.expand-synopsis-button:hover {
  color: #2563eb;
}

.form-select {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.root-folder-display {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: monospace;
  font-size: 0.9rem;
  color: #4b5563;
}

.folder-path {
  color: #6b7280;
}

.folder-separator {
  color: #9ca3af;
  margin: 0 2px;
}

.folder-name {
  color: #374151;
  font-weight: 500;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.checkbox-label {
  color: #374151;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #374151;
}

.add-button {
  background: #10b981;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.add-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.add-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.result-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transform: translateY(-100%);
  animation: slideDown 0.3s ease forwards;
}

.result-message.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.result-message.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.result-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.result-text {
  flex: 1;
  min-width: 0;
}

.result-text h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
}

.result-text p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.result-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.result-close:hover {
  opacity: 1;
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

@keyframes slideDown {
  to {
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modal {
    background: rgba(31, 41, 55, 0.95);
  }

  .modal-title {
    color: #f9fafb;
  }

  .media-year {
    color: #9ca3af;
  }

  .modal-subtitle {
    color: #6b7280;
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

  .modal-header,
  .modal-footer {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .form-label {
    color: #f9fafb;
  }

  .synopsis-container,
  .root-folder-display {
    background: rgba(31, 41, 55, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .synopsis-text {
    color: #d1d5db;
  }

  .form-select {
    background: rgba(31, 41, 55, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }

  .checkbox-label {
    color: #f9fafb;
  }

  .cancel-button {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    color: #9ca3af;
  }

  .cancel-button:hover {
    background: rgba(31, 41, 55, 0.9);
    color: #d1d5db;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal {
    border-radius: 16px;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 20px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .add-form {
    gap: 20px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .add-button,
  .cancel-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
