import React from "react";
import ReactDOM from "react-dom";
import FontSizeDropdown from "./FontSizeDropdown";
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaHeading, FaListUl, FaListOl, FaLink, FaImage, FaTable, FaUndo, FaRedo, FaHighlighter } from "react-icons/fa";
import { MdFormatColorText, MdClose } from "react-icons/md";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { SpiralColorPickerDoubleModal } from "../spiral-picker";
import { useMobilePickerKeyboard, isMobileDevice } from "./useMobilePickerKeyboard";

export default function TiptapToolbar({ editor, theme, highlightColor, setHighlightColor, toolbarLeft, toolbarTop }) {
  const [showTextPicker, setShowTextPicker] = React.useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = React.useState(false);
  const [activePicker, setActivePicker] = React.useState('highlight');
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => { setIsMobile(isMobileDevice()); const handleResize = () => setIsMobile(isMobileDevice()); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  const pickerOpen = showTextPicker || showHighlightPicker;
  useMobilePickerKeyboard(pickerOpen && isMobile, 320);
  const closePicker = React.useCallback(() => { setShowTextPicker(false); setShowHighlightPicker(false); }, []);
  const [currentFontSize, setCurrentFontSize] = React.useState(16);
  React.useEffect(() => {
    if (!editor) return;
    const updateFontSize = () => {
      const attr = editor.getAttributes('textStyle');
      let size = 16;
      if (attr && attr.fontSize) { const parsed = parseInt(attr.fontSize); if (!isNaN(parsed)) size = parsed; }
      setCurrentFontSize(size);
    };
    updateFontSize();
    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);
    return () => { editor.off('selectionUpdate', updateFontSize); editor.off('transaction', updateFontSize); };
  }, [editor]);

  const editorValid = editor && typeof editor.getAttributes === 'function' && typeof editor.chain === 'function' && typeof editor.isActive === 'function' && typeof editor.on === 'function' && typeof editor.off === 'function';
  if (!editorValid) {
    return (
      <div style={{ color: 'red', background: '#271d44', padding: 12, borderRadius: 8, fontWeight: 600 }}>
        Erreur : l’éditeur n’est pas initialisé ou incomplet.<br />
        Vérifiez la prop <b>editor</b> passée au composant TiptapToolbar.<br />
        <span style={{ fontSize: 13, fontWeight: 400 }}>Méthodes attendues : getAttributes, chain, isActive, on, off.</span>
      </div>
    );
  }

  const toolbarNode = (
    <div className="tiptap-toolbar-mobile" style={{ position: 'fixed', left: 250                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            , top: '50%', transform: 'translateY(-50%)', zIndex: 2147483648, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: theme?.surface || theme?.surfaceAlt || 'linear-gradient(120deg, #271d44 0%, #3a2a5c 60%, #241c3a 100%)', borderRadius: 12, padding: '10px 6px', border: `1.8px solid ${theme?.accent1 || '#f59e42'}`, boxShadow: '0 6px 28px rgba(0,0,0,0.10)', fontSize: 18, width: 52, minHeight: 44 }}>
      <button title="Surligner" style={{ background: 'none', border: 'none', color: (() => { const attrs = editor.getAttributes('highlight'); return editor.isActive('highlight') && attrs?.color ? attrs.color : theme?.text || '#fff'; })(), cursor: 'pointer', padding: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderRadius: 6, filter: editor.isActive('highlight') ? 'drop-shadow(0 0 2px #0008)' : 'none', transition: 'color 0.15s', marginBottom: 10, }} onClick={() => { const attrs = editor.getAttributes('highlight'); if (showHighlightPicker && editor.isActive('highlight') && attrs?.color) { editor.chain().focus().unsetHighlight().run(); setHighlightColor(null); setShowHighlightPicker(false); } else { setActivePicker('highlight'); setShowHighlightPicker(v => !v); } }}>
        <FaHighlighter style={{ fontSize: 15, width: 15, height: 15, display: 'block', margin: '0 auto' }} />
      </button>
      <button title="Couleur texte" style={{ background: 'none', border: 'none', color: editor.getAttributes('textStyle').color || theme?.text || '#fff', cursor: 'pointer', padding: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderRadius: 6, transition: 'color 0.15s', marginBottom: 10, }} onClick={() => { const color = editor.getAttributes('textStyle').color; if (showTextPicker && color) { editor.chain().focus().unsetColor().run(); setShowTextPicker(false); } else { setActivePicker('text'); setShowTextPicker(v => !v); } }}>
        <MdFormatColorText style={{ fontSize: 15, width: 15, height: 15, display: 'block', margin: '0 auto' }} />
      </button>
      {(showTextPicker || showHighlightPicker) && (
        isMobile ? (
          ReactDOM.createPortal(
            <>
              <div onClick={closePicker} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30000, }} />
              <div className="spiral-picker-container-mobile">
                <button onClick={closePicker} style={{ position: 'absolute', top: 8, right: 12, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, }} title="Fermer"><MdClose style={{ fontSize: 20, color: '#fff' }} /></button>
                <div className="spiral-picker-mobile-switch">
                  <button className={activePicker === 'highlight' ? 'active' : ''} onClick={() => { setActivePicker('highlight'); setShowHighlightPicker(true); }}> <FaHighlighter /> Surligner</button>
                  <button className={activePicker === 'text' ? 'active' : ''} onClick={() => { setActivePicker('text'); setShowTextPicker(true); }}> <MdFormatColorText /> Texte</button>
                </div>
                <SpiralColorPickerDoubleModal value={activePicker === 'highlight' ? (highlightColor || '#fbbf24') : (editor.getAttributes('textStyle').color || theme?.text || '#fff')} onChange={color => { if (activePicker === 'highlight') { if (color === 'none') { editor.chain().focus().unsetHighlight().run(); setHighlightColor(null); } else { editor.chain().focus().unsetHighlight().setHighlight({ color }).run(); setTimeout(() => { const attrs = editor.getAttributes('highlight'); setHighlightColor(attrs?.color || color); }, 0); } } else { if (color === 'none') { editor.chain().focus().unsetColor().run(); } else { editor.chain().focus().setColor(color).run(); } } } } theme={theme} pickerKey={activePicker} showTextPicker={showTextPicker} showHighlightPicker={showHighlightPicker} activePicker={activePicker} setActivePicker={setActivePicker} isMobile={isMobile} textIconNode={<MdFormatColorText style={{ fontSize: 22, color: theme?.accent1 || '#fbbf24', filter: 'drop-shadow(0 1px 2px #0008)' }} title="Texte" />} highlightIconNode={<FaHighlighter style={{ fontSize: 20, color: theme?.accent1 || '#fbbf24', filter: 'drop-shadow(0 1px 2px #0008)' }} title="Surligneur" />} />
              </div>
            </>,
            document.body
          )
        ) : (
          <div className="spiral-picker-container-mobile" style={{ position: 'fixed', top: '50%', left: 96, transform: 'translateY(-50%)', zIndex: 30000 }}>
            <SpiralColorPickerDoubleModal value={activePicker === 'highlight' ? (highlightColor || '#fbbf24') : (editor.getAttributes('textStyle').color || theme?.text || '#fff')} onChange={color => { if (activePicker === 'highlight') { if (color === 'none') { editor.chain().focus().unsetHighlight().run(); setHighlightColor(null); } else { editor.chain().focus().unsetHighlight().setHighlight({ color }).run(); setTimeout(() => { const attrs = editor.getAttributes('highlight'); setHighlightColor(attrs?.color || color); }, 0); } } else { if (color === 'none') { editor.chain().focus().unsetColor().run(); } else { editor.chain().focus().setColor(color).run(); } } } } theme={theme} pickerKey={activePicker} showTextPicker={showTextPicker} showHighlightPicker={showHighlightPicker} activePicker={activePicker} setActivePicker={setActivePicker} isMobile={isMobile} textIconNode={<MdFormatColorText style={{ fontSize: 22, color: theme?.accent1 || '#fbbf24', filter: 'drop-shadow(0 1px 2px #0008)' }} title="Texte" />} highlightIconNode={<FaHighlighter style={{ fontSize: 20, color: theme?.accent1 || '#fbbf24', filter: 'drop-shadow(0 1px 2px #0008)' }} title="Surligneur" />} />
          </div>
        )
      )}
      <FontSizeDropdown value={currentFontSize} onChange={size => editor.chain().focus().setMark('textStyle').setFontSize(size + 'px').run()} />
      {[ { title: 'Gras', icon: FaBold, active: editor.isActive('bold'), onClick: e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); } }, { title: 'Italique', icon: FaItalic, active: editor.isActive('italic'), onClick: e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); } }, { title: 'Souligné', icon: FaUnderline, active: editor.isActive('underline'), onClick: e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); } }, { title: 'Barré', icon: FaStrikethrough, active: editor.isActive('strike'), onClick: e => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); } }, { title: 'Titre', icon: FaHeading, active: editor.isActive('heading', { level: 2 }), onClick: e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); } }, { title: 'Liste à puces', icon: FaListUl, active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() }, { title: 'Liste numérotée', icon: FaListOl, active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() }, { title: 'Lien', icon: FaLink, active: editor.isActive('link'), onClick: () => { const url = window.prompt('URL du lien'); if (url) editor.chain().focus().setLink({ href: url }).run(); } }, { title: 'Image', icon: FaImage, active: false, onClick: () => { const url = window.prompt('URL de l\'image'); if (url) editor.chain().focus().setImage({ src: url }).run(); } }, { title: 'Tableau', icon: FaTable, active: editor.isActive('table'), onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() }, { title: 'Effacer format', icon: IoMdRemoveCircleOutline, active: false, onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run() }, { title: 'Annuler', icon: FaUndo, active: false, onClick: () => editor.chain().focus().undo().run() }, { title: 'Rétablir', icon: FaRedo, active: false, onClick: () => editor.chain().focus().redo().run() }, ].map(({ title, icon, onClick, active }) => (
        <button key={title} title={title} onClick={onClick} style={{ background: 'none', border: 'none', color: active ? theme?.accent1 || '#f59e42' : theme?.text || '#fff', cursor: 'pointer', padding: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderRadius: 6, boxSizing: 'border-box', transition: 'color 0.15s', marginBottom: 10, }}>
          {React.createElement(icon, { style: { fontSize: 15, width: 15, height: 15, display: 'block', margin: '0 auto' } })}
        </button>
      ))}
    </div>
  );

  try {
    if (typeof document !== 'undefined' && document.body) {
      return ReactDOM.createPortal(toolbarNode, document.body);
    }
  } catch (e) { }

  return toolbarNode;
}
