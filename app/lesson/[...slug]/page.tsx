import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/site';
import { getLessons } from '@/lib/lessons';

type Params = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  const lessons = await getLessons();
  return lessons.map((l) => ({ slug: l.route }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lesson = (await getLessons()).find(
    (l) => l.route.join('/') === slug.join('/'),
  );
  return { title: lesson ? lesson.title : '课程' };
}

export default async function LessonPage({ params }: Params) {
  const { slug } = await params;
  const lessons = await getLessons();
  const lesson = lessons.find((l) => l.route.join('/') === slug.join('/'));
  if (!lesson) notFound();

  const cat = CATEGORIES.find((c) => c.slug === lesson.category);
  const catName = cat?.name ?? lesson.category;

  return (
    <div className="container lesson-wrap">
      <div className="lesson-bar">
        <Link className="back-link" href={`/course/${lesson.category}`}>
          ← 返回{catName}
        </Link>
        <Link className="back-link" href="/search">
          🔍 站内搜索
        </Link>
      </div>
      <h1 className="lesson-title">{lesson.title}</h1>
      <iframe className="lesson-frame" src={lesson.fileUrl} title={lesson.title} />
    </div>
  );
}
