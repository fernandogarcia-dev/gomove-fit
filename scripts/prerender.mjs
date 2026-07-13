import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const templatePath = path.resolve(distDir, "index.html");

if (!fs.existsSync(templatePath)) {
  console.error("Missing dist/index.html. Run vite build first.");
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf-8");
const { render, PRERENDER_ROUTES } = await import(
  path.resolve(distDir, "server/entry-server.js")
);

const DEFAULT_HEAD = `<title>GoMove — Home Workouts Without a Gym</title>
    <meta name="description" content="Free personalized home workout plans for Americans. Exercise at home without a gym." />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://gomove.fit/" />`;

function routeToFile(route) {
  if (route === "/") return path.join(distDir, "index.html");
  const segments = route.replace(/^\//, "").split("/");
  return path.join(distDir, ...segments, "index.html");
}

function injectTemplate({ appHtml, headHtml }) {
  const head = headHtml.trim() ? headHtml : DEFAULT_HEAD;
  return template
    .replace("<!--ssr-head-->", head)
    .replace("<!--ssr-outlet-->", appHtml);
}

let rendered = 0;

for (const route of PRERENDER_ROUTES) {
  const { appHtml, headHtml } = render(route);
  const outputPath = routeToFile(route);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, injectTemplate({ appHtml, headHtml }));
  rendered += 1;
}

console.log(`Prerendered ${rendered} routes via SSR.`);
