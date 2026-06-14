import { defineStore } from 'pinia'
import { cats } from '@/data/cats'

const ROUND_DURATION = 45
const SKILL_COOLDOWN_MS = 2500
const ULTIMATE_COOLDOWN_MS = 30000
const MAX_RECENT_EVENTS = 25
const PURCHASE_LOG_KEY = 'cat-fight:purchase-log'
const PICK_QUEUE_KEY = 'cat-fight:pick-queue'

const SIDE_HINTS = {
  a: ['a', 'left', '1', 'orange', 'tangerine', 'inferno'],
  b: ['b', 'right', '2', 'white', 'marshmallow', 'frostbite'],
}

const SKILL_PATTERNS = [
  { re: /\bcombo\b|\bsuper\b|\bspecial\b/i, amount: 10 },
  { re: /\bkick\b|\bsweep\b/i, amount: 5 },
  { re: /\bpunch\b|\bjab\b|\bhit\b|\bsmack\b/i, amount: 3 },
]

// Map a gift name to the cat it corresponds to, using each cat's own
// `gift.match` regex from the roster.
function detectGiftCatId(giftName) {
  const s = String(giftName || '')
  if (!s) return null
  for (const cat of cats) {
    if (cat.gift?.match?.test(s)) return cat.id
  }
  return null
}

function makeFighter(cat) {
  return {
    cat,
    score: 0,
    status: 'fighting', // fighting | winner | eliminated
    evolved: false,
  }
}

function detectSide(text) {
  const lower = String(text || '').toLowerCase()
  for (const side of ['a', 'b']) {
    for (const hint of SIDE_HINTS[side]) {
      const re = new RegExp(`(?:^|[^a-z])${hint}(?:[^a-z]|$)`, 'i')
      if (re.test(lower)) return side
    }
  }
  return null
}

function detectSkill(text) {
  for (const { re, amount } of SKILL_PATTERNS) {
    if (re.test(text)) return amount
  }
  return null
}

export const useGameStore = defineStore('game', {
  state: () => ({
    roster: cats.map((c) => c),
    queue: cats.slice(2).map((c) => c.id),
    eliminated: [],
    a: makeFighter(cats[0]),
    b: makeFighter(cats[1]),
    timeLeft: ROUND_DURATION,
    roundDuration: ROUND_DURATION,
    roundActive: true,
    roundNumber: 1,
    flash: null, // { side: 'a'|'b', amount: number, key: number }
    lastEvent: null, // { type: 'evolve'|'revive'|'win'|'eliminate', side, key }
    attack: { a: { key: 0, type: 'punch' }, b: { key: 0, type: 'punch' } },
    hurt: { a: 0, b: 0 },
    ultimate: null, // { side, key, name, meme }
    winnerHighlight: null, // { side, key, name, video, color }
    latestPick: null, // { key, user, side, catId, catName, giftIcon }
    purchaseLog: [], // [{ key, ts, user, side, catId, catName, giftIcon, giftName }]
    pickQueueA: [], // queued usernames for side A (head = current turn)
    pickQueueB: [], // queued usernames for side B (head = current turn)
    autoNext: true,
    _timer: null,
    _autoNextTimer: null,

    // --- live integration ---
    live: {
      status: 'idle', // idle | connecting | connected | error | closed
      username: '',
      error: '',
      bridgeUrl: 'ws://localhost:8787',
      recent: [], // [{ key, kind, user, text }]
      fanCount: { a: 0, b: 0 },
    },
    viewerSides: {}, // username -> 'a' | 'b'
    _ws: null,
    _skillCooldown: {}, // username -> timestamp ms
    _ultimateCooldown: {}, // username -> timestamp ms
  }),
  getters: {
    // Head of each side's queue is whose turn it is.
    latestPickerA: (state) => state.pickQueueA[0] || null,
    latestPickerB: (state) => state.pickQueueB[0] || null,
    displayNameA() {
      return this.latestPickerA ? '@' + this.latestPickerA : this.a.cat.name
    },
    displayNameB() {
      return this.latestPickerB ? '@' + this.latestPickerB : this.b.cat.name
    },
  },
  actions: {
    addScore(side, amount) {
      const f = side === 'a' ? this.a : this.b
      if (f.status === 'eliminated') return
      f.score += amount
      this.flash = { side, amount, key: Date.now() }
      const type = amount >= 10 ? 'combo' : amount >= 5 ? 'kick' : 'punch'
      this.attack[side] = { key: Date.now(), type }
      const other = side === 'a' ? 'b' : 'a'
      // delay the hurt slightly so it lands when the punch connects
      setTimeout(() => {
        this.hurt[other] = Date.now()
      }, 180)
    },
    revive(side) {
      const f = side === 'a' ? this.a : this.b
      f.status = 'fighting'
      f.score = Math.max(f.score, 1)
      this.lastEvent = { type: 'revive', side, key: Date.now() }
    },
    evolve(side) {
      const f = side === 'a' ? this.a : this.b
      f.evolved = !f.evolved
      this.lastEvent = { type: 'evolve', side, key: Date.now() }
    },
    triggerUltimate(side) {
      const f = side === 'a' ? this.a : this.b
      if (f.status === 'eliminated') return
      const picker = side === 'a' ? this.latestPickerA : this.latestPickerB
      const name = picker
        ? '@' + picker
        : f.evolved
          ? f.cat.evolvedName
          : f.cat.name
      this.ultimate = {
        side,
        key: Date.now(),
        name,
        ultName: `${name.toUpperCase()} ULTIMATE!`,
        meme: f.cat.meme,
        color: f.evolved ? f.cat.evolvedColor : f.cat.color,
      }
    },
    clearUltimate() {
      const side = this.ultimate?.side
      this.ultimate = null
      if (side) this.executeUltimateFollowup(side)
    },
    executeUltimateFollowup(side) {
      const f = side === 'a' ? this.a : this.b
      if (f.status === 'eliminated') return
      // dramatic on-stage combo after meme exits — punch, kick, punch, kick, finishing combo
      const sequence = [
        { delay: 50, amount: 3 }, // punch
        { delay: 380, amount: 5 }, // kick
        { delay: 760, amount: 3 }, // punch
        { delay: 1140, amount: 5 }, // kick
        { delay: 1600, amount: 12 }, // combo finisher
      ]
      sequence.forEach(({ delay, amount }) => {
        setTimeout(() => {
          if (f.status === 'eliminated') return
          this.addScore(side, amount)
        }, delay)
      })
    },
    startTimer() {
      this.stopTimer()
      this._timer = setInterval(() => {
        if (!this.roundActive) return
        // hold the countdown until the first point of the round is scored
        if (this.a.score === 0 && this.b.score === 0) return
        if (this.timeLeft > 0) {
          this.timeLeft -= 1
        } else {
          this.endRound()
        }
      }, 1000)
    },
    stopTimer() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    },
    endRound() {
      if (!this.roundActive) return
      this.roundActive = false
      const aWins = this.a.score >= this.b.score
      const winner = aWins ? this.a : this.b
      const loser = aWins ? this.b : this.a
      const winnerSide = aWins ? 'a' : 'b'
      const loserSide = aWins ? 'b' : 'a'
      winner.status = 'winner'
      loser.status = 'eliminated'
      this.eliminated.push(loser.cat.id)
      this.lastEvent = { type: 'win', side: winnerSide, key: Date.now() }
      setTimeout(() => {
        this.lastEvent = { type: 'eliminate', side: loserSide, key: Date.now() }
      }, 250)
      if (winner.cat.video) {
        const picker =
          winnerSide === 'a' ? this.latestPickerA : this.latestPickerB
        this.winnerHighlight = {
          side: winnerSide,
          key: Date.now(),
          name: picker
            ? '@' + picker
            : winner.evolved
              ? winner.cat.evolvedName
              : winner.cat.name,
          video: winner.cat.video,
          color: winner.evolved ? winner.cat.evolvedColor : winner.cat.color,
        }
      } else {
        // no highlight to wait on — schedule auto-next directly
        this._scheduleAutoNext(2500)
      }
    },
    clearWinnerHighlight() {
      this.winnerHighlight = null
      // highlight finished → auto-advance to next round
      this._scheduleAutoNext(900)
    },
    _scheduleAutoNext(delay) {
      if (!this.autoNext) return
      if (this._autoNextTimer) {
        clearTimeout(this._autoNextTimer)
        this._autoNextTimer = null
      }
      this._autoNextTimer = setTimeout(() => {
        this._autoNextTimer = null
        if (!this.roundActive) this.nextRound()
      }, delay)
    },
    setAutoNext(enabled) {
      this.autoNext = !!enabled
      if (!enabled && this._autoNextTimer) {
        clearTimeout(this._autoNextTimer)
        this._autoNextTimer = null
      }
    },
    clearLatestPick() {
      this.latestPick = null
    },
    _recordPurchase(entry) {
      this.purchaseLog.push(entry)
      // cap history to last 500 entries
      if (this.purchaseLog.length > 500) {
        this.purchaseLog.splice(0, this.purchaseLog.length - 500)
      }
      this._savePurchaseLog()
    },
    _savePurchaseLog() {
      try {
        localStorage.setItem(PURCHASE_LOG_KEY, JSON.stringify(this.purchaseLog))
      } catch {}
    },
    loadPurchaseLog() {
      try {
        const raw = localStorage.getItem(PURCHASE_LOG_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) this.purchaseLog = parsed
      } catch {}
    },
    clearPurchaseLog() {
      this.purchaseLog = []
      try {
        localStorage.removeItem(PURCHASE_LOG_KEY)
      } catch {}
    },
    nextRound() {
      this.winnerHighlight = null
      // determine challenger from queue (skip already eliminated)
      let nextId = null
      while (this.queue.length) {
        const candidate = this.queue.shift()
        if (!this.eliminated.includes(candidate)) {
          nextId = candidate
          break
        }
      }
      // if queue empty, recycle eliminated cats back in
      if (!nextId) {
        const pool = this.roster
          .map((c) => c.id)
          .filter((id) => id !== this.a.cat.id && id !== this.b.cat.id)
        if (pool.length) {
          this.eliminated = []
          this.queue = pool.slice(1)
          nextId = pool[0]
        }
      }
      if (!nextId) {
        // only two cats total; just reset both
        this.timeLeft = this.roundDuration
        this.roundActive = true
        this.a.score = 0
        this.b.score = 0
        this.a.status = 'fighting'
        this.b.status = 'fighting'
        this.roundNumber += 1
        this._resetFanship()
        return
      }

      const challengerCat = this.roster.find((c) => c.id === nextId)
      // winner stays — replace whichever side is the loser/eliminated
      let replacedSide = null
      if (this.a.status === 'eliminated' || this.a.status === 'fighting') {
        // if the round wasn't ended (e.g., manual next), pick lower scorer to drop
        if (this.a.status !== 'eliminated' && this.b.status !== 'eliminated') {
          if (this.a.score < this.b.score) {
            this.eliminated.push(this.a.cat.id)
            this.a = makeFighter(challengerCat)
            this.b.score = 0
            this.b.status = 'fighting'
            replacedSide = 'a'
          } else {
            this.eliminated.push(this.b.cat.id)
            this.b = makeFighter(challengerCat)
            this.a.score = 0
            this.a.status = 'fighting'
            replacedSide = 'b'
          }
        } else if (this.a.status === 'eliminated') {
          this.a = makeFighter(challengerCat)
          this.b.score = 0
          this.b.status = 'fighting'
          replacedSide = 'a'
        } else {
          this.b = makeFighter(challengerCat)
          this.a.score = 0
          this.a.status = 'fighting'
          replacedSide = 'b'
        }
      } else {
        // a is winner, b eliminated
        this.b = makeFighter(challengerCat)
        this.a.score = 0
        this.a.status = 'fighting'
        replacedSide = 'b'
      }

      this.timeLeft = this.roundDuration
      this.roundActive = true
      this.roundNumber += 1
      // Only reset the side that got a new fighter — the winner's picker keeps their nameplate.
      this._resetSideFanship(replacedSide)
    },
    setRoundDuration(seconds) {
      this.roundDuration = seconds
      if (this.roundActive) this.timeLeft = seconds
    },
    setFighter(side, catId) {
      if (side !== 'a' && side !== 'b') return
      const cat = this.roster.find((c) => c.id === catId)
      if (!cat) return
      if (this[side].cat.id === catId) return
      const otherSide = side === 'a' ? 'b' : 'a'
      if (this[otherSide].cat.id === catId) {
        // swap sides
        const sideCat = this[side].cat
        this[otherSide] = makeFighter(sideCat)
      }
      this[side] = makeFighter(cat)
      this.eliminated = this.eliminated.filter((id) => id !== catId)
      this.queue = this.queue.filter((id) => id !== catId)
      this.timeLeft = this.roundDuration
      this.roundActive = true
      this._resetFanship()
    },

    // ----- Live integration -----
    connectLive(username) {
      const trimmed = String(username || '').replace(/^@/, '').trim()
      if (!trimmed) {
        this.live.status = 'error'
        this.live.error = 'Enter a TikTok username'
        return
      }
      this.disconnectLive()
      this.live.username = trimmed
      this.live.status = 'connecting'
      this.live.error = ''

      const url = `${this.live.bridgeUrl}/?username=${encodeURIComponent(trimmed)}`
      let ws
      try {
        ws = new WebSocket(url)
      } catch (e) {
        this.live.status = 'error'
        this.live.error = String(e?.message || e)
        return
      }
      this._ws = ws

      ws.addEventListener('message', (msgEvt) => {
        let evt
        try {
          evt = JSON.parse(msgEvt.data)
        } catch {
          return
        }
        this._handleLiveEvent(evt)
      })
      ws.addEventListener('close', () => {
        if (this.live.status !== 'error') this.live.status = 'closed'
        this._ws = null
      })
      ws.addEventListener('error', () => {
        this.live.status = 'error'
        if (!this.live.error)
          this.live.error = `Could not reach bridge at ${this.live.bridgeUrl}. Run "npm run server".`
      })
    },
    disconnectLive() {
      if (this._ws) {
        try {
          this._ws.close()
        } catch {}
        this._ws = null
      }
      this.live.status = 'idle'
    },
    _handleLiveEvent(evt) {
      switch (evt.type) {
        case 'connected':
          this.live.status = 'connected'
          this.live.error = ''
          this._pushRecent({ kind: 'system', text: `Connected to @${evt.username}` })
          break
        case 'disconnected':
        case 'streamEnd':
          this.live.status = 'closed'
          this._pushRecent({ kind: 'system', text: 'Live disconnected' })
          break
        case 'error':
          this.live.status = 'error'
          this.live.error = evt.message || 'unknown error'
          this._pushRecent({ kind: 'system', text: `Error: ${this.live.error}` })
          break
        case 'comment':
          this.handleViewerComment(evt.user, evt.text)
          break
        case 'gift':
          this.handleViewerGift(evt.user, evt.count || 1, evt.giftName, evt.diamondCount)
          break
      }
    },
    handleViewerComment(user, text) {
      if (!user) return
      const trimmed = String(text || '').trim()
      this._pushRecent({ kind: 'comment', user, text: trimmed })

      const hinted = detectSide(trimmed)
      const skillAmount = detectSkill(trimmed)

      // "a kick" / "b combo" / "kick orange" — targeted command, no team-switch
      if (hinted && skillAmount) {
        if (this._cooldownOk(this._skillCooldown, user, SKILL_COOLDOWN_MS)) {
          this.addScore(hinted, skillAmount)
        }
        return
      }

      // bare side mention → join that team
      if (hinted) {
        this._assignSide(user, hinted)
        return
      }

      // bare skill → use viewer's own team (auto-joins underdog if none)
      if (skillAmount) {
        let side = this.viewerSides[user]
        if (!side) {
          this._assignSide(user, this._underdogSide())
          side = this.viewerSides[user]
        }
        if (this._cooldownOk(this._skillCooldown, user, SKILL_COOLDOWN_MS)) {
          this.addScore(side, skillAmount)
        }
      }
    },
    handleViewerGift(user, count, giftName, diamondCount) {
      if (!user) return
      this._pushRecent({
        kind: 'gift',
        user,
        text: `${giftName || 'gift'} ×${count}${diamondCount ? ` (${diamondCount}💎)` : ''}`,
      })

      // Each gift maps to a specific fighter. Unknown gifts: log only.
      const targetCatId = detectGiftCatId(giftName)
      if (!targetCatId) return

      let targetSide = null
      if (this.a.cat.id === targetCatId) targetSide = 'a'
      else if (this.b.cat.id === targetCatId) targetSide = 'b'
      // Fighter for this gift isn't currently in the ring → ignore.
      if (!targetSide) return

      const previousSide = this.viewerSides[user]
      const wasAlreadyOnTeam = previousSide === targetSide
      if (!wasAlreadyOnTeam) {
        // first time on this team (or switching) → join that fighter's side
        this._assignSide(user, targetSide)
      }
      // queue the picker so we can show their turn-to-fight position
      const turn = this._enqueueOnSide(user, targetSide)
      const queueSize = (targetSide === 'a' ? this.pickQueueA : this.pickQueueB).length

      // record the pick announcement for the upcoming-fight banner
      const targetCat = this.roster.find((c) => c.id === targetCatId)
      const pick = {
        key: Date.now(),
        ts: Date.now(),
        user,
        side: targetSide,
        catId: targetCatId,
        catName: targetCat?.name || targetCatId,
        giftIcon: targetCat?.gift?.icon || '🎁',
        giftName: targetCat?.gift?.name || giftName,
        turn,
        queueSize,
      }
      this.latestPick = pick
      this._recordPurchase(pick)
      // Fire the ultimate when:
      //  - the viewer was already on this team (single gift = ultimate), OR
      //  - this is a combo gift (count >= 2) — they spent enough to do both.
      const shouldFireUltimate = wasAlreadyOnTeam || (count || 1) >= 2
      if (
        shouldFireUltimate &&
        this._cooldownOk(this._ultimateCooldown, user, ULTIMATE_COOLDOWN_MS)
      ) {
        this.triggerUltimate(targetSide)
      }
    },
    _assignSide(user, side) {
      if (!user || !side) return
      const previous = this.viewerSides[user]
      if (previous === side) return
      if (previous) {
        this.live.fanCount[previous] = Math.max(0, this.live.fanCount[previous] - 1)
        // also remove them from the previous side's pick queue
        const prevKey = previous === 'a' ? 'pickQueueA' : 'pickQueueB'
        this[prevKey] = this[prevKey].filter((u) => u !== user)
      }
      this.viewerSides[user] = side
      this.live.fanCount[side] = (this.live.fanCount[side] || 0) + 1
      const name = side === 'a' ? this.a.cat.name : this.b.cat.name
      this._pushRecent({ kind: 'pick', user, text: `joined team ${name}` })
    },
    _enqueueOnSide(user, side) {
      if (!user || (side !== 'a' && side !== 'b')) return 0
      const key = side === 'a' ? 'pickQueueA' : 'pickQueueB'
      if (!this[key].includes(user)) this[key].push(user)
      return this[key].indexOf(user) + 1
    },
    _clearSideQueue(side) {
      if (side === 'a') this.pickQueueA = []
      else if (side === 'b') this.pickQueueB = []
    },
    _underdogSide() {
      return this.live.fanCount.a <= this.live.fanCount.b ? 'a' : 'b'
    },
    _cooldownOk(map, user, ms) {
      const now = Date.now()
      const last = map[user] || 0
      if (now - last < ms) return false
      map[user] = now
      return true
    },
    _resetFanship() {
      this.viewerSides = {}
      this.live.fanCount = { a: 0, b: 0 }
      this._skillCooldown = {}
      this._ultimateCooldown = {}
      this.pickQueueA = []
      this.pickQueueB = []
    },
    _resetSideFanship(side) {
      if (side !== 'a' && side !== 'b') return
      // drop viewers that were on this (replaced) side
      for (const user of Object.keys(this.viewerSides)) {
        if (this.viewerSides[user] === side) delete this.viewerSides[user]
      }
      this.live.fanCount[side] = 0
      if (side === 'a') this.pickQueueA = []
      else this.pickQueueB = []
    },
    _pushRecent(entry) {
      this.live.recent.unshift({ key: Date.now() + Math.random(), ...entry })
      if (this.live.recent.length > MAX_RECENT_EVENTS) {
        this.live.recent.length = MAX_RECENT_EVENTS
      }
    },
  },
})
