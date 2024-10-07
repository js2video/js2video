import dts from "rollup-plugin-dts";

export default {
  input: "./types/server/index.server.d.ts",
  output: {
    file: "./dist/index.server.d.ts",
    format: "es",
  },
  plugins: [dts()],
};
