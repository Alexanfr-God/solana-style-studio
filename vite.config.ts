
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
    nodePolyfills({
      include: ['buffer', 'process'],
      globals: { Buffer: true, process: true },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    conditions: ['browser', 'module', 'import'],
    // Force single React version resolution
    dedupe: ["react", "react-dom", "use-sync-external-store"]
  },
  optimizeDeps: {
    exclude: [
      "@radix-ui/react-switch",
      'node-fetch',
      '@irys/sdk',
      'arbundles',
      '@toruslabs/eccrypto',
      'usb',
      '@trezor/transport',
    ],
    include: [
      'react',
      'react-dom',
      'zustand',
      'use-sync-external-store',
      '@tanstack/react-query',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/web3.js',
      'buffer',
      'process',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
    // Force Vite to pre-bundle these packages
    force: true
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
    'process.env': '{}',
    // Set NODE_ENV properly for dev
    ...(mode === 'development' ? { "process.env.NODE_ENV": JSON.stringify("development") } : {})
  }
}));
