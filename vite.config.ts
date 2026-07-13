import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { getAllLandingSlugs } from "./src/lib/seo/landing-pages";
import { PUBLIC_ROUTES, SITE_URL } from "./src/lib/seo/site";

function sitemapPlugin() {
  return {
    name: "gomove-sitemap",
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const staticPaths = [...PUBLIC_ROUTES];
      const guidePaths = getAllLandingSlugs().map((slug) => `/guides/${slug}`);
      const allPaths = [...new Set([...staticPaths, ...guidePaths])];

      const urls = allPaths
        .map((route) => {
          const priority =
            route === "/"
              ? "1.0"
              : route === "/guides"
                ? "0.9"
                : route.startsWith("/guides/")
                  ? "0.8"
                  : "0.7";
          const changefreq =
            route === "/" || route === "/guides" ? "weekly" : route.startsWith("/guides/") ? "monthly" : "weekly";

          return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        })
        .join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

      writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), sitemap);

      const crawlLinks = allPaths
        .map((route) => `        <li><a href="${route}">${route}</a></li>`)
        .join("\n");

      const seoIndex = `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <title>GoMove Site Index — Home Workout Guides</title>
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${SITE_URL}/guides" />
  </head>
  <body>
    <h1>GoMove — Home workout guides and exercise plans</h1>
    <p>Free home workouts for Americans. Exercise without a gym.</p>
    <ul>
${crawlLinks}
    </ul>
  </body>
</html>
`;

      writeFileSync(path.resolve(__dirname, "dist/seo-index.html"), seoIndex);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), sitemapPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
