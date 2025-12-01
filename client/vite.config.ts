import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
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
