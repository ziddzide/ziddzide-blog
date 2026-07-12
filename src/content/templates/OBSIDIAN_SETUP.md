# Obsidian + Astro (Mizuki) 写作配置指南

## 1. 打开方式

用 Obsidian 打开博客项目的 `src/content` 目录作为一个 Vault：

```
Obsidian → Open folder as vault → 选择:
C:\Users\34688\Documents\blog\ziddzide-blog\src\content
```

这样你的文章目录 `posts/` 就是 Obsidian 的工作区。

---

## 2. 模板配置（必做）

### 设置模板文件夹
Obsidian 设置 → 核心插件 → 模板 → 模板文件夹位置：
```
.obsidian-templates
```
（把 `.obsidian-templates` 文件夹复制到 `src/content/` 下）

### 使用模板
- `Ctrl+N` 新建笔记
- `Ctrl+T` → 选择 `post-template` → 自动填入 frontmatter

---

## 3. 文章文件组织

每篇文章放一个文件夹，格式如下：

```
posts/
└── 2026-07-12-my-first-post/
    ├── index.md       ← 文章正文
    └── cover.webp     ← 封面图（可选）
```

> **重要**：文件名用英文+连字符，`index.md` 作为入口。  
> 中文标题写在 frontmatter 的 `title` 字段中。

---

## 4. 推荐 Obsidian 社区插件

| 插件 | 用途 | 必装 |
|------|------|------|
| **Templater** | 高级模板，自动日期/标题 | ⭐ 必装 |
| **Image Converter** | 拖入图片自动压缩转 webp | ⭐ 推荐 |
| **Linter** | 自动格式化 frontmatter | 推荐 |
| **Commander** | 自定义快捷命令 | 可选 |
| **Paste URL into selection** | 粘贴链接自动转 Markdown | 可选 |
| **Easy Typing** | 中英文间自动加空格 | 可选 |

---

## 5. Templater 配置（替代自带模板，更好用）

安装 Templater 插件后，设置模板文件夹为 `.obsidian-templates`。

创建模板时可以用 Templater 语法自动填充：

```yaml
---
title: "<% tp.file.title %>"
published: "<% tp.date.now("YYYY-MM-DD") %>"
updated: "<% tp.date.now("YYYY-MM-DD") %>"
draft: false
description: ""
image: ""
tags: []
category: ""
pinned: false
comment: true
author: Ziddzide
---
```

---

## 6. 文章目录命名建议

推荐用日期前缀方便排序：
```
2026-07-12-kali-linux-setup/
2026-07-15-web-penetration-basics/
2026-07-18-network-protocol-analysis/
```

Obsidian 中看到的标题来自 frontmatter 的 `title`，不影响文件名。

---

## 7. 图片处理

直接把图片拖入文章同目录，然后在 frontmatter 中引用：
```yaml
image: cover.webp
```

文中引用：
```markdown
![](screenshot.png)
```

Mizuki 构建时会自动优化图片（转 webp、压缩）。
