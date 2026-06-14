<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeLeft: { type: Number, required: true },
  duration: { type: Number, required: true },
  roundNumber: { type: Number, required: true },
  active: { type: Boolean, required: true },
  waiting: { type: Boolean, default: false },
})

const pct = computed(() => Math.max(0, Math.min(100, (props.timeLeft / props.duration) * 100)))
const display = computed(() => {
  const m = Math.floor(props.timeLeft / 60)
  const s = props.timeLeft % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
const danger = computed(() => props.timeLeft <= 10 && props.active && !props.waiting)
const mainText = computed(() => {
  if (!props.active) return 'ROUND OVER'
  if (props.waiting) return 'WAITING'
  return display.value
})
</script>

<template>
  <div class="timer-wrap">
    <div class="round-label">
      ROUND {{ roundNumber }}
      <span v-if="active && waiting" class="hint">— score a point to start</span>
    </div>
    <div class="time" :class="{ danger, ended: !active, waiting: active && waiting }">
      {{ mainText }}
    </div>
    <div class="bar">
      <div class="fill" :class="{ danger }" :style="{ width: pct + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.timer-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 280px;
}

.round-label {
  font-size: 12px;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

.time {
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transition: color 0.2s ease;
}

.time.danger {
  color: #ff4d6d;
  animation: pulse 0.6s ease-in-out infinite;
}

.time.ended {
  font-size: 28px;
  letter-spacing: 6px;
  color: #ffd166;
}

.time.waiting {
  font-size: 32px;
  letter-spacing: 8px;
  color: rgba(255, 255, 255, 0.55);
  animation: dim-pulse 1.6s ease-in-out infinite;
}

@keyframes dim-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

.hint {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  margin-left: 6px;
  text-transform: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.bar {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #06d6a0, #ffd166);
  transition: width 1s linear;
  border-radius: 999px;
}

.fill.danger {
  background: linear-gradient(90deg, #ff4d6d, #ff8c42);
}

@media (max-width: 720px) {
  .timer-wrap {
    min-width: 0;
    flex: 1;
    gap: 4px;
  }
  .round-label {
    font-size: 9px;
    letter-spacing: 2px;
  }
  .hint { display: none; }
  .time { font-size: 30px; }
  .time.ended { font-size: 18px; letter-spacing: 3px; }
  .time.waiting { font-size: 18px; letter-spacing: 4px; }
  .bar { height: 6px; }
}
</style>
