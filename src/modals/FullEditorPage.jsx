import React from "react";
import EditorPanel from "../components/EditorPanel";
import NewCategoryModal from "../components/NewCategoryModal";

function FullEditorPage({ open, onClose, sections, categories, darkMode, theme, 
  editingSectionId, editSectionName, setEditSectionName, editSectionEmoji, setEditSectionEmoji, editSectionColor, setEditSectionColor, startEditSection, saveEditSection, cancelEditSection, deleteSection,
  editingCategoryId, editCategoryName, setEditCategoryName, editCategoryEmoji, setEditCategoryEmoji, editCategoryColor, setEditCategoryColor, startEditCategory, saveEditCategory, cancelEditCategory, deleteCategory,
  moveSubToCategory, moveCategoryToSection,
  ...editorProps
}) {
  const [showNewCategoryModal, setShowNewCategoryModal] = React.useState(false);
  const handleAddCategory = () => setShowNewCategoryModal(true);
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", overflowX: "hidden", pointerEvents: 'auto', padding: 24 }}>
      <div style={{ background: theme?.surfaceAlt || theme?.surface || '#241c3a', borderRadius: theme?.borderRadius || 16, padding: 24, minWidth: 0, maxWidth: 'min(760px, 96%)', width: '100%', margin: '0 auto', maxHeight: "calc(100vh - 64px)", boxShadow: theme?.shadow || "0 12px 48px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", border: `1px solid ${theme?.border || '#fff3'}`, position: "relative", overflowY: "auto", overflowX: "hidden", boxSizing: 'border-box', alignItems: 'center' }} className="no-scrollbar">
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 24, background: theme?.surfaceAlt || theme?.surface || 'transparent', color: theme?.text || '#fff', border: `1px solid ${theme?.border || 'transparent'}`, borderRadius: theme?.borderRadius || 8, padding: "7px 12px", fontWeight: 600, cursor: "pointer", zIndex: 10000 }}>
          &#10006;
        </button>
        <button onClick={handleAddCategory} title="Créer une catégorie ou une grande partie" style={{ position: "absolute", top: 64, right: 24, background: `linear-gradient(135deg, ${theme?.accent1} 0%, ${theme?.accent2} 100%)`, color: '#fff', border: 'none', borderRadius: theme?.borderRadius || 8, padding: "8px 12px", fontWeight: 600, cursor: "pointer", zIndex: 10000 }}>
          ➕
        </button>

        <div style={{ flex: 1, padding: 0, minWidth: 0, display: "flex", flexDirection: "column", position: "relative" }}>
          <EditorPanel
            {...editorProps}
            sections={sections}
            categories={categories}
            darkMode={darkMode}
            theme={theme}
          />
        </div>
        <NewCategoryModal
          open={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          sections={sections}
          categories={categories}
          addCategory={editorProps.addCategory}
          addSection={editorProps.addSection}
          setExpandedCategoryId={editorProps.setExpandedCategoryId}
          theme={theme}
          moveSubToCategory={moveSubToCategory}
          moveCategoryToSection={moveCategoryToSection}
          // section edit handlers
          editingSectionId={editingSectionId}
          editSectionName={editSectionName}
          setEditSectionName={setEditSectionName}
          editSectionEmoji={editSectionEmoji}
          setEditSectionEmoji={setEditSectionEmoji}
          editSectionColor={editSectionColor}
          setEditSectionColor={setEditSectionColor}
          startEditSection={startEditSection}
          saveEditSection={saveEditSection}
          cancelEditSection={cancelEditSection}
          deleteSection={deleteSection}
          // category edit handlers
          editingCategoryId={editingCategoryId}
          editCategoryName={editCategoryName}
          setEditCategoryName={setEditCategoryName}
          editCategoryEmoji={editCategoryEmoji}
          setEditCategoryEmoji={setEditCategoryEmoji}
          editCategoryColor={editCategoryColor}
          setEditCategoryColor={setEditCategoryColor}
          startEditCategory={startEditCategory}
          saveEditCategory={saveEditCategory}
          cancelEditCategory={cancelEditCategory}
          deleteCategory={deleteCategory}
        />
      </div>
    </div>
  );
}

export default FullEditorPage;
