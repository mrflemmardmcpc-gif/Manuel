import React, { useEffect, useRef, useState } from 'react';
import TiptapViewer from './TiptapViewer';

export default function LazyTiptapViewer({ html = '', threshold = 0.01, rootMargin = '400px', forceRender = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (forceRender) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (obs && el) obs.unobserve(el);
          }
        });
      }, { threshold, rootMargin });
      obs.observe(el);
      return () => obs.disconnect();
    } else {
      setVisible(true);
    }
  }, [forceRender, threshold, rootMargin]);

  const snippet = String(html || '').replace(/<[^>]+>/g, '').slice(0, 400);

  return (
    <div ref={ref} className="lazy-tiptap-wrapper" style={{ minHeight: 48 }}>
      {visible ? <TiptapViewer html={html || ''} /> : <div className="lazy-tiptap-snippet">{snippet}{String(html || '').length > snippet.length ? '…' : ''}</div>}
    </div>
  );
}
