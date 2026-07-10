import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    // Traefik forwards *.localhost storefront hosts to this dev server; Vite's host
    // check would otherwise reject them. Allow the whole localhost suffix.
    allowedHosts: [".localhost"],
    watch: {
      // Reliable file-change detection when the source is bind-mounted into Docker.
      usePolling: true,
    },
  },
})
