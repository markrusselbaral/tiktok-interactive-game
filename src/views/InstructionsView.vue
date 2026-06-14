<script setup>
import { useGameStore } from '@/stores/game'
import { RouterLink } from 'vue-router'

const game = useGameStore()
</script>

<template>
  <div class="instructions-page">
    <header class="header">
      <RouterLink to="/" class="back">← Arena</RouterLink>
      <div class="title">
        <span class="title-glow">HOW</span> TO PLAY
      </div>
      <div class="spacer"></div>
    </header>

    <section class="section">
      <h2 class="section-title">Characters</h2>
      <div class="cards">
        <div
          v-for="cat in game.roster"
          :key="cat.id"
          class="char-card"
          :style="{ '--accent': cat.color }"
        >
          <div class="gift-icon">{{ cat.gift?.icon }}</div>
          <div class="meme-wrap">
            <img class="meme" :src="cat.meme" :alt="cat.name" />
          </div>
          <div class="char-name">{{ cat.name }}</div>
          <div class="gift-tag">
            send <strong>{{ cat.gift?.name }}</strong> to pick this fighter
          </div>
        </div>
      </div>
    </section>

    <div class="page-nav">
      <RouterLink to="/skills" class="page-nav-link">⚡ Skills &amp; Commands</RouterLink>
      <RouterLink to="/roster" class="page-nav-link">🎴 Roster</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.instructions-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, #2d2342 0%, transparent 60%),
    radial-gradient(ellipse at bottom, #3d1f3d 0%, transparent 60%),
    #0c0a18;
  color: #fff;
  padding: 24px 20px 60px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}

.back {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.back:hover { background: rgba(255, 255, 255, 0.12); }

.spacer { width: 90px; }

.title {
  font-size: 44px;
  font-weight: 900;
  letter-spacing: 6px;
  text-align: center;
  flex: 1;
}

.title-glow {
  background: linear-gradient(90deg, #ff4d6d, #ffd166);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 40px rgba(255, 77, 109, 0.4);
}

.section {
  max-width: 980px;
  margin: 0 auto 36px;
}

.section-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 20px;
  color: #fff;
  border-left: 6px solid #ff4d6d;
  padding-left: 16px;
}

.section-sub {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 18px;
  font-size: 18px;
  line-height: 1.6;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.char-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 2px solid var(--accent);
  border-radius: 20px;
  padding: 22px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.45);
}

.gift-icon {
  font-size: 80px;
  line-height: 1;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
}

.meme-wrap {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  border: 3px solid var(--accent);
  box-shadow: 0 0 26px color-mix(in srgb, var(--accent) 40%, transparent);
}

.meme {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.char-name {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: #fff;
}

.gift-tag {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
}

.gift-tag strong {
  color: var(--accent);
  font-size: 20px;
}

.page-nav {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.page-nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-nav-link:hover { background: rgba(255, 255, 255, 0.14); }

@media (max-width: 720px) {
  .instructions-page { padding: 16px 12px 40px; }
  .title { font-size: 28px; letter-spacing: 3px; }
  .spacer { display: none; }
  .section-title { font-size: 24px; letter-spacing: 1.5px; }
  .section-sub { font-size: 16px; }
  .cards { grid-template-columns: 1fr; gap: 16px; }
  .char-card { padding: 20px 16px 18px; gap: 14px; }
  .gift-icon { font-size: 64px; }
  .char-name { font-size: 26px; }
  .gift-tag { font-size: 16px; }
  .gift-tag strong { font-size: 18px; }
  .meme-wrap { aspect-ratio: 4 / 5; }
}
</style>
