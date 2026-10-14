# 课程内容目录（public/content/）

这里放课程 HTML 文件。**放入这里的文件 = 发布到网站的课程**，
GitHub 上增删改这里的文件后 push，Vercel 会自动重新构建并发布，导航、目录和搜索索引都会自动更新。

## 目录结构（两大栏目固定）

```
content/
├── basic-medicine/            基础医学
│   ├── anatomy/               解剖学（暂无完整知识库，现有一门占位示例课）
│   ├── physiology/            生理学
│   ├── biochemistry/          生物化学
│   ├── pathology/             病理学
│   ├── micro-immuno/          微生物与免疫（现为医学免疫学完整知识库）
│   └── pharmacology/          药理学
└── clinical-medicine/         临床医学
    ├── diagnosis/             诊断学
    └── imaging/               医学影像学
```

- 第一层目录名固定为 `basic-medicine` / `clinical-medicine`（对应站内两大栏目）。
- 第二层目录名固定为 6 个基础学科 + `diagnosis` / `imaging`（目录页上的分组标题自动显示中文）。
- 课程页直接放在第二层目录下，文件名即课程名（中文名可以，URL 自动生成稳定哈希链接，见下方规则）。

## 从工作区知识库同步（推荐流程）

各学科的**最终成品 HTML** 都在工作区根目录的编号文件夹里（`21_生理学_知识网页`、`20_病理学_知识网页`……）。
学科知识库更新后，在 medhub 目录执行：

```bash
node scripts/sync-kb.mjs
```

脚本规则：
- 取每个编号文件夹**根目录下、不以 `_` 开头、体积最大的 .html**（以 `_` 开头的都是构建片段，不发布）。
- 按 sha256 比对，内容没变化自动跳过，可重复运行。
- 以后新增学科（例如做完了解剖学知识库），把映射加进 `scripts/sync-kb.mjs` 的 `MAP` 数组即可。

同步完提交推送：

```bash
git add public/content/
git commit -m "同步知识库：更新 xxx"
git push
```

push 后 Vercel 约 1 分钟自动上线。

## 手动添加/更新单个课程

1. 把 HTML 放进对应学科目录（`basic-medicine/<学科>/` 或 `clinical-medicine/<diagnosis|imaging>/`）。
2. 页面建议含 `<title>`（显示在课程列表与搜索结果）；`<meta name="description">` 可选（搜索摘要）。
3. 页面自带的 `<style>`/`<script>` 没关系——课程页通过 iframe 加载，与主站样式、脚本完全隔离。
4. 页内引用图片/JS 用**相对路径**，把资源文件放在同目录一并提交即可。
5. `git add/commit/push` 上线；删文件即下线（旧链接变 404）。

## 课程链接（URL）规则

- 文件名为 **ASCII**（字母/数字/`-._`）时，链接直接用文件名，干净可读。
- 文件名为**中文**时，站点自动生成稳定哈希链接（如 `/lesson/basic-medicine/pathology/p-xxxx`）。
  哈希由文件路径唯一决定：文件不动则链接永不变，导航、搜索、目录页全部自动对应。
  想让链接干净就把文件改名成英文/拼音（改名瞬间旧链接失效，注意已分享的链接）。

> ⚠️ 版权提醒：只发布你有权公开的内容。本站页面为自制整理笔记，请勿整段复制教材原文或扫描教材图片。
