import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    {
      name: "trailing-slash-redirect",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/german-vocab") {
            res.writeHead(301, { Location: "/german-vocab/" });
            res.end();
            return;
          }
          next();
        });
      },
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "German Vocab",
        short_name: "German Vocab",
        description: "Learn German vocabulary A1–B2",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/german-vocab/",
        scope: "/german-vocab/",
        icons: [
          { src: "/german-vocab/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/german-vocab/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/translate\.google\.com\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  base: "/german-vocab/",
});
