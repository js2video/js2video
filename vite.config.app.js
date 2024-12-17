import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        play: resolve(__dirname, "play/index.html"),
      },
    },
  },
  server: {
    port: 3000,
    hmr: false,
    proxy: {
      "/cdn": {
        target: "https://s3.eu-central-1.wasabisys.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, "/js2video-public-cdn"),
      },
    },
  },
});
