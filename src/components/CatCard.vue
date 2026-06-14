<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  fighter: { type: Object, required: true },
  side: { type: String, required: true },
})

const game = useGameStore()
const cat = computed(() => props.fighter.cat)
const evolved = computed(() => props.fighter.evolved)
const username = computed(() =>
  props.side === 'a' ? game.latestPickerA : game.latestPickerB,
)
const displayName = computed(() => {
  if (username.value) return '@' + username.value
  return evolved.value ? cat.value.evolvedName : cat.value.name
})
const displayColor = computed(() => (evolved.value ? cat.value.evolvedColor : cat.value.color))
const isWinner = computed(() => props.fighter.status === 'winner')
const isEliminated = computed(() => props.fighter.status === 'eliminated')
</script>

<template>
  <div
    class="hud"
    :class="{
      winner: isWinner,
      eliminated: isEliminated,
      ['side-' + side]: true,
    }"
    :style="{ '--accent': displayColor }"
  >
    <div class="meme-wrap">
      <img class="meme" :src="cat.meme" :alt="cat.name" />
      <div v-if="evolved" class="evolved-pip" title="Evolved">⚡</div>
    </div>
    <div class="info">
      <div class="top">
        <span class="side-tag">SIDE {{ side.toUpperCase() }}</span>
        <span v-if="isWinner" class="status-tag winner-tag">WINNER</span>
        <span v-else-if="isEliminated" class="status-tag eliminated-tag">ELIMINATED</span>
      </div>
      <div class="name">{{ displayName }}</div>
      <div class="score">{{ fighter.score }}</div>
    </div>
  </div>
</template>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 2px solid var(--accent, #888);
  border-radius: 18px;
  min-width: 220px;
  max-width: 320px;
  flex: 1;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04), 0 12px 28px rgba(0, 0, 0, 0.45);
  transition: filter 0.5s ease, box-shadow 0.4s ease;
}

.side-b { flex-direction: row-reverse; text-align: right; }
.side-b .info { align-items: flex-end; }
.side-b .top { flex-direction: row-reverse; }

.hud.winner {
  box-shadow:
    0 0 0 2px var(--accent),
    0 0 40px var(--accent),
    0 0 80px color-mix(in srgb, var(--accent) 60%, transparent);
}

.hud.eliminated {
  filter: grayscale(1) brightness(0.55);
  border-color: #444;
}

.meme-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--accent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 50%, transparent);
  background: #111;
  flex-shrink: 0;
}

.meme {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.evolved-pip {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffd166;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  border: 2px solid #0c0a18;
  box-shadow: 0 0 10px #ffd166;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.side-tag {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

.status-tag {
  font-size: 10px;
  letter-spacing: 2px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
}

.winner-tag {
  background: var(--accent);
  color: #000;
}

.eliminated-tag {
  background: #c0392b;
  color: #fff;
}

.name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.score {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 60%, transparent);
}

@media (max-width: 720px) {
  .hud {
    min-width: 0;
    max-width: none;
    padding: 8px 10px;
    gap: 8px;
    border-radius: 12px;
    border-width: 1px;
  }
  .meme-wrap {
    width: 44px;
    height: 44px;
    border-width: 2px;
  }
  .evolved-pip {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }
  .side-tag {
    font-size: 8px;
    letter-spacing: 1.5px;
  }
  .status-tag {
    font-size: 8px;
    letter-spacing: 1px;
    padding: 2px 5px;
  }
  .name {
    font-size: 13px;
  }
  .score {
    font-size: 26px;
  }
}
</style>
