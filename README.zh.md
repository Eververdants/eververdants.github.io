# Eververdantes Portfolio · 作品集

> *技与艺交逢之所，灵与匠栖宿之乡。*
> *一隅数字展厅，承载代码、光影与笔墨。*

---

凡人之创作，大抵始于热忱，成于精进。此集所纳，非止于程式之巧、界面之丽，更乃一段跋涉之印记——从全栈应用至 UI 库，从摄影光影至书法墨韵，从影像叙事至交互探索，每一件作品皆是一刻心绪的凝结，一段时光的切片。

---

## ✦ 卷首

- [缘起](#缘起)
- [造物之思](#造物之思)
- [匠心所至](#匠心所至)
- [栋梁之构](#栋梁之构)
- [器用之术](#器用之术)
- [启程之法](#启程之法)
- [藏经之阁](#藏经之阁)
- [布衣之阵](#布衣之阵)
- [版权](#版权)

---

## 缘起

这不是一份寻常的简历，不是一份干瘪的作品清单。

它是一座活的档案馆——创作者在数字世界留下的足迹，每一枚都清晰可辨。从初代原型到迭代成品，从灵感乍现到匠心落定，这里记录了技艺成长的每一道年轮。

网站以全屏卷轴徐徐展开：首屏迎客，次屏述己，三屏陈作，四屏会友。每一次滑动，便是一章新的叙述。动效由 GSAP 驱动，节奏从容克制，恰如翻书。

---

## 造物之思

**以屏为章，以动为言。** 不取传统滚动之连绵不绝，而代之以章节切换——每一屏是一方独立天地，有始有终，起承转合。

**双声共语，东西相映。** 中英文如双生花，并蒂而开，不分主次，不偏不倚。语言切换只在弹指之间，状态流转，始终如一。

**暖色为底，金线勾边。** 大地色系为基调，琥珀为点缀，森林为伏笔。字体的选择上，Outfit 的几何清朗与 Geist Sans 的实用精准相映成趣——如文人案头，既有笔墨纸砚，亦有尺规量具。

**触之可感，移步换景。** 光标过处，泛起微光；卡片之上，指尖轻触即生 3D 倾角。视差的层次、流光溢彩的边框——将冰冷的像素化为可抚摸的表面。

**暗夜犹温，灯火可亲。** 暗色模式非颜色反转这般简单。每一处阴影、每一抹暖意，皆经反复调试，方能在暗色中温柔如烛火，不伤目，不失韵。

---

## 匠心所至

- **全屏卷轴叙事** —— 四屏垂直铺陈（迎宾·述己·陈作·会友），滚轮、触控、键盘皆可驱动，GSAP 转场丝滑如水。
- **双语界面无隙** —— 中英完整切换，状态持久保存，所有内容区域悉数在地化，无一遗漏。
- **作品长廊** —— 精选项目以卡片陈列，点击可入详情：完整描述、技术标签、功能亮点、演示与源码链接，一应俱全。
- **社交雅集** —— Bilibili、抖音、GitHub、QQ、微信五方平台，各有专属配色与渐层，悬停即生流光。微信卡片更藏玄机——轻悬其上，好友码以非线性动画徐徐展开。
- **赞赏 QR 码** —— 屏幕左下角一隅，金色描边熠熠生辉。鼠标掠过，卡片放大，边框旋转变幻，脉动光环层层外扩，金币粒子绕行飞舞，如钱囊初启，宝光四溢。
- **笔墨文章** —— 独立博客区域，Markdown 渲染成文，阅读时长估算，标签筛选随心所欲。
- **影像长廊** —— 精选视频嵌入 Bilibili 播放器，按类别分列，附详尽描述与关联内容，观之如行山阴道上，目不暇接。
- **万物应屏** —— 从掌中寸屏到宽银巨幕，布局自如伸缩，内容疏密有致，不局促，不空旷。
- **幽兰夜灯** —— 深色模式如暗室点灯，色彩柔和，层次分明，视线所及皆舒适安然。
- **光标生花** —— 自订游标带光晕追随，悬停可交互元素时微微亮起，予指尖以反馈，界面顿生灵性。
- **标签为钥** —— 项目、文章、视频皆可依标签筛选，千军万马，一钥可启。

---

## 栋梁之构

```
eververdantes.github.io/
├── public/                    # 静态资源（根目录服务）
│   ├── images/                # QR 码与社交素材
│   ├── projects/              # 项目封面
│   ├── photography/           # 摄影作品
│   ├── calligraphy/           # 书法作品
│   └── blog/                  # 文章插图
├── src/
│   ├── components/
│   │   ├── fullscreen/        # 全屏各屏组件
│   │   │   ├── HeroScreen.tsx         # 首屏 · 迎宾
│   │   │   ├── AboutScreen.tsx        # 次屏 · 述己
│   │   │   ├── ProjectsScreen.tsx     # 三屏 · 陈作
│   │   │   ├── SocialScreen.tsx       # 四屏 · 会友
│   │   │   ├── HeroBackground.tsx     # Canvas 动画背景
│   │   │   ├── ScreenNav.tsx          # 导航圆点
│   │   │   └── CustomCursor.tsx       # 自订游标
│   │   ├── social-icons.tsx           # 社交 SVG 图标
│   │   └── ...                        # 共享组件
│   ├── pages/                 # 路由页面
│   │   ├── FullScreenSite.tsx         # 主登陆页
│   │   ├── Projects.tsx / ProjectDetail.tsx
│   │   ├── Blog.tsx / BlogArticle.tsx
│   │   ├── Videos.tsx / VideoDetail.tsx
│   │   └── NotFound.tsx
│   ├── data/                  # 静态内容数据
│   │   ├── index.ts                   # 数据中心
│   │   ├── social.ts                  # 社交平台配置
│   │   └── projects-cover.ts          # 项目元数据
│   ├── hooks/                 # 自定义 Hooks
│   │   └── use-projects.ts            # 项目数据 Hook
│   ├── contexts/              # React Contexts
│   │   └── LanguageContext.tsx         # 双语状态
│   ├── layouts/               # 布局组件
│   │   └── MainLayout.tsx             # 标准页面布局
│   ├── routes/                # 路由
│   │   └── index.tsx                   # 路由器
│   ├── utils/                 # 工具函数
│   │   └── translations.ts            # 国际化词典
│   ├── types.ts               # 类型定义
│   ├── App.tsx                # 应用根
│   └── index.tsx              # 入口
├── tailwind.config.js         # 设计令牌
├── vite.config.ts             # 构建配置
└── package.json
```

---

## 器用之术

### 核心框架

| 技 | 用 |
|---|---|
| **React 18** | 组件化 UI 架构 |
| **TypeScript** | 类型安全 |
| **Vite** | 构建与热更新 |

### 样式与动效

| 技 | 用 |
|---|---|
| **Tailwind CSS** | 原子化样式与设计令牌 |
| **Framer Motion** | 声明式动画与手势 |
| **GSAP** | 高性能滚动动画 |

### 路由与状态

| 技 | 用 |
|---|---|
| **React Router v6** | 客户端路由与懒加载 |
| **React Context** | 语言状态管理 |

### 内容与数据

| 技 | 用 |
|---|---|
| **Markdown** | 文章渲染 |
| **JSON 数据文件** | 静态内容管理 |

### 部署运维

| 技 | 用 |
|---|---|
| **Vercel / GitHub Pages** | 托管与持续部署 |
| **pnpm** | 包管理 |

---

## 启程之法

### 环境之需

- **Node.js** ≥ 18
- **pnpm**（荐）或 npm

### 本地开卷

```bash
# 取书
git clone https://github.com/Eververdants/eververdantes.github.io.git
cd eververdantes.github.io

# 备器
pnpm install

# 启炉
pnpm run dev

# 成器
pnpm run build

# 预览
pnpm run preview
```

开发服务默认驻于 `http://localhost:3000`。

### 脚本一览

| 命令 | 何为 |
|---|---|
| `pnpm run dev` | 启开发服务（热更新） |
| `pnpm run build` | 打生产包 |
| `pnpm run preview` | 本地预览 |

---

## 藏经之阁

### 管理项目

项目数据存于 `src/data/index.ts` 与 `src/data/projects-cover.ts`。每条项目记录含：

- 中英标题与描述
- 类别与标签（供筛选）
- 功能亮点
- 封面与详情图片
- 演示与源码链接
- 完整 Markdown 文章

### 管理社交平台

平台配置在 `src/data/social.ts`。每条含：

- 中英名称
- 图标与渐层色值
- 主页链接
- 优先级（主要 / 次要）

### 翻译词典

双语词库在 `src/utils/translations.ts`。新增词条须同时在 `en` 与 `zh` 对象中落笔。

---

## 布衣之阵

项目同时兼容 Vercel 与 GitHub Pages 两路部署。`vite.config.ts` 已预设代码分割、esbuild 压缩、资源指纹等优化。

```bash
pnpm run build
# 产物在 dist/ 目录，直取部署即可
```

---

## 版权

**MIT** — 详见 [LICENSE](./LICENSE)。

---

*用心之作 · Crafted with mind and spirit by Eververdants*
