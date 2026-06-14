<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const open = ref(false)

function onKey(e) {
  if (e.key.toLowerCase() === 'h') open.value = !open.value
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="panel" :class="{ collapsed: !open }">
    <button class="toggle" @click="open = !open">
      {{ open ? '▼ HIDE CONTROLS (h)' : '▲ SHOW CONTROLS (h)' }}
    </button>
    <div v-if="open" class="grid">
      <div class="col">
        <div class="col-title">SIDE A — {{ game.displayNameA }}</div>
        <div class="row">
          <button @click="game.addScore('a', 1)">+1 A</button>
          <button @click="game.addScore('a', 5)">+5 A</button>
          <button @click="game.addScore('a', 10)">+10 A</button>
        </div>
        <div class="row">
          <button @click="game.revive('a')">Revive A</button>
          <button @click="game.evolve('a')">
            {{ game.a.evolved ? 'Devolve A' : 'Evolve A' }}
          </button>
        </div>
        <div class="row">
          <button class="ultimate" @click="game.triggerUltimate('a')">⚡ ULTIMATE A</button>
        </div>
      </div>
      <div class="col">
        <div class="col-title">SIDE B — {{ game.displayNameB }}</div>
        <div class="row">
          <button @click="game.addScore('b', 1)">+1 B</button>
          <button @click="game.addScore('b', 5)">+5 B</button>
          <button @click="game.addScore('b', 10)">+10 B</button>
        </div>
        <div class="row">
          <button @click="game.revive('b')">Revive B</button>
          <button @click="game.evolve('b')">
            {{ game.b.evolved ? 'Devolve B' : 'Evolve B' }}
          </button>
        </div>
        <div class="row">
          <button class="ultimate" @click="game.triggerUltimate('b')">⚡ ULTIMATE B</button>
        </div>
      </div>
      <div class="col round-col">
        <div class="col-title">ROUND</div>
        <div class="row">
          <button class="primary" @click="game.endRound()" :disabled="!game.roundActive">
            End Round
          </button>
          <button class="primary" @click="game.nextRound()">
            Next Round →
          </button>
        </div>
        <div class="row">
          <label class="duration">
            Duration
            <select :value="game.roundDuration" @change="game.setRoundDuration(+$event.target.value)">
              <option :value="30">30s</option>
              <option :value="45">45s</option>
              <option :value="60">60s</option>
              <option :value="90">90s</option>
            </select>
          </label>
        </div>
        <div class="queue">
          <div class="queue-title">QUEUE</div>
          <div class="queue-list">
            <span v-for="id in game.queue" :key="id" class="chip">
              <img
                v-if="game.roster.find((c) => c.id === id)?.meme"
                class="chip-meme"
                :src="game.roster.find((c) => c.id === id)?.meme"
                alt=""
              />
              {{ game.roster.find((c) => c.id === id)?.name }}
            </span>
            <span v-if="!game.queue.length" class="chip empty">empty</span>
          </div>
          <div class="queue-title" style="margin-top: 8px">ELIMINATED</div>
          <div class="queue-list">
            <span v-for="id in game.eliminated" :key="id" class="chip elim">
              <img
                v-if="game.roster.find((c) => c.id === id)?.meme"
                class="chip-meme"
                :src="game.roster.find((c) => c.id === id)?.meme"
                alt=""
              />
              {{ game.roster.find((c) => c.id === id)?.name }}
            </span>
            <span v-if="!game.eliminated.length" class="chip empty">none</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 12, 18, 0.92);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px 20px 18px;
  z-index: 100;
}

.toggle {
  position: absolute;
  top: -32px;
  right: 20px;
  background: rgba(10, 12, 18, 0.92);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 6px 14px;
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 700;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.4fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}


.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-title {
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
}

.row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  flex: 1;
  min-width: 70px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease;
}

button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

button:active:not(:disabled) {
  transform: translateY(1px);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button.primary {
  background: linear-gradient(135deg, #ffd166, #ff8c42);
  color: #000;
  border-color: transparent;
}

button.ultimate {
  background: linear-gradient(135deg, #ff4d6d, #b5179e);
  color: #fff;
  border-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 209, 102, 0.6);
  box-shadow: 0 0 18px rgba(255, 77, 109, 0.5);
}

button.ultimate:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff6b85, #d11dc1);
}

.duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  gap: 8px;
  align-items: center;
}

.duration select {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 8px;
  font-weight: 700;
}

.queue {
  margin-top: 4px;
}

.queue-title {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  margin-bottom: 4px;
}

.queue-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 3px 10px 3px 3px;
  font-size: 12px;
  color: #fff;
}

.chip-meme {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.chip.elim {
  border-color: rgba(192, 57, 43, 0.6);
  color: #ff8a8a;
}

.chip.empty {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
</style>
