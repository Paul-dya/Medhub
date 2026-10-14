import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="code">404</div>
      <h1>页面不存在</h1>
      <p className="hero-desc">你访问的课程页可能尚未发布，或链接有误。</p>
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          返回首页
        </Link>
        <Link href="/search" className="btn btn-ghost">
          搜索课程内容
        </Link>
      </div>
    </div>
  );
}
