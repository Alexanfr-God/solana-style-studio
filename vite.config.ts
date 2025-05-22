
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Improve HMR performance
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Add this to make Buffer available globally
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@solana/wallet-adapter-wallets',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/web3.js',
      'buffer',
    ],
    // Skip optional dependencies to speed up installation
    exclude: ['fsevents'],
    // Speed up dependency pre-bundling
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Reduce build bloat
      minify: true,
      // Skip source maps in development to speed up builds
      sourcemap: false,
    }
  },
  build: {
    // Improve build performance
    target: 'esnext',
    // Disable source maps in production to reduce build time
    sourcemap: false,
    // Minify output for production
    minify: 'esbuild',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Chunk size warnings configuration
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Improve code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'wallet-vendor': ['@solana/wallet-adapter-react', '@solana/web3.js']
        }
      }
    }
  },
  // Disable dependency optimization in certain cases to prevent timeouts
  cacheDir: '.vite_cache'
}));
