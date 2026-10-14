# MedHub · medhub.work

面向医学生与医学爱好者的基础医学知识库网站。

- **技术栈**：Next.js（App Router，TypeScript）+ 纯 CSS，部署在 **Vercel**
- **内容形态**：你已有的 HTML 知识网页，放进 `public/content/` 即自动发布（iframe 加载，样式互不干扰）
- **收录范围（固定）**：🧬 基础医学 / 🩺 诊断学 / 🩻 影像学；内、外、妇、儿、皮肤、耳鼻喉等临床各科待后续更新
- **功能**：首页课程卡片、板块目录页、课程阅读页、全站关键词搜索（构建时生成索引，纯前端，零后端成本）
- **同步机制**：GitHub 仓库为唯一内容源，`git push` → Vercel 自动构建发布

## 目录结构

```
medhub/
├── app/                      站点页面（首页/板块/课程/搜索/404）
│   ├── layout.tsx            全站导航与页脚（含免责声明）
│   ├── page.tsx              首页
│   ├── course/[category]/    板块目录页
│   ├── lesson/[...slug]/     课程页（iframe 加载你的 HTML）
│   └── search/               站内搜索
├── lib/
│   ├── site.ts               站点信息与三大板块配置（改板块在这里）
│   └── lessons.ts            构建期扫描 public/content/ 生成课程清单
├── scripts/
│   └── build-search-index.mjs  构建期生成 public/search-index.json
└── public/content/           ★ 课程 HTML 放这里（见该目录内 README）
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建（prebuild 会自动生成搜索索引）
```

## 日常内容更新流程（GitHub 同步）

1. 把新的 HTML 课程页放入 `public/content/<板块>/<子分类>/`（中文文件名可以）。
2. 提交并推送：
   ```bash
   git add public/content/
   git commit -m "新增课程：xxx"
   git push
   ```
3. Vercel 检测到 push 后自动重新构建（约 1 分钟），新内容上线，导航计数与搜索索引同步更新。
4. 删除课程同理：删文件 → push 即下线（课程页会 404）。

> 在 GitHub 网页上直接编辑/拖传文件效果相同（等同于 push）。

## 首次部署到 Vercel

1. 在 GitHub 新建仓库（建议 **Public**，便于粉丝查看源码与内容更新记录；内容敏感可选 Private），推送本项目。
2. 登录 [vercel.com](https://vercel.com) → **Add New → Project** → 导入该仓库。
   - Framework Preset 会自动识别为 **Next.js**，Build Command / Output 保持默认即可。
3. 部署完成后会得到一个 `xxx.vercel.app` 临时地址，先验收一遍。
4. 绑定域名：项目 **Settings → Domains** 添加 `medhub.work` 与 `www.medhub.work`，
   然后到域名注册商处添加 Vercel 提示的解析记录：
   - `@`（根域名）：A 记录 → `76.76.21.21`
   - `www`：CNAME → `cname.vercel-dns.com`
   - 解析生效后 Vercel 自动签发 HTTPS 证书（一般几分钟到 1 小时）。

## 内容合规提醒

- 只发布你有权公开的内容（原创/自行整理的笔记）；避免整段复制教材原文或扫描教材图片。
- 页脚已内置医学免责声明与收录范围声明；请勿上传超出“基础医学/诊断学/影像学”范围的内容。
