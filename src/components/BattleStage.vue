<script setup>
import { ref, watch, computed } from 'vue'
import gsap from 'gsap'
import CatFighter from './CatFighter.vue'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  a: { type: Object, required: true },
  b: { type: Object, required: true },
  attack: { type: Object, required: true },
  hurt: { type: Object, required: true },
  flash: { type: Object, default: null },
  event: { type: Object, default: null },
})

const game = useGameStore()
const pickerA = computed(() => game.latestPickerA)
const pickerB = computed(() => game.latestPickerB)
const queueCountA = computed(() => game.pickQueueA.length)
const queueCountB = computed(() => game.pickQueueB.length)

const stageRef = ref(null)
const flashARef = ref(null)
const flashBRef = ref(null)
const burstARef = ref(null)
const burstBRef = ref(null)
const slotARef = ref(null)
const slotBRef = ref(null)

const attackingSide = computed(() => {
  const aKey = props.attack?.a?.key || 0
  const bKey = props.attack?.b?.key || 0
  if (!aKey && !bKey) return null
  return aKey >= bKey ? 'a' : 'b'
})

watch(
  () => props.flash?.key,
  () => {
    if (!props.flash) return
    if (stageRef.value) {
      gsap.fromTo(
        stageRef.value,
        { x: 0 },
        { x: -2, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      )
    }
    const flashRef = props.flash.side === 'a' ? flashARef.value : flashBRef.value
    if (flashRef) {
      gsap.fromTo(
        flashRef,
        { y: 10, opacity: 0 },
        {
          y: -20,
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(flashRef, { opacity: 0, y: -50, duration: 0.4 })
          },
        },
      )
    }
  },
)

watch(
  () => props.event?.key,
  () => {
    if (!props.event) return
    const burst = props.event.side === 'a' ? burstARef.value : burstBRef.value
    const slot = props.event.side === 'a' ? slotARef.value : slotBRef.value
    if (props.event.type === 'evolve' && burst) {
      gsap.fromTo(
        burst,
        { scale: 0, opacity: 0.6 },
        { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out' },
      )
    }
    if (props.event.type === 'win' && slot) {
      gsap.fromTo(
        slot,
        { scale: 1 },
        { scale: 1.02, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      )
    }
    if (props.event.type === 'eliminate' && slot) {
      gsap.fromTo(
        slot,
        { x: 0 },
        { x: -3, duration: 0.08, yoyo: true, repeat: 3, ease: 'power1.inOut' },
      )
    }
  },
)
</script>

<template>
  <div ref="stageRef" class="battle-stage">
    <div class="floor"></div>
    <div class="ropes top"></div>
    <div class="ropes bottom"></div>

    <div
      ref="slotARef"
      class="fighter-slot left"
      :class="{
        winner: a.status === 'winner',
        eliminated: a.status === 'eliminated',
        'top-layer': attackingSide === 'a',
      }"
      :style="{ '--accent': a.evolved ? a.cat.evolvedColor : a.cat.color }"
    >
      <div ref="burstARef" class="evolve-burst"></div>
      <div v-if="pickerA" class="nameplate side-a">
        <span class="nameplate-user">@{{ pickerA }}</span>
        <span v-if="queueCountA > 1" class="nameplate-queue">+{{ queueCountA - 1 }} waiting</span>
      </div>
      <CatFighter
        :cat="a.cat"
        :evolved="a.evolved"
        side="a"
        :status="a.status"
        :attack-key="attack.a.key"
        :attack-type="attack.a.type"
        :hurt-key="hurt.a"
      />
      <span ref="flashARef" class="score-flash">+{{ flash?.amount }}</span>
    </div>

    <div class="clash-zone">
      <div class="vs">VS</div>
    </div>

    <div
      ref="slotBRef"
      class="fighter-slot right"
      :class="{
        winner: b.status === 'winner',
        eliminated: b.status === 'eliminated',
        'top-layer': attackingSide === 'b',
      }"
      :style="{ '--accent': b.evolved ? b.cat.evolvedColor : b.cat.color }"
    >
      <div ref="burstBRef" class="evolve-burst"></div>
      <div v-if="pickerB" class="nameplate side-b">
        <span class="nameplate-user">@{{ pickerB }}</span>
        <span v-if="queueCountB > 1" class="nameplate-queue">+{{ queueCountB - 1 }} waiting</span>
      </div>
      <CatFighter
        :cat="b.cat"
        :evolved="b.evolved"
        side="b"
        :status="b.status"
        :attack-key="attack.b.key"
        :attack-type="attack.b.type"
        :hurt-key="hurt.b"
      />
      <span ref="flashBRef" class="score-flash">+{{ flash?.amount }}</span>
    </div>
  </div>
</template>

<style scoped>
.battle-stage {
  position: relative;
  width: 100%;
  max-width: 1100px;
  height: clamp(420px, 60vh, 640px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 28px 36px;
  background:
    radial-gradient(ellipse at 50% 90%, rgba(255, 209, 102, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, rgba(20, 14, 30, 0.6), rgba(0, 0, 0, 0.85));
  border-radius: 28px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.6), 0 20px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80px;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 209, 102, 0.08) 0,
      rgba(255, 209, 102, 0.08) 24px,
      transparent 24px,
      transparent 48px
    ),
    linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.6));
  border-top: 2px solid rgba(255, 255, 255, 0.06);
}

.ropes {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(255, 77, 109, 0.6), transparent);
  pointer-events: none;
}

.ropes.top { top: 12%; }
.ropes.bottom { top: 22%; }

.fighter-slot {
  position: relative;
  width: 380px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2;
  transition: filter 0.5s ease;
}

.fighter-slot.top-layer { z-index: 4; }

.fighter-slot.left { margin-right: -95px; }
.fighter-slot.right { margin-left: -95px; }

.fighter-slot.winner {
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--accent) 70%, transparent));
}

.fighter-slot.eliminated {
  filter: grayscale(1) brightness(0.55);
}

.evolve-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 60%, transparent) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
  z-index: 4;
}

.score-flash {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  font-weight: 800;
  color: #ffd166;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
  pointer-events: none;
  opacity: 0;
  z-index: 6;
  font-family: 'Inter', sans-serif;
  letter-spacing: 1px;
}

.nameplate {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--accent);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.55),
    0 0 18px color-mix(in srgb, var(--accent) 55%, transparent);
  z-index: 5;
  pointer-events: none;
  max-width: 80%;
  animation: nameFloat 2.4s ease-in-out infinite;
}

.nameplate-user {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 90%, transparent);
}

.nameplate.side-a .nameplate-user { color: #fff5ec; }
.nameplate.side-b .nameplate-user { color: #f0fbff; }

.nameplate-queue {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
}

@keyframes nameFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.clash-zone {
  position: relative;
  width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.vs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.25);
}

@media (max-width: 1100px) {
  .battle-stage { height: clamp(420px, 56vh, 560px); }
  .fighter-slot { width: 320px; }
}

@media (max-width: 720px) {
  .battle-stage {
    height: min(74vh, 720px);
    min-height: 460px;
    padding: 14px 6px 22px;
    border-radius: 20px;
  }
  .fighter-slot {
    width: 56%;
    max-width: none;
  }
  .nameplate {
    top: 2px;
    padding: 3px 8px;
    border-width: 1.5px;
  }
  .nameplate-user { font-size: 11px; }
  .nameplate-queue { font-size: 8px; letter-spacing: 1px; }
  .fighter-slot.left { margin-right: -10%; }
  .fighter-slot.right { margin-left: -10%; }
  .vs { font-size: 20px; letter-spacing: 3px; }
  .ropes.top { top: 10%; }
  .ropes.bottom { top: 18%; }
  .floor { height: 56px; }
  .score-flash { font-size: 24px; }
}

@media (orientation: portrait) and (max-width: 900px) {
  .battle-stage { height: min(74vh, 720px); min-height: 460px; }
}
</style>
