<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import gsap from 'gsap'

const game = useGameStore()
const { latestPick } = storeToRefs(game)

const bannerRef = ref(null)
const display = ref(null)
const visible = computed(() => !!display.value)

watch(
  () => latestPick.value?.key,
  () => {
    if (!latestPick.value) return
    display.value = { ...latestPick.value }
    if (!bannerRef.value) return
    gsap.fromTo(
      bannerRef.value,
      { y: -24, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' },
    )
  },
)
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      ref="bannerRef"
      class="banner"
      :class="`side-${display.side}`"
    >
      <span class="gift">{{ display.giftIcon }}</span>
      <div class="text">
        <span class="user">@{{ display.user }}</span>
        <span class="picked">JOINED THE FIGHT</span>
      </div>
      <span v-if="display.turn" class="turn">
        <span class="turn-label">TURN</span>
        <span class="turn-num">#{{ display.turn }}</span>
        <span v-if="display.queueSize > 1" class="turn-of">/ {{ display.queueSize }}</span>
      </span>
      <span class="tag">UPCOMING FIGHT</span>
    </div>
  </Transition>
</template>

<style scoped>
.banner {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px 10px 14px;
  background: linear-gradient(90deg, rgba(20, 14, 30, 0.95), rgba(40, 22, 50, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 12px 30px rgba(0, 0, 0, 0.5);
  max-width: 100%;
}

.banner.side-a {
  border-color: rgba(255, 140, 66, 0.6);
  box-shadow:
    0 0 0 1px rgba(255, 140, 66, 0.35),
    0 0 30px rgba(255, 140, 66, 0.25),
    0 12px 30px rgba(0, 0, 0, 0.5);
}

.banner.side-b {
  border-color: rgba(168, 218, 220, 0.6);
  box-shadow:
    0 0 0 1px rgba(168, 218, 220, 0.35),
    0 0 30px rgba(72, 202, 228, 0.25),
    0 12px 30px rgba(0, 0, 0, 0.5);
}

.gift {
  font-size: 32px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

.text {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.3px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-a .user { color: #ff8c42; }
.side-b .user { color: #a8dadc; }

.picked {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 2px;
  font-weight: 800;
}

.tag {
  font-size: 9px;
  letter-spacing: 2.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 999px;
  margin-left: 4px;
}

.turn {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.side-a .turn {
  background: rgba(255, 140, 66, 0.18);
  border-color: rgba(255, 140, 66, 0.55);
}

.side-b .turn {
  background: rgba(168, 218, 220, 0.18);
  border-color: rgba(168, 218, 220, 0.55);
}

.turn-label {
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.65);
}

.turn-num {
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
}

.side-a .turn-num { color: #ffd166; }
.side-b .turn-num { color: #cdeaff; }

.turn-of {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@media (max-width: 720px) {
  .banner {
    gap: 10px;
    padding: 7px 12px 7px 10px;
  }
  .gift { font-size: 24px; }
  .user { font-size: 14px; max-width: 140px; }
  .picked { font-size: 10px; letter-spacing: 1px; }
  .turn { padding: 4px 8px; gap: 3px; }
  .turn-label { font-size: 8px; letter-spacing: 1.5px; }
  .turn-num { font-size: 13px; }
  .turn-of { font-size: 10px; }
  .tag { display: none; }
}
</style>
