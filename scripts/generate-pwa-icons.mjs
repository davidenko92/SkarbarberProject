/**
 * Genera los iconos PWA a partir del logotipo del gorila.
 * - icon-192.png      → install prompt Android, splash
 * - icon-512.png      → splash standalone, manifest principal
 * - icon-maskable-512 → respeta safe-zone (75%) para iconos adaptativos
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

// Recorta el contorno negro del logotipo para maximizar el área del gorila.
async function loadTrimmedLogo() {
  return sharp(SOURCE)
    .trim({ background: "#000000", threshold: 24 })
    .toBuffer();
}

async function generate() {
  await mkdir(OUT, { recursive: true });
  const trimmed = await loadTrimmedLogo();

  async function placeLogo({ size, ratio, outPath }) {
    const inner = Math.round(size * ratio);
    const logo = await sharp(trimmed)
      .resize(inner, inner, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(outPath);
  }

  // any-icon: gorila ocupando casi todo el lienzo (fondo negro corporativo)
  for (const size of [192, 512]) {
    await placeLogo({
      size,
      ratio: 0.94,
      outPath: resolve(OUT, `icon-${size}.png`),
    });
  }

  // maskable 512: safe-zone (Android recorta hasta 20% por borde)
  await placeLogo({
    size: 512,
    ratio: 0.74,
    outPath: resolve(OUT, "icon-maskable-512.png"),
  });

  // Apple touch icon 180x180
  await placeLogo({
    size: 180,
    ratio: 0.94,
    outPath: resolve(ROOT, "public/apple-touch-icon.png"),
  });

  // Favicon 32 + 64
  for (const size of [32, 64]) {
    await placeLogo({
      size,
      ratio: 0.96,
      outPath: resolve(OUT, `favicon-${size}.png`),
    });
  }

  console.log("[pwa-icons] generated in", OUT);
}

generate().catch((err) => {
  console.error("[pwa-icons] failed:", err);
  process.exit(1);
});
