import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Modern browsers only (es2022): smaller output, no legacy transforms.
    target: 'es2022',
    rollupOptions: {
      output: {
        // Split heavy deps into stable vendor chunks so content updates
        // only re-download the small app chunk (cache-friendly on mobile).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('gsap') || id.includes('lenis')) return 'vendor-motion';
          return 'vendor-misc';
        },
      },
    },
  },
  server: {
    // 允许通过 Tailscale Serve 远程访问（zennode.tail25e81f.ts.net）
    allowedHosts: ['zennode.tail25e81f.ts.net'],
  },
});
