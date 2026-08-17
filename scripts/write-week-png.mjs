import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
const WEEK_SIDE = "#7a808a";
const WEEK_CENTER = "#7eb4ff";
const WEEK_DOTS = [
  { x: 0.18, r: 0.048, center: false },
  { x: 0.3, r: 0.048, center: false },
  { x: 0.42, r: 0.048, center: false },
  { x: 0.5, r: 0.096, center: true },
  { x: 0.58, r: 0.048, center: false },
  { x: 0.7, r: 0.048, center: false },
  { x: 0.82, r: 0.048, center: false },
];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    rgba.copy(row, 1, y * width * 4, (y + 1) * width * 4);
    rows.push(row);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function parseHex(color) {
  const n = Number.parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawCircle(rgba, w, h, cx, cy, r, rgb) {
  const x0 = Math.max(0, Math.floor(cx - r - 1));
  const x1 = Math.min(w - 1, Math.ceil(cx + r + 1));
  const y0 = Math.max(0, Math.floor(cy - r - 1));
  const y1 = Math.min(h - 1, Math.ceil(cy + r + 1));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      let cover = r - dist + 0.5;
      if (cover <= 0) continue;
      if (cover > 1) cover = 1;
      const i = (y * w + x) * 4;
      const sa = cover;
      const da = rgba[i + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA <= 0) continue;
      for (let c = 0; c < 3; c += 1) {
        const s = rgb[c] / 255;
        const d = rgba[i + c] / 255;
        rgba[i + c] = Math.round((255 * (s * sa + d * da * (1 - sa))) / outA);
      }
      rgba[i + 3] = Math.round(255 * outA);
    }
  }
}

function weekPng(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const cy = size / 2;
  const cx = size / 2;
  for (const dot of WEEK_DOTS) {
    const x = cx + (dot.x * size - cx) * 1.08;
    const r = dot.r * size;
    drawCircle(
      rgba,
      size,
      size,
      x,
      cy,
      r,
      parseHex(dot.center ? WEEK_CENTER : WEEK_SIDE),
    );
  }
  return encodePng(size, size, rgba);
}

const root = join(import.meta.dirname, "..");
const files = [
  [join(root, "src/app/icon.png"), 64],
  [join(root, "src/app/apple-icon.png"), 180],
  [join(root, "public/held-mark.png"), 512],
];

for (const [path, size] of files) {
  await mkdir(dirname(path), { recursive: true });
  const png = weekPng(size);
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(path);
    stream.on("finish", resolve);
    stream.on("error", reject);
    stream.end(png);
  });
}

console.log("wrote", files.map(([path]) => path).join("\n"));
