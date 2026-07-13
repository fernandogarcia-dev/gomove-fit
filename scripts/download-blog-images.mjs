/**
 * Downloads Unsplash fitness photos (free license) as WebP blog covers.
 * Run: node scripts/download-blog-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.resolve(rootDir, "public/blog/posts");
const coversDir = path.resolve(rootDir, "public/blog/covers");

const WIDTH = 800;
const HEIGHT = 450;

/** Curated Unsplash photo IDs — free license, fitness / home workout themed */
const PHOTOS = {
  homeLiving: "photo-1571019614242-c5c5dee9f50b",
  bodyweight: "photo-1518611012118-696072aa579a",
  gymWeights: "photo-1534438327276-14e5300c3a56",
  apartmentGym: "photo-1534438327276-14e5300c3a56",
  yogaMat: "photo-1544367567-0f2fcb009e0b",
  noEquipment: "photo-1599058945522-28d584b6f0d2",
  gymInterior: "photo-1517836357053-4c1e0c4ab1a0",
  resistanceBand: "photo-1598289431512-b763b3f725e8",
  dumbbells: "photo-1583454110551-21f2f2ee61bd",
  chairWorkout: "photo-1571019613454-1cb2f99b2d8b",
  beginner: "photo-1576678927484-cc907957088c",
  senior: "photo-1571019613454-1cb2f99b2d8b",
  wfh: "photo-1594737625785-d458fba359bb",
  stretching: "photo-1506126613408-eca07ce68773",
  mobility: "photo-1506126613408-eca07ce68773",
  backPain: "photo-1544367567-0f2fcb009e0b",
  neckPain: "photo-1544367567-0f2fcb009e0b",
  outdoorGym: "photo-1576678927484-cc907957088c",
  usaFitness: "photo-1518611012118-696072aa579a",
  running: "photo-1476480862128-209bfaa8dba2",
  calisthenics: "photo-1517836357053-4c1e0c4ab1a0",
  pilates: "photo-1571019614242-c5c5dee9f50b",
  smallSpace: "photo-1544367567-0f2fcb009e0b",
  condo: "photo-1534438327276-14e5300c3a56",
  skyline: "photo-1449824913935-59a10b8d2000",
};

const FALLBACK = PHOTOS.homeLiving;

const unsplashUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${WIDTH}&h=${HEIGHT}&q=80`;

const SLUG_PHOTO = {
  "home-workouts": PHOTOS.homeLiving,
  "workout-at-home-no-gym": PHOTOS.bodyweight,
  "apartment-gym-workout": PHOTOS.apartmentGym,
  "condo-gym-exercises": PHOTOS.condo,
  "no-equipment-workout": PHOTOS.noEquipment,
  "workout-without-gym-membership": PHOTOS.gymInterior,
  "small-space-workout": PHOTOS.smallSpace,
  "resistance-band-workout-at-home": PHOTOS.resistanceBand,
  "dumbbell-workout-at-home": PHOTOS.dumbbells,
  "chair-exercises-at-home": PHOTOS.chairWorkout,
  "beginner-home-workout": PHOTOS.beginner,
  "senior-exercises-at-home": PHOTOS.senior,
  "work-from-home-exercises": PHOTOS.wfh,
  "stretching-at-home": PHOTOS.stretching,
  "mobility-exercises-at-home": PHOTOS.mobility,
};

const CATEGORY_POOL = {
  "home-apartment": [PHOTOS.homeLiving, PHOTOS.bodyweight, PHOTOS.yogaMat, PHOTOS.noEquipment, PHOTOS.smallSpace],
  equipment: [PHOTOS.resistanceBand, PHOTOS.dumbbells, PHOTOS.chairWorkout, PHOTOS.gymWeights],
  "pain-relief": [PHOTOS.stretching, PHOTOS.mobility, PHOTOS.backPain, PHOTOS.neckPain, PHOTOS.pilates],
  lifestyle: [PHOTOS.beginner, PHOTOS.senior, PHOTOS.wfh, PHOTOS.stretching, PHOTOS.running],
  states: [PHOTOS.usaFitness, PHOTOS.skyline, PHOTOS.outdoorGym, PHOTOS.calisthenics, PHOTOS.running],
};

const CATEGORY_COVER = {
  "home-apartment": PHOTOS.homeLiving,
  equipment: PHOTOS.dumbbells,
  "pain-relief": PHOTOS.stretching,
  lifestyle: PHOTOS.beginner,
  states: PHOTOS.skyline,
};

const SLUG_CATEGORY = new Map();

const GUIDE_CATEGORIES = [
  {
    id: "home-apartment",
    slugs: [
      "home-workouts",
      "workout-at-home-no-gym",
      "apartment-gym-workout",
      "condo-gym-exercises",
      "no-equipment-workout",
      "workout-without-gym-membership",
      "small-space-workout",
    ],
  },
  {
    id: "equipment",
    slugs: [
      "resistance-band-workout-at-home",
      "dumbbell-workout-at-home",
      "chair-exercises-at-home",
    ],
  },
  {
    id: "pain-relief",
    slugs: [
      "neck-pain-exercises-at-home",
      "shoulders-pain-exercises-at-home",
      "upper-back-pain-exercises-at-home",
      "lower-back-pain-exercises-at-home",
      "chest-pain-exercises-at-home",
      "elbows-pain-exercises-at-home",
      "wrists-hands-pain-exercises-at-home",
      "core-pain-exercises-at-home",
      "hips-pain-exercises-at-home",
      "glutes-pain-exercises-at-home",
      "thighs-pain-exercises-at-home",
      "knees-pain-exercises-at-home",
      "calves-pain-exercises-at-home",
      "ankles-feet-pain-exercises-at-home",
    ],
  },
  {
    id: "lifestyle",
    slugs: [
      "beginner-home-workout",
      "senior-exercises-at-home",
      "work-from-home-exercises",
      "stretching-at-home",
      "mobility-exercises-at-home",
    ],
  },
  {
    id: "states",
    slugs: [], // filled below
  },
];

const US_STATE_SLUGS = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut",
  "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan",
  "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new-hampshire",
  "new-jersey", "new-mexico", "new-york", "north-carolina", "north-dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode-island", "south-carolina", "south-dakota",
  "tennessee", "texas", "utah", "vermont", "virginia", "washington", "west-virginia",
  "wisconsin", "wyoming", "district-of-columbia",
].map((s) => `home-workout-${s}`);

GUIDE_CATEGORIES[4].slugs = US_STATE_SLUGS;

for (const category of GUIDE_CATEGORIES) {
  for (const slug of category.slugs) {
    SLUG_CATEGORY.set(slug, category.id);
  }
}

function hashSlug(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function photoForSlug(slug) {
  if (SLUG_PHOTO[slug]) return SLUG_PHOTO[slug];
  const category = SLUG_CATEGORY.get(slug) ?? "home-apartment";
  const pool = CATEGORY_POOL[category];
  return pool[hashSlug(slug) % pool.length];
}

async function downloadWebp(photoId, outputPath) {
  let response = await fetch(unsplashUrl(photoId));
  if (!response.ok && photoId !== FALLBACK) {
    response = await fetch(unsplashUrl(FALLBACK));
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch ${photoId}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath);
}

fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(coversDir, { recursive: true });

const allSlugs = [...SLUG_CATEGORY.keys()];
const downloadedPhotos = new Set();

for (const slug of allSlugs) {
  const photoId = photoForSlug(slug);
  const outputPath = path.join(postsDir, `${slug}.webp`);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 2_000) {
    process.stdout.write("s");
    continue;
  }
  await downloadWebp(photoId, outputPath);
  downloadedPhotos.add(photoId);
  process.stdout.write(".");
}

for (const [categoryId, photoId] of Object.entries(CATEGORY_COVER)) {
  const coverPath = path.join(coversDir, `${categoryId}.webp`);
  if (fs.existsSync(coverPath) && fs.statSync(coverPath).size > 2_000) continue;
  await downloadWebp(photoId, coverPath);
}

console.log(`\nDownloaded ${allSlugs.length} post covers + ${Object.keys(CATEGORY_COVER).length} category covers.`);
