# 课程内容目录（public/content/）

这里放你已有的知识网页（HTML 文件）。**放入这里的文件 = 发布到网站的课程**，
GitHub 上增删改这里的文件后 push，Vercel 会自动重新构建并发布，导航、目录和搜索索引都会自动更新。

## 目录结构（三大板块固定）

```
content/
├── basic-medicine/            基础医学
│   ├── anatomy/               解剖学
│   │   └── 心脏的形态结构与心音.html
│   ├── physiology/            生理学
│   │   └── 静息电位与动作电位.html
│   ├── biochemistry/          生物化学
│   ├── pathology/             病理学
│   ├── micro-immuno/          微生物与免疫
│   └── pharmacology/          药理学
├── diagnosis/                 诊断学
│   ├── history-taking/        问诊
│   ├── physical-examination/  体格检查
│   └── ekg/                   心电图
└── imaging/                   影像学
    ├── xray/                  X 线
    ├── ct/                    CT
    ├── mri/                   MRI
    └── ultrasound/            超声
```

- 第一层目录名固定为 `basic-medicine` / `diagnosis` / `imaging`（对应站内三个板块）。
- 第二层及更深的子文件夹**随意建**（建议用英文或拼音），子文件夹名会作为目录页上的分组标题显示。
- 文件直接放在板块根目录下也可以（会归入该板块的“其他”分组）。
- 文件名用中文没问题，例如 `第3章-心输出量.html`。

## 课程链接（URL）规则

- 文件名为 **ASCII**（字母/数字/`-._`）时，链接直接使用该文件名，例如 `/lesson/imaging/xray/chest-xray.html`，干净可读，**推荐**。
- 文件名为**中文**时，站点会自动生成一条稳定哈希链接（如 `/lesson/imaging/xray/p-e5ec15ffe5`）。
  哈希由文件路径唯一决定：不动文件则链接永远不变，可放心分享；导航、搜索、目录页里的链接全部自动对应，无需手动维护。
  想获得干净链接的话，把文件改名为英文/拼音即可（改名的瞬间旧链接失效，注意已分享出去的旧链接）。

## 每个 HTML 文件的建议

1. 写 `<title>` —— 显示在课程列表和搜索结果里（如：`解剖学 · 心脏的形态结构与心音`）。
2. 写 `<meta name="description" content="...">` —— 搜索结果的摘要文案。
3. 页面自带 `<style>` 没关系，课程页通过 iframe 加载，样式与主站隔离互不影响。
4. 页面内不要写绝对路径引用图片；如需图片，放在同级目录、用相对路径引用即可（会一并发布）。

## 添加课程的操作流程

```bash
git add public/content/
git commit -m "新增课程：xxx"
git push
```

push 后 Vercel 约 1 分钟内自动完成构建与上线。

> ⚠️ 版权提醒：只发布你有权公开的内容（自己原创/整理的笔记）。
> 避免整段复制教材原文或扫描教材图片，图片尽量用自己绘制的示意图。
