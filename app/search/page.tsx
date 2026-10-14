'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/site';

type Entry = {
  title: string;
  url: string;
  category: string;
  categoryLabel: string;
  subcategoryLabel?: string | null;
  snippet: string;
};

export default function SearchPage() {
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    if (!index) return null;
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return index
      .filter((e) => {
        const hay = `${e.title} ${e.snippet} ${e.categoryLabel}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 100);
  }, [index, q]);

  return (
    <div className="container search-wrap">
      <h1 className="section-title" style={{ marginTop: 0 }}>
        🔍 搜索课程内容
      </h1>
      <div className="search-box">
        <span className="icon">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="输入关键词，如：心脏、动作电位、肋膈角"
          autoFocus
        />
      </div>

      {results === null && <p className="search-meta">正在加载索引…</p>}
      {results !== null && q.trim() === '' && (
        <p className="search-meta">
          共 {index!.length} 课已收录，输入关键词开始搜索（支持多个关键词，空格分隔）。
        </p>
      )}
      {results !== null && q.trim() !== '' && (
        <p className="search-meta">
          找到 {results.length} 条结果
          {CATEGORIES.length > 0 && ' '}
        </p>
      )}

      {results?.map((e) => (
        <div className="result-item" key={e.url}>
          <h3>
            <Link href={e.url}>{e.title}</Link>
          </h3>
          <p>
            <span className="cat">{e.subcategoryLabel || e.categoryLabel}</span>
            {e.snippet}
          </p>
        </div>
      ))}
    </div>
  );
}
