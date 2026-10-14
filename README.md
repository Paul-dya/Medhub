# MedHub · medhub.work

面向医学生与医学爱好者的医学知识库网站。

- **技术栈**：Next.js（App Router，TypeScript）+ 纯 CSS，部署在 **Vercel**
- **内容形态**：自制的学科可视化知识网页（自包含 HTML），放进 `public/content/` 即发布（iframe 加载，样式脚本互不干扰）
- **栏目结构（main 分支已发布）**：
  - 🧬 **基础医学**：病理学 / 微生物与免疫 / 药理学
  - 🩻 **临床医学**：诊断学 / 医学影像学
  - 完整版 8 学科（另含解剖学、生理学、生物化学）保存在仓库 `full` 分支，不上站点
- **功能**：首页栏目卡片、学科目录页、课程阅读页、全站关键词搜索（构建时生成索引，纯前端，零后端成本）、右下角小红书主页角标
- **同步机制**：GitHub 仓库为唯一内容源，`git push` → Vercel 自动构建发布；学科知识库用 `node scripts/sync-kb.mjs` 从工作区一键同步

## 目录结构

```
medhub/
├── app/                      站点页面（首页/栏目/课程/搜索/404）
│   ├── layout.tsx            全站导航与页脚（含免责声明、小红书角标）
│   ├── page.tsx              首页
│   ├── course/[category]/    栏目目录页（按学科分组）
│   ├── lesson/[...slug]/     课程页（iframe 加载你的 HTML）
│   └── search/               站内搜索
├── lib/
│   ├── site.ts               站点信息、两大栏目与学科配置、小红书链接（改栏目/角标在这里）
│   └── lessons.ts            构建期扫描 public/content/ 生成课程清单
├── scripts/
│   ├── build-search-index.mjs  构建期生成 public/search-index.json
│   └── sync-kb.mjs             从工作区编号文件夹同步学科知识库成品
└── public/content/           ★ 课程 HTML 放这里（见该目录内 README）
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建（prebuild 会自动生成搜索索引）
```

## 日常内容更新流程（GitHub 同步）

1. 学科知识库更新后，同步成品页到站点：
   ```bash
   node scripts/sync-kb.mjs    # 增量同步，未变化的自动跳过
   ```
   （也可以直接把 HTML 放进 `public/content/<栏目>/<学科>/`，规则见 [public/content/README.md](public/content/README.md)）
2. 提交并推送：
   ```bash
   git add public/content/
   git commit -m "同步知识库：更新 xxx"
   git push
   ```
3. Vercel 检测到 push 后自动重新构建（约 1 分钟），新内容上线，导航计数与搜索索引同步更新。
4. 删除课程同理：删文件 → push 即下线（课程页会 404）。

> 在 GitHub 网页上直接编辑/拖传文件效果相同（等同于 push）。
> 完整命令手册见 [docs/git-github-ops.md](docs/git-github-ops.md)。

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
- 页脚已内置医学免责声明；栏目范围固定为基础医学 6 学科 + 诊断学 + 医学影像学。
