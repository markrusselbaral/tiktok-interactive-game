<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { winnerHighlight, ultimate } = storeToRefs(game)

const bgmRef = ref(null)
const hitRef = ref(null)
const enabled = ref(true)
const ready = ref(false)
const failed = ref(false)
const lastHitKey = ref(0)

const BGM_VOLUME = 0.35
const BGM_DUCKED = 0.08
const HIT_VOLUME = 0.55

function applyVolume() {
  if (!bgmRef.value) return
  const ducking = !!winnerHighlight.value || !!ultimate.value
  bgmRef.value.volume = ducking ? BGM_DUCKED : BGM_VOLUME
}

async function tryPlay() {
  if (!bgmRef.value || !enabled.value) return
  try {
    await bgmRef.value.play()
    ready.value = true
    failed.value = false
  } catch {
    failed.value = true
  }
}

function toggle() {
  enabled.value = !enabled.value
  if (!bgmRef.value) return
  if (enabled.value) {
    tryPlay()
  } else {
    bgmRef.value.pause()
  }
}

function onFirstInteraction() {
  tryPlay()
  window.removeEventListener('pointerdown', onFirstInteraction)
  window.removeEventListener('keydown', onFirstInteraction)
}

watch([winnerHighlight, ultimate], applyVolume)

watch(
  () => [game.flash?.key, game.flash?.amount],
  ([key, amount]) => {
    if (!key || key === lastHitKey.value) return
    lastHitKey.value = key
    if (!hitRef.value || !enabled.value) return
    const el = hitRef.value
    el.currentTime = 0
    el.volume = Math.min(1, HIT_VOLUME + (amount || 0) / 40)
    el.play().catch(() => {})
  },
)

onMounted(() => {
  applyVolume()
  tryPlay()
  window.addEventListener('pointerdown', onFirstInteraction)
  window.addEventListener('keydown', onFirstInteraction)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onFirstInteraction)
  window.removeEventListener('keydown', onFirstInteraction)
  if (bgmRef.value) bgmRef.value.pause()
})
</script>

<template>
  <div class="bgm-control" :class="{ off: !enabled, failed }">
    <audio
      ref="bgmRef"
      src="/bgm.mp3"
      loop
      preload="auto"
      @canplay="ready = true"
      @error="failed = true"
    ></audio>
    <audio ref="hitRef" src="/sfx-hit.mp3" preload="auto"></audio>
    <button class="btn" @click="toggle" :title="enabled ? 'Mute music' : 'Unmute music'">
      <span class="icon">{{ enabled ? '🔊' : '🔇' }}</span>
      <span class="label">{{ enabled ? 'MUSIC ON' : 'MUSIC OFF' }}</span>
    </button>
    <div v-if="failed && enabled" class="hint">
      drop <code>bgm.mp3</code> in <code>/public</code>
    </div>
  </div>
</template>

<style scoped>
.bgm-control {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  pointer-events: none;
}

.btn {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 12, 18, 0.7);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.15s ease, transform 0.05s ease;
}

.btn:hover {
  background: rgba(20, 22, 30, 0.9);
}

.btn:active {
  transform: translateY(1px);
}

.bgm-control.off .btn {
  color: rgba(255, 255, 255, 0.55);
}

.icon {
  font-size: 14px;
}

.hint {
  font-size: 10px;
  color: rgba(255, 209, 102, 0.9);
  background: rgba(10, 12, 18, 0.7);
  border: 1px solid rgba(255, 209, 102, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  letter-spacing: 0.5px;
}

.hint code {
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

@media (max-width: 720px) {
  .label { display: none; }
  .btn { padding: 8px 10px; }
}
</style>
