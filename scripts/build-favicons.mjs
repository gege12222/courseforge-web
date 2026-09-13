/**
 * Generate favicons and the PWA/apple-touch icons from the app icon master.
 *
 *   npm run favicons
 *
 * Source of truth is the 1024×1024 iOS app icon copied out of the Flutter app
 * (src/assets/brand/courseforge-icon-1024.png) — the highest-resolution master
 * that exists. Outputs are committed to public/ so Cloudflare never runs this.
 *
 * favicon.svg is written by hand rather than traced, because the mark is
 * genuinely vector (see courseforge-mark.svg) and a 500-byte SVG beats a PNG.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const master = join(root, 'src/assets/brand/courseforge-icon-1024.png');
const out = join(root, 'public');

// Hex lives here only because a favicon is a standalone file that cannot read
// tokens.css. These two values must stay in sync with --cf-navy and --cf-gold.
const NAVY = '#1B2A4A';
const GOLD = '#C9A227';
const CREAM = '#F2EFE8';

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${NAVY}"/>
  <path d="M18 50 V33 A14 14 0 0 1 46 33 V50" stroke="${CREAM}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M26 40 H38 M26 48 H38" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
</svg>
`;

const targets = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
];

await mkdir(out, { recursive: true });
await writeFile(join(out, 'favicon.svg'), faviconSvg);
console.log('public/favicon.svg');

for (const { name, size } of targets) {
  await sharp(master).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(join(out, name));
  console.log(`public/${name}  ${size}×${size}`);
}

// ICO for legacy: a single 32×32 frame is enough alongside favicon.svg.
const png32 = await sharp(master).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // size
header.writeUInt32LE(22, 18); // offset
await writeFile(join(out, 'favicon.ico'), Buffer.concat([header, png32]));
console.log('public/favicon.ico  32×32');
