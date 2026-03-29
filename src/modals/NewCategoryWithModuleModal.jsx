import React from "react";
import { PanelTitle, TextInput } from "../components/editor/shared/FormInputs";
import EmojiPicker from "../components/EmojiPicker";
import { TiptapEditor } from "../components/editor/tiptap";
import CubeButton3D from "../ui/visual/CubeButton.jsx";
import useRotate3D from "../ui/animations/useRotate3D";
import "../ui/animations/rotate3d.css";
import mainTheme from "../theme/theme";
import { SpiralColorPickerSingleModal } from "../components/editor/spiral-picker";

export default function NewCategoryWithModuleModal({ open, onClose, sections = [], onCreate, theme, darkMode }) {
  const [catTitle, setCatTitle] = React.useState("");
  const [catEmoji, setCatEmoji] = React.useState("");
  const [catSection, setCatSection] = React.useState(sections?.[0]?.id || null);
  const [catColor, setCatColor] = React.useState("#10b981");
  const [subTitle, setSubTitle] = React.useState("");
  const [subDesc, setSubDesc] = React.useState("");

  const [showSpiralPicker, setShowSpiralPicker] = React.useState(false);
  const [pickerPos, setPickerPos] = React.useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const swatchRef = React.useRef(null);
  const spiralRef = React.useRef(null);
  const [sectionOpen, setSectionOpen] = React.useState(false);
  const sectionRef = React.useRef(null);
  const sectionBtnRef = React.useRef(null);

  const rotate3d = useRotate3D({ axis: "X", duration: 600, direction: 1, animate: true });

  React.useEffect(() => {
    if (!open) {
      setCatTitle(""); setCatEmoji(""); setCatSection(sections?.[0]?.id || null); setCatColor("#10b981"); setSubTitle(""); setSubDesc("");
      setShowSpiralPicker(false);
    }
  }, [open, sections]);

  React.useEffect(() => {
    function onDocClick(e) {
      if (!spiralRef.current) return;
      if (!spiralRef.current.contains(e.target)) setShowSpiralPicker(false);
    }
    if (showSpiralPicker) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showSpiralPicker]);

  React.useEffect(() => {
    function onDocClick(e) {
      if (!sectionOpen) return;
      if (sectionRef.current && sectionRef.current.contains(e.target)) return;
      if (sectionBtnRef.current && sectionBtnRef.current.contains(e.target)) return;
      setSectionOpen(false);
    }
    if (sectionOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [sectionOpen]);

  if (!open) return null;

  const openPickerAt = (ref) => {
    const rect = ref?.current?.getBoundingClientRect?.();
    if (!rect) return;
    const baseW = 240, baseH = 240, scale = 0.7;
    const cardW = Math.round(baseW * scale), cardH = Math.round(baseH * scale);
    let top = Math.round(rect.top);
    let left = Math.round(rect.right + 12);
    if (left + cardW > window.innerWidth - 12) left = Math.round(window.innerWidth - cardW - 12);
    if (left < 12) left = 12;
    if (top + cardH > window.innerHeight - 12) top = Math.max(12, window.innerHeight - cardH - 12);
    setPickerPos({ top, left, baseW, baseH, scale });
    setShowSpiralPicker(s => !s);
  };

  const createAndClose = () => {
    if (!catTitle.trim() || !subTitle.trim()) return;
    const newCatId = Date.now();
    const newSubId = Date.now() + 1;
    const newCat = { id: newCatId, name: catTitle, icon: catEmoji || '📦', sectionId: catSection, color: catColor, subs: [{ id: newSubId, title: subTitle, text: subDesc }] };
    try { onCreate && onCreate({ newCat, newSubId }); } catch (err) { }
    onClose && onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 260, paddingRight: 10 }}>
      <div onClick={e => e.stopPropagation()} className="no-scrollbar-modal" style={{ position: 'relative', background: theme?.bg || theme?.surface || '#241c3a', border: `2px solid ${theme?.accent1 || '#f59e42'}`, borderRadius: 18, padding: 28, boxShadow: theme?.shadow || '0 8px 32px rgba(0,0,0,0.4)', color: theme?.text || '#fff', width: 720, maxWidth: 590, maxHeight: 'calc(100vh - 48px)', margin: 20, display: 'flex', flexDirection: 'column', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`.no-scrollbar-modal::-webkit-scrollbar{display:none;} .no-scrollbar-modal{scrollbar-width:none; -ms-overflow-style:none;}`}</style>

        <button onClick={onClose} aria-label="Fermer" style={{ position: 'absolute', top: 14, right: 14, background: theme?.surfaceAlt || theme?.surface || theme?.panel || '#35243e', border: `1px solid ${theme?.border || '#42324a'}`, color: theme?.accent1 || '#b87a3a', cursor: 'pointer', fontSize: 20, padding: 10, borderRadius: 10 }}>✖</button>

        <div style={{ fontSize: 22, fontWeight: 900, color: theme?.accent1 || '#f59e42', marginBottom: 8, letterSpacing: 0.4, textTransform: 'uppercase' }}>Mode édition centralisé</div>

        {/* Category block */}
        <div style={{ marginBottom: 12, border: `1.5px solid ${theme?.accent1 || '#f59e42'}`, borderRadius: 12, padding: 16, background: theme?.surface || theme?.surfaceAlt || theme?.panel || 'transparent' }}>
          <div style={{ fontWeight: 900, fontSize: 20, color: theme?.accent1 || '#f59e42', marginBottom: 12 }}>CATÉGORIE</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 36px', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <TextInput placeholder="Titre de la catégorie" value={catTitle} onChange={e => setCatTitle(e.target.value)} />
            <button onClick={() => setShowEmojiPicker(true)} style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme?.border || '#444'}`, background: theme?.surface || theme?.surfaceAlt || theme?.panel, color: theme?.text, width: 56, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Choisir un emoji">{catEmoji || '🙂'}</button>
            <div ref={swatchRef}>
              <button onClick={(e) => { e.stopPropagation(); openPickerAt(swatchRef); }} style={{ width: 36, height: 36, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} title="Ouvrir le pickeur de couleur">
                <div aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: catColor, border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: theme?.subtext || '#ccc', marginBottom: 6 }}>Grande partie</label>
            <div style={{ position: 'relative' }} ref={(el) => { }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setSectionOpen(s => !s); }}
                  ref={sectionBtnRef}
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 10px',
                    height: 44,
                    borderRadius: 8,
                    border: `1px solid ${theme?.border || '#444'}`,
                    background: theme?.surface || theme?.surfaceAlt || theme?.panel || '#241c3a',
                    color: theme?.text || '#fff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>{(sections?.find(s => s.id === catSection)?.emoji || '')} {(sections?.find(s => s.id === catSection)?.name) || 'Sélectionner'}</span>
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: theme?.text }}>{'▾'}</span>
                </button>
              </div>

              {sectionOpen && (
                <div ref={sectionRef} onMouseDown={e => e.stopPropagation()} style={{ position: 'absolute', zIndex: 4000, left: 0, right: 0, marginTop: 8, maxHeight: 240, overflow: 'auto', borderRadius: 8, border: `1px solid ${theme?.border || '#444'}`, background: theme?.surface || theme?.surfaceAlt || theme?.panel || '#241c3a' }}>
                  {sections?.map(s => (
                    <div key={s.id} onClick={() => { setCatSection(s.id); setSectionOpen(false); }} style={{ padding: 10, display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', color: theme?.text, borderBottom: `1px solid ${theme?.border || '#2f2b33'}` }}>
                      <div style={{ width: 28 }}>{s.emoji}</div>
                      <div style={{ flex: 1 }}>{s.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12, border: `1.5px solid ${theme?.accent1 || '#f59e42'}`, borderRadius: 12, padding: 16, background: theme?.surface || theme?.surfaceAlt || theme?.panel || 'transparent' }}>
          <PanelTitle color={theme?.accent1 || '#10b981'} style={{ margin: 0 }}>MODULE</PanelTitle>

          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 12, color: theme?.subtext || '#ccc', marginBottom: 6 }}>Titre</label>
            <TextInput placeholder="Titre du module" value={subTitle} onChange={e => setSubTitle(e.target.value)} />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: theme?.subtext || '#ccc', marginBottom: 6 }}>Description</label>
            <div style={{ marginTop: 8 }}>
              <TiptapEditor value={subDesc} onChange={setSubDesc} darkMode={darkMode} theme={theme} style={{ minHeight: 160 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <div className="rotate3d-perspective" style={{ perspective: 800 }}>
            <CubeButton3D
              width={220}
              height={48}
              depth={48}
              axis="X"
              style={{ boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.08)", borderRadius: mainTheme.borderRadius, margin: '0 auto', display: 'block', ...rotate3d.style }}
              faces={{
                front: { content: ((<><span role="img" aria-label="add">➕</span> <b>Ajouter un module</b></>)), background: theme?.button || mainTheme.primary, textColor: mainTheme.text },
                back: { content: ((<b>Ajouté</b>)), background: theme?.button || mainTheme.primary, textColor: mainTheme.text },
                left: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg },
                right: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg },
                top: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg },
                bottom: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg }
              }}
              borderColor={theme?.accent1 || mainTheme.accent1}
              borderRadius={mainTheme.borderRadius}
              onClick={e => {
                if (!catTitle.trim() || !subTitle.trim()) return;
                rotate3d.handleClick(e);
                try { const btn = e.currentTarget; const cubeInner = btn.querySelector('.cube-btn-inner'); cubeInner && cubeInner.classList.add('rotate-360-x'); setTimeout(() => cubeInner && cubeInner.classList.remove('rotate-360-x'), 600); } catch (err) {}
                createAndClose();
              }}
              onTransitionEnd={rotate3d.handleTransitionEnd}
            />
          </div>
        </div>

        {showSpiralPicker && pickerPos && (
          <div ref={spiralRef} onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 1400, transform: `scale(${pickerPos.scale})`, transformOrigin: 'top left', pointerEvents: 'auto' }}>
            <SpiralColorPickerSingleModal value={catColor} onChange={c => setCatColor(c)} theme={theme} pickerKey={`new-cat`} showFavorites={false} clearButton={<button onClick={e => { e.stopPropagation(); setCatColor('#ffffff'); }} style={{ width: 40, height: 40, padding: 8, borderRadius: 8, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Clear color">✖</button>} />
          </div>
        )}

        <EmojiPicker open={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} onSelect={em => { setCatEmoji(em); setShowEmojiPicker(false); }} theme={theme} />

      </div>
    </div>
  );
}
