import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import generatePublicFilePlugin from "./vite-plugins/generate-public-file";
import Handlebars from "handlebars";
import { promises as fs } from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    generatePublicFilePlugin({
      generateFileContent: async () => {
        const entries = await fs.readdir(
          path.join(process.cwd(), "./public/templates")
        );
        const examples = await Promise.all(
          entries.map(async (file) => {
            const code = await fs.readFile(
              path.join(process.cwd(), "./public/templates", file),
              "utf8"
            );
            return { file, code };
          })
        );
        const template = await fs.readFile(
          path.join(process.cwd(), "./handlebars/llms-full.txt"),
          "utf8"
        );
        const compiledTemplate = Handlebars.compile(template);
        const result = compiledTemplate({ examples });
        return result;
      },
      filename: "llms-full.txt",
    }),
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        play: resolve(__dirname, "play/index.html"),
        iframe: resolve(__dirname, "iframe/index.html"),
      },
    },
  },
  server: {
    port: 3000,
    hmr: false,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/docs": {
        target: "http://localhost:5173",
        changeOrigin: true,
      },
    },
  },
});
