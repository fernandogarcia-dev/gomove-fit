import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { getAllLandingSlugs } from "./src/lib/seo/landing-pages";
import { PUBLIC_ROUTES, SITE_URL } from "./src/lib/seo/site";

const PRERENDER_ROUTES = [
  ...PUBLIC_ROUTES,
  ...getAllLandingSlugs().map((slug) => `/guides/${slug}`),
];

function sitemapPlugin() {
  return {
    name: "gomove-sitemap",
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10);

      const urls = PRERENDER_ROUTES.map((route) => {
        const priority =
          route === "/"
            ? "1.0"
            : route === "/guides"
              ? "0.9"
              : route.startsWith("/guides/")
                ? "0.8"
                : "0.7";
        const changefreq =
          route === "/" || route === "/guides"
            ? "weekly"
            : route.startsWith("/guides/")
              ? "monthly"
              : "weekly";

        const imageBlock =
          route === "/"
            ? `
    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>GoMove — Home Workouts Without a Gym</image:title>
      <image:caption>Personalized home workout plans for Americans</image:caption>
    </image:image>`
            : "";

        return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageBlock}
  </url>`;
      }).join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

      writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), sitemap);
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
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
});
