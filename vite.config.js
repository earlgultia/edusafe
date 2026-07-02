import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    legacy({
      targets: ['Android >= 5', 'Chrome >= 49', 'Firefox >= 45', 'iOS >= 10'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
});
