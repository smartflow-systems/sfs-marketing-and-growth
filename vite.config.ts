import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react({
      // Optimize React rendering
      babel: {
        plugins: [
          // Remove React DevTools in production
          ['transform-react-remove-prop-types', { removeImport: true }],
        ],
      },
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Performance hints
  build: {
    reportCompressedSize: true,
  },
  // OPTIMIZED: Build configuration for better performance
  build: {
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console calls
      },
      mangle: true,
    },
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Payment processing chunk (only loaded when needed)
          'vendor-payments': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          // Heavy tool dependencies (lazy loaded)
          'vendor-tools': ['qrcode', 'papaparse'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Date utilities
          'vendor-date': ['date-fns'],
        },
      },
    },
    // CSS optimization
    cssMinify: 'esbuild',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    // Sourcemaps for production debugging (optional, can be disabled)
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['html2canvas'], // Don't pre-bundle heavy deps that are lazy loaded
    esbuildOptions: {
      // Optimize esbuild for production
      target: 'es2020',
      supported: {
        'top-level-await': true,
      },
    },
  },
  // Preload optimization
  experimental: {
    renderBuiltUrl(filename: string) {
      // Optimize asset loading with CDN if needed
      return { relative: true };
    },
  },
  server: {
    host: '0.0.0.0', // Required for Replit
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 443, // Required for Replit
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/webhook': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
})
