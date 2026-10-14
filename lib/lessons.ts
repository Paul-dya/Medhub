import { promises as fs } from 'fs';
import type { Dirent } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

export type Lesson = {
  /** public/content/ 下的路径段（末段不含 .html） */
  slug: string[];
  /** 站点链接用的 ASCII 安全路径段（与 slug 一一对应） */
  route: string[];
  /** 站点链接 /lesson/... */
  url: string;
  /** 静态文件地址 /content/....html（iframe 直接加载） */
  fileUrl: string;
  title: string;
  category: string;
  subcategory: string | null;
};

/**
 * SSG 静态页的路径段必须为 ASCII：
 * - 段名本身是 ASCII 字母/数字/._- → 原样使用（URL 干净可读）；
 * - 中文等其它字符 → 用路径内容的 sha1 前 10 位生成稳定哈希段。
 * 哈希由文件路径唯一决定，反复构建结果不变，链接长期有效。
 */
export function asciiSlug(seg: string): string {
  if (/^[A-Za-z0-9._-]+$/.test(seg)) return seg;
  const hash = createHash('sha1').update(seg, 'utf8').digest('hex').slice(0, 10);
  return 'p-' + hash;
}

const CONTENT_DIR = path.join(process.cwd(), 'public', 'content');

function encodePath(segments: string[]): string {
  return '/' + segments.map((s) => encodeURIComponent(s)).join('/');
}

async function readHtmlTitle(file: string, fallback: string): Promise<string> {
  try {
    const html = await fs.readFile(file, 'utf8');
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);
    if (m && m[1].trim()) return m[1].trim().replace(/\s+/g, ' ');
  } catch {
    /* 读取失败时退回文件名 */
  }
  return fallback.replace(/[-_]+/g, ' ').trim() || fallback;
}

async function walk(dir: string, rel: string[], out: Lesson[]): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, [...rel, entry.name], out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      const slug = [...rel, entry.name.replace(/\.html$/i, '')];
      const route = slug.map(asciiSlug);
      const fallback = slug[slug.length - 1];
      out.push({
        slug,
        route,
        url: '/lesson' + encodePath(route),
        fileUrl: '/content' + encodePath(slug) + '.html',
        title: await readHtmlTitle(full, fallback),
        category: slug[0],
        subcategory: slug.length > 2 ? slug[1] : null,
      });
    }
  }
}

/** 构建期扫描全部课程页（页面均为静态生成，运行期不读文件系统）。 */
export async function getLessons(): Promise<Lesson[]> {
  const out: Lesson[] = [];
  await walk(CONTENT_DIR, [], out);
  return out.sort((a, b) => a.slug.join('/').localeCompare(b.slug.join('/'), 'zh-Hans-CN'));
}
