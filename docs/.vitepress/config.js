import { defineConfig } from "vitepress";

const isDev = process.env.NODE_ENV === "development";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/docs/",
  outDir: "../dist/docs",
  title: "JS2Video Docs",
  description: "Documentation for JS2Video",
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
    ],

    sidebar: [
      {
        text: "Library / SDK",
        items: [
          { text: "About", link: "/" },
          { text: "Get started", link: "/get-started" },
          { text: "React", link: "/react" },
          { text: "Vanilla JS", link: "/vanilla-js" },
          { text: "Node.js", link: "/node" },
        ],
      },
      {
        text: "Reference",
        items: [{ text: "Typedocs", link: "https://js2video.com/typedocs" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/js2video/js2video" },
    ],
  },
});
