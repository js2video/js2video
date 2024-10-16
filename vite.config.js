import { defineConfig } from "vite";
import { resolve } from "path";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  plugins: [externalizeDeps()],
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.js"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
  },
});
