import React, { useState } from 'react';
import mainTheme from '../theme/theme';

export default function ModuleSidebar({
  show,
  onClose,
  tree,
  selectedGrand,
  setSelectedGrand,
  selectedCat,
  setSelectedCat,
  selectedSous,
  setSelectedSous,
  isAdmin,
  inputs,
  setInputs,
  addGrand,
  addCat,
  addSous,
  removeGrand,
  removeCat,
  removeSous,
}) {
  const [showEditSectionsPanel, setShowEditSectionsPanel] = useState(false);
  const sectionSwatches = ['#6d4aff', '#f59e42', '#10b981', '#ef4444', '#3b82f6'];

  if (!show) return null;

  return (
    <>
      <div className="module-sidebar-overlay" onClick={onClose} />
      <aside className="module-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: mainTheme.accent1, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>📁</span><span style={{ fontWeight: 800 }}>Grandes Parties</span></h3>
          <button onClick={onClose} className="close-btn">✖</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: mainTheme.accent1, fontSize: 14 }}>🏗️ Grandes Parties</h3>
            {isAdmin && (
              <button onClick={() => setShowEditSectionsPanel(!showEditSectionsPanel)} style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: showEditSectionsPanel ? '#ef4444' : '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}>{showEditSectionsPanel ? '✖' : '⚙️'}</button>
            )}
          </div>

          {isAdmin && showEditSectionsPanel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="section-add">
                <h4 style={{ margin: '0 0 8px 0', color: sectionSwatches[0], fontSize: 12 }}>➕ Ajouter</h4>
                <input placeholder="Nom" value={inputs.grand} onChange={(e) => setInputs({ ...inputs, grand: e.target.value })} style={{ width: '100%', padding: 6, borderRadius: 4, marginBottom: 8, fontSize: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 10 }}>
                  {sectionSwatches.map((c) => (
                    <button key={c} onClick={() => { /* placeholder: no color state in inputs */ }} className="swatch" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button onClick={addGrand} style={{ width: '100%', padding: '6px', borderRadius: 4, backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>➕ Ajouter</button>
              </div>

              {tree.map((section, idx) => (
                <div key={idx}>
                  <div className={`grand-item ${selectedGrand === idx ? 'selected' : ''}`} style={{ backgroundColor: selectedGrand === idx ? (section.color || mainTheme.accent1) : (mainTheme.surfaceAlt || mainTheme.surface || '#0b0812'), color: selectedGrand === idx ? '#fff' : mainTheme.text }}>
                    <span style={{ fontSize: 14, fontWeight: '500' }}>{section.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => removeGrand(idx)} style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tree.map((grand, idx) => (
                  <div key={idx} style={{ cursor: 'pointer' }}>
                    <div
                      className={`grand-item ${selectedGrand === idx ? 'selected' : ''}`}
                      onClick={() => { setSelectedGrand(idx); setSelectedCat(null); setSelectedSous(null); }}
                      style={{ backgroundColor: selectedGrand === idx ? (grand.color || mainTheme.accent1) : (mainTheme.surfaceAlt || mainTheme.surface || '#0b0812'), color: selectedGrand === idx ? '#fff' : mainTheme.text }}
                    >
                      {grand.name}
                    </div>

                  {selectedGrand === idx && (
                    <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid rgba(109,74,255,0.08)' }}>
                      {grand.children.map((cat, cIdx) => (
                          <div key={cIdx} style={{ marginBottom: 8 }}>
                          <div onClick={() => { setSelectedCat(cIdx); setSelectedSous(null); }} className={`cat-item ${selectedCat === cIdx ? 'selected' : ''}`} style={{ backgroundColor: selectedCat === cIdx ? (cat.color || mainTheme.accent1) : 'transparent', color: selectedCat === cIdx ? '#fff' : mainTheme.text }}>
                            <span style={{ fontWeight: 700 }}>{cat.name}</span>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); removeCat(cIdx); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>}
                          </div>

                          {selectedCat === cIdx && (
                            <div style={{ marginTop: 8, paddingLeft: 8 }}>
                              {cat.children.map((s, sIdx) => (
                                <div key={sIdx} onClick={() => setSelectedSous(sIdx)} style={{ padding: '8px 10px', borderRadius: 8, background: selectedSous === sIdx ? 'rgba(109,74,255,0.08)' : 'transparent', cursor: 'pointer', marginBottom: 8 }}>
                                  {s.name}
                                  {isAdmin && <button onClick={(e) => { e.stopPropagation(); removeSous(sIdx); }} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>}
                                </div>
                              ))}

                              {isAdmin && (
                                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                  <input value={inputs.sous} onChange={e => setInputs({ ...inputs, sous: e.target.value })} placeholder="+ Sous-catégorie" style={{ flex: 1, padding: 8, borderRadius: 8 }} />
                                  <button onClick={addSous} style={{ padding: '8px 10px', borderRadius: 8, background: '#f59e42', color: '#23202d', border: 'none', fontWeight: 700 }}>+</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            <input value={inputs.grand} onChange={e => setInputs({ ...inputs, grand: e.target.value })} placeholder="+ Grande catégorie" style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', background: '#141018', color: '#fff' }} />
            <button onClick={addGrand} style={{ padding: '10px 12px', borderRadius: 10, background: '#6d4aff', color: '#fff', border: 'none', fontWeight: 700 }}>+</button>
          </div>
        )}
      </aside>
    </>
  );
}
