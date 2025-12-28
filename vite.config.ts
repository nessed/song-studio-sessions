import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification
    minify: "esbuild",
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React ecosystem into separate chunk
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Split UI libraries
          "vendor-ui": ["framer-motion", "lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          // Split data/query libraries
          "vendor-data": ["@tanstack/react-query", "@supabase/supabase-js"],
        },
      },
    },
    // Increase chunk size warning limit (we're intentionally chunking)
    chunkSizeWarningLimit: 600,
    // Generate source maps for debugging (optional, can disable in prod)
    sourcemap: mode === "development",
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@tanstack/react-query",
    ],
  },
}));
