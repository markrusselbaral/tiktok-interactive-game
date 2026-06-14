<script setup>
import { useGameStore } from '@/stores/game'
import { RouterLink } from 'vue-router'

const game = useGameStore()
</script>

<template>
  <div class="roster-page">
    <header class="header">
      <RouterLink to="/" class="back">← Arena</RouterLink>
      <div class="title">ROSTER</div>
      <div class="spacer"></div>
    </header>

    <div class="roster">
      <div
        v-for="cat in game.roster"
        :key="cat.id"
        class="card"
        :style="{ '--accent': cat.color }"
      >
        <div class="meme-wrap">
          <span class="gift-overlay">{{ cat.gift?.icon }}</span>
          <img class="meme" :src="cat.meme" :alt="cat.name" />
        </div>
        <div class="name">{{ cat.name }}</div>
        <div class="gift">
          <span class="gift-name">{{ cat.gift?.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roster-page {
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(ellipse at top, #2d2342 0%, transparent 60%),
    radial-gradient(ellipse at bottom, #3d1f3d 0%, transparent 60%),
    #0c0a18;
  color: #fff;
  padding: 12px 14px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.back {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.back:hover { background: rgba(255, 255, 255, 0.12); }

.spacer { width: 78px; }

.title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 4px;
  text-align: center;
  flex: 1;
  background: linear-gradient(90deg, #ff4d6d, #ffd166);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.roster {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  min-height: 0;
}

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid var(--accent);
  border-radius: 14px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
  min-height: 0;
  overflow: hidden;
}

.meme-wrap {
  position: relative;
  flex: 1 1 0;
  width: 100%;
  min-height: 0;
  border-radius: 10px;
  border: 2px solid var(--accent);
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meme {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.gift-overlay {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(56px, 11vh, 110px);
  line-height: 1;
  z-index: 3;
  filter:
    drop-shadow(0 4px 10px rgba(0, 0, 0, 0.85))
    drop-shadow(0 0 18px color-mix(in srgb, var(--accent) 70%, transparent));
  pointer-events: none;
}

.name {
  flex: 0 0 auto;
  font-size: clamp(14px, 2.4vh, 20px);
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.gift {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 999px;
  padding: 4px 10px;
  max-width: 100%;
}

.gift-name {
  font-size: clamp(11px, 1.8vh, 14px);
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 720px) {
  .roster-page { padding: 10px; }
  .title { font-size: 16px; letter-spacing: 2.5px; }
  .spacer { display: none; }
  .roster { gap: 8px; }
  .card { padding: 8px; gap: 6px; border-radius: 12px; }
}
</style>
