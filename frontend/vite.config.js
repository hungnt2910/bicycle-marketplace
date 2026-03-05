import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 4200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://bicycle-marketplace.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
