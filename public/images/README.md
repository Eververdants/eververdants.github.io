# 图片存储

将图片上传到对应的文件夹：

- `projects/` - 项目封面图
- `photography/` - 摄影作品
- `calligraphy/` - 书法作品
- `blog/` - 博客封面图

## 使用方法

上传图片后，使用以下 URL 格式：

```
https://cdn.jsdelivr.net/gh/Eververdantsx/eververdants.github.io@main/public/images/文件夹/图片名.jpg
```

## 示例

```json
{
  "imageUrl": "https://cdn.jsdelivr.net/gh/Eververdantsx/eververdants.github.io@main/public/images/projects/my-project.jpg"
}
```

## 注意事项

- 图片文件名使用英文和数字，避免中文
- 建议压缩图片后再上传
- 单个文件不要超过 50MB
- 推荐使用 WebP 格式（更小）

## 图片优化工具

- [TinyPNG](https://tinypng.com/) - 在线压缩
- [Squoosh](https://squoosh.app/) - Google 出品
- [ImageOptim](https://imageoptim.com/) - Mac 应用
