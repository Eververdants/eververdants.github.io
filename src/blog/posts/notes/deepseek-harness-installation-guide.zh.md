---
slug: deepseek-harness-installation-guide
title: "DeepSeek Harness 安装教程\n从零开始，手把手教你搭建 AI 智能体"
category: 教程
date: 2026.08.20
excerpt: 一篇面向完全零基础用户的 DeepSeek Harness 安装教程，从环境配置到首次运行，每一步都有详细说明。
tags: [DeepSeek, AI, 教程, 入门]
sources:
  - DeepSeek Harness 官网|https://www.deepseek.com/harness
  - DeepSeek Harness GitHub|https://github.com/deepseek-ai/deepseek-harness
  - DeepSeek 开放平台|https://platform.deepseek.com/
---

> 这是一篇为电脑小白量身定制的教程。如果你从未用过命令行，从未写过代码，也能跟着这篇教程成功安装 DeepSeek Harness。

## 什么是 DeepSeek Harness？

先说说我们要装的东西到底是什么。

**DeepSeek Harness**（简称 `dsh`）是 [DeepSeek AI](https://deepseek.com) 推出的一个开源工具。它的核心理念是**"一切皆插件"**——你可以把它理解为一个"积木框架"，AI 模型是核心，各种能力（读文件、执行命令、联网搜索等）都是可以自由组合的插件。

打个比方：

- **AI 模型**（比如 DeepSeek-V4）就像一个人的大脑
- **DeepSeek Harness** 就像给这个大脑装上了手、脚、眼睛和各种工具，让它不仅能"想"，还能"做"

它目前处于**开发者预览阶段**，意味着功能还在快速迭代，但已经可以正常使用了。

### 它能做什么？

- 让 AI 帮你写代码、改代码
- 让 AI 帮你读取和编辑文件
- 让 AI 帮你执行命令行操作
- 让 AI 帮你搜索网页内容
- 让 AI 自动完成复杂的多步骤任务

### 为什么选择它？

- **开源免费**：代码完全公开，MIT 许可证
- **插件化设计**：需要什么功能就装什么插件
- **国产团队**：DeepSeek 是国内顶尖的 AI 公司，文档和社区都有中文支持

---

## 第一步：安装 Node.js

DeepSeek Harness 是用 TypeScript 写的，需要 Node.js 来运行。别担心，Node.js 的安装非常简单。

### 1.1 下载 Node.js

1. 打开浏览器，访问 [Node.js 官网](https://nodejs.org/)
2. 你会看到两个下载按钮，选择左边的 **LTS（长期支持版）**
3. 点击后会自动开始下载，等待下载完成

> **什么是 LTS？** LTS 是 Long Term Support 的缩写，意思是"长期支持版本"。这个版本最稳定，适合普通用户使用。

### 1.2 安装 Node.js（Windows 用户）

1. 找到下载好的文件（通常在"下载"文件夹），双击运行
2. 出现安装向导后，点击 **Next**
3. 勾选 **"I accept the terms in the License Agreement"**（我接受许可条款），点击 Next
4. 选择安装路径，**建议保持默认**，点击 Next
5. 这一步很重要！确保 **"Automatically install the necessary tools"** 被勾选，然后点击 Next
6. 点击 **Install** 开始安装
7. 等待安装完成，点击 **Finish**

### 1.3 验证安装是否成功

现在来检查一下 Node.js 是否安装好了。

1. 按键盘上的 `Win + R` 键（Win 键就是那个 Windows 图标的键）
2. 在弹出的框中输入 `cmd`，然后按回车
3. 这会打开一个黑色的窗口，这就是"命令提示符"（也叫终端）
4. 在里面输入以下内容，然后按回车：

```sh
node --version
```

5. 如果看到类似 `v20.11.0` 这样的版本号，说明安装成功了！

> **如果提示"不是内部或外部命令"怎么办？**
> 这说明 Node.js 没有被正确添加到系统路径。解决方法：
>
> 1. 关闭当前的命令提示符窗口
> 2. 重新打开一个新的命令提示符
> 3. 如果还是不行，尝试重启电脑后再试

---

## 第二步：获取 DeepSeek API Key

DeepSeek Harness 需要一个 API Key 来调用 DeepSeek 的 AI 模型。这个 Key 就像一把"钥匙"，证明你有权限使用 DeepSeek 的服务。

### 2.1 注册 DeepSeek 账号

1. 打开浏览器，访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 点击页面上的 **"注册"** 按钮
3. 输入你的手机号码
4. 点击"获取验证码"，然后输入收到的短信验证码
5. 设置一个密码（建议用字母+数字的组合，容易记住又安全）
6. 点击"注册"完成

### 2.2 创建 API Key

1. 用刚注册的账号登录
2. 登录后会进入控制台页面
3. 在页面上找到 **"API Keys"** 或 **"接口密钥"** 选项（通常在左侧菜单或顶部导航）
4. 点击 **"创建新密钥"**
5. 给密钥取一个名字，比如 `my-dsh-key`（方便以后识别）
6. 点击确认

### 2.3 保存你的 API Key

**这一步非常重要！**

1. 创建成功后，页面会显示你的 API Key（一长串字母和数字）
2. **立即复制这个 Key 并保存到一个安全的地方**
3. 关闭页面后就**无法再次查看**这个 Key 了

> **小提示：** 可以把 Key 保存在手机备忘录或者电脑的记事本里，但不要分享给别人。

### 2.4 了解模型和费用

DeepSeek 目前提供两个主力模型：

| 模型                  | 特点             | 适合场景           |
| --------------------- | ---------------- | ------------------ |
| **DeepSeek-V4-Flash** | 速度快、价格便宜 | 日常使用、学习测试 |
| **DeepSeek-V4-Pro**   | 能力更强、更智能 | 复杂任务、专业开发 |

#### API 接口地址

- **OpenAI 格式**：`https://api.deepseek.com`
- **Anthropic 格式**：`https://api.deepseek.com/anthropic`

#### 价格详情

| 计费项                           | DeepSeek-V4-Flash   | DeepSeek-V4-Pro     |
| -------------------------------- | ------------------- | ------------------- |
| **输入（缓存命中）- 空闲时段**   | 0.05 元/百万 tokens | 0.15 元/百万 tokens |
| **输入（缓存命中）- 高峰时段**   | 0.10 元/百万 tokens | 0.30 元/百万 tokens |
| **输入（缓存未命中）- 空闲时段** | 1.5 元/百万 tokens  | 4.5 元/百万 tokens  |
| **输入（缓存未命中）- 高峰时段** | 3.0 元/百万 tokens  | 9.0 元/百万 tokens  |
| **输出 - 空闲时段**              | 4.5 元/百万 tokens  | 13.5 元/百万 tokens |
| **输出 - 高峰时段**              | 9.0 元/百万 tokens  | 27.0 元/百万 tokens |

> **省钱小技巧：** 尽量在空闲时段（非高峰期）使用，价格会便宜一半。
>
> **高峰时段为北京时间 9:00 - 12:00、14:00 - 18:00**，其余时间为空闲时段。

---

## 第三步：安装 DeepSeek Harness

现在万事俱备，开始安装主角！

### 方式一：快速体验（推荐新手）

这是最简单的方式，只需要一行命令。

1. 打开命令提示符（按 `Win + R`，输入 `cmd`，回车）
2. 输入以下命令，然后按回车：

```sh
npx @deepseek-ai/dsh web
```

3. 首次运行会自动下载所需的文件，需要等待几分钟
4. 当你看到类似这样的输出时，说明启动成功了：

```
[INFO] Server listening on http://127.0.0.1:3080
```

5. 浏览器会自动打开一个页面，如果没有，手动在浏览器地址栏输入 `http://127.0.0.1:3080`

> **什么是 npx？** npx 是 Node.js 自带的工具，可以运行 npm 上的包。你不需要额外安装它。

### 方式二：从源码安装（进阶用户）

如果你想要查看源码或者进行二次开发，可以选择这种方式。

#### 2.1 安装 Git

Git 是一个版本控制工具，用来下载源码。

1. 访问 [Git 官网](https://git-scm.com/)
2. 下载对应你系统的版本（Windows 用户选择 Windows）
3. 安装时保持默认选项，一路 Next 即可

安装完成后，重新打开命令提示符，输入：

```sh
git --version
```

看到版本号说明安装成功。

#### 2.2 安装 pnpm

pnpm 是一个包管理器，用来安装项目依赖。

在命令提示符中输入：

```sh
npm install -g pnpm
```

等待安装完成，然后验证：

```sh
pnpm --version
```

#### 2.3 下载源码并安装

依次输入以下命令（每输入一行按一次回车）：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
```

> **注意：** `pnpm install` 和 `pnpm run build` 可能需要较长时间，这是正常的，请耐心等待。

#### 2.4 启动

```sh
pnpm dsh web
```

### 方式三：使用 Python SDK（开发者）

如果你熟悉 Python，也可以用 Python 版本。

#### 3.1 安装 Python

如果还没安装 Python：

1. 访问 [Python 官网](https://www.python.org/downloads/)
2. 下载最新版本
3. **安装时一定要勾选 "Add Python to PATH"**
4. 完成安装

#### 3.2 安装 SDK

```sh
python -m pip install deepseek-harness-sdk
```

#### 3.3 创建测试脚本

用记事本创建一个文件，命名为 `test.py`，内容如下：

```python
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness() as harness:
    result = harness.run("Say hello to the world.")
    print(result)
```

然后在命令提示符中运行：

```sh
python test.py
```

---

## 第四步：配置和使用

启动后，你还需要配置 API Key 才能开始使用。

### 4.1 配置 API Key

在 Web 界面中：

1. 找到设置入口（通常在页面角落或侧边栏）
2. 找到 "API Key" 或 "密钥" 相关的配置项
3. 粘贴你之前保存的 API Key
4. 保存设置

### 4.2 选择运行模式

DeepSeek Harness 提供四种模式：

| 模式         | 适合谁   | 特点                     |
| ------------ | -------- | ------------------------ |
| **标准模式** | 普通用户 | 功能最全，推荐新手使用   |
| **PTC 模式** | 开发者   | 可以用代码组合多步操作   |
| **极简模式** | 测试人员 | 只保留基础功能，用于测试 |
| **创造模式** | 开发者   | 可以创建自定义的 Agent   |

**新手建议选择"标准模式"。**

> **关于模型选择的建议：**
>
> - 如果你使用 **DeepSeek-V4-Flash**，推荐用**标准模式**，体验更完整
> - 如果你使用 **DeepSeek-V4-Pro**，建议用**极简模式**。因为 V4-Pro 在后训练阶段存在一定的过拟合问题，极简模式下只提供 bash 和文件编辑两个基础工具，反而能让模型更好地发挥推理能力

### 4.3 开始使用

在输入框中输入你的问题或任务，比如：

- "帮我写一个 Python 计算器"
- "解释什么是 Docker"
- "帮我创建一个简单的网页"
- "帮我读取这个文件并总结内容"

然后按回车，等待 AI 回复。

---

## 常见问题解决

### 问题 1：命令提示"不是内部或外部命令"

**可能原因：** 软件没有正确安装，或者没有添加到系统环境变量。

**解决方法：**

1. 重新安装 Node.js / Python / Git
2. 安装完成后关闭并重新打开命令提示符
3. 如果还是不行，重启电脑后再试

### 问题 2：下载速度很慢或超时

**可能原因：** 网络问题，国内访问某些服务器较慢。

**解决方法：**

**方法一：使用 [Watt Toolkit](https://steampp.net/)（原 Steam++）**

1. 访问 [Watt Toolkit 官网](https://steampp.net/) 下载安装
2. 打开软件，找到"网络加速"
3. 勾选 GitHub 和 npm 的加速选项
4. 点击"一键加速"
5. 加速成功后重新运行安装命令

**方法二：配置国内镜像**

```sh
# 配置 npm 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
```

> **注意：** 如果你需要其他加速工具，可以自行搜索研究，本文不提供相关教程。

### 问题 3：端口 3080 被占用

**解决方法：**

```sh
# 指定其他端口启动
npx @deepseek-ai/dsh web --port 3081
```

然后访问 `http://127.0.0.1:3081`

### 问题 4：API Key 无效

**检查：**

1. API Key 是否正确复制（没有多余空格）
2. 账户余额是否充足

### 问题 5：浏览器没有自动打开

没关系，手动打开浏览器，在地址栏输入：

```
http://127.0.0.1:3080
```

---

## 进阶学习

当你成功运行 DeepSeek Harness 后，可以继续探索：

### 官方资源

- [DeepSeek Harness 官网](https://www.deepseek.com/harness)
- [GitHub 仓库](https://github.com/deepseek-ai/deepseek-harness)
- [API 文档](https://platform.deepseek.com/api-docs)
- [DeepSeek 开放平台](https://platform.deepseek.com/)

### 插件探索

DeepSeek Harness 的强大之处在于插件系统。你可以：

- 浏览社区插件
- 学习如何开发自己的插件
- 根据需求组合不同的插件

### 参与社区

- 在 [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 上提交问题和建议
- 加入官方社区（企微群、[Discord](https://discord.gg/Ycq5dCaS4)）
- 关注微信公众号获取最新动态

---

## 总结

恭喜你！如果跟着教程走到了这里，说明你已经成功安装并运行了 DeepSeek Harness。

回顾一下我们做了什么：

1. 安装了 Node.js 运行环境
2. 注册了 DeepSeek 账号并获取了 API Key
3. 安装并启动了 DeepSeek Harness
4. 配置了 API Key，可以开始使用了

接下来，你可以尽情探索 AI 智能体的世界，让它帮你完成各种任务。

如果在使用过程中遇到问题，欢迎在评论区留言，或者到 [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 提问。

**祝你玩得开心！**
