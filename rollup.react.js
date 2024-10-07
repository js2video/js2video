import dts from "rollup-plugin-dts";

export default {
  input: "./types/react/index.react.d.ts",
  output: {
    file: "./dist/index.react.d.ts",
    format: "es",
  },
  plugins: [dts()],
};
