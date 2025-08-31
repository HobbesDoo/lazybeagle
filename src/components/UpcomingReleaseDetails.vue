<template>
  <Teleport to="body">
    <div v-if="isOpen" class="urd-overlay" @click.self="emit('close')">
      <div class="urd-panel" role="dialog" aria-modal="true">
        <button class="urd-close" @click="emit('close')" aria-label="Close">×</button>
        <div class="urd-content">
          <div class="urd-poster" v-if="poster">
            <img :src="poster" :alt="title" />
          </div>
          <div class="urd-info">
            <h3 class="urd-title">{{ title }}</h3>
            <div class="urd-subtitle">{{ subtitle }}</div>
            <div class="urd-date" v-if="dateText">{{ dateText }}</div>
            <div class="urd-synopsis">
              {{ synopsisText }}
            </div>
            <div class="urd-ratings" v-if="ratingText">
              {{ ratingText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  release: { type: Object, default: null },
  poster: { type: String, default: '' },
  serviceType: { type: String, default: 'sonarr' },
})

const emit = defineEmits(['close'])

const title = computed(() => {
  if (!props.release) return ''
  if (props.serviceType === 'sonarr') {
    const series = props.release.series?.title || 'Unknown Series'
    const s = String(props.release.seasonNumber || 0).padStart(2, '0')
    const e = String(props.release.episodeNumber || 0).padStart(2, '0')
    const epTitle = props.release.title || ''
    return `${series} — S${s}E${e}${epTitle ? ` · ${epTitle}` : ''}`
  }
  return props.release.title || 'Upcoming Movie'
})

const subtitle = computed(() => {
  if (!props.release) return ''
  if (props.serviceType === 'sonarr') {
    return props.release.series?.network || ''
  }
  return props.release.originalTitle || ''
})

const dateText = computed(() => {
  if (!props.release) return ''
  const dateStr =
    props.serviceType === 'sonarr' ? props.release.airDateUtc : props.release.digitalRelease
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString()
})

const synopsisText = computed(() => {
  if (!props.release) return ''
  const overview = props.serviceType === 'sonarr' ? props.release.overview : props.release.overview
  return overview && overview.trim() ? overview : 'No information available'
})

const ratingText = computed(() => {
  if (!props.release || props.serviceType === 'sonarr') return ''
  const ratings = props.release.ratings
  if (!ratings) return ''
  const tmdb = ratings.value || ratings.tmdb || ratings.imdb || null
  return tmdb ? `Rating: ${typeof tmdb === 'object' ? tmdb.value : tmdb}` : ''
})
</script>

<style scoped>
.urd-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 16px;
}

.urd-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: #fff;
  width: min(820px, 92vw);
  max-height: 82vh;
  overflow: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.urd-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  color: #fff;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.urd-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  padding: 18px;
}

.urd-poster img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: block;
}

.urd-title {
  margin: 0 0 6px;
  font-size: 1.1rem;
  font-weight: 700;
}

.urd-subtitle {
  font-size: 0.9rem;
  opacity: 0.85;
  margin-bottom: 8px;
}

.urd-date {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 10px;
}

.urd-synopsis {
  font-size: 0.95rem;
  line-height: 1.5;
}

.urd-ratings {
  margin-top: 12px;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .urd-content {
    grid-template-columns: 1fr;
  }
}
</style>
