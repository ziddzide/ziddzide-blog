# Obsidian + Astro (Mizuki) 写作配置指南

## 1. 打开方式

用 Obsidian 打开**整个博客项目**作为 Vault：

```
Obsidian → Open folder as vault → 选择:
C:\Users\34688\Documents\blog\ziddzide-blog
```

> ⚠️ 模板文件夹**不能**放在 `src/content/` 里面，
> 因为 Astro 会把 `src/content/` 下所有 `.md` 文件当成文章内容来解析，
> 模板里的特殊语法会导致构建失败。所以模板放在仓库根的 `templates/`。

---

## 2. 模板配置（必做）

Obsidian 设置 → 核心插件 → 开启 **模板** → 模板文件夹位置填：

```
templates
```

---

## 3. 使用模板写文章

1. 在 `src/content/posts/` 下右键 → 新建文件夹（如 `2026-07-12-hello`）
2. 右键该文件夹 → 新建笔记 → **命名只写 `index`**（不要写 `.md`，Obsidian 会自动加）
3. 光标放最上面，`Ctrl+P` → 搜「模板」→ 插入模板 → 选 `post-template`
4. 改 `title` 和 `published` 日期，下面写正文

> ⚠️ **重点**：新建笔记时文件名只写 `index`，
> 如果写成 `index.md` 会变成 `index.md.md` 导致文章无法识别！

---

## 4. 文章文件组织

```
src/content/posts/
└── 2026-07-12-my-first-post/
    ├── index.md       ← 文章正文（文件名必须是 index.md）
    └── cover.webp     ← 封面图（可选，frontmatter 写 image: cover.webp）
```

---

## 5. 上传文章

```powershell
git add -A
git commit -m "文章标题"
git push
```

推送后等 1-2 分钟，刷新 `https://ziddzide.github.io/ziddzide-blog/` 即可看到。
