import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const logotipoPath = path.join(publicDir, "logotipo.svg");
const logomarcaPath = path.join(publicDir, "logomarca.svg");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071510"/>
      <stop offset="55%" stop-color="#0b2218"/>
      <stop offset="100%" stop-color="#123828"/>
    </linearGradient>
    <radialGradient id="glow" cx="22%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#00d48d" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#00d48d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#bg)"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glow)"/>
  <circle cx="1040" cy="120" r="180" fill="#00b87a" fill-opacity="0.08"/>
  <circle cx="980" cy="520" r="240" fill="#009b59" fill-opacity="0.10"/>
  <text x="96" y="250" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800">Home workouts</text>
  <text x="96" y="320" fill="#00d48d" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800">without a gym</text>
  <text x="96" y="390" fill="#d7f5e8" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="500">Personalized exercise plans for your home,</text>
  <text x="96" y="430" fill="#d7f5e8" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="500">apartment gym, or zero equipment.</text>
  <text x="96" y="540" fill="#9fd9bf" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">gomove.fit</text>
</svg>`;

async function rasterizeFavicons() {
  const paddedSquare = async (size, paddingRatio = 0.12) => {
    const innerWidth = Math.round(size * (1 - paddingRatio * 2));
    const logo = await sharp(logotipoPath)
      .resize(innerWidth, null, { fit: "inside" })
      .png()
      .toBuffer();
    const meta = await sharp(logo).metadata();
    const left = Math.round((size - (meta.width ?? innerWidth)) / 2);
    const top = Math.round((size - (meta.height ?? innerWidth)) / 2);

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 7, g: 21, b: 16, alpha: 1 },
      },
    })
      .composite([{ input: logo, left, top }])
      .png();
  };

  await (await paddedSquare(16)).toFile(path.join(publicDir, "favicon-16x16.png"));
  await (await paddedSquare(32)).toFile(path.join(publicDir, "favicon-32x32.png"));
  await (await paddedSquare(48)).toFile(path.join(publicDir, "favicon-48x48.png"));
  await (await paddedSquare(180, 0.1)).toFile(path.join(publicDir, "apple-touch-icon.png"));

  const favicon32 = await sharp(path.join(publicDir, "favicon-32x32.png")).toBuffer();
  await sharp(favicon32).toFile(path.join(publicDir, "favicon.ico"));
}

async function rasterizeOgImage() {
  const logo = await sharp(logotipoPath)
    .resize(520, null, { fit: "inside" })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const logoWidth = logoMeta.width ?? 520;
  const logoHeight = logoMeta.height ?? 130;
  const logoLeft = OG_WIDTH - logoWidth - 96;
  const logoTop = Math.round((OG_HEIGHT - logoHeight) / 2) + 10;

  const base = await sharp(Buffer.from(ogSvg)).png().toBuffer();

  await sharp(base)
    .composite([{ input: logo, left: logoLeft, top: logoTop }])
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(publicDir, "og-image.png"));

  fs.writeFileSync(path.join(publicDir, "og-image.svg"), ogSvg, "utf-8");
}

async function rasterizeLogoPng() {
  await sharp(logotipoPath)
    .resize(512, null, { fit: "inside" })
    .png()
    .toFile(path.join(publicDir, "logotipo.png"));
}

await rasterizeFavicons();
await rasterizeOgImage();
await rasterizeLogoPng();

const faviconSvg = await sharp(path.join(publicDir, "favicon-48x48.png"))
  .resize(512, 512)
  .toBuffer();
fs.writeFileSync(
  path.join(publicDir, "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image href="data:image/png;base64,${faviconSvg.toString("base64")}" width="512" height="512"/></svg>`,
);

console.log("Generated brand images: favicons, og-image.png, logotipo.png");
