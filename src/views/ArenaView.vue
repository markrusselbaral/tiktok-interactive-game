<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import CatCard from '@/components/CatCard.vue'
import BattleStage from '@/components/BattleStage.vue'
import RoundTimer from '@/components/RoundTimer.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import UltimateOverlay from '@/components/UltimateOverlay.vue'
import WinnerHighlight from '@/components/WinnerHighlight.vue'
import BackgroundMusic from '@/components/BackgroundMusic.vue'
import LiveConnect from '@/components/LiveConnect.vue'
import UpcomingFight from '@/components/UpcomingFight.vue'
import FanRoster from '@/components/FanRoster.vue'
import { RouterLink } from 'vue-router'

const game = useGameStore()
const {
  a,
  b,
  flash,
  lastEvent,
  attack,
  hurt,
  timeLeft,
  roundDuration,
  roundNumber,
  roundActive,
  ultimate,
  winnerHighlight,
} = storeToRefs(game)

onMounted(() => game.startTimer())
onUnmounted(() => game.stopTimer())
</script>

<template>
  <div class="arena">
    <div class="title-bar">
      <div class="title">
        <span class="title-glow">CAT</span> FIGHT ARENA
      </div>
      <div class="nav-links">
        <RouterLink to="/instructions" class="nav-link">📖 CHARACTERS</RouterLink>
        <RouterLink to="/skills" class="nav-link">⚡ SKILLS</RouterLink>
        <RouterLink to="/roster" class="nav-link">🎴 ROSTER</RouterLink>
      </div>
    </div>

    <UpcomingFight />

    <FanRoster />

    <div class="hud-row">
      <CatCard :fighter="a" side="a" />
      <RoundTimer
        :time-left="timeLeft"
        :duration="roundDuration"
        :round-number="roundNumber"
        :active="roundActive"
        :waiting="roundActive && a.score === 0 && b.score === 0"
      />
      <CatCard :fighter="b" side="b" />
    </div>

    <BattleStage
      :a="a"
      :b="b"
      :attack="attack"
      :hurt="hurt"
      :flash="flash"
      :event="lastEvent"
    />

    <ControlPanel />

    <UltimateOverlay :ultimate="ultimate" @done="game.clearUltimate()" />

    <WinnerHighlight :highlight="winnerHighlight" @done="game.clearWinnerHighlight()" />

    <BackgroundMusic />

    <LiveConnect />
  </div>
</template>

<style scoped>
.arena {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, #2d2342 0%, transparent 60%),
    radial-gradient(ellipse at bottom, #3d1f3d 0%, transparent 60%),
    #0c0a18;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px 220px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  gap: 24px;
}

.title-bar {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.title {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 6px;
  text-align: center;
}

.nav-links {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.title-glow {
  background: linear-gradient(90deg, #ff4d6d, #ffd166);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 40px rgba(255, 77, 109, 0.4);
}

.hud-row {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
}

@media (max-width: 720px) {
  .arena {
    padding: 14px 8px 70px;
    gap: 12px;
  }
  .title {
    font-size: 22px;
    letter-spacing: 3px;
  }
  .nav-links {
    position: static;
    transform: none;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .nav-link {
    font-size: 9px;
    padding: 5px 8px;
    letter-spacing: 1px;
  }
  .title-bar {
    gap: 8px;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .hud-row {
    gap: 8px;
    flex-wrap: nowrap;
    align-items: center;
  }
}
</style>
