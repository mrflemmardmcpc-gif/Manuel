import React from "react";

export default function Header({
  isMobile,
  isAuthenticated,
  editMode,
  setEditMode,
  setShowSearchModal,
  darkMode,
  setDarkMode,
  layout,
  theme,
  Emoji,
  showSectionPanel,
  setShowSectionPanel,
  selectedSectionId,
  setSelectedSectionId,
  selectedCategoryId,
  setSelectedCategoryId,
  setSearch,
  data,
  showGallery,
  setShowGallery,
  onHomeClick,
  onOpenNewCategoryModal,
  pageTitle = null,
  pageEmoji = null,
}) {
  // '➕' menu removed from header — category creation moved to centralized editor modal
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        backgroundColor: theme.glass || 'rgba(36,28,58,0.72)',
        backdropFilter: "saturate(140%) blur(6px)",
        padding: isMobile ? `${layout.headerPad/2 + 4}px 0 ${layout.headerPad/2 + 4}px 0` : `${layout.headerPad/2}px 20px`,
        paddingLeft: !isMobile ? ((showSectionPanel ? layout.sideWidth : 0) + 48) : 0,
        minWidth: isMobile ? "100vw" : undefined,
        width: isMobile ? "100vw" : undefined,
        boxSizing: "border-box",
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: showSectionPanel && !isMobile
          ? "0 12px 40px 0 rgba(59,130,246,0.18), 0 2px 8px 0 #FFB36622"
          : theme.shadow,
        transition: "padding-left 0.7s cubic-bezier(.68,-0.6,0.32,1.6), box-shadow 0.55s cubic-bezier(.68,-0.6,0.32,1.6)",
        background: 'transparent',
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: layout.headerRowGap, marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: layout.headerRowGap, minWidth: 0 }}>
          <button onClick={() => { console.log('Header: menu clicked'); setShowSectionPanel && setShowSectionPanel(true); }} style={{ padding: layout.headerButtonPad, borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt || theme.surface || theme.panel, color: theme.text, fontSize: layout.headerIconSize, cursor: "pointer", flexShrink: 0 }}>☰</button>
          <h1 style={{ margin: 0, fontSize: layout.headerTitle, fontWeight: 800, background: `linear-gradient(135deg, ${theme.accent1} 0%, ${theme.accent2} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "0.05px", lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ marginRight: 8 }}>{pageEmoji || '🛠️'}</span>
            {pageTitle || 'Le Manuel'}
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginLeft: 0,
            justifyContent: isMobile ? "space-between" : "flex-end"
          }}
        >
          <button
            onClick={() => { console.log('Header: home clicked'); if (typeof onHomeClick === 'function') onHomeClick(); }}
            style={{ padding: isMobile && isAuthenticated ? '2px 2px' : isMobile ? '4px 7px' : layout.headerButtonPad, minWidth: isMobile && isAuthenticated ? 15 : undefined, minHeight: isMobile && isAuthenticated ? 15 : undefined, borderRadius: 10, backgroundColor: theme.surfaceAlt || theme.surface || theme.panel, color: theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", flexShrink: 0 }}
          >🏠</button>
          <button
            onClick={() => { console.log('Header: gallery clicked'); setShowGallery && setShowGallery(true); }}
            style={{ padding: isMobile && isAuthenticated ? '2px 2px' : isMobile ? '4px 7px' : layout.headerButtonPad, minWidth: isMobile && isAuthenticated ? 15 : undefined, minHeight: isMobile && isAuthenticated ? 15 : undefined, borderRadius: 10, backgroundColor: showGallery ? "#23202d" : `linear-gradient(135deg, ${theme.accent1} 0%, ${theme.accent2} 100%)`, color: "white", border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>📷</button>
          {isAuthenticated && (
            <button
              onClick={() => setEditMode((v) => !v)}
              style={{
                padding: isMobile && isAuthenticated ? '2px 2px' : isMobile ? '4px 7px' : layout.headerButtonPad,
                minWidth: isMobile && isAuthenticated ? 15 : undefined,
                minHeight: isMobile && isAuthenticated ? 15 : undefined,
                borderRadius: 10,
                backgroundColor: editMode ? theme.accent1 : (theme.surfaceAlt || theme.surface || theme.panel),
                color: editMode ? 'white' : theme.text,
                border: `1px solid ${theme.border}`,
                cursor: "pointer",
                fontWeight: 600,
                flexShrink: 0,
                marginRight: 4
              }}
              title={editMode ? "Quitter le mode édition" : "Activer le mode édition"}
            >
              ✏️
            </button>
          )}
          {/* '➕' menu removed from header; use the modal's add button instead */}
          <button onClick={() => { console.log('Header: search clicked'); setShowSearchModal && setShowSearchModal(true); }} style={{ padding: isMobile && isAuthenticated ? '2px 2px' : isMobile ? '4px 7px' : layout.headerButtonPad, minWidth: isMobile && isAuthenticated ? 15 : undefined, minHeight: isMobile && isAuthenticated ? 15 : undefined, borderRadius: 10, backgroundColor: theme.surfaceAlt || theme.surface || theme.panel, color: theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", flexShrink: 0 }}>🔍</button>
          {(!isMobile) && (
            <button onClick={() => setDarkMode((d) => !d)} style={{ padding: layout.headerButtonPad, borderRadius: 10, backgroundColor: theme.surfaceAlt || theme.surface || theme.panel, color: theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0 }}>
              {darkMode ? <Emoji symbol="☀️" label="Mode clair" size={layout.headerIconSize} /> : <Emoji symbol="🌙" label="Mode sombre" size={layout.headerIconSize} />}
            </button>
          )}
        </div>
      </div>
      <div className="chips-scroll" style={{ display: "flex", gap: isMobile ? 12 : 10, flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: 'touch', padding: isMobile ? '4px 0' : '8px 0', alignItems: 'center', position: 'relative', top: 0, marginBottom: isAuthenticated && isMobile ? 2 : 8 }}>
          <button className="chip" onClick={() => { setSelectedSectionId(null); setSelectedCategoryId(null); setSearch && setSearch(""); }} style={{ background: selectedSectionId === null ? `linear-gradient(135deg, ${theme.accent1} 0%, ${theme.accent2} 100%)` : 'transparent' }}>📌 Tout</button>
        {data.sections.map((section) => (
          <button key={section.id} className="chip" onClick={() => { setSelectedSectionId(section.id); setSelectedCategoryId(null); setSearch && setSearch(""); }} style={{ background: selectedSectionId === section.id ? (section.color || theme.accent1) : 'transparent', color: selectedSectionId === section.id ? '#fff' : undefined }}>
            {section.emoji} {section.name}
          </button>
        ))}
      </div>
      {selectedSectionId && (
        <div
          className="chips-scroll"
          style={{
            marginTop: 0,
            marginBottom: isMobile ? 6 : 16,
            padding: isMobile ? '4px 0' : '6px 0 8px 0',
            display: "flex",
            gap: isMobile ? 12 : 10,
            flexWrap: "nowrap",
            overflowX: "auto",
            WebkitOverflowScrolling: 'touch',
            backgroundColor: theme.surfaceAlt || theme.surface || theme.panel,
            borderBottom: `1px solid ${theme.border}`,
            alignItems: 'center'
          }}
        >
          <button onClick={() => { setSelectedCategoryId(null); setSearch && setSearch(""); }} style={{ padding: "4px 10px", borderRadius: 14, backgroundColor: selectedCategoryId === null ? theme.accent1 : theme.panel, color: selectedCategoryId === null ? "white" : theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>◆ Toutes</button>
          {data.categories.filter(cat => cat.sectionId === selectedSectionId).map((cat) => (
            <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setSearch && setSearch(""); }} style={{ padding: "4px 10px", borderRadius: 14, backgroundColor: selectedCategoryId === cat.id ? cat.color || theme.accent1 : (theme.surfaceAlt || theme.surface || theme.panel), color: selectedCategoryId === cat.id ? "white" : theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
