// TikTok Live → WebSocket bridge.
// Run: npm run server
// Or with a default username: TIKTOK_USERNAME=somebody npm run server
// Then in the browser, the LiveConnect panel connects to ws://localhost:8787

import http from 'node:http'
import { WebSocketServer } from 'ws'
import {
  TikTokLiveConnection,
  WebcastEvent,
  ControlEvent,
} from 'tiktok-live-connector'

const PORT = Number(process.env.PORT || 8787)
const DEFAULT_USER = process.env.TIKTOK_USERNAME || process.argv[2] || ''

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('TikTok bridge running. Connect via WebSocket.')
})

const wss = new WebSocketServer({ server })

function attachTikTok(ws, username) {
  const send = (data) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data))
  }

  const tiktok = new TikTokLiveConnection(username, {
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: true,
  })

  tiktok
    .connect()
    .then((state) => {
      const roomId = state?.roomId || tiktok.roomId
      console.log(`[tiktok] connected to @${username} (room ${roomId})`)
      send({ type: 'connected', username, roomId: String(roomId || '') })
    })
    .catch((err) => {
      console.warn(`[tiktok] connect failed for @${username}:`, err?.message || err)
      send({ type: 'error', message: String(err?.message || err) })
      try {
        ws.close()
      } catch {}
    })

  tiktok.on(WebcastEvent.CHAT, (data) => {
    send({
      type: 'comment',
      user: data?.user?.uniqueId || data?.user?.nickname || 'viewer',
      userId: String(data?.user?.userId || ''),
      text: String(data?.comment || ''),
    })
  })

  tiktok.on(WebcastEvent.GIFT, (data) => {
    // streakable gifts (giftType 1) emit during the streak; only forward the final tally
    const giftType = data?.giftDetails?.giftType ?? data?.gift?.gift_type
    const repeatEnd = data?.repeatEnd
    if (giftType === 1 && !repeatEnd) return
    send({
      type: 'gift',
      user: data?.user?.uniqueId || data?.user?.nickname || 'viewer',
      userId: String(data?.user?.userId || ''),
      giftId: data?.giftId || data?.gift?.gift_id,
      giftName: data?.giftDetails?.giftName || data?.gift?.name || 'gift',
      count: data?.repeatCount || 1,
      diamondCount: data?.giftDetails?.diamondCount || data?.gift?.diamond_count || 0,
    })
  })

  tiktok.on(WebcastEvent.STREAM_END, () => {
    send({ type: 'streamEnd' })
  })

  tiktok.on(ControlEvent.DISCONNECTED, () => {
    console.log(`[tiktok] disconnected from @${username}`)
    send({ type: 'disconnected' })
  })

  tiktok.on(ControlEvent.ERROR, (err) => {
    console.warn(`[tiktok] error on @${username}:`, err?.message || err)
    send({ type: 'error', message: String(err?.message || err) })
  })

  ws.on('close', () => {
    try {
      tiktok.disconnect()
    } catch {}
  })

  ws.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }
    if (msg.type === 'ping') send({ type: 'pong' })
  })
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost')
  const username = url.searchParams.get('username') || DEFAULT_USER

  if (!username) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message:
          'No TikTok username provided. Pass ?username=xxx on the WebSocket URL or set TIKTOK_USERNAME.',
      }),
    )
    ws.close()
    return
  }

  console.log(`[bridge] client connected, attaching to @${username}`)
  attachTikTok(ws, username)
})

server.listen(PORT, () => {
  console.log(`[bridge] WebSocket bridge listening on ws://localhost:${PORT}`)
  if (DEFAULT_USER) console.log(`[bridge] default TikTok user: @${DEFAULT_USER}`)
})
