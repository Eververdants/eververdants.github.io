import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // GitHub Pages 部署基础路径
    base: '/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    // 环境变量定义
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },

    // 构建优化
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild', // 使用 esbuild 压缩（更快）

      // 复制 public 目录
      copyPublicDir: true,

      // 代码分割优化
      rollupOptions: {
        output: {
          manualChunks: {
            // React 核心库单独打包
            'react-vendor': ['react', 'react-dom'],
            // Lucide 图标库单独打包
            'icons': ['lucide-react'],
          },
          // 优化文件命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        }
      },

      // esbuild 压缩配置
      esbuild: {
        drop: ['console', 'debugger'], // 生产环境移除 console 和 debugger
      },

      // 分块大小警告阈值
      chunkSizeWarningLimit: 1000,
    },

    // 预览服务器配置
    preview: {
      port: 4173,
      host: '0.0.0.0',
    }
  };
});
