<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { live, a, b } = storeToRefs(game)

const username = ref('')
const isNarrow =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 720px)').matches
const open = ref(!isNarrow)

const statusLabel = computed(() => {
  switch (live.value.status) {
    case 'connecting':
      return 'connecting…'
    case 'connected':
      return `LIVE @${live.value.username}`
    case 'error':
      return 'error'
    case 'closed':
      return 'disconnected'
    default:
      return 'idle'
  }
})

const statusClass = computed(() => `status-${live.value.status}`)

function connect() {
  if (!username.value.trim()) return
  game.connectLive(username.value.trim())
}

function disconnect() {
  game.disconnectLive()
}

onUnmounted(() => game.disconnectLive())
</script>

<template>
  <div class="live" :class="{ collapsed: !open }">
    <button class="toggle" @click="open = !open">
      {{ open ? '◀ HIDE' : 'LIVE ▶' }}
    </button>
    <div v-if="open" class="body">
      <div class="header">
        <div class="title">TIKTOK LIVE</div>
        <div class="status" :class="statusClass">● {{ statusLabel }}</div>
      </div>

      <div v-if="live.status !== 'connected'" class="connect-row">
        <input
          v-model="username"
          placeholder="@username"
          @keyup.enter="connect"
        />
        <button class="primary" @click="connect" :disabled="live.status === 'connecting'">
          {{ live.status === 'connecting' ? '…' : 'Connect' }}
        </button>
      </div>
      <div v-else class="connect-row">
        <button @click="disconnect">Disconnect</button>
      </div>

      <div v-if="live.error" class="error">{{ live.error }}</div>

      <div class="fans">
        <div class="fan-row">
          <span class="fan-label">{{ game.displayNameA }}</span>
          <span class="fan-count">{{ live.fanCount.a }} 🌹</span>
        </div>
        <div class="fan-row">
          <span class="fan-label">{{ game.displayNameB }}</span>
          <span class="fan-count">{{ live.fanCount.b }} 🌹</span>
        </div>
      </div>

      <div class="legend">
        <div><strong>🌹 Rose / 🍦 Ice Cream</strong> — pick a fighter (1st gift) or fire ultimate</div>
        <div><strong>a kick / b kick</strong> — make that side perform a skill</div>
        <div><strong>punch / kick / combo</strong> — your team performs the skill</div>
        <div><strong>orange / white</strong> — switch which side you support</div>
      </div>

      <div class="feed">
        <div v-if="!live.recent.length" class="feed-empty">no events yet…</div>
        <div
          v-for="evt in live.recent"
          :key="evt.key"
          class="feed-row"
          :class="`kind-${evt.kind}`"
        >
          <span class="kind-icon">
            <template v-if="evt.kind === 'gift'">🌹</template>
            <template v-else-if="evt.kind === 'pick'">⭐</template>
            <template v-else-if="evt.kind === 'comment'">💬</template>
            <template v-else>·</template>
          </span>
          <span v-if="evt.user" class="user">{{ evt.user }}</span>
          <span class="text">{{ evt.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live {
  position: fixed;
  top: 80px;
  right: 0;
  z-index: 90;
  width: 320px;
  background: rgba(10, 12, 18, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  border-radius: 12px 0 0 12px;
  padding: 14px 14px 12px;
  color: #fff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  transition: transform 0.2s ease;
}

.live.collapsed {
  transform: translateX(calc(100% - 56px));
}

.toggle {
  position: absolute;
  top: 10px;
  left: -2px;
  transform: translateX(-100%);
  background: rgba(10, 12, 18, 0.92);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  border-radius: 8px 0 0 8px;
  padding: 6px 10px;
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 700;
  cursor: pointer;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
}

.status {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.status-connecting { color: #ffd166; }
.status-connected { color: #80ffa1; background: rgba(128, 255, 161, 0.12); }
.status-error { color: #ff8a8a; background: rgba(255, 138, 138, 0.12); }
.status-closed { color: rgba(255, 255, 255, 0.5); }
.status-idle { color: rgba(255, 255, 255, 0.5); }

.connect-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

button {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
}

button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button.primary {
  background: linear-gradient(135deg, #ff4d6d, #b5179e);
  border-color: transparent;
}

.error {
  font-size: 11px;
  color: #ff8a8a;
  background: rgba(255, 138, 138, 0.08);
  border: 1px solid rgba(255, 138, 138, 0.25);
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 8px;
}

.fans {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.fan-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.fan-label {
  color: rgba(255, 255, 255, 0.8);
}

.fan-count {
  font-weight: 700;
}

.legend {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.legend strong {
  color: #ffd166;
  font-weight: 700;
}

.feed {
  max-height: 180px;
  overflow-y: auto;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 6px;
}

.feed-empty {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  padding: 8px 0;
}

.feed-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.feed-row .user {
  color: #ffd166;
  font-weight: 700;
  flex-shrink: 0;
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-row .text {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.feed-row.kind-gift .text {
  color: #ff8a8a;
}

.feed-row.kind-pick .text {
  color: #80ffa1;
}

.feed-row.kind-system .text {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.kind-icon {
  width: 14px;
  flex-shrink: 0;
  text-align: center;
}

@media (max-width: 720px) {
  .live {
    top: 56px;
    width: min(86vw, 280px);
    padding: 10px 10px 10px;
    border-radius: 10px 0 0 10px;
  }
  .live.collapsed { transform: translateX(calc(100% - 44px)); }
  .toggle {
    top: 6px;
    padding: 5px 8px;
    font-size: 10px;
  }
  .feed { max-height: 130px; }
  .legend { font-size: 10px; }
}
</style>
