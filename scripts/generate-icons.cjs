/**
 * One-off icon generator — run manually: node scripts/generate-icons.cjs
 * Creates PNG icons using pure Node.js (no external dependencies).
 * Design: black background, blue (#007aff) rounded square.
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const OUT_DIR = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(OUT_DIR, { recursive: true })

// ── CRC32 ─────────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crcBuf])
}

// ── PNG encoder ───────────────────────────────────────────────────────────────

function createPng(size, pixelFn) {
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const raw = Buffer.allocUnsafe(size * (1 + size * 3))
  let off = 0
  for (let y = 0; y < size; y++) {
    raw[off++] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size)
      raw[off++] = r; raw[off++] = g; raw[off++] = b
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Icon pixel function ───────────────────────────────────────────────────────
// Black background, blue rounded square (80% of size), 22% corner radius.

function iconPixel(x, y, size) {
  const pad = size * 0.10
  const inner = size - 2 * pad
  const ix = x - pad
  const iy = y - pad

  if (ix < 0 || iy < 0 || ix >= inner || iy >= inner) return [0, 0, 0]

  const r = inner * 0.22
  const corners = [
    [r, r],
    [inner - r, r],
    [r, inner - r],
    [inner - r, inner - r],
  ]
  for (const [cx, cy] of corners) {
    const dx = ix - cx, dy = iy - cy
    if (Math.abs(dx) > r && Math.abs(dy) > r) continue
    if (dx < -r || dy < -r || dx > r || dy > r) continue
    if (Math.sqrt(dx * dx + dy * dy) > r) return [0, 0, 0]
  }

  return [0x00, 0x7a, 0xff]
}

// ── Generate ──────────────────────────────────────────────────────────────────

const sizes = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of sizes) {
  const out = path.join(OUT_DIR, name)
  fs.writeFileSync(out, createPng(size, iconPixel))
  console.log(`✓ ${name} (${size}×${size})`)
}
