/**
 * Genera los iconos PWA a partir del logo del proyecto.
 * - icon-192.png      → install prompt Android, splash
 * - icon-512.png      → splash standalone, manifest principal
 * - icon-maskable-512 → respeta safe-zone (80%) para iconos adaptativos
 * - apple-touch-icon  → iOS Home Screen (180x180 con fondo)
 * - favicon-32.png    → favicon estándar
 *
 * Reejecutable: `node scripts/generate-pwa-icons.mjs`
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = resolve(ROOT, "public/gorila-logotipo 2.jpeg");
const OUT = resolve(ROOT, "public/icons");

const BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function generate() {
  await mkdir(OUT, { recursive: true });

  // any-icon: logo sobre cuadrado negro con padding cómodo
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.78);
    const logo = await sharp(SOURCE)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(resolve(OUT, `icon-${size}.png`));
  }

  // maskable 512: safe-zone del 80% (logo más pequeño, fondo dorado tenue)
  {
    const size = 512;
    const inner = Math.round(size * 0.62);
    const logo = await sharp(SOURCE)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(resolve(OUT, `icon-maskable-512.png`));
  }

  // Apple touch icon 180x180
  {
    const size = 180;
    const inner = Math.round(size * 0.82);
    const logo = await sharp(SOURCE)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(resolve(ROOT, "public/apple-touch-icon.png"));
  }

  // Favicon 32 + 64 PNG (Next 16 sirve favicon.ico desde app/ si existe)
  for (const size of [32, 64]) {
    const inner = Math.round(size * 0.86);
    const logo = await sharp(SOURCE)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(resolve(OUT, `favicon-${size}.png`));
  }

  console.log("[pwa-icons] generated in", OUT);
}

generate().catch((err) => {
  console.error("[pwa-icons] failed:", err);
  process.exit(1);
});
