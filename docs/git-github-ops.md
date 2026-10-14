# MedHub 知识网站 · Git / GitHub 构建运维手册

> 适用项目：`medhub`（medhub.work，Next.js + Vercel + GitHub 同步）
> 目标读者：站点维护者（你自己）。所有命令均以 Windows PowerShell 为例，Git Bash / WSL 通用。
> 约定：`$` 开头的行是需要执行的命令；`#` 开头的是说明。

---

## 目录

- [0. 心智模型：三台"机器"和一条流水线](#0-心智模型)
- [1. 一次性配置（身份、密钥、客户端）](#1-一次性配置)
- [2. 日常核心工作流（最高频操作）](#2-日常核心工作流)
- [3. 查看历史与差异](#3-查看历史与差异)
- [4. 出错回滚手册（运维核心）](#4-出错回滚手册)
- [5. GitHub 平台操作（网页 + gh CLI）](#5-github-平台操作)
- [6. MedHub 运维 SOP（标准作业程序）](#6-medhub-运维-sop)
- [7. 速查表（一张表带走）](#7-速查表)
- [8. 交叉索引：命令 ↔ 项目文件 ↔ SOP](#8-交叉索引)

<a name="0-心智模型"></a>
## 0. 心智模型：三台"机器"和一条流水线

```
 你本地电脑                        GitHub（云端仓库）              Vercel（云平台）
┌──────────────────────┐  push  ┌──────────────────┐  push 触发  ┌─────────────────┐
│ E:\Temp\auto table\  │ ─────▶ │ github.com/你/   │ ─────────▶ │ 自动构建        │
│ medhub/              │  pull  │ medhub (main)    │            │ medhub.work     │
│ └─ .git/ (版本历史)  │ ◀───── │  ← 唯一权威源    │            │  (粉丝访问)     │
└──────────────────────┘        └──────────────────┘            └─────────────────┘
        │  npm run dev                                           
        └──▶ 本地预览 http://localhost:3000（只有你自己看）
```

四个必须内化的概念：

| 概念 | 一句话解释 | 在本项目里 |
|---|---|---|
| **工作区** | 你能直接编辑的普通文件夹 | `public/content/` 里的 HTML、`app/` 里的代码 |
| **暂存区（staging）** | `git add` 后、`commit` 前的"待提交清单" | `git status` 里绿色的 `Changes to be committed` |
| **本地仓库（.git）** | 完整的历史快照库，纯本地，不联网 | `medhub\.git\` 目录，删了它就丢了未推送的历史 |
| **远程仓库（origin）** | GitHub 上的副本，是 Vercel 的部署源 | `git remote -v` 可看到地址 |

**核心纪律：GitHub 仓库是唯一权威内容源。** 本地删了没提交的文件、Vercel 上直接改的东西（其实改不了），都不算数。任何要上线的内容，必须先进仓库。

---

<a name="1-一次性配置"></a>
## 1. 一次性配置（身份、密钥、客户端）

> 本章只做一次。完成后用第 2.0 节的"体检命令"验证。

### 1.1 提交身份（谁署名的）

```powershell
# 查看当前配置（--list 列出全部，--show-origin 显示来自哪个配置文件）
git config --list --show-origin

# 设置全局身份（所有仓库共用；本机上已经设置过，显示 Paul / 1271968029@qq.com）
git config --global user.name "Paul"
git config --global user.email "1271968029@qq.com"

# 只想对 medhub 这一个仓库用不同身份（会写入 medhub\.git\config，优先级高于全局）
cd "E:\Temp\auto table\medhub"
git config user.name "MedHub Admin"
git config user.email "medhub@example.com"
```

> 身份只影响提交记录里的署名，**不影响** GitHub 登录。GitHub 网页上提交记录能关联到你的账号，靠的是 email 匹配或 SSH key 匹配。

### 1.2 生成 SSH 密钥（推荐，免密码推送）

```powershell
# 1) 生成密钥对（一路回车即可；-C 是注释，一般填你的 GitHub 邮箱）
ssh-keygen -t ed25519 -C "1271968029@qq.com"

# 2) Windows 上把公钥加入 ssh-agent（管理员模式，只做一次）
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add

# 3) 查看公钥内容（.pub 是公钥，可以公开；私钥 id_ed25519 永远不要给任何人）
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

然后把**公钥全文**添加到 GitHub：
1. 打开 `https://github.com/settings/keys` → **New SSH key**
2. Title 随意（如 `windows-medhub`），Key 粘贴公钥 → Add key
3. 测试：

```powershell
ssh -T git@github.com
# 成功提示：Hi 你的用户名! You've successfully authenticated, but GitHub does not provide shell access.
# （第一次连接会问 whether to continue connecting (yes/no [f])，输入 yes）
```

### 1.3 备选：HTTPS + 个人访问令牌（PAT）

如果不想配 SSH，可以走 HTTPS。**注意：GitHub 自 2021 年起不接受账号密码**，必须用 PAT。

1. `https://github.com/settings/tokens` → **Generate new token (classic)**
2. 勾选 `repo` 权限 → Generate → 复制令牌（只显示一次）
3. 首次 `git push` 时：用户名填 GitHub 用户名，**密码栏填令牌**。
   Windows 的 Git Credential Manager 会自动记住，之后不再询问。

### 1.4 体检命令（每次换电脑 / 怀疑配置坏了就跑一遍）

```powershell
cd "E:\Temp\auto table\medhub"
git config user.name          # ① 有身份
git remote -v                 # ② 有远程地址（还没配 remote 时为空）
git ls-remote origin          # ③ 能连上 GitHub（列出远程分支；失败=网络/密钥问题）
git status -s                 # ④ 工作区状态正常
```

---

<a name="2-日常核心工作流"></a>
## 2. 日常核心工作流（最高频操作）

### 2.1 每日循环（记住这 4 条命令就够）

```powershell
cd "E:\Temp\auto table\medhub"
git status -s            # ① 看：哪些文件变了
git add <文件或目录>      # ② 挑：把要提交的放进暂存区
git commit -m "说明"     # ③ 定：写成一个版本快照
git push                 # ④ 发：推到 GitHub → Vercel 自动上线
```

### 2.2 完整实例：发布一门新课程

场景：你整理好了《生物化学·糖酵解》的 HTML 笔记，要上线。

```powershell
cd "E:\Temp\auto table\medhub"

# ① 把文件放进正确位置（用资源管理器拖进去，或）
#    目标：public\content\basic-medicine\biochemistry\糖酵解.html
#    （biochemistry 子文件夹不存在就新建；命名规范见 public\content\README.md）

# ② 查看状态，确认新文件出现（?? = 未跟踪的新文件）
git status -s
# ?? public/content/basic-medicine/biochemistry/糖酵解.html

# ③ 加入暂存区（可以精确到文件，也可以整个目录）
git add public/content/basic-medicine/biochemistry/糖酵解.html
# 或 git add public/content/          # 把 content 下所有变更都暂存
# 或 git add .                        # 整个项目所有变更（确认无误时用）

# ④ 提交（信息写清楚：做了什么 + 影响什么）
git commit -m "新增课程：生物化学·糖酵解"

# ⑤ 推送
git push

# ⑥ 验证：
#    - 打开 vercel.com → 项目 → Deployments：约 1 分钟内出现新部署（绿色）
#    - 访问 https://medhub.work/course/basic-medicine，新条目出现
#    - 站内搜索应能搜到（搜"糖酵解"）
```

### 2.3 关于 `git add` 的三个粒度

| 命令 | 含义 | 何时用 |
|---|---|---|
| `git add 具体文件.html` | 只暂存这一个文件 | 日常最稳，推荐默认 |
| `git add public/content/` | 暂存该目录全部变更 | 一次加多门课 |
| `git add .` | 暂存当前目录及子目录全部变更 | 确认没有无关文件时 |
| `git add -p` | 逐块（hunk）审阅并选择暂存 | 一个文件里既有想提交的也有不想要的小改动 |

### 2.4 拉取远端更新（pull）——多设备/网页编辑时必做

场景 A：你在手机/网页上直接编辑过仓库文件，回家继续改 → 先 `pull` 再改，避免冲突。
场景 B：换了新电脑 clone 下来 → 首次已经是最新，不需要 pull。
场景 C：只有一个设备且从不网页编辑 → 可以不用，但养成习惯没有坏处。

```powershell
git pull --rebase        # 拉取并变基：把你的本地提交"接在"远端最新提交之后
# 等价于：git fetch + git rebase origin/main
```

> 如果 pull 时报冲突（conflict）：打开冲突文件，会看到 `<<<<<<<` / `=======` / `>>>>>>>` 三段标记，手动保留要的内容、删掉标记，再 `git add 该文件` → `git rebase --continue`。
> 本项目单人维护 + 内容是独立 HTML 文件，冲突概率极低（同一文件两边都改才会冲突）。

### 2.5 GitHub 网页端编辑（等价于 push）

不装工具时的备用通道：
1. `https://github.com/你/medhub` → 点进 `public/content/...` → 点文件名
2. 右上 **pencil 图标** 直接编辑，或 **+** 号 **Upload files**（可拖拽多个文件）
3. 底部 **Commit changes** → 完成，等同于本地 `commit + push`，Vercel 照常自动部署

> 网页端适合小改（错别字、一句话）；批量添加文件用本地 + `git add` 更可控。

---

<a name="3-查看历史与差异"></a>
## 3. 查看历史与差异

### 3.1 看提交历史

```powershell
git log --oneline            # 每行一条：哈希 + 信息（最常用）
git log --oneline -10        # 最近 10 条
git log --graph --oneline --decorate   # 图形化 + 分支标签
git log --oneline -- public/content/imaging/    # 只看某目录的历史
git log -p -- "public/content/basic-medicine/anatomy/心脏的形态结构与心音.html"  # 看某文件历次改动的全文
git show <哈希>              # 看某次提交改了什么（diff 全文）
git show --stat <哈希>       # 只看某次提交改了哪些文件
```

GitHub 网页对应位置：仓库主页 **Commits** 按钮；任意文件页的 **History** 按钮；点某次提交看 diff。

### 3.2 看当前差异（提交前自查，防手滑）

```powershell
git diff                 # 工作区 vs 暂存区（改了但还没 add 的）
git diff --cached        # 暂存区 vs 上次提交（add 了还没 commit 的）
git diff HEAD            # 工作区+暂存区 vs 上次提交（"我这一轮总共改了啥"，提交前看这个）
git status -s            # 状态总览（一行一个文件）
```

**推荐习惯：`commit` 前永远先 `git diff HEAD --stat` 扫一眼改动面。**

### 3.3 分支（本项目暂不需要，但要知道）

```powershell
git branch               # 本地分支（当前分支前缀 *）
git branch -a            # 含远程分支
git switch feature-x     # 新建并切换到分支
git switch main          # 切回主分支
git merge feature-x      # 在 main 上合并 feature-x
git branch -d feature-x  # 合并后删除
```

本项目建议：**日常内容更新全部直接在 `main` 上**（单人、静态内容、Vercel 监听 main）。
只有大改版（如换主题、改页面结构）才开分支，在 Vercel 里还能创建 *Preview Deployment* 预览分支效果，满意后再合并进 main。

---

<a name="4-出错回滚手册"></a>
## 4. 出错回滚手册（运维核心）

按"错误发生在哪一步"选对应操作。**先判断错误是否已 push**：未 push 的随便修，已 push 的只许"反向提交"，不许改写历史。

### 4.1 还没 commit：改动还在工作区

```powershell
# 丢弃某文件的本地修改（文件回到上次提交状态；危险：改没了就没了，除非 reflog 能救）
git restore 文件名.html              # 新写法
git checkout -- 文件名.html          # 老写法，等价

# 取消暂存（文件已 add 了，先退回暂存区，改动还在文件里）
git restore --staged 文件名.html
git reset 文件名.html                # 老写法，等价
```

### 4.2 已 commit、未 push：本地撤销

```powershell
git reset --soft  HEAD~1    # 撤销提交，改动全部保留在暂存区（最常用：信息写错了/少加了文件）
git reset --mixed HEAD~1    # 撤销提交，改动退回工作区（默认行为）
git reset --hard  HEAD~1    # 撤销提交且丢弃改动（危险！确认不要了再用）
git reset --hard <某个哈希>  # 回到任意历史版本（危险：之后该版本之上的本地提交丢失，reflog 可救）
```

> 三个模式的唯一区别是"改动放哪"：`--soft`→暂存区，`--mixed`→工作区，`--hard`→直接删。

### 4.3 已 push：安全回滚（唯一正确姿势）

```powershell
git log --oneline -5          # 找到要回滚的提交哈希
git revert <哈希>              # 生成一个"反向提交"，把那次改动抵消掉
git push                       # 推上去，Vercel 自动重新部署回旧版
```

> 为什么不用 `reset --hard` + `push --force` 改历史？
> 本项目单人维护其实可以 force，但**粉丝/设备缓存过的链接对应的部署历史会被改写**，且一旦未来有人协作，force 会把别人的提交冲掉。养成 `revert` 习惯，永不吃亏。

### 4.4 本项目最高频的三个回滚场景

| 场景 | 操作 |
|---|---|
| 课程上线后发现内容写错，要**撤下这门课** | 删文件：`git rm "public/content/.../某课.html"` → `git commit -m "下线课程：某课（内容勘误中）"` → `git push`。旧链接变 404（首页已配好 404 引导页） |
| 上次提交把课程 A 的改动误伤了课程 B，要**只回滚课程 B** | `git restore --source=<上上次提交的哈希> "public/content/.../B.html"` → `git add ...` → `git commit -m "恢复课程B到正确版本"` → `git push` |
| 提交信息写错 / 少加了一个文件（**未 push**） | `git add 漏掉的文件` → `git commit --amend`（把新内容并进上一条提交）；再 `git push` |

### 4.5 删错了仓库 / 提交错了敏感文件

- **删了整个 GitHub 仓库**：90 天内发邮件 `support@github.com` 可申请恢复备份；而且**本地的 `.git` 目录只要没删，所有未推送的历史都在**，重新建远程仓库 push 即可。
- **把不该提交的文件（如密钥）提交过**：
  1. `git rm --cached 该文件`（停止跟踪，本地保留）→ 加入 `.gitignore` → commit + push（文件以后不再进仓库，但**历史里仍在**）。
  2. 如果历史里的是真密钥：立即在对应平台**作废重发**该密钥；需要彻底清除历史时再用 `git filter-repo`（重写历史，需所有协作者重新 clone，本项目单人可用）。

### 4.6 时间机器：`git reflog`

```powershell
git reflog                 # 列出 HEAD 的每一次移动（含 reset、revert、checkout）
git reflog | Select-String "HEAD@{2}"
git reset --hard <reflog里的哈希>   # 回到"手滑之前"的任意状态
```

> 只要本地 `.git` 还在，`reflog` 里的东西都救得回来（默认保留约 90 天）。

---

<a name="5-github-平台操作"></a>
## 5. GitHub 平台操作（网页 + gh CLI）

### 5.1 仓库创建（首次）

**网页**：`github.com` → 右上 **+** → **New repository** → 名字 `medhub` → 选 Public 或 Private → **不要勾选** Add README / .gitignore / license（本地仓库已有这些文件，勾了会导致首次 push 需要先 pull 合并）。

**CLI（装过 gh 后更省事）**：

```powershell
# 安装 gh（GitHub 官方命令行）
winget install cli.cli

# 登录（按提示在浏览器里授权）
gh auth login

# 在本地仓库目录内，一条命令建远程仓库并推送（自动建仓库）
cd "E:\Temp\auto table\medhub"
gh repo create medhub --public --source=. --push
# 之后等价于手动：git remote add origin git@github.com:你/medhub.git && git push -u origin main
```

> 已手动配好 `git remote` 的话，直接 `git push -u origin main` 即可；`-u` 让以后 `git push` / `git pull` 省略参数。

### 5.2 克隆到新设备（首次）

```powershell
# 从 GitHub 拉一份完整副本（含全部历史）
git clone git@github.com:你/medhub.git
# 或 HTTPS：git clone https://github.com/你/medhub.git

cd medhub
npm install        # 安装依赖（node_modules 不进仓库，每台机器自己装）
npm run dev        # 本地预览 http://localhost:3000
```

### 5.3 常用 gh CLI 命令（可选，提效）

```powershell
gh repo list                       # 列出你的仓库
gh repo view                       # 查看当前仓库信息
gh run list                        # 查看 GitHub Actions 运行记录（本项目一般用不到）
gh pr list / gh pr create          # 分支协作时用
gh release create v1.0 -t "v1.0"   # 发布 Release（见 5.4）
```

> **概念区分**：Vercel 的自动部署**不是** GitHub Actions。push 后的构建日志在 vercel.com → 项目 → Deployments 里看，不在 GitHub 里看。

### 5.4 版本标签（给内容打"里程碑"）

适合在"示例课清空、正式课程批量上线"这类节点打标签，方便日后 `git checkout v1.0` 找回那一版。

```powershell
git tag -a v1.0 -m "正式课程上线"
git push origin v1.0
git tag                # 列出本地标签
git checkout v1.0      # 进入"只读"的标签版本查看文件（detached HEAD）
git switch main        # 回到工作分支
```

### 5.5 关于 `.gitattributes`（可选，消除 CRLF 警告）

本项目在 Windows 上提交时会看到 `LF will be replaced by CRLF` 警告——只是换行符风格提示，不影响运行。想消除警告，在仓库根目录建 `.gitattributes`：

```
* text=auto
```

### 5.6 GitHub 仓库设置里值得看一眼的（Settings 标签页）

| 设置项 | 建议 |
|---|---|
| **General → Visibility** | Public（粉丝可看源码和更新记录，传播友好）/ Private（仅自己，Vercel 照样能部署） |
| **Branches → Add rule**（分支保护） | 单人可不设；若开启：要求 PR 合并 + 禁止 force push |
| **Actions** | 本项目用不到，可不动 |
| **Insights → Traffic** | 看访问来源（粉丝从哪个平台点进来），对运营有参考价值 |

---

<a name="6-medhub-运维-sop"></a>
## 6. MedHub 运维 SOP（标准作业程序）

> 每个 SOP 固定四段：**触发场景 / 操作 / 验证 / 回退**。涉及的文件都在 `E:\Temp\auto table\medhub\` 下。

### SOP-1 发布新课程

- **触发**：整理好一门新课的 HTML。
- **操作**：
  1. 放入 `public\content\<栏目>\<学科>\<课程名>.html`（栏目目录名固定：`basic-medicine` / `clinical-medicine`；学科目录名见 [public/content/README.md](../public/content/README.md)。学科知识库更新时直接用 `node scripts/sync-kb.mjs` 一键同步）。
  2. 文件内必须有 `<title>`（列表与搜索显示用）和 `<meta name="description">`（搜索摘要）。
  3. `git add public/content/` → `git commit -m "新增课程：xxx"` → `git push`。
- **验证**：Vercel Deployments 出现绿色新部署；`/course/<板块>` 出现新条目（计数 +1）；站内搜索能命中。
- **回退**：SOP-3（下线课程）。

### SOP-2 勘误已上线课程

- **触发**：粉丝反馈/自查发现内容错误。
- **操作**：直接编辑 `public\content\...\某课.html` → `git diff HEAD --stat` 自查 → `git commit -m "勘误：xxx"` → `git push`。
- **验证**：刷新课程页（iframe 加载的就是这个文件，改完即生效）；必要时 `Ctrl+F5` 强刷。
- **回退**：`git revert <本次哈希>` → `git push`（见 §4.3）。

### SOP-3 下线课程

- **触发**：课程版权存疑 / 内容过时 / 临时撤下。
- **操作**：
  ```powershell
  git rm "public/content/.../某课.html"
  git commit -m "下线课程：某课（原因）"
  git push
  ```
- **验证**：课程页 URL 返回 404（自动显示引导页）；目录与搜索中消失。
- **回退**：`git checkout <下线前的哈希> -- "public/content/.../某课.html"` → commit → push，课程恢复（URL 不变，哈希链接是文件路径决定的）。

### SOP-4 回滚整个站点到上一版

- **触发**：大批量更新后发现页面结构出问题（如误改了 `app/` 下的代码）。
- **操作**：
  ```powershell
  git log --oneline -5                 # 确认要回到哪个提交
  git revert <目标哈希>                 # 或连续 revert 多次
  git push
  ```
- **验证**：Vercel 新部署完成；全站抽查首页/板块/课程/搜索。
- **回退**：`git revert <revert提交的哈希>`（revert 的 revert = 恢复）。

### SOP-5 重命名课程文件（换 URL）

- **触发**：把中文文件名改成英文/拼音以获得干净 URL（见 [content README](../public/content/README.md) 的 URL 规则）。
- **操作**：
  ```powershell
  git mv "public/content/imaging/xray/胸部X线正位片读片要点.html" "public/content/imaging/xray/chest-xray-pa.html"
  git commit -m "重命名：胸部X线正位片读片要点 → chest-xray-pa（干净URL）"
  git push
  ```
- **验证**：新 URL 可访问；旧 URL 404。**先告知已分享过旧链接的粉丝**（或旧链接别改）。
- **回退**：`git mv` 回来 + commit + push。

### SOP-6 更换电脑 / 新设备接入

- **触发**：换电脑、重装系统、借设备改东西。
- **操作**：
  ```powershell
  git clone git@github.com:你/medhub.git
  cd medhub
  npm install
  npm run dev        # 开发预览（改完代码自动热更新）
  # 或生产预览：
  npm run build && npm run start    # http://localhost:3000
  ```
- **验证**：`git log --oneline -3` 与 GitHub 一致；本地 `:3000` 页面正常。
- **注意**：新设备先按 §1 配身份与 SSH key。

### SOP-7 排查"为什么线上没更新"

按顺序检查：

1. `git status -s` → 文件是不是**忘了 add**？
2. `git log --oneline -1` 与 GitHub 网页 Commits 是否一致 → 是不是**忘了 push**？
3. vercel.com → Deployments → 最新部署状态：
   - **Building** → 正常，等 1 分钟
   - **Errored** → 点进去看 Build 日志（常见：某 HTML 放错目录、package.json 被误改）
   - **绿色但页面没变** → 浏览器缓存，`Ctrl+F5`；或 Vercel 边缘缓存，等 1-2 分钟
4. 本地复现线上行为：`npm run build && npm run start`，本地也旧 → 问题在仓库；本地新线上旧 → 问题在部署环节。

### SOP-8 发布前内容审计（push 前 30 秒 checklist）

- [ ] 文件放对了栏目/学科目录？（`basic-medicine/` 或 `clinical-medicine/` 下的对应学科）
- [ ] 内容属于**基础医学 6 学科 / 诊断学 / 医学影像学**范围？
- [ ] 内容是自己有权公开的？（无整段教材原文 / 无扫描教材图）
- [ ] `<title>` 和 `<meta description>` 写了？
- [ ] 页内图片用了相对路径且已随文件一起 add？
- [ ] `git diff HEAD --stat` 扫过改动面，没有夹带无关文件？

---

<a name="7-速查表"></a>
## 7. 速查表（一张表带走）

| # | 我要… | 命令 |
|---|---|---|
| 1 | 看哪些文件变了 | `git status -s` |
| 2 | 加文件到暂存区 | `git add <文件/目录>`（或 `git add .`） |
| 3 | 提交 | `git commit -m "说明"` |
| 4 | 推送到 GitHub（上线） | `git push` |
| 5 | 拉取远端更新 | `git pull --rebase` |
| 6 | 看本轮总改动 | `git diff HEAD --stat` |
| 7 | 丢弃某文件的本地修改 | `git restore <文件>` |
| 8 | 取消某文件的暂存 | `git restore --staged <文件>` |
| 9 | 提交信息写错了（未 push） | `git commit --amend` |
| 10 | 撤销本地上次提交 | `git reset --soft HEAD~1` |
| 11 | 回滚已上线的错误提交 | `git revert <哈希>` + `git push` |
| 12 | 取回历史某版文件 | `git restore --source=<哈希> <文件>` |
| 13 | 重命名文件并跟踪 | `git mv 旧 新` |
| 14 | 删除文件并跟踪 | `git rm <文件>` |
| 15 | 停止跟踪但保留本地 | `git rm --cached <文件>`（再写进 .gitignore） |
| 16 | 看历史 | `git log --oneline` / `git log -p -- <文件>` |
| 17 | 救命（reflog） | `git reflog` → `git reset --hard <哈希>` |
| 18 | 看远程配置 | `git remote -v` |
| 19 | 测 GitHub 连通 | `git ls-remote origin` |
| 20 | 克隆到新设备 | `git clone <仓库地址>` + `npm install` |

---

<a name="8-交叉索引"></a>
## 8. 交叉索引

### 8.1 项目文件 ↔ 最常触碰它的 git 操作

| 项目文件 | 日常操作 | 对应 SOP / 章节 |
|---|---|---|
| `public/content/**/*.html` | `add` / `commit` / `push` / `rm` / `mv` / `restore` | SOP-1~5；§2、§4 |
| `public/content/README.md` | 命名与 URL 规则（只读参考） | SOP-1；§8.3 |
| `app/**`（页面代码） | 一般不动；大改版走分支 + revert 回滚 | SOP-4、§3.3、§4.3 |
| `lib/site.ts` | 改板块配置 / 文案（低频，改完全站生效） | SOP-4（回滚） |
| `scripts/build-search-index.mjs` | 搜索索引逻辑（低频） | SOP-7（部署报错排查） |
| `package.json` + `package-lock.json` | `npm install <包>` 后**两个文件都要 commit** | §2.3 |
| `.gitignore` | 新增忽略规则（如临时文件） | §4.5 |
| `README.md` | 项目说明文档 | — |
| `.git/`（隐藏目录） | 永远不要手动编辑 / 删除 | §4.6 |

### 8.2 运维场景 ↔ 命令 ↔ 章节

| 场景 | 关键命令 | 章节 |
|---|---|---|
| 新课上线 | `add` → `commit` → `push` | §2.2、SOP-1 |
| 改错字 | 编辑 → `commit` → `push` | SOP-2 |
| 课程撤下 | `git rm` → `commit` → `push` | SOP-3 |
| 线上出错回滚 | `git revert <哈希>` → `push` | §4.3、SOP-4 |
| 取回历史文件 | `git restore --source=<哈希>` | §4.4 |
| 换文件名 | `git mv` | SOP-5 |
| 换电脑 | `clone` + `npm install` | SOP-6 |
| 线上没更新 | `status` → `log` → Vercel Deployments → 本地 build | SOP-7 |
| 手滑删错 | `git reflog` → `reset --hard` | §4.6 |
| 敏感文件入库 | `rm --cached` + `.gitignore` + 作废密钥 | §4.5 |

### 8.3 与项目内其他文档的关系

| 文档 | 关系 |
|---|---|
| 仓库根 [README.md](../README.md) | 站点总览 + Vercel/域名首次部署步骤（本手册不重复） |
| [public/content/README.md](../public/content/README.md) | 内容目录结构、命名、URL 哈希规则（本手册 SOP-1/5 引用它） |
| 本手册 | git/GitHub 命令与运维流程（本文档） |

---

*手册版本 v1 · 随项目仓库分发。更新命令或流程后，请一并提交本文件。*
