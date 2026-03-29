import React, { useRef, useState } from "react";
import { TiptapEditor } from "../tiptap";
import { TextInput, PanelTitle } from "../shared/FormInputs";
import CubeButton3D from "../../../ui/visual/CubeButton";
import useRotate3D from "../../../ui/animations/useRotate3D";
import "../../../ui/animations/rotate3d.css";
import mainTheme from "../../../theme/theme";

export default function ModuleEditForm({
  editTitle,
  setEditTitle,
  editText,
  setEditText,
  darkMode,
  theme,
  setEditorInstance,
  selectionInfo,
  applyFormatting,
  applyColorToSelection,
  tableMenuOpen,
  setTableMenuOpen,
  tableTemplates,
  quickColors,
  selectionCustomColor,
  setSelectionCustomColor,
  saveEditSub,
  cancelEdit,
  editColor,
  setEditColor,
  normalizeLineBreaks
}) {
  const [highlightColor, setHighlightColor] = React.useState('#fbbf24');
  const rotate3d = useRotate3D({ axis: "X", duration: 600, direction: 1, animate: true });
  const editorInstanceRef = useRef(null);

  const handleTextChange = (val) => {
    setEditText(val);
  };
  const handleSetEditorInstance = (instance) => {
    editorInstanceRef.current = instance;
    setEditorInstance && setEditorInstance(instance);
  };

  return (
    <div style={{
      marginTop: 40,
      margin: '32px auto',
      background: theme?.surfaceAlt || theme?.surface || theme?.panel || "#23202d",
      borderRadius: 14,
      padding: "20px",
      border: `1.5px solid ${theme?.accent1 || "#f59e42"}`,
      boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.08)",
      maxWidth: 640,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <PanelTitle color={theme?.accent1 || "#f59e42"}>✏️ Modifier un module</PanelTitle>

      <div style={{ maxWidth: 560, margin: '0 auto 12px', width: '100%' }}>
        <TextInput
          placeholder="Titre"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          style={{ marginBottom: 0, padding: '10px 14px', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <TiptapEditor
          value={editText}
          onChange={handleTextChange}
          darkMode={darkMode}
          theme={theme}
          setEditorInstance={handleSetEditorInstance}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <div className="rotate3d-perspective" style={{ perspective: 800 }}>
          <CubeButton3D
            width={220}
            height={48}
            depth={48}
            axis="X"
            style={{
              boxShadow: theme?.shadow || "0 8px 32px rgba(0,0,0,0.08)",
              borderRadius: mainTheme.borderRadius,
              margin: '0 auto',
              display: 'block',
              ...rotate3d.style
            }}
            faces={{
              front: {
                content: (<><span role="img" aria-label="save">💾</span> <b>Enregistrer</b></>),
                background: theme?.button || mainTheme.primary || "linear-gradient(120deg, #1a1330 0%, #271d44 60%, #3a2566 100%)",
                textColor: mainTheme.text
              },
              back: { content: (<b>Enregistré</b>), background: theme?.button || mainTheme.primary || "#271d44", textColor: mainTheme.text },
              left: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg || "#120a22" },
              right: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg || "#3a2566" },
              top: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg || "#271d44" },
              bottom: { content: "", background: theme?.button || mainTheme.primary || mainTheme.bg || "#1a1330" }
            }}
            borderColor={theme?.accent1 || mainTheme.accent1 || "#fff4"}
            borderRadius={mainTheme.borderRadius}
            onClick={e => {
              let currentText = editText;
              if (editorInstanceRef.current && typeof editorInstanceRef.current.getHTML === 'function') {
                currentText = editorInstanceRef.current.getHTML();
              }
              const normalized = normalizeLineBreaks(currentText);
              setEditText(normalized);
              rotate3d.handleClick(e);
              setTimeout(() => {
                saveEditSub && saveEditSub(normalized);
              }, 0);
            }}
            onTransitionEnd={rotate3d.handleTransitionEnd}
          />
        </div>
      </div>
    </div>
  );
}
