<template>
  <BaseCard :grid-width="gridWidth" :grid-height="gridHeight" :frameless="frameless" :title="showTitle ? title : ''">
    <div class="clock-card" :class="{ compact }">
      <div class="time">{{ timeStr }}</div>
      <div class="date">{{ dateStr }}</div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({
  title: { type: String, default: 'Clock' },
  format24h: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: false },
  frameless: { type: Boolean, default: true },
  gridWidth: { type: Number, default: 3 },
  gridHeight: { type: Number, default: 2 },
})

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const timeStr = computed(() => {
  const opts = props.format24h
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }
    : { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  return new Intl.DateTimeFormat(undefined, opts).format(now.value)
})

const dateStr = computed(() => {
  const opts = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' }
  return new Intl.DateTimeFormat(undefined, opts).format(now.value)
})
</script>

<style scoped>
.clock-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 4px;
  min-height: 100px;
}
.time { font-size: 2rem; font-weight: 600; letter-spacing: .5px; }
.date { opacity: .7; font-size: .95rem; }

.compact .time { font-size: 1.5rem; }
.compact .date { font-size: .85rem; }

@media (max-width: 768px) {
  .time { font-size: 1.6rem; }
  .date { font-size: .9rem; }
}
</style>
