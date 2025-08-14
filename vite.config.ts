
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
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force React to use the same instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"]
  },
  define: {
    // Add this to make Buffer available globally
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@solana/wallet-adapter-wallets',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/web3.js',
      'buffer',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Enable the node polyfills plugin
      plugins: []
    }
  }
}));
