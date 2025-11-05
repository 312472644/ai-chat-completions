import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/ai': {
        target: 'https://cts.cr11yjy.com:1026/ai/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ai/, ''),
      },
    },
  },
});
