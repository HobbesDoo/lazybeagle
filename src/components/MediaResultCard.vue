<!--
  MediaResultCard Component

  Displays individual search results from Sonarr/Radarr with poster, ratings, and metadata.
  Modular design to work with different *arr services.
-->

<template>
  <div class="media-result-card" @click="handleAddClick">
    <div class="media-poster">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="mediaTitle"
        class="poster-image"
        @error="handleImageError"
      />
      <div v-else class="poster-placeholder">
        <span class="placeholder-icon">{{ providerType === 'sonarr' ? '📺' : '🎬' }}</span>
      </div>
    </div>

    <div class="media-info">
      <!-- Title and Year -->
      <div class="title-section">
        <h3 class="media-title">{{ mediaTitle }}</h3>
        <span v-if="year" class="media-year">({{ year }})</span>
      </div>

      <!-- Ratings -->
      <div v-if="hasRatings" class="ratings-section">
        <!-- IMDB Rating -->
        <div v-if="imdbRating" class="rating imdb-rating">
          <span class="rating-source">IMDb</span>
          <span class="rating-value">{{ imdbRating.toFixed(1) }}</span>
        </div>

        <!-- TMDB Rating -->
        <div v-if="tmdbRating" class="rating tmdb-rating">
          <span class="rating-source">TMDb</span>
          <span class="rating-value">{{ tmdbRating.toFixed(1) }}</span>
        </div>

        <!-- Other ratings -->
        <div v-if="rottenTomatoesRating" class="rating rt-rating">
          <span class="rating-source">RT</span>
          <span class="rating-value">{{ rottenTomatoesRating }}%</span>
        </div>
      </div>

      <!-- Metadata -->
      <div class="metadata-section">
        <!-- Status/Certification -->
        <div v-if="certification" class="metadata-item certification">
          {{ certification }}
        </div>

        <!-- Runtime/Duration -->
        <div v-if="runtime" class="metadata-item runtime">
          {{ formatRuntime(runtime) }}
        </div>

        <!-- Genres -->
        <div v-if="genres && genres.length > 0" class="metadata-item genres">
          {{ genres.slice(0, 3).join(', ') }}
        </div>

        <!-- Network/Studio -->
        <div v-if="network" class="metadata-item network">
          {{ network }}
        </div>

        <!-- Status for TV Shows -->
        <div v-if="status && providerType === 'sonarr'" class="metadata-item status">
          {{ status }}
        </div>
      </div>

      <!-- Overview -->
      <div v-if="overview" class="overview-section">
        <p class="media-overview">{{ truncatedOverview }}</p>
        <button v-if="overview.length > 200" class="expand-button" @click.stop="toggleOverview">
          {{ showFullOverview ? 'Show Less' : 'Show More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  providerType: {
    type: String,
    required: true, // 'sonarr' or 'radarr'
    validator: (value) => ['sonarr', 'radarr'].includes(value),
  },
})

// Emits
const emit = defineEmits(['addMedia'])

// Reactive state
const showFullOverview = ref(false)

// Computed properties
const mediaTitle = computed(() => {
  return props.result.title || props.result.seriesName || 'Unknown Title'
})

const year = computed(() => {
  if (props.providerType === 'sonarr') {
    return (
      props.result.year ||
      (props.result.firstAired ? new Date(props.result.firstAired).getFullYear() : null)
    )
  } else {
    return (
      props.result.year ||
      (props.result.releaseDate ? new Date(props.result.releaseDate).getFullYear() : null)
    )
  }
})

const posterUrl = computed(() => {
  // Try different poster sources
  const images = props.result.images || []
  const poster = images.find((img) => img.coverType === 'poster')

  if (poster?.remoteUrl) {
    return poster.remoteUrl
  }

  // Fallback to other image fields
  if (props.result.remotePoster) {
    return props.result.remotePoster
  }

  return null
})

const overview = computed(() => {
  return props.result.overview || props.result.summary || ''
})

const truncatedOverview = computed(() => {
  if (!overview.value) return ''
  if (showFullOverview.value || overview.value.length <= 200) {
    return overview.value
  }
  return overview.value.substring(0, 200) + '...'
})

// Ratings
const imdbRating = computed(() => {
  const ratings = props.result.ratings || {}
  return ratings.imdb?.value || null
})

const tmdbRating = computed(() => {
  const ratings = props.result.ratings || {}
  return ratings.tmdb?.value || null
})

const rottenTomatoesRating = computed(() => {
  const ratings = props.result.ratings || {}
  return ratings.rottenTomatoes?.value || null
})

const hasRatings = computed(() => {
  return imdbRating.value || tmdbRating.value || rottenTomatoesRating.value
})

// Metadata
const certification = computed(() => {
  return props.result.certification || props.result.contentRating || null
})

const runtime = computed(() => {
  return props.result.runtime || null
})

const genres = computed(() => {
  return props.result.genres || []
})

const network = computed(() => {
  if (props.providerType === 'sonarr') {
    return props.result.network || null
  } else {
    return props.result.studio || null
  }
})

const status = computed(() => {
  return props.result.status || null
})

// Methods
const handleAddClick = () => {
  emit('addMedia', {
    ...props.result,
    providerType: props.providerType,
  })
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const toggleOverview = () => {
  showFullOverview.value = !showFullOverview.value
}

const formatRuntime = (minutes) => {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}
</script>

<style scoped>
.media-result-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.media-result-card:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.media-poster {
  position: relative;
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.6;
}

.media-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.title-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.media-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.media-year {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 400;
}

.ratings-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.imdb-rating {
  background: #f59e0b;
  color: white;
}

.tmdb-rating {
  background: #0ea5e9;
  color: white;
}

.rt-rating {
  background: #dc2626;
  color: white;
}

.rating-source {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.rating-value {
  font-weight: 700;
}

.metadata-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.metadata-item {
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.certification {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

.status {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

.overview-section {
  margin-top: 4px;
}

.media-overview {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 8px 0;
}

.expand-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.expand-button:hover {
  color: #2563eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .media-result-card {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .media-result-card:hover {
    background: rgba(31, 41, 55, 0.9);
  }

  .media-title {
    color: #f9fafb;
  }

  .media-year {
    color: #9ca3af;
  }

  .media-overview {
    color: #d1d5db;
  }

  .poster-placeholder {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
  }
}

/* Responsive */
@media (max-width: 768px) {
  .media-result-card {
    flex-direction: column;
    gap: 12px;
  }

  .media-poster {
    width: 100%;
    height: 200px;
    max-width: 140px;
    margin: 0 auto;
  }

  .media-title {
    font-size: 1.125rem;
  }

  .ratings-section {
    gap: 12px;
  }

  .metadata-section {
    gap: 8px;
  }

  .metadata-item {
    font-size: 0.8rem;
    padding: 3px 10px;
  }
}

@media (max-width: 480px) {
  .media-result-card {
    padding: 12px;
  }

  .media-poster {
    height: 160px;
    max-width: 110px;
  }

  .placeholder-icon {
    font-size: 36px;
  }

  .title-section {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
