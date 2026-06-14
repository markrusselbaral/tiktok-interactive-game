<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  highlight: { type: Object, default: null },
})
const emit = defineEmits(['done'])

const overlayRef = ref(null)
const frameRef = ref(null)
const nameRef = ref(null)
const videoRef = ref(null)
const visible = ref(false)

const accent = computed(() => props.highlight?.color || '#ffd166')
const sideClass = computed(() => (props.highlight ? `from-${props.highlight.side}` : ''))

watch(
  () => props.highlight?.key,
  async () => {
    if (!props.highlight) return
    visible.value = true
    await nextTick()
    play()
  },
)

function play() {
  if (!overlayRef.value) return
  gsap.set(overlayRef.value, { opacity: 0 })
  gsap.to(overlayRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out' })

  if (frameRef.value) {
    gsap.set(frameRef.value, { scale: 0.4, opacity: 0, rotate: -6 })
    gsap.to(frameRef.value, {
      scale: 1,
      opacity: 1,
      rotate: 0,
      duration: 0.55,
      ease: 'back.out(1.8)',
      delay: 0.15,
    })
  }

  if (nameRef.value) {
    gsap.set(nameRef.value, { y: 30, opacity: 0 })
    gsap.to(nameRef.value, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.45,
    })
  }

  if (videoRef.value) {
    const v = videoRef.value
    v.currentTime = 0
    v.muted = false
    v.volume = 1
    const playPromise = v.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // browser blocked unmuted autoplay — fall back to muted so the highlight still shows
        v.muted = true
        v.play().catch(() => {})
      })
    }
  }
}

function close() {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  gsap.to(overlayRef.value, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => {
      visible.value = false
      emit('done')
    },
  })
}

function onVideoEnded() {
  close()
}
</script>

<template>
  <div
    v-if="visible"
    ref="overlayRef"
    class="winner-overlay"
    :class="sideClass"
    :style="{ '--win-color': accent }"
  >
    <div ref="frameRef" class="frame">
      <video
        v-if="highlight"
        ref="videoRef"
        class="video"
        :src="highlight.video"
        autoplay
        playsinline
        @ended="onVideoEnded"
      ></video>
      <div class="frame-glow"></div>
    </div>
    <div class="overlay-ui">
      <div class="label">WINNER</div>
      <div ref="nameRef" class="name">{{ highlight?.name }}</div>
      <div class="sub">VICTORY HIGHLIGHT</div>
    </div>
    <button class="dismiss" @click.stop="close">SKIP →</button>
  </div>
</template>

<style scoped>
.winner-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: #000;
  overflow: hidden;
}

.frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
  box-shadow: inset 0 0 0 6px var(--win-color), inset 0 0 120px rgba(0, 0, 0, 0.6);
}

.video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  display: block;
}

.frame-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 80px rgba(0, 0, 0, 0.6),
    inset 0 0 200px color-mix(in srgb, var(--win-color) 25%, transparent);
}

.overlay-ui {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 32px 40px 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
  pointer-events: none;
  z-index: 5;
}

.label {
  font-family: 'Impact', 'Inter', sans-serif;
  font-size: 18px;
  letter-spacing: 12px;
  color: var(--win-color);
  font-weight: 800;
  text-shadow: 0 0 20px var(--win-color);
}

.name {
  font-family: 'Impact', 'Inter', sans-serif;
  font-size: 64px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4px;
  text-shadow:
    0 4px 0 #000,
    0 0 24px var(--win-color),
    0 0 60px var(--win-color);
  white-space: nowrap;
  line-height: 1;
}

.sub {
  font-size: 11px;
  letter-spacing: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

.dismiss {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 800;
  letter-spacing: 2px;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;
}

.dismiss:hover {
  background: rgba(0, 0, 0, 0.75);
}

@media (max-width: 720px) {
  .overlay-ui { padding: 20px 22px 24px; }
  .name { font-size: 36px; letter-spacing: 3px; }
  .label { font-size: 14px; letter-spacing: 8px; }
  .sub { font-size: 10px; letter-spacing: 6px; }
}
</style>
