import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    // @vitejs/plugin-react v6 では babel オプションが廃止され
    // rolldown-vite のネイティブtransformに統合された。
    // react-compiler は別途プラグインで組み込む想定。
    react(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@shared": path.resolve(__dirname, "../server/src/shared"),
    },
  },
  server: {
    port: 3030,
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".loca.lt", ".trycloudflare.com"],
  },
});
