// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ffmpeg": {
        target: "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ffmpeg/, ""),
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@ffmpeg/core-mt"],
  },
  worker: {
    format: "es",
  },
});
