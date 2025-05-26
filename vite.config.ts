import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Dynamically import PostCSS plugins
const postcssImport = import('postcss-import');
const tailwindcss = import('tailwindcss');
const autoprefixer = import('autoprefixer');

export default defineConfig(async ({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    css: {
      postcss: {
        plugins: [
          (await postcssImport).default,
          (await tailwindcss).default,
          (await autoprefixer).default,
        ],
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        stream: "stream-browserify",
        buffer: "buffer",
        process: "process/browser",
      },
    },
    define: {
      global: 'globalThis',
      'process.env': {},
      'process': {
        env: {},
        browser: true,
        version: '',
      },
    },
    optimizeDeps: {
      include: [
        '@solana/wallet-adapter-wallets',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react-ui',
        '@solana/web3.js',
        'buffer',
        'process',
        'stream-browserify',
        '@metaplex-foundation/js',
        '@coral-xyz/anchor'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis',
          'process.env': '{}',
        },
      }
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    }
  };
});