import React, { useState, useEffect } from "react";
import { ModuleEditForm, ModuleAddForm } from "./editor/forms";

export default function EditorPanel(props) {
  const { editMode, isAuthenticated, editingSubId, addingSubToCatId, theme, categories } = props;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    if (editingSubId && categories) {
      const cat = (categories || []).find(c => (c.subs || []).some(s => s.id === editingSubId));
      if (cat) setSelectedCategoryId(cat.id);
    }
  }, [editingSubId, categories]);

  // Initialize selectedCategoryId to first category when categories load
  useEffect(() => {
    if ((selectedCategoryId === null || selectedCategoryId === undefined) && categories && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  function normalizeLineBreaks(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\r\n|\r/g, '\n');
  }

  if (!editMode || !isAuthenticated) return null;

  return (
    <div className="editor-panel-mobile" style={{
      background: theme?.surfaceAlt || theme?.surface || theme?.panel || "#241c3a",
      color: theme?.text || '#fff',
      border: `1px solid ${theme?.border || "#fff3"}`,
      borderRadius: theme?.borderRadius || 12,
      padding: '24px 28px',
      marginBottom: 0,
      boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.12)",
      maxWidth: 760,
      width: '100%',
      margin: '8px auto',
      position: "relative",
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ color: theme?.accent1 || "#f59e42", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: 0.2, textAlign: 'center' }}>Mode édition centralisé</h2>

      <div style={{ maxWidth: 680, width: '100%', margin: '16px auto 0 auto', boxSizing: 'border-box' }}>

        {/* Sélection de catégorie à modifier */}
        <div style={{
          margin: "0 0 12px 0",
          background: theme?.surface || theme?.surfaceAlt || theme?.panel || "#241c3a",
          borderRadius: 16,
          padding: "20px 18px",
          border: `1.5px solid ${theme?.border || "#f59e42"}`,
          boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.08)",
          minWidth: 320,
          maxWidth: '100%',
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 26, color: theme?.accent1 || "#f59e42", fontWeight: 700, marginRight: 6 }}>📁</span>
            <span style={{ color: theme?.accent1 || "#f59e42", fontWeight: 700, fontSize: 20 }}>Choisir la catégorie à modifier</span>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select
              value={selectedCategoryId || ''}
              onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
              style={{
                fontSize: 18,
                padding: '12px 18px',
                borderRadius: 10,
                border: `1.5px solid ${theme?.border || "#f59e42"}`,
                background: 'linear-gradient(120deg, #271d44 0%, #3a2a5c 60%, #241c3a 100%)',
                color: theme?.text || '#fff',
                boxShadow: '0 2px 8px 0 rgba(80,60,120,0.10)',
                marginBottom: 10,
                flex: 1
              }}
            >
              <option value="" style={{ background: theme?.surface || theme?.panel || '#241c3a', color: theme?.text || '#fff' }}>Choisir une catégorie...</option>
              {(categories || []).map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: theme?.surface || theme?.panel || '#241c3a', color: theme?.text || '#fff' }}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            <button onClick={() => {
              if (!selectedCategoryId) return;
              if (props.createAndEditSub) {
                props.createAndEditSub(selectedCategoryId);
              } else {
                props.setAddingSubToCatId && props.setAddingSubToCatId(selectedCategoryId);
              }
            }} style={{ padding: '10px 12px', borderRadius: 10, background: theme?.accent1, color: '#fff', border: 'none', cursor: 'pointer' }}>
              + Créer une sous-catégorie
            </button>
          </div>

          {/* Liste des sous-catégories */}
          {selectedCategoryId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {((categories || []).find(c => c.id === selectedCategoryId)?.subs || []).map(sub => (
                <div key={sub.id} style={{ padding: 12, borderRadius: 10, background: theme?.surfaceAlt || theme?.surface || '#201a36', border: `1px solid ${theme?.border || '#444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: theme?.accent1 || '#f59e42', marginBottom: 6 }}>{sub.title}</div>
                    <div style={{ color: theme?.text || '#ddd', maxHeight: 120, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: sub.text || '' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => {
                        props.setEditTitle && props.setEditTitle(sub.title || '');
                        props.setEditText && props.setEditText(sub.text || '');
                        props.setEditColor && props.setEditColor(sub.color || '');
                        props.setEditingSubId && props.setEditingSubId(sub.id);
                      }} style={{ padding: '8px 10px', borderRadius: 8, background: 'transparent', color: theme?.accent1 || '#f59e42', border: `1px solid ${theme?.accent1 || '#f59e42'}`, cursor: 'pointer' }}>Modifier</button>
                      <button onClick={() => {
                        if (!props.deleteSub) return;
                        props.deleteSub(selectedCategoryId, sub.id);
                      }} style={{ padding: '8px 10px', borderRadius: 8, background: theme?.accent1 ? 'transparent' : '#dc2626', color: '#fda4af', border: `1px solid ${theme?.accent1 || '#ef4444'}`, cursor: 'pointer' }}>Supprimer</button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaires d'édition / ajout */}
        {editingSubId && (
          <ModuleEditForm
            editTitle={props.editTitle}
            setEditTitle={props.setEditTitle}
            editText={props.editText}
            setEditText={props.setEditText}
            darkMode={props.darkMode}
            theme={theme}
            setEditorInstance={props.setEditorInstance}
            saveEditSub={props.saveEditSub}
            cancelEdit={props.cancelEdit}
            editColor={props.editColor}
            setEditColor={props.setEditColor}
            normalizeLineBreaks={normalizeLineBreaks}
          />
        )}

        {addingSubToCatId && (
          <ModuleAddForm
            newSubTitle={props.newSubTitle}
            setNewSubTitle={props.setNewSubTitle}
            newSubColor={props.newSubColor}
            setNewSubColor={props.setNewSubColor}
            saveNewSub={props.saveNewSub}
            cancelAddingSub={props.cancelAddingSub}
            theme={theme}
          />
        )}

        {/* 'Ajouter une catégorie' retiré du mode édition centralisé */}

      </div>

    </div>
  );
}
