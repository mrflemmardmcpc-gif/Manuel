import React, { useEffect, useState } from "react";
import { ModuleAddForm, ModuleEditForm } from "./editor/forms";

function copyDeep(obj) {
  return JSON.parse(JSON.stringify(obj || []));
}

export default function CentralEditMode({ tree, setTree, saveData, theme }) {
  const accent = theme?.accent1 || "#f59e42";
  const panelBg = theme?.surfaceAlt || theme?.surface || theme?.panel || "#23202d";

  const [targetLevel, setTargetLevel] = useState("sous"); // 'grand' | 'cat' | 'sous'
  const [action, setAction] = useState("modify"); // 'add' | 'modify' | 'delete'

  const [selGrand, setSelGrand] = useState(tree && tree.length > 0 ? 0 : null);
  const [selCat, setSelCat] = useState(() => (tree?.[0]?.children?.length ? 0 : null));
  const [selSub, setSelSub] = useState(() => (tree?.[0]?.children?.[0]?.children?.length ? 0 : null));

  // Inputs for grands
  const [newGrandName, setNewGrandName] = useState("");
  const [editGrandName, setEditGrandName] = useState("");

  // Inputs for cats
  const [newCatName, setNewCatName] = useState("");
  const [editCatName, setEditCatName] = useState("");

  // Inputs for subs
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubColor, setNewSubColor] = useState("#6d4aff");

  // Edit sub content
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // Keep selected indexes valid when tree changes
    if (!tree || tree.length === 0) {
      setSelGrand(null);
      setSelCat(null);
      setSelSub(null);
      return;
    }
    if (selGrand === null || selGrand >= tree.length) setSelGrand(0);
    const cats = tree[selGrand || 0]?.children || [];
    if (!cats || cats.length === 0) {
      setSelCat(null);
      setSelSub(null);
      return;
    }
    if (selCat === null || selCat >= cats.length) setSelCat(0);
    const subs = cats[selCat || 0]?.children || [];
    if (!subs || subs.length === 0) setSelSub(null);
    else if (selSub === null || selSub >= subs.length) setSelSub(0);
  }, [tree]);

  useEffect(() => {
    // sync edit fields when a sub is selected
    if (selGrand !== null && selCat !== null && selSub !== null) {
      const sub = tree?.[selGrand]?.children?.[selCat]?.children?.[selSub];
      setEditTitle(sub?.title ?? sub?.name ?? "");
      setEditText(sub?.content ?? "");
    } else {
      setEditTitle("");
      setEditText("");
    }
  }, [selGrand, selCat, selSub]);

  const addGrand = () => {
    if (!newGrandName.trim()) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n.push({ name: newGrandName.trim(), children: [] });
      return n;
    });
    setNewGrandName("");
  };

  const saveEditGrand = () => {
    if (selGrand === null) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].name = editGrandName.trim() || n[selGrand].name;
      return n;
    });
    setEditGrandName("");
  };

  const deleteGrand = () => {
    if (selGrand === null) return;
    if (!window.confirm("Supprimer cette grande partie et tout son contenu ?")) return;
    setTree(prev => prev.filter((_, i) => i !== selGrand));
    setSelGrand(null);
  };

  const addCat = () => {
    if (selGrand === null || !newCatName.trim()) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].children.push({ name: newCatName.trim(), children: [] });
      return n;
    });
    setNewCatName("");
  };

  const saveEditCat = () => {
    if (selGrand === null || selCat === null) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].children[selCat].name = editCatName.trim() || n[selGrand].children[selCat].name;
      return n;
    });
    setEditCatName("");
  };

  const deleteCat = () => {
    if (selGrand === null || selCat === null) return;
    if (!window.confirm("Supprimer cette catégorie et tout son contenu ?")) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].children = n[selGrand].children.filter((_, i) => i !== selCat);
      return n;
    });
    setSelCat(null);
  };

  const saveNewSub = () => {
    if (selGrand === null || selCat === null || !newSubTitle.trim()) return;
    const newSub = { name: newSubTitle.trim(), title: newSubTitle.trim(), content: "" };
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].children[selCat].children.push(newSub);
      return n;
    });
    setNewSubTitle("");
  };

  const saveEditSub = (normalizedContent) => {
    if (selGrand === null || selCat === null || selSub === null) return;
    setTree(prev => {
      const n = copyDeep(prev);
      const sub = n[selGrand].children[selCat].children[selSub];
      sub.title = editTitle;
      sub.content = normalizedContent;
      return n;
    });
  };

  const deleteSub = () => {
    if (selGrand === null || selCat === null || selSub === null) return;
    if (!window.confirm("Supprimer cette sous-catégorie ?")) return;
    setTree(prev => {
      const n = copyDeep(prev);
      n[selGrand].children[selCat].children = n[selGrand].children[selCat].children.filter((_, i) => i !== selSub);
      return n;
    });
    setSelSub(null);
  };

  const cancelAddingSub = () => setNewSubTitle("");
  const cancelEdit = () => { setEditTitle(""); setEditText(""); };

  return (
    <div style={{
      background: theme?.bg || theme?.surface || theme?.surfaceAlt || "#241c3a",
      border: `2px solid ${accent}`,
      borderRadius: 18,
      padding: 32,
      marginBottom: 0,
      boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.08)",
      maxWidth: 1200,
      width: '100%',
      marginLeft: 0,
      marginRight: 'auto',
      position: "relative",
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
    }}>
      <h2 style={{ color: accent, margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: 0.2 }}>Mode édition centralisé</h2>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#fff', fontWeight: 700 }}>Niveau :</label>
        <select value={targetLevel} onChange={e => setTargetLevel(e.target.value)} style={{ padding: 8, borderRadius: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
          <option value="grand" style={{ background: panelBg, color: theme?.text || '#fff' }}>Grande partie</option>
          <option value="cat" style={{ background: panelBg, color: theme?.text || '#fff' }}>Catégorie</option>
          <option value="sous" style={{ background: panelBg, color: theme?.text || '#fff' }}>Sous-catégorie</option>
        </select>

        <label style={{ color: '#fff', fontWeight: 700 }}>Action :</label>
        <select value={action} onChange={e => setAction(e.target.value)} style={{ padding: 8, borderRadius: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
          <option value="add" style={{ background: panelBg, color: theme?.text || '#fff' }}>Ajouter</option>
          <option value="modify" style={{ background: panelBg, color: theme?.text || '#fff' }}>Modifier</option>
          <option value="delete" style={{ background: panelBg, color: theme?.text || '#fff' }}>Supprimer</option>
        </select>

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => saveData && saveData()} style={{ padding: '10px 14px', background: accent, color: '#fff', border: 'none', borderRadius: 10 }}>Enregistrer (local)</button>
        </div>
      </div>

      {/* Controls area */}
      <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Grand part controls */}
        {targetLevel === 'grand' && (
          <div style={{ background: panelBg, padding: 18, borderRadius: 12, border: `1px solid ${accent}`, minWidth: 300 }}>
            {action === 'add' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Nom de la grande partie</label>
                <input value={newGrandName} onChange={e => setNewGrandName(e.target.value)} placeholder="Ex: Fixations" style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8 }} />
                <div style={{ marginTop: 10 }}>
                  <button onClick={addGrand} style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8 }}>➕ Ajouter</button>
                </div>
              </>
            )}

            {action === 'modify' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Choisir</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>
                <input value={editGrandName} onChange={e => setEditGrandName(e.target.value)} placeholder="Nouveau nom" style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8 }} />
                <div style={{ marginTop: 10 }}>
                  <button onClick={saveEditGrand} style={{ padding: '8px 12px', background: '#f59e42', color: '#fff', border: 'none', borderRadius: 8 }}>💾 Sauvegarder</button>
                </div>
              </>
            )}

            {action === 'delete' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Choisir (supprimer)</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>
                <div style={{ marginTop: 10 }}>
                  <button onClick={deleteGrand} style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8 }}>🗑 Supprimer</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Category controls */}
        {targetLevel === 'cat' && (
          <div style={{ background: panelBg, padding: 18, borderRadius: 12, border: `1px solid ${accent}`, minWidth: 420 }}>
            {/* 'Ajouter catégorie' retiré — ajout de catégorie désactivé dans le mode centralisé */}

            {action === 'modify' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Grande partie</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>
                {selGrand !== null && (
                  <>
                    <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Catégorie</label>
                    <select value={selCat ?? ''} onChange={e => setSelCat(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                      {(tree[selGrand].children || []).map((c, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{c.name}</option>)}
                    </select>
                    <input value={editCatName} onChange={e => setEditCatName(e.target.value)} placeholder="Nouveau nom de catégorie" style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8 }} />
                    <div style={{ marginTop: 10 }}>
                      <button onClick={saveEditCat} style={{ padding: '8px 12px', background: '#f59e42', color: '#fff', border: 'none', borderRadius: 8 }}>💾 Sauvegarder</button>
                    </div>
                  </>
                )}
              </>
            )}

            {action === 'delete' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Grande partie</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>
                {selGrand !== null && (
                  <>
                    <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Catégorie</label>
                    <select value={selCat ?? ''} onChange={e => setSelCat(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                      {(tree[selGrand].children || []).map((c, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{c.name}</option>)}
                    </select>
                    <div style={{ marginTop: 10 }}>
                      <button onClick={deleteCat} style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8 }}>🗑 Supprimer catégorie</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Sub controls */}
        {targetLevel === 'sous' && (
          <div style={{ background: panelBg, padding: 18, borderRadius: 12, border: `1px solid ${accent}`, minWidth: 520, flex: 1 }}>
            {action === 'add' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Grande partie</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>

                {selGrand !== null && (
                  <>
                    <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Catégorie</label>
                    <select value={selCat ?? ''} onChange={e => setSelCat(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                      {(tree[selGrand].children || []).map((c, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{c.name}</option>)}
                    </select>
                    {selCat !== null && (
                      <ModuleAddForm
                        newSubTitle={newSubTitle}
                        setNewSubTitle={setNewSubTitle}
                        newSubColor={newSubColor}
                        setNewSubColor={setNewSubColor}
                        saveNewSub={saveNewSub}
                        cancelAddingSub={cancelAddingSub}
                        theme={theme}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {action === 'modify' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Grande partie</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>

                {selGrand !== null && (
                  <>
                    <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Catégorie</label>
                    <select value={selCat ?? ''} onChange={e => setSelCat(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                          {(tree[selGrand].children || []).map((c, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{c.name}</option>)}
                        </select>
                    {selCat !== null && (
                      <>
                        <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Sous-catégorie</label>
                        <select value={selSub ?? ''} onChange={e => setSelSub(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                          {(tree[selGrand].children[selCat].children || []).map((s, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{s.name || s.title || `Sous ${i}`}</option>)}
                        </select>

                        {selSub !== null && (
                          <ModuleEditForm
                            editTitle={editTitle}
                            setEditTitle={setEditTitle}
                            editText={editText}
                            setEditText={setEditText}
                            theme={theme}
                            saveEditSub={saveEditSub}
                            cancelEdit={cancelEdit}
                            normalizeLineBreaks={(s) => (typeof s === 'string' ? s.replace(/\r\n|\r/g, '\n') : s)}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {action === 'delete' && (
              <>
                <label style={{ color: '#fff', fontWeight: 700 }}>Grande partie</label>
                <select value={selGrand ?? ''} onChange={e => setSelGrand(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                  {tree.map((g, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{g.name}</option>)}
                </select>
                {selGrand !== null && (
                  <>
                    <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Catégorie</label>
                    <select value={selCat ?? ''} onChange={e => setSelCat(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                      {(tree[selGrand].children || []).map((c, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{c.name}</option>)}
                    </select>
                    {selCat !== null && (
                      <>
                        <label style={{ color: '#fff', fontWeight: 700, marginTop: 8 }}>Sous-catégorie</label>
                        <select value={selSub ?? ''} onChange={e => setSelSub(Number(e.target.value))} style={{ width: '100%', marginTop: 8, padding: 8, background: panelBg, color: theme?.text || '#fff', border: `1px solid ${theme?.border || '#ffffff33'}`, appearance: 'none' }}>
                          {(tree[selGrand].children[selCat].children || []).map((s, i) => <option key={i} value={i} style={{ background: panelBg, color: theme?.text || '#fff' }}>{s.name || s.title || `Sous ${i}`}</option>)}
                        </select>
                        <div style={{ marginTop: 10 }}>
                          <button onClick={deleteSub} style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8 }}>🗑 Supprimer sous-catégorie</button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
