<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  ultimate: { type: Object, default: null },
})
const emit = defineEmits(['done'])

const overlayRef = ref(null)
const memeRef = ref(null)
const flashRef = ref(null)
const burstRef = ref(null)
const shockRef = ref(null)
const ringRef = ref(null)
const nameRef = ref(null)
const beamsRef = ref(null)
const boltsRef = ref(null)
const particlesRef = ref(null)
const visible = ref(false)

const accent = computed(() => props.ultimate?.color || '#ff4d6d')
const sideClass = computed(() => (props.ultimate ? `from-${props.ultimate.side}` : ''))

const particles = Array.from({ length: 24 }, (_, i) => i)
const bolts = Array.from({ length: 6 }, (_, i) => i)
const beams = Array.from({ length: 12 }, (_, i) => i)

watch(
  () => props.ultimate?.key,
  async () => {
    if (!props.ultimate) return
    visible.value = true
    await nextTick()
    play()
  },
)

function play() {
  // background flash
  gsap.fromTo(
    flashRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.06, yoyo: true, repeat: 5, ease: 'power1.inOut' },
  )
  // overlay screen shake
  gsap.fromTo(
    overlayRef.value,
    { x: 0, y: 0 },
    { x: -10, y: 6, duration: 0.04, yoyo: true, repeat: 24, ease: 'power1.inOut' },
  )
  // expanding shockwave
  gsap.fromTo(
    shockRef.value,
    { scale: 0, opacity: 1 },
    { scale: 12, opacity: 0, duration: 1.2, ease: 'power3.out' },
  )
  // ring pulse
  gsap.fromTo(
    ringRef.value,
    { scale: 0.4, opacity: 1 },
    { scale: 4, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.15 },
  )
  // light burst rotating
  gsap.set(burstRef.value, { rotate: 0, scale: 0.2, opacity: 1 })
  gsap.to(burstRef.value, { rotate: 360, duration: 2.6, ease: 'none' })
  gsap.to(burstRef.value, { scale: 2.4, duration: 1.4, ease: 'power2.out' })
  gsap.to(burstRef.value, { opacity: 0, duration: 0.5, delay: 2.1 })
  // beams rotate
  gsap.fromTo(beamsRef.value, { rotate: 0 }, { rotate: 90, duration: 2.4, ease: 'power2.out' })
  // meme drop-in slam
  gsap.set(memeRef.value, { scale: 0.05, opacity: 0, rotate: -25, y: -100 })
  gsap.to(memeRef.value, {
    scale: 1.15,
    opacity: 1,
    rotate: 0,
    y: 0,
    duration: 0.45,
    ease: 'back.out(2.6)',
  })
  gsap.to(memeRef.value, {
    scale: 1,
    duration: 0.3,
    delay: 0.45,
    ease: 'power2.out',
  })
  gsap.to(memeRef.value, {
    y: -8,
    duration: 0.4,
    delay: 0.8,
    yoyo: true,
    repeat: 2,
    ease: 'sine.inOut',
  })
  // name slam
  gsap.set(nameRef.value, { scale: 4, opacity: 0, letterSpacing: '40px' })
  gsap.to(nameRef.value, {
    scale: 1,
    opacity: 1,
    letterSpacing: '6px',
    duration: 0.4,
    delay: 0.35,
    ease: 'power3.out',
  })
  // lightning bolts flicker
  if (boltsRef.value) {
    const boltEls = boltsRef.value.querySelectorAll('.bolt')
    boltEls.forEach((el, i) => {
      gsap.set(el, { opacity: 0, scaleY: 0 })
      gsap.to(el, {
        opacity: 1,
        scaleY: 1,
        duration: 0.05,
        delay: 0.2 + i * 0.08,
        yoyo: true,
        repeat: 3,
        ease: 'power1.inOut',
      })
    })
  }
  // particles explode outward
  if (particlesRef.value) {
    const partEls = particlesRef.value.querySelectorAll('.particle')
    partEls.forEach((el) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 280 + Math.random() * 320
      gsap.set(el, { x: 0, y: 0, opacity: 1, scale: Math.random() * 1 + 0.5 })
      gsap.to(el, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 1.4 + Math.random() * 0.6,
        ease: 'power3.out',
      })
    })
  }
  // close
  setTimeout(() => {
    gsap.to(overlayRef.value, {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        visible.value = false
        gsap.set(overlayRef.value, { opacity: 1, x: 0, y: 0 })
        emit('done')
      },
    })
  }, 2700)
}
</script>

<template>
  <div
    v-if="visible"
    ref="overlayRef"
    class="ult-overlay"
    :class="sideClass"
    :style="{ '--ult-color': accent }"
  >
    <div ref="flashRef" class="flash"></div>
    <div ref="burstRef" class="burst"></div>
    <div ref="beamsRef" class="beams">
      <div v-for="i in beams" :key="i" class="beam" :style="{ transform: `rotate(${i * 30}deg)` }"></div>
    </div>
    <div ref="ringRef" class="ring"></div>
    <div ref="shockRef" class="shock"></div>

    <div ref="boltsRef" class="bolts">
      <div
        v-for="i in bolts"
        :key="i"
        class="bolt"
        :style="{
          left: 10 + i * 14 + '%',
          transform: `translateX(-50%) rotate(${i % 2 ? 6 : -6}deg)`,
        }"
      ></div>
    </div>

    <div ref="particlesRef" class="particles">
      <span v-for="i in particles" :key="i" class="particle"></span>
    </div>

    <div class="hero">
      <div class="meme-frame">
        <img v-if="ultimate" ref="memeRef" class="meme" :src="ultimate.meme" :alt="ultimate.name" />
      </div>
      <div ref="nameRef" class="name">{{ ultimate?.ultName }}</div>
      <div class="sub">ULTIMATE</div>
    </div>
  </div>
</template>

<style scoped>
.ult-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(circle at center, color-mix(in srgb, var(--ult-color) 40%, transparent), rgba(0, 0, 0, 0.85));
}

.flash {
  position: absolute;
  inset: 0;
  background: var(--ult-color);
  mix-blend-mode: screen;
  opacity: 0;
}

.burst {
  position: absolute;
  width: 1400px;
  height: 1400px;
  background:
    conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255, 255, 255, 0.6) 8deg,
      transparent 16deg,
      transparent 38deg,
      var(--ult-color) 46deg,
      transparent 54deg,
      transparent 76deg,
      rgba(255, 255, 255, 0.6) 84deg,
      transparent 92deg
    );
  filter: blur(4px) saturate(1.4);
  opacity: 0;
  mix-blend-mode: screen;
}

.beams {
  position: absolute;
  width: 1200px;
  height: 1200px;
}

.beam {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1200px;
  height: 6px;
  margin: -3px 0 0 -600px;
  background: linear-gradient(90deg, transparent, var(--ult-color) 40%, #fff 50%, var(--ult-color) 60%, transparent);
  filter: blur(2px);
  opacity: 0.55;
  transform-origin: center;
}

.ring {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 6px solid var(--ult-color);
  box-shadow: 0 0 60px var(--ult-color), inset 0 0 60px var(--ult-color);
  opacity: 0;
}

.shock {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 80px #fff, 0 0 160px var(--ult-color);
  opacity: 0;
}

.bolts {
  position: absolute;
  inset: 0;
}

.bolt {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #fff 30%, var(--ult-color) 70%, transparent);
  filter: blur(1px) drop-shadow(0 0 14px #fff) drop-shadow(0 0 24px var(--ult-color));
  transform-origin: top center;
  opacity: 0;
  clip-path: polygon(45% 0, 60% 30%, 40% 50%, 65% 70%, 50% 100%, 40% 70%, 60% 50%, 35% 30%);
}

.particles {
  position: absolute;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, var(--ult-color) 70%, transparent);
  box-shadow: 0 0 12px var(--ult-color);
  opacity: 0;
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  z-index: 5;
}

.meme-frame {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  overflow: hidden;
  border: 8px solid var(--ult-color);
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.9),
    0 0 60px var(--ult-color),
    0 0 140px var(--ult-color),
    inset 0 0 30px rgba(0, 0, 0, 0.5);
  background: #111;
}

.meme {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.name {
  font-family: 'Impact', 'Inter', sans-serif;
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 6px;
  text-shadow:
    0 4px 0 #000,
    0 0 20px var(--ult-color),
    0 0 60px var(--ult-color);
  text-align: center;
  white-space: nowrap;
  opacity: 0;
}

.sub {
  font-size: 14px;
  letter-spacing: 12px;
  color: var(--ult-color);
  font-weight: 800;
  text-shadow: 0 0 18px var(--ult-color);
}

.from-a .hero {
  animation: hero-from-left 0.5s ease-out;
}
.from-b .hero {
  animation: hero-from-right 0.5s ease-out;
}

@keyframes hero-from-left {
  from { transform: translateX(-200px) rotate(-8deg); }
  to { transform: translateX(0) rotate(0); }
}
@keyframes hero-from-right {
  from { transform: translateX(200px) rotate(8deg); }
  to { transform: translateX(0) rotate(0); }
}

@media (max-width: 720px) {
  .meme-frame { width: 220px; height: 220px; }
  .name { font-size: 36px; letter-spacing: 4px; }
}
</style>
