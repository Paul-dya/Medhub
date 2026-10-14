import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES, SUBCATEGORY_NAMES } from '@/lib/site';
import { getLessons } from '@/lib/lessons';

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  return { title: cat ? `${cat.name} · 课程目录` : '课程目录' };
}

export default async function CoursePage({ params }: Params) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const lessons = (await getLessons()).filter((l) => l.category === category);

  const groups: { name: string; items: typeof lessons }[] = [];
  for (const l of lessons) {
    const key = l.subcategory ?? '';
    let g = groups.find((x) => x.name === key);
    if (!g) {
      g = { name: key, items: [] };
      groups.push(g);
    }
    g.items.push(l);
  }

  return (
    <div className="container">
      <div className="course-head">
        <div className="crumb">
          <Link href="/">首页</Link> / {cat.name}
        </div>
        <h1>
          {cat.icon} {cat.name}
        </h1>
        <p>{cat.description}</p>
      </div>

      {lessons.length === 0 && (
        <p className="empty-hint">该板块还没有课程，等待第一波内容上线。</p>
      )}

      {groups.map((g) => (
        <section className="lesson-group" key={g.name || '__root__'}>
          {g.name && <h2>{SUBCATEGORY_NAMES[g.name] ?? g.name}</h2>}
          <ul className="lesson-list">
            {g.items.map((l, i) => (
              <li key={l.slug.join('/')}>
                <Link href={l.url}>
                  <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
