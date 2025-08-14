
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
    },
    // Remove React aliases, only use dedupe
    dedupe: ["react", "react-dom"]
  },
  build: {
    sourcemap: true,
    minify: mode === 'production',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: []
    }
  },
  define: {
    // Add this to make Buffer available globally
    global: 'globalThis',
    // Set NODE_ENV properly for dev
    ...(mode === 'development' ? { "process.env.NODE_ENV": JSON.stringify("development") } : {})
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
  }
}));
