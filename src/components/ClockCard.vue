<!--
  ClockCard Component

  Displays current time and date with a clean, minimal design.
  Supports both 12-hour and 24-hour formats and updates in real-time.
-->

<template>
  <div class="clock-card">
    <!-- Main Time Display -->
    <div class="time-display">
      <span class="time">{{ formattedTime }}</span>
      <span v-if="timeFormat === '12'" class="period">{{ period }}</span>
    </div>

    <!-- Date Display -->
    <div class="date-display">
      <span class="date">{{ formattedDate }}</span>
    </div>

    <!-- Optional Temperature Display -->
    <div v-if="temperature" class="temperature-display">
      <svg
        class="temperature-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
      </svg>
      <span class="temperature">{{ temperature }}°</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  /**
   * Time format: '12' for 12-hour, '24' for 24-hour
   */
  timeFormat: {
    type: String,
    default: '12',
    validator: (value) => ['12', '24'].includes(value),
  },

  /**
   * Optional temperature to display
   */
  temperature: {
    type: [String, Number],
    default: null,
  },

  /**
   * Timezone to display (defaults to local)
   */
  timezone: {
    type: String,
    default: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
})

// Reactive state
const currentTime = ref(new Date())
const intervalId = ref(null)

// Computed properties
const formattedTime = computed(() => {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: props.timeFormat === '12',
    timeZone: props.timezone,
  }

  const timeString = currentTime.value.toLocaleTimeString('en-US', options)

  if (props.timeFormat === '12') {
    // Remove AM/PM from the time string as we show it separately
    return timeString.replace(/\s?(AM|PM)$/i, '')
  }

  return timeString
})

const period = computed(() => {
  if (props.timeFormat !== '12') return ''

  const options = {
    hour: 'numeric',
    hour12: true,
    timeZone: props.timezone,
  }

  const timeString = currentTime.value.toLocaleTimeString('en-US', options)
  const match = timeString.match(/(AM|PM)$/i)
  return match ? match[1] : ''
})

const formattedDate = computed(() => {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: props.timezone,
  }

  return currentTime.value.toLocaleDateString('en-US', options).toUpperCase()
})

// Update time function
const updateTime = () => {
  currentTime.value = new Date()
}

// Lifecycle hooks
onMounted(() => {
  // Update immediately
  updateTime()

  // Set up interval to update every second
  intervalId.value = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.clock-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 200px;
  width: 100%;
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.time {
  font-size: 4rem;
  font-weight: 300;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.period {
  font-size: 1.5rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  margin-top: 8px;
}

.date-display {
  margin-bottom: 16px;
}

.date {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

.temperature-display {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
}

.temperature-icon {
  color: rgba(255, 255, 255, 0.7);
}

.temperature {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .clock-card {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .clock-card {
    padding: 24px 16px;
    min-height: 160px;
  }

  .time {
    font-size: 3rem;
  }

  .period {
    font-size: 1.25rem;
  }

  .date {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .clock-card {
    padding: 20px 12px;
    min-height: 140px;
  }

  .time {
    font-size: 2.5rem;
  }

  .period {
    font-size: 1rem;
  }

  .date {
    font-size: 0.8rem;
  }
}

/* Animation for smooth time updates */
.time {
  transition: opacity 0.1s ease-in-out;
}

/* Ensure proper font rendering */
.time,
.period,
.date {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
