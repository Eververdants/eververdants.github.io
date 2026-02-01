# Eververdants Portfolio

个人作品集网站 - 展示项目、摄影、书法作品和博客。

## ✨ 特性

- 🎨 现代化设计，支持深色模式
- 🌍 中英文双语支持
- 📱 完全响应式，支持移动端
- 🚀 基于 Cloudflare KV 的内容管理
- ⚡ 快速加载，全球 CDN 加速

## 🚀 快速开始

查看 [快速开始指南](./QUICK_START.md) 完成 5 分钟配置。

## 📚 文档

- [快速开始](./QUICK_START.md) - 5分钟完成配置
- [Cloudflare 配置指南](./CLOUDFLARE_SETUP.md) - 详细配置步骤
- [本地开发指南](./LOCAL_DEVELOPMENT.md) - 本地开发环境设置

## 🛠️ 技术栈

- **框架**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **部署**: GitHub Pages
- **内容管理**: Cloudflare KV
- **AI**: Google Gemini API

## 📝 内容管理

所有内容（项目、摄影、书法、博客）都存储在 Cloudflare KV 中。

### 添加新内容

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **KV**
3. 选择对应的键（projects/photography/calligraphy/blog）
4. 编辑 JSON 数据
5. 保存 → 立即生效！

详见 [快速开始指南](./QUICK_START.md)

## 🔧 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build
```

详见 [本地开发指南](./LOCAL_DEVELOPMENT.md)

## 📄 License

MIT

---

Made with ❤️ by Eververdants
