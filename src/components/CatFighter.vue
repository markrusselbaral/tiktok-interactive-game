<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  cat: { type: Object, required: true },
  evolved: { type: Boolean, default: false },
  side: { type: String, required: true },
  status: { type: String, default: 'fighting' },
  attackKey: { type: Number, default: 0 },
  attackType: { type: String, default: 'punch' },
  hurtKey: { type: Number, default: 0 },
})

const facing = computed(() => (props.side === 'a' ? 'right' : 'left'))
const pose = ref('idle')

const spriteSrc = computed(() => {
  const s = props.cat.sprites
  if (props.status === 'eliminated') return s.ko[facing.value]
  return s[pose.value]?.[facing.value] || s.idle[facing.value]
})

const root = ref(null)
const sprite = ref(null)
const hitRingRef = ref(null)
const dustRef = ref(null)
const swooshRef = ref(null)
const sparkRef = ref(null)
let idleTl = null
let busyTimer = null

function startIdle() {
  stopIdle()
  if (!root.value) return
  gsap.set(root.value, { y: 0, x: 0, rotate: 0 })
  idleTl = gsap.to(root.value, {
    y: -8,
    duration: 0.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

function stopIdle() {
  if (idleTl) {
    idleTl.kill()
    idleTl = null
  }
}

function clearBusy() {
  if (busyTimer) {
    clearTimeout(busyTimer)
    busyTimer = null
  }
}

function setPose(next, ms) {
  pose.value = next
  clearBusy()
  if (ms) {
    busyTimer = setTimeout(() => {
      busyTimer = null
      if (props.status === 'fighting') {
        pose.value = 'idle'
        startIdle()
      }
    }, ms)
  }
}

function doAttack(type) {
  if (props.status !== 'fighting') return
  stopIdle()
  const next = type === 'kick' ? 'kick' : 'punch'
  setPose(next, 320)
  const dir = facing.value === 'right' ? 1 : -1
  const lungeDist = type === 'kick' ? 60 : 45
  if (root.value) {
    gsap.fromTo(
      root.value,
      { x: 0 },
      {
        x: lungeDist * dir,
        duration: 0.11,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(root.value, { x: 0, duration: 0.18, ease: 'power2.inOut' })
        },
      },
    )
  }
  if (sprite.value) {
    gsap.fromTo(
      sprite.value,
      { x: 0 },
      { x: 8 * dir, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' },
    )
  }
  if (dustRef.value) {
    const offset = -28 * dir
    gsap.fromTo(
      dustRef.value,
      { x: offset, scale: 0.3, opacity: 0.6 },
      {
        x: offset + -16 * dir,
        scale: 1.2,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      },
    )
  }
  if (swooshRef.value) {
    const isKick = type === 'kick'
    gsap.fromTo(
      swooshRef.value,
      { scaleX: 0.2, opacity: isKick ? 1 : 0.85, y: isKick ? 18 : 0 },
      {
        scaleX: isKick ? 1.6 : 1.3,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.out',
      },
    )
  }
  if (sparkRef.value) {
    const isKick = type === 'kick'
    gsap.fromTo(
      sparkRef.value,
      { scale: 0.3, opacity: 0, rotate: 0 },
      {
        scale: isKick ? 1.5 : 1.1,
        opacity: 1,
        rotate: 45,
        duration: 0.08,
        delay: 0.06,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(sparkRef.value, { opacity: 0, scale: isKick ? 2 : 1.7, duration: 0.2 })
        },
      },
    )
  }
  if (type === 'combo') {
    setTimeout(() => doAttack('kick'), 280)
  }
}

function doHit() {
  if (props.status !== 'fighting') return
  stopIdle()
  setPose('hit', 320)
  if (!root.value) return
  const dir = facing.value === 'right' ? -1 : 1
  gsap.fromTo(
    root.value,
    { x: 0 },
    {
      x: 18 * dir,
      duration: 0.09,
      ease: 'power3.out',
      onComplete: () => {
        gsap.to(root.value, { x: 0, duration: 0.2, ease: 'power2.out' })
      },
    },
  )
  if (hitRingRef.value) {
    gsap.fromTo(
      hitRingRef.value,
      { scale: 0.4, opacity: 0.7 },
      { scale: 1.6, opacity: 0, duration: 0.45, ease: 'power2.out' },
    )
  }
}

function doKo() {
  stopIdle()
  clearBusy()
  pose.value = 'ko'
  const dir = facing.value === 'right' ? 1 : -1
  gsap.to(root.value, {
    rotate: 90 * dir,
    y: 28,
    duration: 0.7,
    ease: 'power2.in',
  })
}

function doVictory() {
  stopIdle()
  clearBusy()
  pose.value = 'idle'
  if (!root.value) return
  gsap.set(root.value, { rotate: 0, x: 0 })
  idleTl = gsap.to(root.value, {
    y: -14,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

watch(() => props.attackKey, () => doAttack(props.attackType))
watch(() => props.hurtKey, doHit)
watch(
  () => props.status,
  (s) => {
    if (root.value) gsap.set(root.value, { rotate: 0, x: 0, y: 0 })
    if (s === 'fighting') {
      pose.value = 'idle'
      startIdle()
    } else if (s === 'eliminated') {
      doKo()
    } else if (s === 'winner') {
      doVictory()
    }
  },
)

onMounted(() => {
  if (props.status === 'fighting') startIdle()
  else if (props.status === 'eliminated') doKo()
  else if (props.status === 'winner') doVictory()
})
onUnmounted(() => {
  stopIdle()
  clearBusy()
})
</script>

<template>
  <div class="fighter-wrap" :class="{ evolved }">
    <div class="shadow"></div>
    <div ref="dustRef" class="dust"></div>
    <div ref="hitRingRef" class="hit-ring"></div>
    <div ref="root" class="fighter-root">
      <div ref="swooshRef" class="swoosh" :class="`swoosh-${facing}`"></div>
      <div ref="sparkRef" class="spark" :class="`spark-${facing}`"></div>
      <img ref="sprite" class="sprite" :src="spriteSrc" :alt="cat.name" />
    </div>
    <div v-if="evolved" class="evolve-aura"></div>
  </div>
</template>

<style scoped>
.fighter-wrap {
  position: relative;
  width: 340px;
  height: 340px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.fighter-root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.55));
}

.evolved .fighter-root {
  filter:
    drop-shadow(0 0 8px rgba(255, 209, 102, 0.6))
    saturate(1.15);
}

.sprite {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.shadow {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 18px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.55), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.dust {
  position: absolute;
  bottom: 12px;
  left: 50%;
  width: 36px;
  height: 36px;
  margin-left: -18px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.45), transparent 70%);
  filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.hit-ring {
  position: absolute;
  top: 42%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 18px rgba(255, 209, 102, 0.55);
  opacity: 0;
  pointer-events: none;
  z-index: 4;
}

.swoosh {
  position: absolute;
  top: 50%;
  width: 110px;
  height: 5px;
  margin-top: -2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.9) 40%,
    rgba(255, 209, 102, 0.85) 60%,
    transparent
  );
  filter: blur(1.5px);
  border-radius: 3px;
  opacity: 0;
  pointer-events: none;
  z-index: 3;
  transform-origin: left center;
}

.swoosh-right {
  left: 60%;
  transform-origin: left center;
}

.swoosh-left {
  right: 60%;
  transform-origin: right center;
  transform: scaleX(-1);
}

.spark {
  position: absolute;
  top: 46%;
  width: 30px;
  height: 30px;
  margin-top: -15px;
  background:
    linear-gradient(0deg, transparent 44%, #fff 47%, #fff 53%, transparent 56%),
    linear-gradient(90deg, transparent 44%, #fff 47%, #fff 53%, transparent 56%);
  filter: drop-shadow(0 0 6px #fff) drop-shadow(0 0 12px #ffd166);
  opacity: 0;
  pointer-events: none;
  z-index: 5;
}

.spark-right { left: 70%; }
.spark-left { right: 70%; }

.evolve-aura {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 50%, rgba(255, 209, 102, 0.08) 65%, transparent 78%);
  pointer-events: none;
}

@media (max-width: 720px) {
  .fighter-wrap {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  }
  .shadow { width: 60%; height: 14px; bottom: 4px; }
}
</style>
