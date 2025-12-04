import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // <-- use container name
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8081', // <-- use container name
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8081', // <-- use container name
        changeOrigin: true,
      }
    }
  }
});
