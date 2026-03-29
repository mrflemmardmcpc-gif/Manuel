import React from "react";

export default function Sidebar({
  show,
  onClose,
  isAuthenticated,
  showEditSectionsPanel,
  setShowEditSectionsPanel,
  compactEdit = false,
  newSectionName,
  setNewSectionName,
  newSectionEmoji,
  setNewSectionEmoji,
  newSectionColor,
  setNewSectionColor,
  sectionSwatches,
  addSection,
  data,
  setData,
  editingSectionId,
  setEditingSectionId,
  editSectionName,
  setEditSectionName,
  editSectionEmoji,
  setEditSectionEmoji,
  editSectionColor,
  setEditSectionColor,
  saveEditSection,
  cancelEditSection,
  startEditSection,
  deleteSection,
  selectedSectionId,
  setSelectedSectionId,
  selectedCategoryId,
  setSelectedCategoryId,
  setSearch,
  theme,
  layout,
}) {
  const asideRef = React.useRef(null);

  React.useEffect(() => {
    if (!show) return;
    const handleOutside = (e) => {
      if (!asideRef.current) return;
      if (!asideRef.current.contains(e.target)) {
        if (typeof onClose === 'function') onClose();
      }
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('touchstart', handleOutside);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('touchstart', handleOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <aside ref={asideRef} style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: layout.sideWidth, backgroundColor: theme.surfaceAlt || theme.surface || theme.bg || theme.panel, backdropFilter: "blur(20px)", zIndex: 300, overflow: "auto", padding: layout.modalPad, borderRight: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: theme.accent1, fontSize: 14 }}>🏗️ Grandes Parties</h3>
          {isAuthenticated && !compactEdit && (
            <button onClick={() => setShowEditSectionsPanel(!showEditSectionsPanel)} style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: showEditSectionsPanel ? "#ef4444" : "#3b82f6", color: "white", border: "none", cursor: "pointer", fontSize: 12 }}>{showEditSectionsPanel ? "✖" : "⚙️"}</button>
          )}
        </div>

          {isAuthenticated && showEditSectionsPanel && !compactEdit ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ backgroundColor: theme.surfaceAlt || theme.surface || theme.panel, padding: 12, borderRadius: 8, border: `2px dashed #10b981` }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#10b981", fontSize: 12 }}>➕ Ajouter</h4>
              <input placeholder="Nom" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 4, border: `1px solid ${theme.border}`, backgroundColor: theme.surface || theme.surfaceAlt || theme.panel, color: theme.text, marginBottom: 8, fontSize: 12 }} />
              <input placeholder="Emoji" value={newSectionEmoji} onChange={(e) => setNewSectionEmoji(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 4, border: `1px solid ${theme.border}`, backgroundColor: theme.surface || theme.surfaceAlt || theme.panel, color: theme.text, marginBottom: 8, fontSize: 12 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input type="color" value={newSectionColor} onChange={(e) => setNewSectionColor(e.target.value)} style={{ width: "100%", padding: 4, borderRadius: 4, border: `1px solid ${theme.border}`, cursor: "pointer" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 10 }}>
                {sectionSwatches.map((c) => (
                  <button key={c} onClick={() => setNewSectionColor(c)} style={{ height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, backgroundColor: c, cursor: "pointer" }} />
                ))}
              </div>
              <button onClick={addSection} style={{ width: "100%", padding: "6px", borderRadius: 4, backgroundColor: "#10b981", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: "bold" }}>➕ Ajouter</button>
            </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sections.map((section) => (
                <div key={section.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => { setSelectedSectionId(section.id); setSelectedCategoryId(null); setSearch && setSearch(""); /* keep panel open for editing */ }}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 8, backgroundColor: selectedSectionId === section.id ? section.color : (theme.surfaceAlt || theme.surface || theme.panel), color: selectedSectionId === section.id ? "white" : theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: "500", display: "flex", alignItems: "center" }}
                  >
                    {section.emoji} {section.name}
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => startEditSection(section.id)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surfaceAlt || theme.surface || theme.panel, color: theme.text, cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteSection && deleteSection(section.id)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme.border}`, background: '#ef4444', color: 'white', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setSelectedSectionId(section.id); setSelectedCategoryId(null); setSearch && setSearch(""); onClose(); }}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 8, backgroundColor: selectedSectionId === section.id ? section.color : (theme.surfaceAlt || theme.surface || theme.panel), color: selectedSectionId === section.id ? "white" : theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: "500", display: "flex", alignItems: "center" }}
              >
                {section.emoji} {section.name}
              </button>
            ))}
          </div>
        )}

        {selectedSectionId && (
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: theme.accent1, fontSize: 14 }}>📋 Catégories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.categories.filter(cat => cat.sectionId === selectedSectionId).map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setSearch && setSearch(""); onClose(); }} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: selectedCategoryId === cat.id ? (cat.color || theme.accent1) : (theme.surfaceAlt || theme.surface || theme.panel), color: selectedCategoryId === cat.id ? "white" : theme.text, border: `1px solid ${theme.border}`, cursor: "pointer", textAlign: "left", fontSize: 14 }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
  );
}
