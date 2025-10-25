import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    // DISABLE caching during development
    watch: {
      usePolling: true // Force polling for file changes
    }
  },
  // Force Vite to invalidate cache
  optimizeDeps: {
    force: true // Force re-optimization on every start
  },
  // Disable build cache
  build: {
    sourcemap: true
  }
});