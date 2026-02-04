# 部署指南 / Deployment Guide

本项目支持多平台部署：GitHub Pages 和 Vercel。

## 🚀 GitHub Pages 部署

### 自动部署
每次推送到 `main` 分支时，GitHub Actions 会自动构建和部署。

### 配置步骤
1. 进入仓库设置：`Settings` → `Secrets and variables` → `Actions`
2. 添加以下 Secrets：
   - `VITE_API_URL`: Cloudflare Worker API 地址
   - `GEMINI_API_KEY`: Google Gemini API 密钥

3. 确保 GitHub Pages 设置：
   - `Settings` → `Pages`
   - Source: `GitHub Actions`

### 访问地址
- https://eververdants.github.io
- 或自定义域名：https://eververdants.com

---

## 🔷 Vercel 部署

### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 导入你的 GitHub 仓库：`Eververdants/eververdants.github.io`
4. Vercel 会自动检测到 `vercel.json` 配置
5. 配置环境变量：
   - `VITE_API_URL`: Cloudflare Worker API 地址
   - `GEMINI_API_KEY`: Google Gemini API 密钥
6. 点击 "Deploy"

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### Vercel 配置说明

项目已包含 `vercel.json` 配置文件：
- ✅ 框架：Vite
- ✅ 构建命令：`pnpm run build`
- ✅ 输出目录：`dist`
- ✅ SPA 路由重写
- ✅ 正确的 MIME 类型头
- ✅ 缓存优化

### 访问地址
- Vercel 自动生成的域名：`https://your-project.vercel.app`
- 可以在 Vercel Dashboard 中配置自定义域名

---

## 🔧 本地开发

```bash
# 安装依赖
pnpm install

# 开发服务器
pnpm run dev

# 构建
pnpm run build

# 预览构建结果
pnpm run preview
```

---

## 📝 环境变量

创建 `.env.local` 文件（不要提交到 Git）：

```env
VITE_API_URL=https://your-worker.workers.dev
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🌐 多平台部署对比

| 特性 | GitHub Pages | Vercel |
|------|-------------|--------|
| 自动部署 | ✅ | ✅ |
| 自定义域名 | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| 环境变量 | ✅ (Secrets) | ✅ |
| 构建时间 | ~2-3 分钟 | ~1-2 分钟 |
| CDN | GitHub CDN | Vercel Edge Network |
| 免费额度 | 无限制 | 100GB 带宽/月 |

---

## 🐛 故障排查

### GitHub Pages 问题

**问题：MIME 类型错误**
- 确保 `public/.nojekyll` 文件存在
- 检查 GitHub Actions 构建日志

**问题：404 错误**
- 确保 GitHub Pages 设置为 "GitHub Actions"
- 检查 `base` 配置在 `vite.config.ts` 中是否正确

### Vercel 问题

**问题：检测到 Next.js**
- 确保 `vercel.json` 中 `framework` 设置为 `"vite"`
- 删除 Vercel 项目重新导入

**问题：环境变量未生效**
- 在 Vercel Dashboard 中检查环境变量设置
- 确保变量名以 `VITE_` 开头
- 重新部署项目

---

## 📚 相关文档

- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vercel 文档](https://vercel.com/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
