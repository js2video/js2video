import { defineConfig } from "vite";
import { resolve } from "path";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), externalizeDeps()],
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.js"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
  },
});
