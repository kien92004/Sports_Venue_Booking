import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(() => {
  const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8081';
  return {
    publicDir: 'public',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        },
        '/rest': backendUrl
      }
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        process: 'process/browser',
        buffer: 'buffer',
      },
    },
  };
});
