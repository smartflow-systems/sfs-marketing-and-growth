import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
