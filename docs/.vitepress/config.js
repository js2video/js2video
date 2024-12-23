import { defineConfig } from "vitepress";

const isDev = process.env.NODE_ENV === "development";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/docs/",
  outDir: "../dist/docs",
  title: "JS2Video",
  description: "Documentation",
  tagline: "",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "Playground",
        link: isDev
          ? "http://localhost:3000/play/"
          : "https://js2video.com/play/",
        target: "_self",
      },
      {
        text: "Docs",
        link: "/",
      },
    ],

    sidebar: [
      {
        text: "Get started",
        items: [{ text: "What is JS2Video?", link: "/" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
