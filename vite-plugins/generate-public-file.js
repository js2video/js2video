export default function generatePublicFilePlugin(options = {}) {
  const {
    generateFileContent = async () => "content",
    filename = "filename.txt",
  } = options;

  async function generatePublicFile(dir) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const content = await generateFileContent();
    const outPath = path.join(dir, filename);
    await fs.writeFile(outPath, content, "utf-8");
    console.log(
      `✅ [vite-plugin-generate-llms] Wrote ${filename} to ${outPath}`
    );
  }

  return {
    name: "vite-plugin-generate-llms-txt",
    async configureServer() {
      const path = await import("path");
      const publicDir = path.join(process.cwd(), "public");
      await generatePublicFile(publicDir);
    },
    async closeBundle() {
      const path = await import("path");
      const distDir = path.join(process.cwd(), "dist");
      await generatePublicFile(distDir);
    },
  };
}
