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

const BLOG_COVER_WIDTH = 800;
const BLOG_COVER_HEIGHT = 450;

const BLOG_COVERS = [
  {
    file: "home-apartment.webp",
    gradient: ["#071510", "#0f3d2a", "#1a5c40"],
    accent: "#00d48d",
    title: "Home &amp; Apartment",
    subtitle: "Train without a commercial gym",
  },
  {
    file: "equipment.webp",
    gradient: ["#0a1628", "#142d4a", "#1e4468"],
    accent: "#5eb8ff",
    title: "Home Equipment",
    subtitle: "Bands, dumbbells &amp; chairs",
  },
  {
    file: "pain-relief.webp",
    gradient: ["#1a1208", "#3d2a14", "#5c3f1a"],
    accent: "#ffb347",
    title: "Pain &amp; Mobility",
    subtitle: "Gentle relief at home",
  },
  {
    file: "lifestyle.webp",
    gradient: ["#12081a", "#2a1440", "#3f1f5c"],
    accent: "#c9a0ff",
    title: "Lifestyle",
    subtitle: "Beginners, seniors &amp; WFH",
  },
  {
    file: "states.webp",
    gradient: ["#081018", "#142838", "#1e3a52"],
    accent: "#7dd3fc",
    title: "All 50 States",
    subtitle: "Home workouts nationwide",
  },
];

function blogCoverSvg({ gradient, accent, title, subtitle }) {
  const [c1, c2, c3] = gradient;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${BLOG_COVER_WIDTH}" height="${BLOG_COVER_HEIGHT}" viewBox="0 0 ${BLOG_COVER_WIDTH} ${BLOG_COVER_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="50%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${BLOG_COVER_WIDTH}" height="${BLOG_COVER_HEIGHT}" fill="url(#bg)"/>
  <rect width="${BLOG_COVER_WIDTH}" height="${BLOG_COVER_HEIGHT}" fill="url(#glow)"/>
  <circle cx="120" cy="${BLOG_COVER_HEIGHT - 80}" r="140" fill="${accent}" fill-opacity="0.08"/>
  <circle cx="${BLOG_COVER_WIDTH - 60}" cy="${BLOG_COVER_HEIGHT - 40}" r="100" fill="${accent}" fill-opacity="0.12"/>
  <text x="40" y="180" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800">${title}</text>
  <text x="40" y="230" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600">${subtitle}</text>
  <text x="40" y="${BLOG_COVER_HEIGHT - 36}" fill="#ffffff" fill-opacity="0.55" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600">gomove.fit guides</text>
</svg>`;
}

async function rasterizeBlogCovers() {
  const coversDir = path.join(publicDir, "blog", "covers");
  fs.mkdirSync(coversDir, { recursive: true });

  for (const cover of BLOG_COVERS) {
    const svg = blogCoverSvg(cover);
    await sharp(Buffer.from(svg))
      .webp({ quality: 88, effort: 4 })
      .toFile(path.join(coversDir, cover.file));
  }
}

await rasterizeOgImage();
await rasterizeLogoPng();
await rasterizeBlogCovers();

console.log("Generated brand images: og-image.png, logotipo.png, blog covers (webp)");
