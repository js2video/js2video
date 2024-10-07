import dts from "rollup-plugin-dts";

export default {
  input: "./types/client/index.client.d.ts",
  output: {
    file: "./dist/index.client.d.ts",
    format: "es",
  },
  plugins: [dts()],
};
