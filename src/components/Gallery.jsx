import React, { useState, useEffect, useRef } from "react";

export default function Gallery({
  showGallery,
  setShowGallery,
  isAuthenticated,
  editMode,
  setEditMode,
  // optional controlled props for gallery image flow (App.jsx provides these)
  isAddingImage,
  setIsAddingImage,
  newImageCatId,
  setNewImageCatId,
  newImageSubId,
  setNewImageSubId,
  newImageDesc,
  setNewImageDesc,
  newImageUrl,
  setNewImageUrl,
  fileInputRef,
  onFileChange,
  saveImage,
  galleryUploadBusy,
  galleryCategories,
  galleryFilterSectionId,
  setGalleryFilterSectionId,
  galleryFilterCatId,
  setGalleryFilterCatId,
  filteredGalleryImages,
  theme,
  darkMode,
  layout,
  data,
  setSelectedCategoryId,
  setExpandedCategoryId,
  setExpandedCategories,
  subRefs,
  // ModulePage can pass updateData so Gallery can persist images into module data
  updateData,
  // optional: pass an imgbb API key via prop or set REACT_APP_IMGBB_API_KEY
  imgbbApiKey,
}) {
  const padding = layout.modalPad || 20;

  // canonical arrays from data
  const sectionsArr = Array.isArray(data?.sections) ? data.sections : [];
  const categoriesArr = Array.isArray(data?.categories) ? data.categories : [];
  const galleryCats = Array.isArray(galleryCategories) ? galleryCategories : categoriesArr;

  // Local uncontrolled state fallbacks when parent doesn't provide setters
  const [localGalleryFilterSectionId, setLocalGalleryFilterSectionId] = useState(null);
  const [localGalleryFilterCatId, setLocalGalleryFilterCatId] = useState(null);
  const [localNewImageCatId, setLocalNewImageCatId] = useState(null);
  const [localNewImageSubId, setLocalNewImageSubId] = useState(null);
  const [localNewImageDesc, setLocalNewImageDesc] = useState("");
  const [localNewImageUrl, setLocalNewImageUrl] = useState("");
  const [localIsAddingImage, setLocalIsAddingImage] = useState(false);
  const [localGalleryUploadBusy, setLocalGalleryUploadBusy] = useState(false);
  const internalFileRef = useRef(null);

  const currentGalleryFilterSectionId = typeof galleryFilterSectionId !== 'undefined' && galleryFilterSectionId !== null ? galleryFilterSectionId : localGalleryFilterSectionId;
  const currentGalleryFilterCatId = typeof galleryFilterCatId !== 'undefined' && galleryFilterCatId !== null ? galleryFilterCatId : localGalleryFilterCatId;

  const currentNewImageCatId = typeof newImageCatId !== 'undefined' ? newImageCatId : localNewImageCatId;
  const currentNewImageSubId = typeof newImageSubId !== 'undefined' ? newImageSubId : localNewImageSubId;
  const currentNewImageDesc = typeof newImageDesc !== 'undefined' ? newImageDesc : localNewImageDesc;
  const currentNewImageUrl = typeof newImageUrl !== 'undefined' ? newImageUrl : localNewImageUrl;
  const currentIsAddingImage = typeof isAddingImage !== 'undefined' ? isAddingImage : localIsAddingImage;
  const currentGalleryUploadBusy = typeof galleryUploadBusy !== 'undefined' ? galleryUploadBusy : localGalleryUploadBusy;

  const setFilterSectionId = (v) => {
    if (typeof setGalleryFilterSectionId === 'function') return setGalleryFilterSectionId(v);
    return setLocalGalleryFilterSectionId(v);
  };
  const setFilterCatId = (v) => {
    if (typeof setGalleryFilterCatId === 'function') return setGalleryFilterCatId(v);
    return setLocalGalleryFilterCatId(v);
  };
  const setNewImageCatIdWrapper = (v) => {
    if (typeof setNewImageCatId === 'function') return setNewImageCatId(v);
    return setLocalNewImageCatId(v);
  };
  const setNewImageSubIdWrapper = (v) => {
    if (typeof setNewImageSubId === 'function') return setNewImageSubId(v);
    return setLocalNewImageSubId(v);
  };
  const setNewImageUrlWrapper = (v) => {
    if (typeof setNewImageUrl === 'function') return setNewImageUrl(v);
    return setLocalNewImageUrl(v);
  };
  const setNewImageDescWrapper = (v) => {
    if (typeof setNewImageDesc === 'function') return setNewImageDesc(v);
    return setLocalNewImageDesc(v);
  };
  const setIsAddingImageWrapper = (v) => {
    if (typeof setIsAddingImage === 'function') return setIsAddingImage(v);
    return setLocalIsAddingImage(v);
  };
  const setGalleryUploadBusyLocal = (v) => setLocalGalleryUploadBusy(v);

  const selectBaseStyle = {
    width: '100%',
    padding: '10px 12px',
    paddingRight: '40px',
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    backgroundColor: darkMode ? (theme.panel || 'rgba(26,30,46,0.95)') : (theme.bg || '#f8fafc'),
    color: theme.text,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    boxSizing: 'border-box'
  };
  const selectWrapperStyle = { position: 'relative' };
  const arrowStyle = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: theme.subtext, fontSize: 12 };

  // Build images list from `data` when parent didn't provide `filteredGalleryImages`
  const builtImages = [];
  (categoriesArr || []).forEach((cat) => {
    (cat.subs || []).forEach((sub) => {
      const imgs = Array.isArray(sub.images) ? sub.images : (sub.image ? [sub.image] : []);
      imgs.forEach((img, idx) => {
        const url = typeof img === 'string' ? img : (img && (img.url || img.src || img.image) ? (img.url || img.src || img.image) : '');
        const desc = img && typeof img === 'object' ? (img.desc || img.description || '') : '';
        builtImages.push({ url, desc, catId: cat.id, subId: sub.id, catName: cat.name, subTitle: sub.title || sub.name || '', index: idx });
      });
    });
  });

  let filteredImages = Array.isArray(filteredGalleryImages) ? filteredGalleryImages : builtImages;
  if (currentGalleryFilterSectionId) {
    filteredImages = filteredImages.filter((img) => {
      const cat = categoriesArr.find((c) => c.id === img.catId);
      return cat && (cat.sectionId == currentGalleryFilterSectionId);
    });
  }
  if (currentGalleryFilterCatId) {
    filteredImages = filteredImages.filter((img) => img.catId == currentGalleryFilterCatId);
  }

  // Handlers: file upload fallback (ImgBB), save and delete image (persist via updateData when available)
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }
    try {
      setGalleryUploadBusyLocal(true);
      const form = new FormData();
      form.append('image', file);
      const apiKey = imgbbApiKey || process.env.REACT_APP_IMGBB_API_KEY || 'e6becf18c2ca24aef7f37411409d42ac';
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: form,
      });
      const dataRes = await res.json();
      if (dataRes && dataRes.success) {
        setNewImageUrlWrapper(dataRes.data.url);
      } else {
        alert('Erreur upload ImgBB');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur upload image: ' + (err.message || err));
    } finally {
      setGalleryUploadBusyLocal(false);
    }
  };

  const handleSaveImage = () => {
    const url = currentNewImageUrl;
    const catId = currentNewImageCatId;
    const subId = currentNewImageSubId;
    const desc = currentNewImageDesc;
    if (!url) {
      alert('Aucune image à enregistrer.');
      return;
    }
    if (!catId || !subId) {
      alert('Sélectionne une catégorie et un module.');
      return;
    }
    if (typeof updateData === 'function') {
      setGalleryUploadBusyLocal(true);
      setTimeout(() => {
        updateData((d) => ({
          ...d,
          categories: d.categories.map((cat) =>
            cat.id === catId
              ? {
                  ...cat,
                  subs: cat.subs.map((sub) =>
                    sub.id === subId
                      ? {
                          ...sub,
                          images: [
                            ...(Array.isArray(sub.images) ? sub.images : sub.image ? [sub.image] : []),
                            { url, desc },
                          ],
                        }
                      : sub
                  ),
                }
              : cat
          ),
        }));
        setNewImageUrlWrapper('');
        setNewImageDescWrapper('');
        setNewImageCatIdWrapper(null);
        setNewImageSubIdWrapper(null);
        setIsAddingImageWrapper(false);
        setGalleryUploadBusyLocal(false);
      }, 400);
    } else {
      // fallback: persist in localStorage
      try {
        const key = 'gallery_images_local';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ url, desc, catId, subId });
        localStorage.setItem(key, JSON.stringify(existing));
        setNewImageUrlWrapper('');
        setNewImageDescWrapper('');
        setNewImageCatIdWrapper(null);
        setNewImageSubIdWrapper(null);
        setIsAddingImageWrapper(false);
      } catch (e) {
        console.error('Failed to persist gallery image locally', e);
      }
    }
  };

  const handleDeleteImage = (catId, subId, index) => {
    if (!window.confirm('Supprimer cette image ?')) return;
    if (typeof updateData === 'function') {
      updateData((d) => ({
        ...d,
        categories: d.categories.map((cat) =>
          cat.id === catId
            ? {
                ...cat,
                subs: cat.subs.map((sub) =>
                  sub.id === subId
                    ? {
                        ...sub,
                        images: Array.isArray(sub.images) ? sub.images.filter((_, i) => i !== index) : sub.images,
                      }
                    : sub
                ),
              }
            : cat
        ),
      }));
    } else {
      try {
        const key = 'gallery_images_local';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = existing.findIndex((it) => it.catId === catId && it.subId === subId && it.index === index);
        if (idx >= 0) {
          existing.splice(idx, 1);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) {
        console.error('Failed to delete local gallery image', e);
      }
    }
  };

  if (!showGallery) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 35%), radial-gradient(circle at 80% 10%, rgba(16,185,129,0.18), transparent 30%), rgba(0,0,0,0.82)",
      backdropFilter: "blur(6px)",
      zIndex: 200,
      overflow: "auto",
      padding: padding
    }}>
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        backgroundColor: darkMode ? "rgba(12,14,26,0.9)" : "rgba(255,255,255,0.94)",
        borderRadius: 18,
        padding: padding,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: 'nowrap', gap: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2 style={{ margin: 0, color: theme.accent1, letterSpacing: 0.4, fontSize: 24 }}>📷 Galerie</h2>
            <span style={{ color: theme.subtext, fontSize: 13 }}>Ajoute, trie et consulte tes photos par module.</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isAuthenticated && (
              <button
                  onClick={() => setIsAddingImageWrapper((v) => !v)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: (editMode || currentIsAddingImage) ? "linear-gradient(120deg, #10b981, #22d3ee)" : (theme.surfaceAlt || theme.surface || theme.panel),
                    color: (editMode || currentIsAddingImage) ? "white" : theme.text,
                    border: `1px solid ${theme.border}`,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: (editMode || currentIsAddingImage) ? "0 8px 20px rgba(16,185,129,0.35)" : "none"
                  }}
                >
                {(editMode || currentIsAddingImage) ? "Mode édition" : "Editer"}
              </button>
            )}
            <button
              onClick={() => setShowGallery(false)}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 16,
              }}>✖</button>
          </div>
        </div>

        {currentIsAddingImage && (
          <div style={{ background: darkMode ? "rgba(20,23,38,0.9)" : "rgba(248,250,252,0.9)", border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, marginBottom: 22, boxShadow: "0 10px 28px rgba(0,0,0,0.12)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: theme.text }}>Catégorie</label>
              <div style={selectWrapperStyle}>
                <select
                  value={currentNewImageCatId || ""}
                  onChange={(e) => setNewImageCatIdWrapper(e.target.value ? parseInt(e.target.value) : null)}
                  style={selectBaseStyle}
                >
                  <option value="">-- Sélectionne --</option>
                    {categoriesArr.map((cat) => (<option key={cat.id} value={cat.id} style={{ backgroundColor: darkMode ? 'rgba(26,30,46,0.95)' : '#f8fafc', color: theme.text }}>{cat.icon} {cat.name}</option>))}
                </select>
                <span style={arrowStyle}>{'▾'}</span>
              </div>
            </div>
            {currentNewImageCatId && (
              <div style={selectWrapperStyle}>
                <select
                  value={currentNewImageSubId || ""}
                  onChange={(e) => setNewImageSubIdWrapper(e.target.value ? parseInt(e.target.value) : null)}
                  style={selectBaseStyle}
                >
                  <option value="">-- Sélectionne --</option>
                  {(categoriesArr.find((cat) => cat.id === currentNewImageCatId)?.subs || []).map((sub) => (
                    <option key={sub.id} value={sub.id} style={{ backgroundColor: darkMode ? 'rgba(26,30,46,0.95)' : '#f8fafc', color: theme.text }}>{sub.title}</option>
                  ))}
                </select>
                <span style={arrowStyle}>{'▾'}</span>
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", color: theme.text }}>Description (optionnel)</label>
              <input value={currentNewImageDesc} onChange={(e) => setNewImageDescWrapper(e.target.value)} placeholder="Ex: angle du robinet" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${theme.border}`, backgroundColor: darkMode ? "rgba(26,30,46,0.95)" : "#f8fafc", color: theme.text, boxShadow: darkMode ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.8)", transition: "border-color 120ms ease, box-shadow 120ms ease" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="file" ref={fileInputRef || internalFileRef} onChange={(e) => { if (typeof onFileChange === 'function') return onFileChange(e); return handleFileChange(e); }} accept="image/*" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px dashed ${theme.border}`, backgroundColor: darkMode ? "rgba(26,30,46,0.9)" : "#f8fafc", color: theme.text, transition: "border-color 120ms ease, box-shadow 120ms ease" }} />
              {currentNewImageUrl && <img src={currentNewImageUrl} alt="Preview" style={{ width: "100%", maxHeight: 200, borderRadius: 10, objectFit: "cover", border: `1px solid ${theme.border}` }} />}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { if (typeof saveImage === 'function') return saveImage(); return handleSaveImage(); }} disabled={currentGalleryUploadBusy} style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: currentGalleryUploadBusy ? "#6b7280" : "linear-gradient(120deg, #10b981, #0ea5e9)", color: "white", border: "none", cursor: currentGalleryUploadBusy ? "not-allowed" : "pointer", fontWeight: 800 }}>
                  {currentGalleryUploadBusy ? "Upload..." : "💾 Enregistrer"}
                </button>
                <button onClick={() => { setNewImageUrlWrapper(""); setNewImageCatIdWrapper(null); setNewImageSubIdWrapper(null); setNewImageDescWrapper(""); }} disabled={currentGalleryUploadBusy} style={{ padding: "10px 14px", borderRadius: 12, backgroundColor: "#6b7280", color: "white", border: "none", cursor: currentGalleryUploadBusy ? "not-allowed" : "pointer", fontWeight: 700, opacity: currentGalleryUploadBusy ? 0.75 : 1 }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
          <div style={{ background: theme.surface || theme.surfaceAlt || theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12, boxShadow: theme.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: theme.subtext, fontSize: 12 }}>
              <span>🌐</span><span>Grande partie</span>
            </div>
              <div style={selectWrapperStyle}>
              <select value={currentGalleryFilterSectionId ?? ""} onChange={(e) => setFilterSectionId(e.target.value ? Number(e.target.value) : null)} style={selectBaseStyle}>
                <option value="" style={{ backgroundColor: theme.bg, color: theme.text }}>Toutes</option>
                {sectionsArr.map((s) => (<option key={s.id} value={s.id} style={{ backgroundColor: theme.bg, color: theme.text }}>{s.emoji} {s.name}</option>))}
              </select>
              <span style={arrowStyle}>{'▾'}</span>
            </div>
          </div>
          <div style={{ background: theme.surface || theme.surfaceAlt || theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12, boxShadow: theme.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: theme.subtext, fontSize: 12 }}>
              <span>📂</span><span>Catégorie</span>
            </div>
              <div style={selectWrapperStyle}>
              <select value={currentGalleryFilterCatId ?? ""} onChange={(e) => setFilterCatId(e.target.value ? Number(e.target.value) : null)} style={selectBaseStyle}>
                <option value="" style={{ backgroundColor: theme.bg, color: theme.text }}>Toutes</option>
                {galleryCats.map((cat) => (<option key={cat.id} value={cat.id} style={{ backgroundColor: theme.bg, color: theme.text }}>{cat.icon} {cat.name}</option>))}
              </select>
              <span style={arrowStyle}>{'▾'}</span>
            </div>
          </div>
        </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {filteredImages.map((img) => (
            <div key={`${img.catId}-${img.subId}-${img.index}`} style={{ border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden", background: theme.surface || theme.surfaceAlt || theme.panel, boxShadow: "0 12px 28px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative" }}>
                <img src={img.url} alt={img.desc || img.subTitle} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, padding: "4px 10px", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>{img.catName} • {img.subTitle}</div>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {img.desc && <div style={{ fontSize: 13, color: theme.text }}>{img.desc}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button onClick={() => {
                    setSelectedCategoryId(img.catId);
                    setExpandedCategories && setExpandedCategories(prev => ({ ...prev, [img.catId]: true }));
                    // wait for DOM to render then scroll with header offset, retry if necessary
                    const scrollToSub = (attempt = 0) => {
                      const subRef = subRefs && subRefs.current && subRefs.current[img.subId];
                      if (subRef) {
                        const headerEl = document.querySelector('header');
                        const headerOffset = headerEl ? headerEl.offsetHeight : 140;
                        const rect = subRef.getBoundingClientRect();
                        const target = window.scrollY + rect.top - headerOffset - 12;
                        try { window.scrollTo({ top: target, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, target); }
                        setShowGallery(false);
                      } else if (attempt < 12) {
                        setTimeout(() => scrollToSub(attempt + 1), 80);
                      } else {
                        // fallback: close gallery
                        setShowGallery(false);
                      }
                    };
                    setTimeout(() => scrollToSub(0), 80);
                  }} style={{ flex: 1, padding: "10px", borderRadius: 10, backgroundColor: "#3b82f6", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, boxShadow: "0 8px 18px rgba(59,130,246,0.35)" }}>👁️ Voir</button>
                  {isAuthenticated && (editMode || currentIsAddingImage) && (
                    <button onClick={() => handleDeleteImage(img.catId, img.subId, img.index)} style={{ width: 44, padding: "10px", borderRadius: 10, backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
