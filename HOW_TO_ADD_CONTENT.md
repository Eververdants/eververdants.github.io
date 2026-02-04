# 如何添加内容 / How to Add Content

本指南将教你如何向网站添加新的博客文章、项目、摄影作品和书法作品。

**简单三步：编辑 JSON → 提交 Git → 自动部署** ✨

---

## 📝 添加博客文章

### 步骤 1: 编辑数据文件

打开 `public/data/blog.json`，在数组中添加新的博客条目：

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
  "imageUrl": "https://picsum.photos/1200/600?random=300",
  "content": "完整的博客内容（中文）\n\n使用 \\n\\n 分段\n\n## 使用 ## 创建标题",
  "contentEn": "Full blog content (English)\n\nUse \\n\\n for paragraphs\n\n## Use ## for headings"
}
```

### 步骤 2: 提交到 Git

```bash
git add public/data/blog.json
git commit -m "feat: 添加新博客 - 你的博客标题"
git push origin main
```

### 步骤 3: 等待自动部署

- GitHub Actions 会自动构建和部署到 GitHub Pages
- Vercel 会自动检测并部署
- 大约 2-3 分钟后，新内容就会上线！

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
  "imageUrl": "https://picsum.photos/800/600?random=6",
  "demoUrl": "https://demo.com",
  "repoUrl": "https://github.com/username/repo"
}
```

提交：
```bash
git add public/data/projects.json
git commit -m "feat: 添加新项目 - 项目名称"
git push origin main
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
  "url": "https://picsum.photos/800/600?random=7",
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
  "url": "https://picsum.photos/500/900?random=5",
  "aspectRatio": "tall"
}
```

---

## 🖼️ 图片上传方式

### 方式 1: 使用 jsDelivr CDN（推荐）

1. 将图片放到 `public/images/` 对应目录
2. 提交到 GitHub
3. 使用 URL: 
   ```
   https://cdn.jsdelivr.net/gh/Eververdantsx/eververdants.github.io@main/public/images/blog/your-image.jpg
   ```

### 方式 2: 使用占位图（快速测试）

```
https://picsum.photos/1200/600?random=YOUR_ID
```

### 方式 3: 使用免费图床

- [Imgur](https://imgur.com/)
- [SM.MS](https://sm.ms/)
- [Cloudflare Images](https://www.cloudflare.com/products/cloudflare-images/)

---

## 🔄 完整工作流程示例

### 示例：添加一篇新博客

```bash
# 1. 编辑文件
code public/data/blog.json

# 2. 本地测试（可选）
pnpm run dev
# 访问 http://localhost:3000 查看效果

# 3. 提交更改
git add public/data/blog.json
git commit -m "feat: 添加新博客 - 我的第一篇技术博客"
git push origin main

# 4. 等待部署（2-3分钟）
# GitHub Actions 和 Vercel 会自动部署
```

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

### Q: 本地看到了新内容，但线上没有？
A: 
1. 确保已经 `git push` 到 GitHub
2. 检查 GitHub Actions 构建状态
3. 清除浏览器缓存

### Q: 图片显示不出来？
A:
1. 检查图片 URL 是否正确
2. 确保图片支持 CORS
3. 使用 jsDelivr CDN 或其他可靠的图床

### Q: 中英文切换后内容不对？
A:
1. 检查是否同时提供了中文和英文字段
2. 确保字段名正确（如 `titleEn` 而不是 `title_en`）

### Q: 如何删除内容？
A:
从对应的 JSON 文件中删除该条目，然后提交到 Git。

---

## 💡 最佳实践

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小（建议 < 500KB）
   - 使用 CDN 加速

2. **内容组织**
   - 使用有意义的 ID（如日期 + 序号：`"20241215-1"`)
   - 保持 JSON 格式整洁（使用格式化工具）
   - 定期备份数据文件

3. **版本控制**
   - 每次修改都提交到 Git
   - 写清楚 commit message
   - 使用分支进行大改动

4. **测试流程**
   - 本地测试 → 提交 Git → 验证线上效果
   - 使用 `pnpm run preview` 预览构建结果

---

## 📚 文件结构

```
public/data/
├── blog.json          # 博客文章
├── projects.json      # 项目作品
├── photography.json   # 摄影作品
└── calligraphy.json   # 书法作品

public/images/
├── blog/             # 博客图片
├── projects/         # 项目图片
├── photography/      # 摄影图片
└── calligraphy/      # 书法图片
```

---

## 🚀 快速命令

```bash
# 本地开发
pnpm run dev

# 构建
pnpm run build

# 预览构建结果
pnpm run preview

# 提交更改
git add .
git commit -m "feat: 添加新内容"
git push origin main
```

---

就这么简单！编辑 JSON 文件，提交到 GitHub，剩下的交给自动化部署。✨

