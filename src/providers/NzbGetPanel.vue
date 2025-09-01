<template>
  <div class="provider-root">
    <div class="provider-header">
      <IconRenderer icon="lucide:download" :size="16" />
      <span>NZBGet Queue</span>
      <span v-if="loading" class="spinner" aria-hidden="true"></span>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-else class="queue-list">
      <div v-if="items.length === 0" class="empty">Queue is empty</div>
      <div v-for="item in items" :key="item.NZBID" class="queue-item">
        <div class="title-row">
          <span class="title">{{ item.NZBName }}</span>
          <span class="progress">{{ item.DownloadedSizeMB }} / {{ item.FileSizeMB }} MB</span>
        </div>
        <div class="meta-row">
          <span>{{ item.Category }}</span>
          <span>{{ item.Status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import IconRenderer from '../components/IconRenderer.vue'
import configService from '../services/config.js'

// Optional props: baseUrl/apiKey overrides or polling interval
const props = defineProps({
  pollInterval: { type: Number, default: 0 },
})

const loading = ref(true)
const error = ref('')
const items = ref([])
let timer = null

const fetchQueue = async () => {
  try {
    loading.value = true
    error.value = ''

    // Expect NZBGet defined in services.yaml (or links provider config later)
    const svc = configService.getServiceByType('nzbget') || {}
    const baseUrl = (svc.url || '').replace(/\/$/, '')
    const apiKey = svc.api_key || ''

    if (!baseUrl) throw new Error('NZBGet service not configured')

    // NZBGet JSON-RPC: /jsonrpc
    const res = await fetch(`${baseUrl}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify({ method: 'listgroups', params: [] }),
      mode: 'cors',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    items.value = Array.isArray(data?.result) ? data.result : []
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchQueue()
  if (props.pollInterval > 0) {
    timer = setInterval(fetchQueue, props.pollInterval)
  }
})
</script>

<style scoped>
.provider-root {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #fff;
}
.provider-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: auto;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.queue-item {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.meta-row {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  opacity: 0.9;
}
.empty {
  opacity: 0.8;
}
.error {
  color: #fecaca;
}
</style>
