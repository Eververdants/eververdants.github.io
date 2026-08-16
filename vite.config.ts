import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    // 允许通过 Tailscale Serve 远程访问（zennode.tail25e81f.ts.net）
    allowedHosts: ['zennode.tail25e81f.ts.net'],
  },
});
