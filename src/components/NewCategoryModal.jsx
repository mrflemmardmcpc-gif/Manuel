import React, { useEffect, useState } from 'react';

export default function NewCategoryModal({
  open,
  onClose,
  sections = [],
  categories = [],
  addCategory,
  addSection,
  setExpandedCategoryId,
  theme,
  moveCategoryToSection,
  moveSubToCategory,
  // section edit props
  editingSectionId,
  editSectionName,
  setEditSectionName,
  editSectionEmoji,
  setEditSectionEmoji,
  editSectionColor,
  setEditSectionColor,
  startEditSection,
  saveEditSection,
  cancelEditSection,
  deleteSection,
  // category edit props
  editingCategoryId,
  editCategoryName,
  setEditCategoryName,
  editCategoryEmoji,
  setEditCategoryEmoji,
  editCategoryColor,
  setEditCategoryColor,
  startEditCategory,
  saveEditCategory,
  cancelEditCategory,
  deleteCategory,
}) {
  const [mode, setMode] = useState('category'); // 'category' | 'section'

  const [movingCategoryId, setMovingCategoryId] = useState(null);
  const [moveTargetSection, setMoveTargetSection] = useState(null);
  const [moveModeType, setMoveModeType] = useState('sub'); // 'sub' | 'category'
  // keep select values as strings to avoid type-mismatch with DOM option values
  const [sourceCatForSub, setSourceCatForSub] = useState(String(categories?.[0]?.id || ''));
  const [selectedSubForMove, setSelectedSubForMove] = useState('');
  const [targetCatForSub, setTargetCatForSub] = useState(String(categories?.[0]?.id || ''));
  const [categoryToMoveTop, setCategoryToMoveTop] = useState(String(categories?.[0]?.id || ''));
  const [targetSectionForCategoryTop, setTargetSectionForCategoryTop] = useState(String(sections?.[0]?.id || ''));

  // Section fields
  const [sectionName, setSectionName] = useState('');
  const [sectionEmoji, setSectionEmoji] = useState('📁');
  const [sectionColor, setSectionColor] = useState(theme?.accent2 || '#6d4aff');

  // Category fields
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('');
  const [catColor, setCatColor] = useState(theme?.accent1 || '#10b981');
  const [catSectionId, setCatSectionId] = useState(sections?.[0]?.id || '');

  useEffect(() => {
    setCatSectionId(sections?.[0]?.id || '');
    setTargetSectionForCategoryTop(String(sections?.[0]?.id || ''));
  }, [sections]);

  useEffect(() => {
    setSourceCatForSub(String(categories?.[0]?.id || ''));
    setTargetCatForSub(String(categories?.[0]?.id || ''));
    setSelectedSubForMove('');
    setCategoryToMoveTop(String(categories?.[0]?.id || ''));
  }, [categories]);

  if (!open) return null;

  const createSection = () => {
    const name = (sectionName || '').trim();
    if (!name) return window.alert('Le nom de la grande partie est requis');
    const id = Date.now();
    const newSec = { id, name, color: sectionColor || (theme?.accent2 || '#6d4aff'), emoji: sectionEmoji || '📁' };
    if (typeof addSection === 'function') addSection(newSec);
    onClose && onClose();
  };

  const createCategory = () => {
    const name = (catName || '').trim();
    if (!name) return window.alert('Le nom de la catégorie est requis');
    if (!catSectionId) return window.alert('Sélectionnez une grande partie');
    const id = Date.now();
    const newCat = { id, name, icon: catEmoji || '📦', sectionId: catSectionId, color: catColor || (theme?.accent1 || '#10b981'), subs: [] };
    if (typeof addCategory === 'function') addCategory(newCat);
    if (typeof setExpandedCategoryId === 'function') setExpandedCategoryId(id);
    onClose && onClose();
  };

  const containerBg = theme?.surfaceAlt || theme?.surface || theme?.background || '#241c3a';
  const inputBg = theme?.surface || theme?.background || '#201a36';
  const br = theme?.borderRadius ?? 12;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2150000000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', overflowX: 'hidden', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 720, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', overflowX: 'hidden', background: containerBg, borderRadius: br, padding: 20, boxShadow: theme?.shadow || '0 12px 48px rgba(0,0,0,0.32)', border: `1px solid ${theme?.border || '#fff3'}`, boxSizing: 'border-box', margin: '0 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: theme?.accent1 || '#f59e42' }}>Créer</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onClose && onClose()} style={{ background: 'transparent', border: 'none', color: theme?.text || '#fff', cursor: 'pointer', fontSize: 18 }}>✖</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <button onClick={() => setMode('category')} style={{ padding: 8, borderRadius: Math.max(8, br - 4), background: mode === 'category' ? `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)` : inputBg, color: mode === 'category' ? '#fff' : theme?.text, border: `1px solid ${theme?.border}` }}>Nouvelle catégorie</button>
          <button onClick={() => setMode('section')} style={{ padding: 8, borderRadius: Math.max(8, br - 4), background: mode === 'section' ? `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)` : inputBg, color: mode === 'section' ? '#fff' : theme?.text, border: `1px solid ${theme?.border}` }}>Nouvelle grande partie</button>
          <button onClick={() => setMode('move')} style={{ padding: 8, borderRadius: Math.max(8, br - 4), background: mode === 'move' ? `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)` : inputBg, color: mode === 'move' ? '#fff' : theme?.text, border: `1px solid ${theme?.border}` }}>Déplacer</button>
        </div>

        {mode === 'section' ? (
          <div>
            <label style={{ color: theme?.text, fontWeight: 700 }}>Nom</label>
            <input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="Nom de la grande partie" style={{ width: '100%', padding: 10, borderRadius: Math.max(8, br - 4), marginTop: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <input value={sectionEmoji} onChange={e => setSectionEmoji(e.target.value)} placeholder="Emoji" style={{ width: 80, padding: 8, borderRadius: Math.max(6, br - 8), border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
              <input type="color" value={sectionColor} onChange={e => setSectionColor(e.target.value)} style={{ width: 60, height: 40, padding: 0, border: `1px solid ${theme?.border}`, borderRadius: 6 }} />
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={createSection} style={{ padding: '10px 16px', borderRadius: Math.max(8, br - 4), background: `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)`, color: '#fff', border: 'none' }}>✅ Créer la grande partie</button>
            </div>
          </div>
        ) : mode === 'move' ? (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setMoveModeType('sub')} style={{ padding: 8, borderRadius: Math.max(8, br - 4), background: moveModeType === 'sub' ? `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)` : inputBg, color: moveModeType === 'sub' ? '#fff' : theme?.text, border: `1px solid ${theme?.border}` }}>Sous-catégorie</button>
              <button onClick={() => setMoveModeType('category')} style={{ padding: 8, borderRadius: Math.max(8, br - 4), background: moveModeType === 'category' ? `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)` : inputBg, color: moveModeType === 'category' ? '#fff' : theme?.text, border: `1px solid ${theme?.border}` }}>Catégorie</button>
            </div>

            {moveModeType === 'sub' ? (
              <div>
                <label style={{ color: theme?.text, fontWeight: 700 }}>Choisir la sous-catégorie</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={sourceCatForSub || ''} onChange={e => setSourceCatForSub(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: '1 1 220px', minWidth: 200 }}>
                    <option value="">Choisir une catégorie source</option>
                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>)}
                  </select>
                  <select value={selectedSubForMove || ''} onChange={e => setSelectedSubForMove(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: '1 1 260px', minWidth: 220 }}>
                    <option value="">Choisir une sous-catégorie</option>
                    {(categories.find(c => String(c.id) === String(sourceCatForSub))?.subs || []).map(s => (
                      <option key={s.id} value={String(s.id)}>{s.title}</option>
                    ))}
                  </select>
                  <select value={targetCatForSub || ''} onChange={e => setTargetCatForSub(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: '1 1 220px', minWidth: 200 }}>
                    <option value="">Choisir une catégorie cible</option>
                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>)}
                  </select>
                  <div style={{ flex: '0 0 140px', display: 'flex' }}>
                    <button onClick={() => {
                      if (!selectedSubForMove) return window.alert('Choisissez une sous-catégorie');
                      if (!targetCatForSub) return window.alert('Choisissez une catégorie cible');
                      moveSubToCategory?.(Number(selectedSubForMove), Number(targetCatForSub));
                      setSelectedSubForMove(''); setSourceCatForSub(''); setTargetCatForSub('');
                      if (typeof setExpandedCategoryId === 'function') setExpandedCategoryId(Number(targetCatForSub));
                    }} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none' }}>Déplacer</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ color: theme?.text, fontWeight: 700 }}>Déplacer une catégorie vers une grande partie</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={categoryToMoveTop || ''} onChange={e => setCategoryToMoveTop(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: '1 1 220px', minWidth: 200 }}>
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>)}
                  </select>
                  <select value={targetSectionForCategoryTop || ''} onChange={e => setTargetSectionForCategoryTop(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: '1 1 220px', minWidth: 200 }}>
                    <option value="">Choisir une grande partie</option>
                    {sections.map(s => <option key={s.id} value={String(s.id)}>{(s.emoji || '📁') + ' ' + s.name}</option>)}
                  </select>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => {
                      if (!categoryToMoveTop) return window.alert('Choisissez une catégorie');
                      if (!targetSectionForCategoryTop) return window.alert('Choisissez une grande partie cible');
                      moveCategoryToSection?.(Number(categoryToMoveTop), Number(targetSectionForCategoryTop));
                      setCategoryToMoveTop(''); setTargetSectionForCategoryTop('');
                    }} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none' }}>Déplacer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label style={{ color: theme?.text, fontWeight: 700 }}>Nom de la catégorie</label>
            <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Nom de la catégorie" style={{ width: '100%', padding: 10, borderRadius: Math.max(8, br - 4), marginTop: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 12, marginTop: 12, alignItems: 'end' }}>
              <input value={catEmoji} onChange={e => setCatEmoji(e.target.value)} placeholder="Emoji" style={{ padding: 8, borderRadius: Math.max(6, br - 8), border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
              <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} style={{ width: 60, height: 40, padding: 0, border: `1px solid ${theme?.border}`, borderRadius: 6 }} />
              <select value={catSectionId || ''} onChange={e => setCatSectionId(e.target.value ? Number(e.target.value) : '')} style={{ padding: 8, borderRadius: Math.max(6, br - 8), border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, appearance: 'none' }}>
                <option value="" style={{ background: inputBg, color: theme?.text }}>Choisir une grande partie</option>
                {sections.map(s => <option key={s.id} value={s.id} style={{ background: inputBg, color: theme?.text }}>{(s.emoji || '📁') + ' ' + s.name}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={createCategory} style={{ padding: '10px 16px', borderRadius: Math.max(8, br - 4), background: `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)`, color: '#fff', border: 'none' }}>✅ Créer la catégorie</button>
            </div>
          </div>
        )}

        {/* Management area: edit / delete existing sections and categories */}
        {mode !== 'move' && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${theme?.border || '#ffffff22'}`, paddingTop: 14 }}>
          <h4 style={{ margin: '0 0 8px 0', color: theme?.accent1 }}>Gérer les grandes parties</h4>
          {sections && sections.length === 0 && <div style={{ color: theme?.text, opacity: 0.8 }}>Aucune grande partie</div>}
          {sections && sections.map(sec => (
            <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {editingSectionId == sec.id ? (
                <>
                  <input value={editSectionName || ''} onChange={e => setEditSectionName?.(e.target.value)} placeholder="Nom" style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: 1 }} />
                  <input value={editSectionEmoji || ''} onChange={e => setEditSectionEmoji?.(e.target.value)} placeholder="Emoji" style={{ width: 80, padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
                  <input type="color" value={editSectionColor || '#000000'} onChange={e => setEditSectionColor?.(e.target.value)} style={{ width: 44, height: 34, padding: 0, borderRadius: 6 }} />
                  <button type="button" onClick={e => { e.stopPropagation(); saveEditSection?.(); }} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none' }}>Enregistrer</button>
                  <button type="button" onClick={e => { e.stopPropagation(); cancelEditSection?.(); }} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none' }}>Annuler</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: sec.color || '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sec.emoji || '📁'}</div>
                    <div style={{ color: theme?.text, fontWeight: 700 }}>{sec.name}</div>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); startEditSection?.(sec); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none' }}>✏️</button>
                  <button type="button" onClick={e => { e.stopPropagation(); deleteSection?.(sec.id); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none' }}>🗑️</button>
                </>
              )}
            </div>
          ))}

          <h4 style={{ margin: '16px 0 8px 0', color: theme?.accent1 }}>Gérer les catégories</h4>
          {categories && categories.length === 0 && <div style={{ color: theme?.text, opacity: 0.8 }}>Aucune catégorie</div>}
          {categories && categories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {editingCategoryId == cat.id ? (
                <>
                  <input value={editCategoryName || ''} onChange={e => setEditCategoryName?.(e.target.value)} placeholder="Nom catégorie" style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text, flex: 1 }} />
                  <input value={editCategoryEmoji || ''} onChange={e => setEditCategoryEmoji?.(e.target.value)} placeholder="Emoji" style={{ width: 80, padding: 8, borderRadius: 8, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }} />
                  <input type="color" value={editCategoryColor || '#000000'} onChange={e => setEditCategoryColor?.(e.target.value)} style={{ width: 44, height: 34, padding: 0, borderRadius: 6 }} />
                  <button type="button" onClick={e => { e.stopPropagation(); saveEditCategory?.(); }} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none' }}>Enregistrer</button>
                  <button type="button" onClick={e => { e.stopPropagation(); cancelEditCategory?.(); }} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none' }}>Annuler</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.color || '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon || '📦'}</div>
                    <div style={{ color: theme?.text, fontWeight: 700 }}>{cat.name} <span style={{ opacity: 0.6, marginLeft: 8 }}>{sections?.find(s => s.id === cat.sectionId)?.name || ''}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button type="button" onClick={e => { e.stopPropagation(); startEditCategory?.(cat); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none' }}>✏️</button>
                    {movingCategoryId === cat.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select value={moveTargetSection || ''} onChange={e => setMoveTargetSection(e.target.value ? Number(e.target.value) : '')} style={{ padding: 6, borderRadius: 6, border: `1px solid ${theme?.border}`, background: inputBg, color: theme?.text }}>
                          <option value="">Choisir une grande partie</option>
                          {sections.map(s => <option key={s.id} value={s.id}>{(s.emoji || '📁') + ' ' + s.name}</option>)}
                        </select>
                        <button onClick={e => { e.stopPropagation(); if (moveTargetSection) { moveCategoryToSection?.(cat.id, moveTargetSection); setMovingCategoryId(null); setMoveTargetSection(null); } }} style={{ padding: '6px 8px', borderRadius: 6, background: '#10b981', color: '#fff', border: 'none' }}>Valider</button>
                        <button onClick={e => { e.stopPropagation(); setMovingCategoryId(null); setMoveTargetSection(null); }} style={{ padding: '6px 8px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none' }}>Annuler</button>
                      </div>
                    ) : (
                      <button type="button" onClick={e => { e.stopPropagation(); setMovingCategoryId(cat.id); setMoveTargetSection(cat.sectionId || ''); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#f59e42', color: '#fff', border: 'none' }}>Déplacer</button>
                    )}
                    <button type="button" onClick={e => { e.stopPropagation(); deleteCategory?.(cat.id); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none' }}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
