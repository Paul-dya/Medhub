import fsSync from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * 知识库同步脚本：把工作区里各学科"最终成品 HTML"复制到 MedHub 站点内容目录。
 *
 * 用法（在 medhub 目录下）：
 *   node scripts/sync-kb.mjs
 * 然后 git add/commit/push，Vercel 自动发布。
 *
 * 规则：
 * - 每个源文件夹取"根目录下、不以 _ 开头、体积最大的 .html"作为最终成品
 *   （以 _ 开头的都是构建片段，不发布）。
 * - 按 sha256 比对，内容没变则跳过，重复运行安全。
 * - 源目录位于 medhub 的同级目录（工作区根目录），如结构变化请改下方 WORKSPACE/MAP。
 */

const ROOT = process.cwd(); // medhub 根目录
const WORKSPACE = path.resolve(ROOT, '..'); // 工作区根目录
const CONTENT_DIR = path.join(ROOT, 'public', 'content');

/** 学科知识库文件夹 → 站点内容目录 的映射 */
const MAP = [
  { folder: '21_生理学_知识网页', to: 'basic-medicine/physiology' },
  { folder: '20_病理学_知识网页', to: 'basic-medicine/pathology' },
  { folder: '17_生物化学知识网页', to: 'basic-medicine/biochemistry' },
  { folder: '16_医学免疫学知识网页', to: 'basic-medicine/micro-immuno' },
  { folder: '15_药理学知识网页', to: 'basic-medicine/pharmacology' },
  { folder: '14_诊断学知识网页', to: 'clinical-medicine/diagnosis' },
  { folder: '18_医学影像学知识网页', to: 'clinical-medicine/imaging' },
];

async function main() {
  let updated = 0;
  for (const m of MAP) {
    const srcDir = path.join(WORKSPACE, m.folder);
    const destDir = path.join(CONTENT_DIR, m.to);
    let entries;
    try {
      entries = await fs.readdir(srcDir, { withFileTypes: true });
    } catch {
      console.log(`[skip] ${m.folder}: 文件夹不存在`);
      continue;
    }
    const cands = [];
    for (const e of entries) {
      if (e.isFile() && !e.name.startsWith('_') && e.name.toLowerCase().endsWith('.html')) {
        const st = await fs.stat(path.join(srcDir, e.name));
        cands.push({ name: e.name, size: st.size });
      }
    }
    if (!cands.length) {
      console.log(`[skip] ${m.folder}: 未找到成品 HTML`);
      continue;
    }
    cands.sort((a, b) => b.size - a.size);
    const pick = cands[0];
    const srcFile = path.join(srcDir, pick.name);
    await fs.mkdir(destDir, { recursive: true });
    const destFile = path.join(destDir, pick.name);

    const srcHash = crypto
      .createHash('sha256')
      .update(await fs.readFile(srcFile))
      .digest('hex');
    if (fsSync.existsSync(destFile)) {
      const dstHash = crypto
        .createHash('sha256')
        .update(await fs.readFile(destFile))
        .digest('hex');
      if (srcHash === dstHash) {
        console.log(`[ok]   ${m.folder}/${pick.name} -> ${m.to}/ (未变化)`);
        continue;
      }
    }
    await fs.copyFile(srcFile, destFile);
    console.log(
      `[sync] ${m.folder}/${pick.name} (${(pick.size / 1024 / 1024).toFixed(2)} MB) -> public/content/${m.to}/${pick.name}`,
    );
    updated++;
  }
  console.log(`[sync-kb] 完成：更新 ${updated} 个，未变化 ${MAP.length - updated} 个`);
}

main();
