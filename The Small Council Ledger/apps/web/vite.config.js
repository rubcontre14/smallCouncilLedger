import { defineConfig } from 'vite';
import marko from '@marko/run/vite';

export default defineConfig({
  plugins: [marko()],
  server: {
    port: 8080,
    strictPort: false,
  },
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
  },
});
