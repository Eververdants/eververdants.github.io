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
npm run dev        # 开发服务器（/ 主站、/blog 博客、/projects 作品索引）
npm run sync       # 拉取 GitHub 公开仓库数据 → src/projects/data/repos.json
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 子站

站点内含三个独立 SPA 入口（同一 dist/ 一次部署）：

| 入口      | 路径         | 技术栈               | 数据源                                |
| --------- | ------------ | -------------------- | ------------------------------------- |
| 主站      | `/`          | React + GSAP         | `src/data/`                           |
| 博客      | `/blog/`     | React                | `src/blog/posts/`（frontmatter）      |
| 作品索引  | `/projects/` | 纯 TS（零运行时依赖） | `src/projects/data/repos.json`（gh）   |

作品索引的数据由 `scripts/fetch-repos.mjs` 用 `gh repo list --json` 拉取，合并
`scripts/curation.json`（精选/配图/标签/文案覆盖）后写入 `src/projects/data/repos.json`
（提交进仓库，CI 无需 gh 认证）。`.github/workflows/refresh-repos.yml` 每周一自动重新
拉取并提交 —— 新仓库会自动出现在 /projects/ 台账中。

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 时自动构建并部署到 GitHub Pages：

```bash
git push origin main
```

## License

本仓库为多许可证，不同内容类型适用不同许可：

| 内容                     | 位置                                      | 许可                                     |
| ------------------------ | ----------------------------------------- | ---------------------------------------- |
| 代码（组件、效果、工具） | `src/`                                    | [MIT](LICENSE)                           |
| 摄影作品                 | `public/assets/`（SELECTED WORKS 屏）     | [All Rights Reserved](LICENSE-PHOTOS.md) |
| 博客文章                 | `src/data/journal.ts`（SELECTED BLOG 屏） | [CC BY-NC-SA 4.0](LICENSE-BLOG.md)       |
