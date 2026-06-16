import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const FG_SCALE = 0.6;
const BG = { r: 11, g: 13, b: 23 };

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

async function main() {
  const src = path.resolve('icon/icon.png');
  const resDir = path.resolve('android/app/src/main/res');
  const srcBuf = fs.readFileSync(src);
  const anydpi = path.join(resDir, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpi, { recursive: true });

  const fgColor = hexToRgb('#ffffff');

  for (const [density, px] of Object.entries(SIZES)) {
    const mipmap = path.join(resDir, `mipmap-${density}`);
    fs.mkdirSync(mipmap, { recursive: true });

    const fgPx = Math.round(px * FG_SCALE);
    const pad = Math.round((px - fgPx) / 2);

    // Foreground: resize icon and center on transparent canvas
    const fgResized = await sharp(srcBuf).resize(fgPx, fgPx, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    const fgCanvas = await sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: fgResized, top: pad, left: pad }])
      .png().toBuffer();
    fs.writeFileSync(path.join(mipmap, 'ic_launcher_foreground.png'), fgCanvas);

    // Background: solid brand color
    const bgCanvas = await sharp({ create: { width: px, height: px, channels: 4, background: BG } }).png().toBuffer();
    fs.writeFileSync(path.join(mipmap, 'ic_launcher_background.png'), bgCanvas);

    // Legacy combined
    const combined = await sharp(bgCanvas).composite([{ input: fgCanvas, top: 0, left: 0 }]).png().toBuffer();
    fs.writeFileSync(path.join(mipmap, 'ic_launcher.png'), combined);
    fs.writeFileSync(path.join(mipmap, 'ic_launcher_round.png'), combined);
  }

  // Adaptive XML
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@mipmap/ic_launcher_background"/>
  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
  fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), xml);
  fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), xml);

  console.log('Icons generated successfully');
}

main().catch(e => { console.error(e); process.exit(1); });
