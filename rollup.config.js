import dts from "rollup-plugin-dts";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = [
  {
    input: ["./types/index.d.ts", "./types/lib/export-video.d.ts"],
    output: [
      {
        dir: resolve(__dirname, "rollup"),
        format: "es",
      },
    ],
    plugins: [dts()],
  },
];

export default config;