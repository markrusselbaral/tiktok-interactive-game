<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { purchaseLog, a, b } = storeToRefs(game)

// Walk newest → oldest, take each user once. The latest side they picked wins.
const uniqueByUser = computed(() => {
  const seen = new Set()
  const result = []
  for (let i = purchaseLog.value.length - 1; i >= 0; i--) {
    const p = purchaseLog.value[i]
    if (!p?.user || seen.has(p.user)) continue
    seen.add(p.user)
    result.push(p)
  }
  return result
})

const fansA = computed(() => uniqueByUser.value.filter((p) => p.side === 'a'))
const fansB = computed(() => uniqueByUser.value.filter((p) => p.side === 'b'))

const latestA = computed(() => fansA.value[0] || null)
const latestB = computed(() => fansB.value[0] || null)
</script>

<template>
  <div class="fan-roster">
    <div class="col side-a">
      <div class="head">
        <span class="gift">{{ a.cat.gift?.icon }}</span>
        <span class="name">{{ latestA ? '@' + latestA.user : '—' }}</span>
        <span class="count">{{ fansA.length }}</span>
      </div>
      <div class="list">
        <span v-for="p in fansA.slice(0, 30)" :key="p.key" class="chip">
          @{{ p.user }}
        </span>
        <span v-if="!fansA.length" class="empty">no fans yet</span>
      </div>
    </div>

    <div class="col side-b">
      <div class="head">
        <span class="gift">{{ b.cat.gift?.icon }}</span>
        <span class="name">{{ latestB ? '@' + latestB.user : '—' }}</span>
        <span class="count">{{ fansB.length }}</span>
      </div>
      <div class="list">
        <span v-for="p in fansB.slice(0, 30)" :key="p.key" class="chip">
          @{{ p.user }}
        </span>
        <span v-if="!fansB.length" class="empty">no fans yet</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fan-roster {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 1100px;
}

.col {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 0;
}

.col.side-a { border-color: rgba(255, 140, 66, 0.45); }
.col.side-b { border-color: rgba(168, 218, 220, 0.45); }

.head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.gift { font-size: 22px; line-height: 1; }
.name {
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.side-a .name { color: #ff8c42; }
.side-b .name { color: #a8dadc; }

.count {
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 80px;
  overflow-y: auto;
}

.chip {
  font-size: 11px;
  font-weight: 700;
  color: #ffd166;
  background: rgba(255, 209, 102, 0.08);
  border: 1px solid rgba(255, 209, 102, 0.25);
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}

.empty {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

@media (max-width: 720px) {
  .fan-roster { gap: 8px; }
  .col { padding: 8px; border-radius: 10px; }
  .gift { font-size: 18px; }
  .name { font-size: 12px; }
  .count { font-size: 10px; padding: 1px 6px; }
  .chip { font-size: 10px; padding: 2px 6px; }
  .list { max-height: 60px; gap: 4px; }
}
</style>
