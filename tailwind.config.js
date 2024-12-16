import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./play/index.{jsx,html}", "./index.html", "./src/**/*.jsx"],
  theme: {
    extend: {
      fontFamily: {
        ui: ["var(--font-ui)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
