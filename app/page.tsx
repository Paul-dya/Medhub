import Link from 'next/link';
import { CATEGORIES, SITE } from '@/lib/site';
import { getLessons } from '@/lib/lessons';

export default async function HomePage() {
  const lessons = await getLessons();

  return (
    <>
      <section className="hero container">
        <h1>
          {SITE.name}
          <span className="hero-dot"> · </span>
          医学知识库
        </h1>
        <p className="hero-desc">
          基础医学与临床医学（诊断学 · 医学影像学）课程知识网页，
          按学科分类、一键检索，供医学生与医学爱好者学习、复习。
        </p>
        <div className="hero-actions">
          <Link href="/search" className="btn btn-primary">
            🔍 搜索课程内容
          </Link>
          <Link href="/course/basic-medicine" className="btn btn-ghost">
            从基础医学开始浏览
          </Link>
        </div>
      </section>

      <section className="container">
        <h2 className="section-title">课程栏目</h2>
        <div className="card-grid card-grid-2">
          {CATEGORIES.map((c) => {
            const count = lessons.filter((l) => l.category === c.slug).length;
            return (
              <Link key={c.slug} href={`/course/${c.slug}`} className="course-card">
                <div className="course-icon">{c.icon}</div>
                <div>
                  <h3>
                    {c.name}
                    <span className="course-count">{count} 课</span>
                  </h3>
                  <p>{c.description}</p>
                  <div className="course-tags">
                    {c.subtopics.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
