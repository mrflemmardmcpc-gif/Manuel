import React from 'react';
import LazyTiptapViewer from './LazyTiptapViewer';

function SubPanel({ sub, headerHeight, highlighted, theme, onRef, forceRender }) {
  return (
    <div className="module-panel" ref={onRef} style={{ scrollMarginTop: headerHeight + 20, ...(highlighted ? { boxShadow: `0 0 0 4px ${theme.accent1}33` } : {}) }}>
      <div className="module-panel-inner">
        <h2 style={{ margin: "0 0 16px 0", fontSize: 20, fontWeight: 800, color: theme.accent2 }}>
          {sub.title}
        </h2>
        <div style={{ fontSize: 15, lineHeight: 1.6, color: theme.text }}>
          <LazyTiptapViewer html={sub.text || ""} forceRender={forceRender} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(SubPanel);
