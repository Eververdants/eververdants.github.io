# eververdants.github.io

Eververdants（万山青未阑）的个人网站。

一个导航主站 + 四个内容子站。主站只负责指路，内容全部在子站里。

## 技术栈

- [React 19](https://react.dev) — 组件化 UI（主站 / 关于 / 博客 / 摄影）
- [Vite](https://vite.dev) — 构建工具，五个独立入口
- [Tailwind CSS v4](https://tailwindcss.com) — 仅博客与作品索引加载；主站与关于页不加载
- 无动画库：滚动、过渡全部交给浏览器原生与 CSS

## 站点结构

| 入口     | 路径         | 技术栈                | 数据源                              |
| -------- | ------------ | --------------------- | ----------------------------------- |
| 导航主站 | `/`          | React                 | 各子站的构建期索引                  |
| 关于     | `/about/`    | React                 | `src/data/resume.ts`                |
| 博客     | `/blog/`     | React                 | `src/blog/posts/`（frontmatter）    |
| 作品索引 | `/projects/` | 纯 TS（零运行时依赖） | `src/projects/data/repos.json`（gh）|
| 摄影集   | `/photos/`   | React                 | `src/photos/works/`（frontmatter）  |

全部子站共用 `src/shared/`：`tokens.css`（配色、液态玻璃材质、同心圆、非连续曲率圆角、字阶、动效时长）、`prefs.ts`（语言 / 主题，单一实现）、`topbar.ts`（`<site-topbar>` 自定义元素）、`palette.ts`（`<site-palette>`，Ctrl/Cmd-K 全站搜索）、`seo.ts`（逐路由 `<head>` 管理）。

两个共享组件都渲染进 **light DOM 而非 Shadow DOM**：预渲染靠序列化 `outerHTML`，Shadow 内容不会被写入静态 HTML，那样每个页面的静态版本就没有导航了。

## 双语

语言与主题存在同一对 localStorage key（`blog-lang` / `blog-theme`），任一处切换全站生效；也支持 `?lang=` / `?theme=` 覆盖。

博客文章按语言分 URL：`/blog/<slug>/`（英文）与 `/blog/zh/<slug>/`（中文），互为 hreflang，各有独立 canonical。其余页面为单 URL + 客户端切换，通过 `?lang=` 声明 hreflang 备选。

## 本地开发

```bash
npm install
npm run dev        # 开发服务器（先重建搜索索引）
npm run sync       # 拉取 GitHub 公开仓库数据 → src/projects/data/repos.json
npm run build      # 构建 → 重定向桩 / 机器可读索引 / 预渲染
npm run preview    # 预览构建产物
```

`npm run build` 依次执行：

1. `vite build` — 五个入口打包进 `dist/`
2. `scripts/postbuild.mjs` — 生成 `404.html`（去 canonical、加 noindex）与 `/resume`、`/selected`、`/selected-blog` 三个旧地址的重定向桩
3. `scripts/build-geo.mjs` — 生成 `search.json`、`posts.json`、`works.json`、`site.json`、`llms-full.txt`
4. `scripts/prerender.mjs` — 用无头 Chrome 把 12 篇文章（中英各 6）、三个子站列表页、摄影详情页和主站烘焙成静态 HTML，并写出 `sitemap.xml` / `robots.txt` / `rss.xml`

预渲染**不会**让构建失败（缺 Chrome 时降级为警告），因此 `.github/workflows/deploy.yml` 会单独断言这些产物确实存在且非空——不要只信退出码。

作品索引的数据由 `scripts/fetch-repos.mjs` 用 `gh repo list --json` 拉取，合并 `scripts/curation.json`（精选 / 配图 / 标签 / 文案覆盖）后写入 `src/projects/data/repos.json`（提交进仓库，CI 无需 gh 认证）。`.github/workflows/refresh-repos.yml` 每周一自动重新拉取并提交。

## SEO / GEO

- 每篇随笔两种语言各一页，带 hreflang 对与独立 canonical
- JSON-LD：`Person` / `ProfilePage` / `WebSite` / `CollectionPage` / `ItemList` / `BlogPosting` / `Photograph` / `SoftwareSourceCode` / `BreadcrumbList`
- `robots.txt` 显式放行 GPTBot、ClaudeBot、Google-Extended、PerplexityBot、Bytespider、CCBot
- `llms.txt`（导览）与 `llms-full.txt`（全站正文，中英）
- 机器可读：`site.json`、`posts.json`、`works.json`、`projects.json`、`search.json`
- 旧地址重定向桩不进 sitemap

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 时自动构建并部署到 GitHub Pages：

```bash
git push origin main
```

## License

本仓库为多许可证，不同内容类型适用不同许可：

| 内容                     | 位置                                  | 许可                                     |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| 代码（组件、效果、工具） | `src/`                                | [MIT](LICENSE)                           |
| 摄影作品                 | `public/works/`                       | [All Rights Reserved](LICENSE-PHOTOS.md) |
| 博客文章                 | `src/blog/posts/`                     | [CC BY-NC-SA 4.0](LICENSE-BLOG.md)       |
