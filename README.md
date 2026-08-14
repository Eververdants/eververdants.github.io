# eververdants.github.io

Eververdants 的个人网站。

## 技术栈

- [Astro](https://astro.build) — 静态站点生成
- [Tailwind CSS v4](https://tailwindcss.com) — 原子化样式
- WebGL2 — 全屏流体动态背景（teal）
- 字体：Inter（UI）+ Fraunces（名字）

## 本地开发

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 时自动构建并部署到 GitHub Pages：

```bash
git push origin main
```

## License

[MIT](LICENSE)
