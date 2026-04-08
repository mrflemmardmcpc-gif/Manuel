import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Gallery from "../components/Gallery";
import SubPanel from "../components/SubPanel";
import FullEditorPage from "../modals/FullEditorPage";
import mainTheme from "../theme/theme";
import "../AppTiptap.css";

export default function ModulePage({ isAdmin = false, onHome, moduleName = 'Module', dataOverride = null, onDirtyChange = null, exportRef = null }) {
  const moduleKey = (moduleName || 'Module').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const initial = dataOverride ? (dataOverride.value || dataOverride) : { sections: [], categories: [] };
  const baseSnapshotRef = React.useRef(JSON.stringify(initial));
  const [isDirty, setIsDirty] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [data, setData] = useState(initial);

  // Do NOT persist module edits to localStorage anymore. Always start from bundled `dataOverride`.
  useEffect(() => {
    try {
      setData(initial);
      baseSnapshotRef.current = JSON.stringify(initial);
    } catch (e) {
      console.error(`[ModulePage:${moduleName}] Error while initializing data:`, e);
    }
  }, [initial, moduleName]);

  const updateData = (updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // detect dirty state compared to original bundled data
      try {
        const snap = JSON.stringify(next || {});
        const dirty = snap !== (baseSnapshotRef.current || '');
        if (dirty !== isDirty) {
          setIsDirty(dirty);
          try { if (typeof onDirtyChange === 'function') onDirtyChange(dirty); } catch (e) {}
        }
      } catch (e) { /* ignore */ }
      // schedule autosave for admins (debounced) - will be defined below
      try {
        if (isAdmin && typeof scheduleAutosave === 'function') scheduleAutosave(next);
      } catch (e) {}
      return next;
    });
  };

  // Autosave helpers (debounced) for admins
  const autosaveTimerRef = useRef(null);
  const suppressAutosaveRef = useRef(false);
  const scheduleAutosave = (payload) => {
    try {
      if (!isAdmin) return;
      if (suppressAutosaveRef.current) return;
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await fetch('/api/export-set', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: moduleName, data: payload }) });
        } catch (e) {
          // ignore autosave errors
        }
      }, 1200);
    } catch (e) {}
  };

  useEffect(() => {
    return () => { if (autosaveTimerRef.current) { clearTimeout(autosaveTimerRef.current); autosaveTimerRef.current = null; } };
  }, []);

  // expose current data to parent via exportRef so App can POST it when pushing
  useEffect(() => {
    try {
      if (exportRef) {
        exportRef.current = () => data;
      }
    } catch (e) {}
  }, [exportRef, data]);

  // warn on unload if admin and dirty
  useEffect(() => {
    const handler = (e) => {
      if (isAdmin && isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isAdmin, isDirty]);

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [showEditSectionsPanel, setShowEditSectionsPanel] = useState(Boolean(isAdmin));

  const theme = mainTheme;
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? (window.innerWidth <= 720) : false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const layout = { sideWidth: 280, modalPad: 18, headerPad: isMobile ? 10 : 28, headerRowGap: isMobile ? 8 : 18, headerButtonPad: isMobile ? '4px' : '8px', headerIconSize: isMobile ? 14 : 18, headerTitle: isMobile ? 16 : 22 };
  const [editMode, setEditMode] = useState(Boolean(isAdmin));
  const [darkMode, setDarkMode] = useState(true);
  const [showGallery, setShowGallery] = useState(false);

  // Live-sync for admins: poll Upstash for remote changes and apply them live
  const lastLocalSnapRef = useRef(JSON.stringify(data || {}));
  const lastRemoteSnapRef = useRef(baseSnapshotRef.current || '');
  const mergedBaseRef = useRef(baseSnapshotRef.current || '');
  const [conflicts, setConflicts] = useState([]);

  const deepClone = (v) => { try { return JSON.parse(JSON.stringify(v || {})); } catch (e) { return v; } };
  const deepEqual = (a,b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; } };
  const mapById = (arr) => { const m = {}; (arr || []).forEach(it => { if (it && it.id !== undefined) m[String(it.id)] = it; }); return m; };

  const threeWayMerge = (base, local, remote) => {
    // focus on categories/subs merging; return { merged, conflicts: [] }
    try {
      const baseCats = (base && base.categories) ? base.categories : [];
      const localCats = (local && local.categories) ? local.categories : [];
      const remoteCats = (remote && remote.categories) ? remote.categories : [];
      const baseMap = mapById(baseCats);
      const localMap = mapById(localCats);
      const remoteMap = mapById(remoteCats);
      const mergedMap = Object.assign({}, localMap); // start from local
      const conflicts = [];
      const allIds = new Set([...Object.keys(baseMap), ...Object.keys(localMap), ...Object.keys(remoteMap)]);
      for (const id of allIds) {
        const b = baseMap[id];
        const l = localMap[id];
        const r = remoteMap[id];
        if (!b && r && !l) {
          // new remote category
          mergedMap[id] = deepClone(r);
          continue;
        }
        if (b && !r) {
          // remote deleted
          if (!l || deepEqual(b, l)) {
            delete mergedMap[id];
            continue;
          } else {
            conflicts.push({ type: 'category', id, reason: 'deleted-remotely', base: b, local: l, remote: null });
            continue;
          }
        }
        if (b && r) {
          if (!l) {
            // local missing, adopt remote
            mergedMap[id] = deepClone(r);
            continue;
          }
          // both exist - check if local changed vs base and remote changed vs base
          const baseEqLocal = deepEqual(b, l);
          const baseEqRemote = deepEqual(b, r);
          if (baseEqLocal && !baseEqRemote) {
            // local didn't change -> adopt remote
            mergedMap[id] = deepClone(r);
            continue;
          }
          if (!baseEqLocal && baseEqRemote) {
            // remote didn't change -> keep local
            mergedMap[id] = deepClone(l);
            continue;
          }
          if (!baseEqLocal && !baseEqRemote) {
            // both changed -> attempt subs merge
            const subsBase = (b.subs || []);
            const subsLocal = (l.subs || []);
            const subsRemote = (r.subs || []);
            const baseSubMap = mapById(subsBase);
            const localSubMap = mapById(subsLocal);
            const remoteSubMap = mapById(subsRemote);
            const mergedSubsMap = Object.assign({}, localSubMap);
            const allSubIds = new Set([...Object.keys(baseSubMap), ...Object.keys(localSubMap), ...Object.keys(remoteSubMap)]);
            for (const sid of allSubIds) {
              const sb = baseSubMap[sid];
              const sl = localSubMap[sid];
              const sr = remoteSubMap[sid];
              if (!sb && sr && !sl) { mergedSubsMap[sid] = deepClone(sr); continue; }
              if (sb && !sr) {
                if (!sl || deepEqual(sb, sl)) { delete mergedSubsMap[sid]; continue; }
                else { conflicts.push({ type: 'sub', id: sid, categoryId: id, reason: 'deleted-remotely', base: sb, local: sl, remote: null }); continue; }
              }
              if (sb && sr) {
                if (!sl) { mergedSubsMap[sid] = deepClone(sr); continue; }
                const baseEqLocalSub = deepEqual(sb, sl);
                const baseEqRemoteSub = deepEqual(sb, sr);
                if (baseEqLocalSub && !baseEqRemoteSub) { mergedSubsMap[sid] = deepClone(sr); continue; }
                if (!baseEqLocalSub && baseEqRemoteSub) { mergedSubsMap[sid] = deepClone(sl); continue; }
                if (!baseEqLocalSub && !baseEqRemoteSub) { conflicts.push({ type: 'sub', id: sid, categoryId: id, base: sb, local: sl, remote: sr }); continue; }
              }
            }
            // rebuild subs array preserving local order then appending new remote ones
            const mergedSubs = [];
            const seen = new Set();
            for (const s of subsLocal) { if (s && mergedSubsMap[String(s.id)]) { mergedSubs.push(mergedSubsMap[String(s.id)]); seen.add(String(s.id)); } }
            for (const s of subsRemote) { if (s && !seen.has(String(s.id))) { mergedSubs.push(mergedSubsMap[String(s.id)] || deepClone(s)); seen.add(String(s.id)); } }
            mergedMap[id] = Object.assign({}, deepClone(l), { subs: mergedSubs });
            continue;
          }
        }
      }
      // rebuild categories array preserving local order then appending new remote ones
      const mergedCats = [];
      const seenCats = new Set();
      for (const c of localCats) { if (c && mergedMap[String(c.id)]) { mergedCats.push(mergedMap[String(c.id)]); seenCats.add(String(c.id)); } }
      for (const c of remoteCats) { if (c && !seenCats.has(String(c.id))) { mergedCats.push(mergedMap[String(c.id)] || deepClone(c)); seenCats.add(String(c.id)); } }
      const merged = Object.assign({}, deepClone(local || {}), { categories: mergedCats });
      return { merged, conflicts };
    } catch (e) {
      return { merged: null, conflicts: [] };
    }
  };

  useEffect(() => {
    try { lastLocalSnapRef.current = JSON.stringify(data || {}); } catch (e) { lastLocalSnapRef.current = '' + (data || ''); }
  }, [data]);

  useEffect(() => {
    if (!isAdmin) return;
    let stopped = false;
    let timer = null;
    const fetchRemote = async () => {
      try {
        const q = encodeURIComponent(moduleName || '');
        const res = await fetch('/api/export-get?module=' + q, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) return; // ignore errors for now
        const json = await res.json();
        if (!json || !json.success) return;
        let remoteVal = json.data;
        // unwrap wrapper { value: ... }
        if (remoteVal && remoteVal.value && (remoteVal.value.sections || remoteVal.value.categories)) remoteVal = remoteVal.value;
        // if remote stored as string, try parse
        if (typeof remoteVal === 'string') {
          try { remoteVal = JSON.parse(remoteVal); } catch (e) { /* keep as string */ }
        }
        const remoteSnap = JSON.stringify(remoteVal || {});
        if (remoteSnap !== lastRemoteSnapRef.current) {
          lastRemoteSnapRef.current = remoteSnap;
          try {
            const baseObj = mergedBaseRef.current ? JSON.parse(mergedBaseRef.current) : {};
            const localObj = data || {};
            const remoteObj = remoteVal || {};
            const mergeResult = threeWayMerge(baseObj, localObj, remoteObj) || {};
            const merged = mergeResult.merged || null;
            if (merged) {
              suppressAutosaveRef.current = true;
              try { updateData(merged); } catch (e) { setData(merged); }
              suppressAutosaveRef.current = false;
              try { if (typeof onDirtyChange === 'function') onDirtyChange(false); } catch (e) {}
              mergedBaseRef.current = JSON.stringify(merged);
              lastLocalSnapRef.current = JSON.stringify(merged);
            }
          } catch (e) {
            // fallback: if merging fails, apply remote when safe
            if (remoteSnap !== lastLocalSnapRef.current) {
              if (!isDirty) {
                try { baseSnapshotRef.current = remoteSnap; } catch (e) {}
                try { updateData(remoteVal || {}); } catch (e) { setData(remoteVal || {}); }
                try { if (typeof onDirtyChange === 'function') onDirtyChange(false); } catch (e) {}
              }
            }
          }
        }
      } catch (e) {
        // ignore polling errors
      }
    };
    // initial fetch then poll
    fetchRemote();
    timer = setInterval(fetchRemote, 2500);
    return () => { stopped = true; if (timer) clearInterval(timer); };
  }, [isAdmin, moduleName, isDirty]);

  

  const [editingSubId, setEditingSubId] = useState(null);
  const [addingSubToCatId, setAddingSubToCatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubColor, setNewSubColor] = useState("#10b981");

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionEmoji, setNewSectionEmoji] = useState("");
  const [newSectionColor, setNewSectionColor] = useState("#6d4aff");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [editSectionEmoji, setEditSectionEmoji] = useState("");
  const [editSectionColor, setEditSectionColor] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryEmoji, setEditCategoryEmoji] = useState("");
  const [editCategoryColor, setEditCategoryColor] = useState("");

  const [headerHeight, setHeaderHeight] = useState(140);
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;
    const update = () => setHeaderHeight(headerEl.offsetHeight || 0);
    update();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(headerEl);
    }
    window.addEventListener('resize', update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    setEditMode(Boolean(isAdmin));
    setShowEditSectionsPanel(Boolean(isAdmin));
  }, [isAdmin]);

  // ensure initial dirty state reflects persisted data vs bundled snapshot
  useEffect(() => {
    try {
      const snap = JSON.stringify(data || {});
      const dirty = snap !== (baseSnapshotRef.current || '');
      if (dirty !== isDirty) {
        setIsDirty(dirty);
        try { if (typeof onDirtyChange === 'function') onDirtyChange(dirty); } catch (e) {}
      }
    } catch (e) { /* ignore */ }
  }, [data]);

  const handleSetSearch = (q) => setSearchTerm(q || "");

  const subRefs = useRef({});
  const [highlightedSubId, setHighlightedSubId] = useState(null);

  const performSearch = (q) => {
    const query = (q || searchTerm || '').trim().toLowerCase();
    if (!query) return;
    for (const cat of (data.categories || [])) {
      for (const sub of (cat.subs || [])) {
        const title = (sub.title || '').toLowerCase();
        const text = (sub.text || '').toLowerCase();
        if (title.includes(query) || text.includes(query)) {
          setExpandedCategoryId(cat.id);
          setShowSearchModal(false);
          setSearchTerm(query);

          const scrollToSub = (attempt = 0) => {
            const el = subRefs.current[sub.id];
            if (el) {
              const headerOffset = headerHeight || 140;
              const rect = el.getBoundingClientRect();
              const target = window.scrollY + rect.top - headerOffset - 12;
              try {
                window.scrollTo({ top: target, behavior: 'smooth' });
              } catch (e) {
                window.scrollTo(0, target);
              }
              setHighlightedSubId(sub.id);
              setTimeout(() => setHighlightedSubId(null), 3000);
            } else if (attempt < 12) {
              setTimeout(() => scrollToSub(attempt + 1), 80);
            } else {
              const anyEl = subRefs.current[sub.id];
              if (anyEl && typeof anyEl.scrollIntoView === 'function') anyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          };

          setTimeout(() => scrollToSub(0), 40);
          return;
        }
      }
    }
    window.alert('Aucun résultat pour "' + q + '"');
  };

  const handleHomeClick = () => {
    setSelectedSectionId(null);
    setExpandedCategoryId(null);
    setSearchTerm("");
    setShowSidebar(false);
    setShowGallery(false);
    if (typeof onHome === 'function') return onHome();
    try { window.location.href = '/'; } catch (e) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleOpenNewCategoryModal = () => {
    const name = window.prompt('Nom de la nouvelle catégorie ?');
    if (!name) return;
    const icon = window.prompt('Emoji / icône (ex: 📦) ?', '📦') || '📦';
    const sectionId = selectedSectionId || (data.sections?.[0]?.id || null);
    const id = Date.now();
    const newCat = { id, name, icon, sectionId, color: '#6d4aff', subs: [] };
    updateData(prev => ({ ...prev, categories: [...(prev.categories || []), newCat] }));
    setExpandedCategoryId(id);
  };

  const addSection = (sectionParam) => {
    if (sectionParam && sectionParam.id) {
      updateData(prev => ({ ...prev, sections: [...(prev.sections || []), sectionParam] }));
      return;
    }
    const name = (newSectionName || '').trim();
    if (!name) return;
    const id = Date.now();
    const section = { id, name, color: newSectionColor || '#6d4aff', emoji: newSectionEmoji || '📁' };
    updateData(prev => ({ ...prev, sections: [...(prev.sections || []), section] }));
    setNewSectionName(''); setNewSectionEmoji(''); setNewSectionColor('#6d4aff');
  };

  const startEditSection = (idOrSection) => {
    const id = idOrSection && typeof idOrSection === 'object' ? idOrSection.id : idOrSection;
    const s = data.sections?.find(sec => sec.id == id);
    if (!s) return;
    setEditingSectionId(id);
    setEditSectionName(s.name || '');
    setEditSectionEmoji(s.emoji || '');
    setEditSectionColor(s.color || '');
  };

  const startEditCategory = (cat) => {
    if (!cat) return;
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name || '');
    setEditCategoryEmoji(cat.icon || '');
    setEditCategoryColor(cat.color || '');
  };

  const saveEditSection = () => {
    if (editingSectionId === null) return;
    updateData(prev => {
      const sections = (prev.sections || []).map(sec => sec.id == editingSectionId ? { ...sec, name: editSectionName, emoji: editSectionEmoji, color: editSectionColor } : sec);
      return { ...prev, sections };
    });
    setEditingSectionId(null); setEditSectionName(''); setEditSectionEmoji(''); setEditSectionColor('');
  };

  const saveEditCategory = () => {
    if (editingCategoryId === null) return;
    updateData(prev => {
      const categories = (prev.categories || []).map(cat => cat.id === editingCategoryId ? { ...cat, name: editCategoryName, icon: editCategoryEmoji, color: editCategoryColor } : cat);
      return { ...prev, categories };
    });
    setEditingCategoryId(null); setEditCategoryName(''); setEditCategoryEmoji(''); setEditCategoryColor('');
  };

  const cancelEditSection = () => {
    setEditingSectionId(null); setEditSectionName(''); setEditSectionEmoji(''); setEditSectionColor('');
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null); setEditCategoryName(''); setEditCategoryEmoji(''); setEditCategoryColor('');
  };

  const deleteSection = (id) => {
    if (!window.confirm('Supprimer cette section et ses catégories ?')) return;
    updateData(prev => {
      const sections = (prev.sections || []).filter(sec => sec.id != id);
      const categories = (prev.categories || []).filter(cat => cat.sectionId != id);
      return { ...prev, sections, categories };
    });
    if (selectedSectionId == id) setSelectedSectionId(null);
  };

  const deleteCategory = (catId) => {
    if (!catId) return;
    if (!window.confirm('Supprimer cette catégorie et ses sous-modules ?')) return;
    updateData(prev => ({ ...prev, categories: (prev.categories || []).filter(c => c.id !== catId) }));
    if (expandedCategoryId === catId) setExpandedCategoryId(null);
    if (editingCategoryId === catId) cancelEditCategory();
  };

  const moveCategoryToSection = (catId, newSectionId) => {
    if (!catId || typeof newSectionId === 'undefined' || newSectionId === null) return;
    updateData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(cat => cat.id === catId ? { ...cat, sectionId: newSectionId } : cat)
    }));
  };

  useEffect(() => {
    if (editMode) {
      const firstSub = data.categories?.[0]?.subs?.[0];
      setEditingSubId(prev => prev || (firstSub ? firstSub.id : null));
    } else {
      setEditingSubId(null);
    }
  }, [editMode, data]);

  // When switching out of admin mode, reset to bundled data so visitors see only pushed/deployed data
  useEffect(() => {
    if (!isAdmin) {
      try {
        setData(initial);
        baseSnapshotRef.current = JSON.stringify(initial);
        try { if (typeof onDirtyChange === 'function') onDirtyChange(false); } catch (e) {}
      } catch (e) {}
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!editingSubId) return;
    for (const cat of (data.categories || [])) {
      const sub = (cat.subs || []).find(s => s.id === editingSubId);
      if (sub) {
        setEditTitle(sub.title || "");
        setEditText(sub.text || "");
        setEditColor(sub.color || "");
        return;
      }
    }
  }, [editingSubId, data]);

  const moveSubToCategory = (subId, newCatId) => {
    if (!subId || !newCatId) return;
    updateData(prev => {
      let subToMove = null;
      const newCategories = (prev.categories || []).map(cat => {
        if ((cat.subs || []).some(sub => sub.id === subId)) {
          subToMove = (cat.subs || []).find(sub => sub.id === subId);
          return { ...cat, subs: (cat.subs || []).filter(sub => sub.id !== subId) };
        }
        return cat;
      });
      if (!subToMove) return prev;
      return {
        ...prev,
        categories: newCategories.map(cat => cat.id === newCatId ? { ...cat, subs: [...(cat.subs || []), subToMove] } : cat)
      };
    });
    setEditingSubId(subId);
  };

  const saveEditSub = (normalizedText) => {
    if (!editingSubId) return;
    console.log(`[ModulePage:${moduleName}] saveEditSub called`, { editingSubId, editTitle, normalizedText: (normalizedText || '').slice(0,120) });
    updateData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(cat => ({
        ...cat,
        subs: (cat.subs || []).map(sub => sub.id === editingSubId ? { ...sub, title: editTitle, text: normalizedText, color: editColor || sub.color } : sub)
      }))
    }));
  };

  const saveNewSub = () => {
    if (!addingSubToCatId || !newSubTitle.trim()) { window.alert('Le titre est requis'); return; }
    let maxId = 0;
    for (const cat of (data.categories || [])) {
      for (const sub of (cat.subs || [])) {
        if (sub && sub.id && sub.id > maxId) maxId = sub.id;
      }
    }
    const newId = maxId + 1;
    const newSub = { id: newId, title: newSubTitle.trim(), text: '', color: newSubColor || '#8a96a8' };
    console.log(`[ModulePage:${moduleName}] saveNewSub`, { addingSubToCatId, newId, title: newSub.title });
    updateData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(cat => cat.id === addingSubToCatId ? { ...cat, subs: [...(cat.subs || []), newSub] } : cat)
    }));
    setNewSubTitle("");
    setNewSubColor("#10b981");
    setEditingSubId(newId);
    setAddingSubToCatId(null);
  };

  const cancelAddingSub = () => { setNewSubTitle(""); setAddingSubToCatId(null); };

  const createAndEditSub = (catId) => {
    if (!catId) return;
    let maxId = 0;
    for (const cat of (data.categories || [])) {
      for (const sub of (cat.subs || [])) {
        if (sub && sub.id && sub.id > maxId) maxId = sub.id;
      }
    }
    const newId = maxId + 1;
    const newSub = { id: newId, title: 'Nouveau module', text: '', color: newSubColor || '#8a96a8' };
    console.log(`[ModulePage:${moduleName}] createAndEditSub`, { catId, newId, title: newSub.title });
    updateData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(cat => cat.id === catId ? { ...cat, subs: [...(cat.subs || []), newSub] } : cat)
    }));
    setNewSubTitle('');
    setNewSubColor('#10b981');
    setEditTitle(newSub.title);
    setEditText(newSub.text);
    setEditColor(newSub.color);
    setEditingSubId(newId);
    setAddingSubToCatId(null);
  };

  const deleteSub = (catId, subId) => {
    if (!catId || !subId) return;
    if (!window.confirm('Supprimer cette sous-catégorie ?')) return;
    console.log(`[ModulePage:${moduleName}] deleteSub`, { catId, subId });
    updateData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(cat => cat.id === catId ? { ...cat, subs: (cat.subs || []).filter(s => s.id !== subId) } : cat)
    }));
    if (editingSubId === subId) setEditingSubId(null);
  };

  const addCategory = (newCat) => {
    if (!newCat) return;
    updateData(prev => ({ ...prev, categories: [...(prev.categories || []), newCat] }));
  };

  const filteredCategories = useMemo(() => {
    const cats = Array.isArray(data.categories) ? data.categories : [];
    if (expandedCategoryId) return cats.filter(c => c.id === expandedCategoryId);
    if (selectedSectionId) return cats.filter(c => c.sectionId === selectedSectionId);
    return cats;
  }, [data.categories, expandedCategoryId, selectedSectionId]);

  const categoriesWithVisibleSubs = useMemo(() => {
    const q = (searchTerm || '').toLowerCase().trim();
    return filteredCategories.map(cat => {
      const visibleSubs = (cat.subs || []).filter(sub => {
        if (!q) return true;
        const title = (sub.title || '').toLowerCase();
        const text = (sub.text || '').toLowerCase();
        return title.includes(q) || text.includes(q);
      });
      return { ...cat, visibleSubs };
    }).filter(cat => !(q && (cat.visibleSubs || []).length === 0));
  }, [filteredCategories, searchTerm]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.gradient, color: theme.text }}>
      <Header
        isMobile={isMobile}
        isAuthenticated={isAdmin}
        editMode={editMode}
        setEditMode={setEditMode}
        setShowSearchModal={setShowSearchModal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        layout={layout}
        theme={theme}
        Emoji={({ symbol }) => <span>{symbol}</span>}
        pageTitle={moduleName}
        pageEmoji={null}
        showSectionPanel={showSidebar}
        setShowSectionPanel={setShowSidebar}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        selectedCategoryId={expandedCategoryId}
        setSelectedCategoryId={setExpandedCategoryId}
        setSearch={handleSetSearch}
        data={data}
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        onHomeClick={handleHomeClick}
        onOpenNewCategoryModal={handleOpenNewCategoryModal}
      />


      <FullEditorPage
        open={editMode}
        onClose={() => setEditMode(false)}
        sections={data.sections}
        categories={data.categories}
        darkMode={darkMode}
        theme={theme}
        editingSubId={editingSubId}
        setEditingSubId={setEditingSubId}
        addingSubToCatId={addingSubToCatId}
        setAddingSubToCatId={setAddingSubToCatId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editText={editText}
        setEditText={setEditText}
        editColor={editColor}
        setEditColor={setEditColor}
        newSubTitle={newSubTitle}
        setNewSubTitle={setNewSubTitle}
        newSubColor={newSubColor}
        setNewSubColor={setNewSubColor}
        saveEditSub={saveEditSub}
        saveNewSub={saveNewSub}
        cancelAddingSub={cancelAddingSub}
        createAndEditSub={createAndEditSub}
        deleteSub={deleteSub}
        addCategory={addCategory}
        addSection={addSection}
        moveSubToCategory={moveSubToCategory}
        moveCategoryToSection={moveCategoryToSection}
        isAuthenticated={isAdmin}
        editMode={editMode}
        onOpenNewCategoryModal={handleOpenNewCategoryModal}
        setExpandedCategoryId={setExpandedCategoryId}
        // section edit props
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
        // category edit props
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

      {showSearchModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowSearchModal(false)}>
          <div style={{ width: 'min(900px, 96%)', background: theme.surface || theme.surfaceAlt || theme.bg || '#241c3a', padding: 18, borderRadius: 12, boxShadow: theme.shadow }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0, color: theme.accent1 }}>🔎 Recherche</h3>
              <button onClick={() => setShowSearchModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✖</button>
            </div>
            <input
              value={searchTerm}
              onChange={(e) => handleSetSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { performSearch(e.target.value); } }}
              placeholder="Rechercher..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg || '#201a36', color: theme.text }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { handleSetSearch(''); setShowSearchModal(false); }} style={{ padding: '8px 12px', borderRadius: 8, background: theme.accent1, color: '#fff', border: 'none' }}>Effacer</button>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        show={showSidebar}
        onClose={() => setShowSidebar(false)}
        isAuthenticated={isAdmin}
        showEditSectionsPanel={showEditSectionsPanel}
        setShowEditSectionsPanel={setShowEditSectionsPanel}
        data={data}
        setData={updateData}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        selectedCategoryId={expandedCategoryId}
        setSelectedCategoryId={setExpandedCategoryId}
        setSearch={handleSetSearch}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        newSectionEmoji={newSectionEmoji}
        setNewSectionEmoji={setNewSectionEmoji}
        newSectionColor={newSectionColor}
        setNewSectionColor={setNewSectionColor}
        sectionSwatches={["#6d4aff", "#f59e42", "#10b981", "#ef4444", "#3b82f6"]}
        addSection={addSection}
        editingSectionId={editingSectionId}
        setEditingSectionId={setEditingSectionId}
        editSectionName={editSectionName}
        setEditSectionName={setEditSectionName}
        editSectionEmoji={editSectionEmoji}
        setEditSectionEmoji={setEditSectionEmoji}
        editSectionColor={editSectionColor}
        setEditSectionColor={setEditSectionColor}
        saveEditSection={saveEditSection}
        cancelEditSection={cancelEditSection}
        startEditSection={startEditSection}
        deleteSection={deleteSection}
        theme={theme}
        layout={layout}
      />

      <main style={{ flex: 1, padding: 32, paddingTop: headerHeight + 20, paddingBottom: 120, overflowY: "auto", overflowX: "hidden", minHeight: 0, height: "100vh", marginLeft: showSidebar ? (layout.sideWidth + 48) : 0, transition: "margin-left 0.7s cubic-bezier(.68,-0.6,0.32,1.6)" }}>

        <div>
          {categoriesWithVisibleSubs.map(cat => (
            <div key={cat.id} style={{ marginBottom: 48 }}>
              <h1 style={{ margin: "0 0 28px 0", fontSize: 28, fontWeight: 800, color: theme.accent1 }}>
                {cat.icon} {cat.name}
              </h1>
              <div style={{ display: "grid", gridTemplateColumns: (isMobile ? `repeat(auto-fit, minmax(420px, 420px))` : "repeat(auto-fit, minmax(700px, 1fr))"), gap: (isMobile ? 28 : 24), transition: "max-height 0.3s", overflow: "visible", justifyContent: (isMobile ? 'center' : 'stretch') }}>
                {cat.visibleSubs.map((sub) => (
                  <SubPanel
                    key={sub.id}
                    sub={sub}
                    headerHeight={headerHeight}
                    highlighted={highlightedSubId === sub.id}
                    theme={theme}
                    onRef={(el) => { subRefs.current[sub.id] = el; }}
                    forceRender={highlightedSubId === sub.id || expandedCategoryId === cat.id || editMode}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      <div style={{ width: "100%", minHeight: 120, height: 120 }} />
    </main>

      <Gallery
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        data={data}
        theme={theme}
        darkMode={darkMode}
        layout={layout}
        setSelectedCategoryId={setExpandedCategoryId}
        setExpandedCategories={() => { /* noop for this page */ }}
        subRefs={subRefs}
        // allow Gallery to persist images into this ModulePage's data
        updateData={updateData}
        // admin flags
        isAuthenticated={isAdmin}
        editMode={editMode}
        setEditMode={setEditMode}
      />
    </div>
  );
}
