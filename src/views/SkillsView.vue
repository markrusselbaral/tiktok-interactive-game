<script setup>
import { RouterLink } from 'vue-router'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
  <div class="skills-page">
    <header class="header">
      <RouterLink to="/" class="back">← Arena</RouterLink>
      <div class="title">
        <span class="title-glow">SKILLS</span> &amp; COMMANDS
      </div>
      <div class="spacer"></div>
    </header>

    <section class="section">
      <h2 class="section-title">Characters &amp; Skills</h2>
      <p class="section-sub">Type these commands in chat to make the characters attack:</p>

      <div class="skills">
        <div class="skill-col side-a">
          <div class="col-head">SIDE A</div>
          <ul class="cmd-list">
            <li><code>a punch</code> <span class="arrow">→</span> Punch attack</li>
            <li><code>a kick</code> <span class="arrow">→</span> Kick attack</li>
            <li><code>a combo</code> <span class="arrow">→</span> Combo attack</li>
          </ul>
        </div>
        <div class="skill-col side-b">
          <div class="col-head">SIDE B</div>
          <ul class="cmd-list">
            <li><code>b punch</code> <span class="arrow">→</span> Punch attack</li>
            <li><code>b kick</code> <span class="arrow">→</span> Kick attack</li>
            <li><code>b combo</code> <span class="arrow">→</span> Combo attack</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Roster</h2>
      <p class="section-sub">Gift 🌹 <strong>Rose</strong> or 🍦 <strong>Ice Cream Cone</strong> to pick a fighter.</p>
      <div class="roster">
        <div
          v-for="cat in game.roster"
          :key="cat.id"
          class="card"
          :style="{ '--accent': cat.color }"
        >
          <div class="meme-wrap">
            <img class="meme" :src="cat.meme" :alt="cat.name" />
            <span class="gift-overlay">{{ cat.gift?.icon }}</span>
          </div>
          <div class="name">{{ cat.name }}</div>
          <div class="gift">
            <span class="gift-icon">{{ cat.gift?.icon }}</span>
            <span class="gift-name">{{ cat.gift?.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="page-nav">
      <RouterLink to="/instructions" class="page-nav-link">📖 Characters</RouterLink>
      <RouterLink to="/roster" class="page-nav-link">🎴 Roster</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.skills-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, #2d2342 0%, transparent 60%),
    radial-gradient(ellipse at bottom, #3d1f3d 0%, transparent 60%),
    #0c0a18;
  color: #fff;
  padding: 14px 16px 28px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

.back {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.back:hover { background: rgba(255, 255, 255, 0.12); }

.spacer { width: 78px; }

.title {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 4px;
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
  margin: 0 auto 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1.5px;
  margin: 0 0 8px;
  color: #fff;
  border-left: 4px solid #ff4d6d;
  padding-left: 10px;
}

.section-sub {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.45;
}

.skills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.skill-col {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
}

.skill-col.side-a { border-color: rgba(255, 140, 66, 0.5); }
.skill-col.side-b { border-color: rgba(168, 218, 220, 0.5); }

.col-head {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.side-a .col-head { color: #ff8c42; }
.side-b .col-head { color: #a8dadc; }

.cmd-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cmd-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

.cmd-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  padding: 3px 7px;
  color: #ffd166;
}

.arrow {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
  font-size: 14px;
}

.bullets {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.45;
}

.bullets code {
  font-family: ui-monospace, monospace;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 700;
  color: #ffd166;
}

.roster {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 200px));
  justify-content: center;
  gap: 12px;
}

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid var(--accent);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.meme-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
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
  bottom: 6px;
  right: 6px;
  font-size: 44px;
  line-height: 1;
  z-index: 3;
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid var(--accent);
  border-radius: 999px;
  padding: 5px 7px;
  filter:
    drop-shadow(0 4px 10px rgba(0, 0, 0, 0.9))
    drop-shadow(0 0 16px color-mix(in srgb, var(--accent) 90%, transparent));
  pointer-events: none;
  animation: giftPulse 1.6s ease-in-out infinite;
}

@keyframes giftPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.name {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.gift {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--accent) 70%, transparent);
  border-radius: 999px;
  padding: 4px 11px;
  max-width: 100%;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 40%, transparent);
}

.gift-icon {
  font-size: 16px;
  line-height: 1;
}

.gift-name {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 80%, transparent);
}

.page-nav {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.page-nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-nav-link:hover { background: rgba(255, 255, 255, 0.14); }

@media (max-width: 720px) {
  .skills-page { padding: 10px 10px 24px; }
  .title { font-size: 20px; letter-spacing: 2.5px; }
  .spacer { display: none; }
  .section { margin-bottom: 12px; }
  .section-title { font-size: 16px; letter-spacing: 1px; margin-bottom: 6px; }
  .section-sub { font-size: 12px; }
  .skills { grid-template-columns: 1fr 1fr; gap: 8px; }
  .skill-col { padding: 8px 10px; border-radius: 10px; }
  .col-head { font-size: 11px; letter-spacing: 2px; margin-bottom: 6px; }
  .cmd-list { gap: 5px; }
  .cmd-list li { font-size: 12px; gap: 6px; }
  .cmd-list code { font-size: 11px; padding: 2px 6px; }
  .arrow { font-size: 12px; }
  .bullets { font-size: 12px; gap: 5px; padding-left: 16px; }
  .bullets code { font-size: 11px; }
  .roster { grid-template-columns: repeat(auto-fit, minmax(140px, 160px)); gap: 10px; }
  .card { padding: 8px; gap: 6px; border-radius: 11px; }
  .gift-overlay { font-size: 36px; padding: 4px 6px; bottom: 5px; right: 5px; }
  .name { font-size: 12px; }
  .gift { padding: 3px 9px; }
  .gift-icon { font-size: 14px; }
  .gift-name { font-size: 11px; }
  .page-nav-link { font-size: 11px; padding: 7px 10px; }
}
</style>
