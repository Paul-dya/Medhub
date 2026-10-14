import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

/**
 * 构建时脚本：扫描 public/content/ 下所有 .html 课程页，
 * 生成 public/search-index.json 供站内搜索使用。
 * 在 `next build` 之前由 package.json 的 prebuild 自动执行。
 */

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'public', 'content');
const OUT = path.join(ROOT, 'public', 'search-index.json');

const CATEGORY_LABELS = {
  'basic-medicine': '基础医学',
  'clinical-medicine': '临床医学',
};

const SUBCATEGORY_LABELS = {
  anatomy: '解剖学',
  physiology: '生理学',
  biochemistry: '生物化学',
  pathology: '病理学',
  'micro-immuno': '微生物与免疫',
  pharmacology: '药理学',
  diagnosis: '诊断学',
  imaging: '医学影像学',
};

/** 与 lib/lessons.ts 的 asciiSlug 保持一致：SSG 路由段必须 ASCII，中文段用稳定哈希 */
const asciiSlug = (seg) => {
  if (/^[A-Za-z0-9._-]+$/.test(seg)) return seg;
  return 'p-' + createHash('sha1').update(seg, 'utf8').digest('hex').slice(0, 10);
};

const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const getMeta = (html, name) => {
  const a = html.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'),
  );
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i'),
  );
  return (a ?? b)?.[1]?.trim() ?? '';
};

const getTitle = (html) =>
  html.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]?.trim().replace(/\s+/g, ' ') ?? '';

async function collect(dir, rel, out) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await collect(full, [...rel, e.name], out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      const slug = [...rel, e.name.replace(/\.html$/i, '')];
      const html = await fs.readFile(full, 'utf8');
      const text = stripTags(html);
      out.push({
        title: getTitle(html) || slug[slug.length - 1],
        category: slug[0],
        categoryLabel: CATEGORY_LABELS[slug[0]] ?? slug[0],
        subcategory: slug.length > 2 ? slug[1] : null,
        subcategoryLabel: slug.length > 2 ? SUBCATEGORY_LABELS[slug[1]] ?? slug[1] : null,
        url: '/lesson/' + slug.map(asciiSlug).join('/'),
        fileUrl: '/content/' + slug.map(encodeURIComponent).join('/') + '.html',
        snippet: (getMeta(html, 'description') || text).slice(0, 200),
      });
    }
  }
}

const entries = [];
await collect(CONTENT_DIR, [], entries);
await fs.writeFile(OUT, JSON.stringify(entries));
console.log(`[search-index] wrote ${entries.length} lessons -> public/search-index.json`);
