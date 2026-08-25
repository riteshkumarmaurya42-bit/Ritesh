#!/usr/bin/env node
/**
 * Generate PWA icons (PNG) with zero dependencies.
 *
 * Outputs:
 *   assets/icons/icon-192.png         — regular app icon (rounded square)
 *   assets/icons/icon-512.png         — regular app icon (rounded square)
 *   assets/icons/maskable-512.png     — full-bleed maskable icon (safe-zone padding)
 *   assets/icons/apple-touch-icon.png — 180x180 iOS icon
 *
 * Usage: npm run icons
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'icons');

/* ---------- Minimal PNG encoder ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw scanlines, each prefixed with filter byte 0 (None)
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Drawing helpers (rgba float tuples) ---------- */

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

// Brand palette (matches css/style.css)
const BG_TOP = [10, 10, 15];      // #0a0a0f
const BG_BOTTOM = [26, 26, 42];   // #1a1a2a
const GLOW = [124, 58, 237];      // #7c3aed
const BOLT_TOP = [167, 139, 250]; // #a78bfa
const BOLT_BOTTOM = [6, 255, 165];// #06ffa5

/** Classic lightning bolt polygon in a 0..100 coordinate space. */
const BOLT = [
  [55, 5],
  [25, 55],
  [45, 55],
  [40, 95],
  [75, 40],
  [52, 40],
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Render one icon.
 * @param {number} size     pixel width/height
 * @param {object} opts
 * @param {boolean} opts.rounded  rounded-corner silhouette (false = full bleed)
 * @param {number}  opts.scale    bolt scale (1 = fills canvas; maskable uses ~0.7 for safe zone)
 */
function renderIcon(size, { rounded = true, scale = 1 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const corner = size * 0.225; // rounded-corner radius
  const cx = size / 2;
  const cy = size / 2;
  const bolt = BOLT.map(([x, y]) => [cx + (x - 50) * (size / 100) * scale, cy + (y - 50) * (size / 100) * scale]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Silhouette
      if (rounded) {
        const dx = Math.max(Math.abs(x - cx) - (cx - corner), 0);
        const dy = Math.max(Math.abs(y - cy) - (cy - corner), 0);
        if (Math.sqrt(dx * dx + dy * dy) > corner) continue; // transparent
      }

      const u = x / (size - 1);
      const v = y / (size - 1);

      // Background: vertical gradient + soft radial glow
      let [r, g, b] = mix(BG_TOP, BG_BOTTOM, v);
      const gx = u - 0.35, gy = v - 0.3;
      const dist = Math.sqrt(gx * gx + gy * gy);
      const glow = Math.max(0, 1 - dist / 0.65) ** 2 * 0.45;
      r = lerp(r, GLOW[0], glow);
      g = lerp(g, GLOW[1], glow);
      b = lerp(b, GLOW[2], glow);

      // Lightning bolt with vertical gradient
      if (pointInPolygon(x, y, bolt)) {
        const t = Math.min(1, Math.max(0, (y - bolt[0][1]) / (bolt[3][1] - bolt[0][1])));
        [r, g, b] = mix(BOLT_TOP, BOLT_BOTTOM, t);
      }

      rgba[idx] = Math.round(r);
      rgba[idx + 1] = Math.round(g);
      rgba[idx + 2] = Math.round(b);
      rgba[idx + 3] = 255;
    }
  }
  return encodePng(size, size, rgba);
}

/* ---------- Main ---------- */

const targets = [
  { file: 'icon-192.png', size: 192, opts: { rounded: true, scale: 1 } },
  { file: 'icon-512.png', size: 512, opts: { rounded: true, scale: 1 } },
  { file: 'maskable-512.png', size: 512, opts: { rounded: false, scale: 0.7 } },
  { file: 'apple-touch-icon.png', size: 180, opts: { rounded: false, scale: 0.85 } },
];

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const { file, size, opts } of targets) {
  const png = renderIcon(size, opts);
  fs.writeFileSync(path.join(OUT_DIR, file), png);
  console.log(`✓ ${path.join('assets', 'icons', file)} (${size}x${size}, ${(png.length / 1024).toFixed(1)} kB)`);
}
console.log('\nDone. Icons referenced from manifest.json and index.html.');
