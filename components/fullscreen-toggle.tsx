'use client';

import { useCallback, useEffect, useState } from 'react';

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

type FullscreenEl = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};

/**
 * 课程页全屏切换按钮：
 * 点击后整个阅读区（含顶栏）进入浏览器全屏，iframe 撑满屏幕；
 * Esc 或再次点击退出。兼容 Chrome/Edge/Firefox/Safari（webkit 前缀）。
 */
export default function FullscreenToggle({ targetId }: { targetId: string }) {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const sync = () => {
      const d = document as FullscreenDoc;
      setIsFull(Boolean(document.fullscreenElement ?? d.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggle = useCallback(async () => {
    const d = document as FullscreenDoc;
    const active = document.fullscreenElement ?? d.webkitFullscreenElement;
    try {
      if (active) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          d.webkitExitFullscreen?.();
        }
      } else {
        const el = document.getElementById(targetId) as FullscreenEl | null;
        if (!el) return;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else {
          el.webkitRequestFullscreen?.();
        }
      }
    } catch {
      /* 浏览器拒绝全屏（如部分移动端浏览器），静默忽略 */
    }
  }, [targetId]);

  return (
    <button
      type="button"
      className="fs-btn"
      onClick={toggle}
      title={isFull ? '退出全屏（或按 Esc）' : '全屏查看'}
    >
      {isFull ? '⛶ 退出全屏' : '⛶ 全屏'}
    </button>
  );
}
