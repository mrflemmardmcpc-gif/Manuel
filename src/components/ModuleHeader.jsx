import React, { useState, useRef } from 'react';

export default function ModuleHeader({
  name,
  isAdmin,
  onToggleSidebar,
  onSave,
  isSaved,
  searchText,
  setSearchText,
  tree,
  filterGrand,
  setFilterGrand,
  filterCat,
  setFilterCat,
  resetFilters,
  onHomeClick,
  galleryOpen,
  onToggleGallery,
  editMode,
  onToggleEdit,
  onQuickAdd,
  sidebarOpen,
}) {
  // '➕' menu removed from module header — category creation moved to central editor modal
  const searchRef = useRef(null);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 120,
          backgroundColor: 'rgba(20,14,36,0.9)',
          padding: sidebarOpen ? '10px 20px 6px 20px' : '14px 24px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(109,74,255,0.14)',
          backdropFilter: 'none',
          transition: 'padding-left 0.6s, box-shadow 0.4s',
          boxShadow: sidebarOpen ? '0 12px 40px rgba(59,130,246,0.08)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, transform: sidebarOpen ? 'translateX(280px)' : 'translateX(0)', transition: 'transform 260ms' }}>
            <button onClick={onToggleSidebar} title="Ouvrir le menu" style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', width: 46, height: 46, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>☰</button>
            <h1 style={{ margin: 0, fontSize: sidebarOpen ? 20 : 24, fontWeight: 900, background: 'linear-gradient(135deg, #f59e42 0%, #6d4aff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{name}</h1>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onHomeClick && onHomeClick()} title="Accueil" style={{ padding: 8, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>🏠</button>

            <button onClick={() => onToggleGallery && onToggleGallery()} title="Galerie" style={{ padding: 8, borderRadius: 10, background: galleryOpen ? '#23202d' : 'linear-gradient(135deg,#6d4aff,#f59e42)', color: '#fff', border: 'none', cursor: 'pointer' }}>📷</button>

            {isAdmin && (
              <button onClick={() => onToggleEdit && onToggleEdit()} title="Basculer édition" style={{ padding: 8, borderRadius: 10, background: editMode ? '#2b2738' : 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>✏️</button>
            )}

            {/* '➕' menu removed from module header; use central editor modal button instead */}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => { if (searchRef.current) searchRef.current.focus(); }} title="Recherche" style={{ padding: 8, borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>🔍</button>
              <input ref={(el) => (searchRef.current = el)} value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="🔍 Rechercher..." style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: '#201a36', color: '#fff', minWidth: 220 }} />
            </div>

            {isAdmin && (
              <button onClick={onSave} style={{ padding: '8px 12px', borderRadius: 8, background: isSaved ? '#6d4aff' : '#f59e42', color: '#fff', border: 'none', cursor: 'pointer' }}>{isSaved ? '💾 Sauvegardé' : '⚠️ Sauvegarder'}</button>
            )}
          </div>
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto', paddingTop: 6 }}>
          <button onClick={() => { resetFilters && resetFilters(); }} style={{ padding: '6px 10px', borderRadius: 16, background: filterGrand === null ? '#f59e42' : '#201a36', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Tout</button>
          {tree && tree.map((g, i) => (
            <button key={i} onClick={() => { setFilterGrand && setFilterGrand(i); setFilterCat && setFilterCat(null); }} style={{ padding: '6px 10px', borderRadius: 16, background: filterGrand === i ? '#6d4aff' : '#23202d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{g.name}</button>
          ))}
        </div>
      </header>
      <div style={{ height: sidebarOpen ? 104 : 92 }} />
    </>
  );
}
