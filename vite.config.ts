import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
});
