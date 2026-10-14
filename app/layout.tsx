import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE, CATEGORIES, SCOPE_NOTE, MEDICAL_DISCLAIMER } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(`https://${SITE.domain}`),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">✚</span>
              <span className="brand-name">{SITE.name}</span>
              <span className="brand-sub">基础医学知识库</span>
            </Link>
            <nav className="main-nav">
              <Link href="/">首页</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/course/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
              <Link href="/search" className="nav-search">
                🔍 搜索
              </Link>
            </nav>
          </div>
        </header>

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="container">
            <p>{SCOPE_NOTE}</p>
            <p className="footer-disclaimer">{MEDICAL_DISCLAIMER}</p>
            <p className="footer-copy">
              © {new Date().getFullYear()} {SITE.name} · {SITE.domain} · 仅供医学教育使用
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
