<template>
  <div class="provider-root">
    <div v-if="error" class="error">{{ error }}</div>

    <div v-else class="queue-list">
      <div v-if="rows.length === 0" class="empty">Queue is empty</div>
      <div v-else class="table">
        <div class="thead">
          <div class="th">Status</div>
          <div class="th name">Name</div>
          <div class="th">Category</div>
          <div class="th">Size</div>
          <div class="th">Left</div>
        </div>
        <div
          v-for="row in rows"
          :key="row.id"
          class="tr"
          @click="toggleItem(row.raw)"
          :title="row.statusLabel === 'PAUSED' ? 'Resume' : 'Pause'"
          style="cursor: pointer"
        >
          <div class="td">
            <span class="status-badge" :class="statusClass(row.status)">{{ row.statusLabel }}</span>
          </div>
          <div class="td name">{{ row.displayName }}</div>
          <div class="td">{{ row.category || '-' }}</div>
          <div class="td">{{ row.size }}</div>
          <div class="td">{{ row.left }}</div>
          <div class="progress-row">
            <div
              class="progress-bar"
              :class="statusClass(row.status)"
              :style="{ width: row.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import configService from '../services/config.js'

// Optional props: baseUrl/username/password/rpcPath overrides or polling interval
const props = defineProps({
  pollInterval: { type: Number, default: 0 },
  baseUrl: { type: String, default: '' },
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  rpcPath: { type: String, default: '' },
})

const loading = ref(true)
const error = ref('')
const items = ref([])
let timer = null

const formatSize = (mb) => {
  const bytes = (Number(mb) || 0) * 1024 * 1024
  if (bytes >= 1024 ** 4) return (bytes / 1024 ** 4).toFixed(2) + ' TB'
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + ' GB'
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return Math.max(bytes, 0).toFixed(0) + ' B'
}

const statusClass = (status) => {
  const s = String(status || '').toUpperCase()
  if (s.includes('PAUSE')) return 'status-paused'
  if (s.includes('POST')) return 'status-post'
  if (s.includes('DOWN')) return 'status-downloading'
  return 'status-default'
}

const parseFriendlyName = (name) => {
  if (!name) return ''
  // Basic patterns: Title (Year) ... or Title.Year.... or Title - Year ...
  const yearMatch = name.match(/\b(19\d{2}|20\d{2})\b/)
  const qualityMatch = name.match(/(2160p|1080p|720p|UHD|4K|HDR)/i)
  let title = name
  if (yearMatch) {
    const idx = name.indexOf(yearMatch[0])
    if (idx > 0) {
      title = name
        .slice(0, idx)
        .replace(/[._-]+/g, ' ')
        .trim()
    }
  } else {
    title = name.replace(/[._-]+/g, ' ').trim()
  }
  const parts = []
  if (title) parts.push(title)
  if (yearMatch) parts.push(`(${yearMatch[0]})`)
  if (qualityMatch) parts.push(qualityMatch[0].toUpperCase())
  return parts.join(' ')
}

const rows = computed(() => {
  return (items.value || []).map((it) => {
    const total = Number(it.FileSizeMB) || 0
    const done = Number(it.DownloadedSizeMB) || 0
    const leftMB = Math.max(total - done, Number(it.RemainingSizeMB || 0))
    const progress = total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0
    const eta = it.EtaTime || it.Eta || null // different fields may exist; otherwise blank
    return {
      id: it.NZBID || it.NZBId || it.NzbId || it.NZBNAME,
      status: it.Status || '',
      statusLabel: (it.Status || '').toString().toUpperCase(),
      displayName: parseFriendlyName(it.NZBName || it.NzbName || ''),
      category: it.Category || '',
      size: formatSize(total),
      left: formatSize(leftMB),
      eta: eta ? eta.toString() : '-',
      progress,
      raw: it,
    }
  })
})

const getConnection = () => {
  const svc = configService.getServiceByType('nzbget') || {}
  const base = (props.baseUrl || svc.url || '').replace(/\/$/, '')
  const user = props.username || svc.username || svc.user || ''
  const pass = props.password || svc.password || ''
  const rpcPath = props.rpcPath || svc.rpc_path || '/jsonrpc'
  if (!base) throw new Error('NZBGet service not configured')
  const headers = { 'Content-Type': 'application/json' }
  if (user || pass) headers['Authorization'] = 'Basic ' + btoa(`${user}:${pass}`)
  return { base, rpcPath, headers }
}

const sendRpc = async (method, params) => {
  const { base, rpcPath, headers } = getConnection()
  const res = await fetch(`${base}${rpcPath}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ method, params }),
    mode: 'cors',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const fetchQueue = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await sendRpc('listgroups', [])
    items.value = Array.isArray(data?.result) ? data.result : []
    console.log('[NzbGetPanel] queue items', items.value)
  } catch (e) {
    error.value = e.message || String(e)
    console.error('[NzbGetPanel] error', e)
  } finally {
    loading.value = false
  }
}

const toggleItem = async (raw) => {
  try {
    const id = raw?.LastID || raw?.NZBID || raw?.NzbId || raw?.NZBId
    if (!id) return
    const status = String(raw?.Status || '').toUpperCase()
    const action = status.includes('PAUSE') ? 'GroupResume' : 'GroupPause'
    console.log('[NzbGetPanel] toggle', { id, status, action })
    const params = [action, '', [Number(id)]]
    const res = await sendRpc('editqueue', params)
    console.log('[NzbGetPanel] editqueue response', params, res)
    if (res?.result !== true) console.warn('[NzbGetPanel] editqueue did not return success')
    await fetchQueue()
  } catch (e) {
    console.error('Failed to toggle NZBGet item:', e)
  }
}

onMounted(() => {
  console.log('[NzbGetPanel] mounted with props', {
    baseUrl: props.baseUrl,
    username: props.username ? '***' : '',
    rpcPath: props.rpcPath,
    pollInterval: props.pollInterval,
  })
  fetchQueue()
  if (props.pollInterval > 0) {
    timer = setInterval(fetchQueue, props.pollInterval)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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
  to {
    transform: rotate(360deg);
  }
}
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.table {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}
.thead {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  font-size: 0.8rem;
}
.tr {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px;
  gap: 8px;
  padding: 10px 12px 6px 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.td {
  font-size: 0.9rem;
}
.td.name {
  font-weight: 600;
}
.progress-row {
  grid-column: 1 / -1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  width: 0%;
  transition: width 0.25s ease;
}
.status-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.status-downloading {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
}
.status-paused {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}
.status-post {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #3b82f6;
}
.progress-bar.status-downloading {
  background: #10b981;
}
.progress-bar.status-paused {
  background: #f59e0b;
}
.progress-bar.status-post {
  background: #3b82f6;
}
.empty {
  opacity: 0.8;
}
.error {
  color: #fecaca;
}
</style>
