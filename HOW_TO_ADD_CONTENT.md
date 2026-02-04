# 如何添加内容 / How to Add Content

本指南将教你如何向网站添加新的博客文章、项目、摄影作品和书法作品。

---

## 📝 添加博客文章

### 步骤 1: 编辑数据文件

打开 `public/data/blog.json`，添加新的博客条目：

```json
{
  "id": "3",
  "title": "你的博客标题（中文）",
  "titleEn": "Your Blog Title (English)",
  "excerpt": "简短摘要（中文）",
  "excerptEn": "Short excerpt (English)",
  "date": "2024年12月15日",
  "dateEn": "Dec 15, 2024",
  "readTime": "5分钟阅读",
  "readTimeEn": "5 min read",
  "tags": ["标签1", "标签2"],
  "tagsEn": ["Tag1", "Tag2"],
  "imageUrl": "https://your-image-url.com/image.jpg",
  "content": "完整的博客内容（中文）\n\n使用 \\n\\n 分段\n\n## 使用 ## 创建标题",
  "contentEn": "Full blog content (English)\n\nUse \\n\\n for paragraphs\n\n## Use ## for headings"
}
```

### 步骤 2: 上传图片（可选）

你可以使用以下方式上传博客封面图：

1. **使用 jsDelivr CDN**（推荐）
   - 将图片放到 `public/images/blog/` 目录
   - 提交到 GitHub
   - 使用 URL: `https://cdn.jsdelivr.net/gh/Eververdantsx/eververdants.github.io@main/public/images/blog/your-image.jpg`

2. **使用图床服务**
   - [Imgur](https://imgur.com/)
   - [SM.MS](https://sm.ms/)
   - [Cloudflare Images](https://www.cloudflare.com/products/cloudflare-images/)

3. **使用占位图**
   - `https://picsum.photos/1200/600?random=YOUR_ID`

### 步骤 3: 上传到 Cloudflare KV

#### 方式一：使用脚本（推荐）

**Windows:**
```powershell
.\scripts\upload-to-kv.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/upload-to-kv.sh
./scripts/upload-to-kv.sh
```

#### 方式二：手动上传

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 上传博客数据
wrangler kv:key put --namespace-id="YOUR_NAMESPACE_ID" "blog" --path="public/data/blog.json"
```

### 步骤 4: 验证

访问你的网站，检查新博客是否显示。

---

## 🎨 添加项目

编辑 `public/data/projects.json`：

```json
{
  "id": "6",
  "title": "项目名称",
  "titleEn": "Project Name",
  "description": "简短描述",
  "descriptionEn": "Short description",
  "fullDescription": "详细描述",
  "fullDescriptionEn": "Full description",
  "category": "分类",
  "categoryEn": "Category",
  "features": ["特性1", "特性2"],
  "featuresEn": ["Feature 1", "Feature 2"],
  "tags": ["React", "TypeScript"],
  "tagsEn": ["React", "TypeScript"],
  "imageUrl": "https://your-image-url.com/project.jpg",
  "demoUrl": "https://demo.com",
  "repoUrl": "https://github.com/username/repo"
}
```

然后上传：
```bash
wrangler kv:key put --namespace-id="YOUR_NAMESPACE_ID" "projects" --path="public/data/projects.json"
```

---

## 📷 添加摄影作品

编辑 `public/data/photography.json`：

```json
{
  "id": "7",
  "title": "作品标题",
  "titleEn": "Photo Title",
  "description": "作品描述",
  "descriptionEn": "Photo description",
  "url": "https://your-image-url.com/photo.jpg",
  "aspectRatio": "wide",
  "location": "拍摄地点",
  "locationEn": "Location",
  "date": "2024年12月",
  "dateEn": "Dec 2024",
  "technicalDetails": {
    "camera": "Sony A7R IV",
    "lens": "35mm f/1.4",
    "aperture": "f/2.8",
    "shutterSpeed": "1/60s",
    "iso": "800"
  }
}
```

**aspectRatio 选项:**
- `"wide"`: 横向照片 (16:9)
- `"tall"`: 竖向照片 (9:16)
- `"square"`: 方形照片 (1:1)

然后上传：
```bash
wrangler kv:key put --namespace-id="YOUR_NAMESPACE_ID" "photography" --path="public/data/photography.json"
```

---

## ✍️ 添加书法作品

编辑 `public/data/calligraphy.json`：

```json
{
  "id": "5",
  "title": "作品标题",
  "titleEn": "Calligraphy Title",
  "content": "书法内容（汉字）",
  "description": "作品含义和描述",
  "descriptionEn": "Meaning and description",
  "url": "https://your-image-url.com/calligraphy.jpg",
  "aspectRatio": "tall"
}
```

然后上传：
```bash
wrangler kv:key put --namespace-id="YOUR_NAMESPACE_ID" "calligraphy" --path="public/data/calligraphy.json"
```

---

## 🔄 完整工作流程示例

### 示例：添加一篇新博客

1. **编辑数据文件**
```bash
# 打开编辑器
code public/data/blog.json
```

2. **添加新条目**（在数组末尾添加）
```json
{
  "id": "3",
  "title": "我的第一篇技术博客",
  "titleEn": "My First Tech Blog",
  "excerpt": "分享我学习 React 的心得体会",
  "excerptEn": "Sharing my React learning experience",
  "date": "2024年12月20日",
  "dateEn": "Dec 20, 2024",
  "readTime": "3分钟阅读",
  "readTimeEn": "3 min read",
  "tags": ["React", "学习"],
  "tagsEn": ["React", "Learning"],
  "imageUrl": "https://picsum.photos/1200/600?random=300",
  "content": "今天我学习了 React Hooks...",
  "contentEn": "Today I learned about React Hooks..."
}
```

3. **本地测试**
```bash
pnpm run dev
# 访问 http://localhost:3000 查看效果
```

4. **上传到 Cloudflare KV**
```powershell
# Windows
.\scripts\upload-to-kv.ps1

# 或手动上传
wrangler kv:key put --namespace-id="YOUR_NAMESPACE_ID" "blog" --path="public/data/blog.json"
```

5. **提交到 Git**
```bash
git add public/data/blog.json
git commit -m "feat: 添加新博客文章 - 我的第一篇技术博客"
git push origin main
```

6. **等待部署**
- GitHub Actions 会自动构建和部署
- Vercel 会自动检测并部署
- 大约 2-3 分钟后，新内容就会上线

---

## 📋 数据格式说明

### 必填字段
- `id`: 唯一标识符（字符串）
- `title` / `titleEn`: 中英文标题
- `url` / `imageUrl`: 图片地址

### 可选字段
- `description` / `descriptionEn`: 描述
- `tags` / `tagsEn`: 标签数组
- `date` / `dateEn`: 日期
- 其他特定字段（根据内容类型）

### 多语言支持
- 所有文本字段都应该有中文和英文版本
- 中文字段：`title`, `description`, `content` 等
- 英文字段：`titleEn`, `descriptionEn`, `contentEn` 等

---

## 🐛 常见问题

### Q: 上传后看不到新内容？
A: 
1. 检查 Cloudflare KV 是否上传成功
2. 清除浏览器缓存
3. 等待 1-2 分钟让 CDN 更新

### Q: 图片显示不出来？
A:
1. 检查图片 URL 是否正确
2. 确保图片支持 CORS
3. 使用 jsDelivr CDN 或其他可靠的图床

### Q: 中英文切换后内容不对？
A:
1. 检查是否同时提供了中文和英文字段
2. 确保字段名正确（如 `titleEn` 而不是 `title_en`）

### Q: 如何批量上传多个文件？
A:
使用提供的脚本 `upload-to-kv.ps1` 或 `upload-to-kv.sh`，它会自动上传所有数据文件。

---

## 💡 最佳实践

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小（建议 < 500KB）
   - 使用 CDN 加速

2. **内容组织**
   - 使用有意义的 ID（如日期 + 序号）
   - 保持数据文件格式整洁
   - 定期备份数据文件

3. **版本控制**
   - 每次修改都提交到 Git
   - 写清楚 commit message
   - 使用分支进行大改动

4. **测试流程**
   - 本地测试 → 上传 KV → 验证线上效果
   - 使用 `pnpm run preview` 预览构建结果

---

## 📚 相关文档

- [Cloudflare KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [数据模板说明](./DATA_TEMPLATES.md)
- [部署指南](./DEPLOYMENT.md)
