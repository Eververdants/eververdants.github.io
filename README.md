# eververdants.github.io

Eververdants 的个人网站。

## 技术栈

- [React](https://react.dev) — 组件化 UI
- [Vite](https://vite.dev) — 构建工具
- [Tailwind CSS v4](https://tailwindcss.com) — 原子化样式
- [Lenis](https://github.com/darkroomengineering/lenis) — 平滑滚动
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

本仓库为多许可证，不同内容类型适用不同许可：

| 内容 | 位置 | 许可 |
|------|------|------|
| 代码（组件、效果、工具） | `src/` | [MIT](LICENSE) |
| 摄影作品 | `public/assets/`（SELECTED WORKS 屏） | [All Rights Reserved](LICENSE-PHOTOS.md) |
| 博客文章 | `src/data/journal.ts`（SELECTED BLOG 屏） | [CC BY-NC-SA 4.0](LICENSE-BLOG.md) |
