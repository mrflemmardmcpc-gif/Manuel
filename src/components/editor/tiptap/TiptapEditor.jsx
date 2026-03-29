import React, { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FontSize from "./FontSizeExtension";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import TiptapToolbar from "./TiptapToolbar";
import { TableContextMenu, TableHandleButtons } from "./TableControls";

const CustomTableHeader = TableHeader;
const CustomTableCell = TableCell;

function useMobileKeyboard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 600;
    if (!isMobile) return;

    const vv = window.visualViewport;
    if (!vv) return;

    let rafId = null;
    let isKeyboardOpen = false;
    let pickerKeyboardHeight = 0;

    const resetToolbar = (toolbar) => {
      toolbar.style.position = '';
      toolbar.style.top = '';
      toolbar.style.left = '';
      toolbar.style.right = '';
      toolbar.style.bottom = '';
      toolbar.style.width = '';
      toolbar.style.transform = '';
      toolbar.style.zIndex = '';
      toolbar.style.borderRadius = '';
    };

    const positionToolbar = () => {
      const toolbar = document.querySelector('.tiptap-toolbar-mobile');
      if (!toolbar) return;

      const nativeKeyboardHeight = window.innerHeight - vv.height;
      const nativeOpen = nativeKeyboardHeight > 100;
      const pickerOpen = document.documentElement.classList.contains('picker-keyboard-open');
      if (pickerOpen) {
        const h = getComputedStyle(document.documentElement).getPropertyValue('--picker-keyboard-height');
        pickerKeyboardHeight = parseInt(h) || 280;
      } else {
        pickerKeyboardHeight = 0;
      }

      const effectiveOpen = nativeOpen || pickerOpen;
      const effectiveHeight = nativeOpen ? nativeKeyboardHeight : pickerKeyboardHeight;

      if (effectiveOpen !== isKeyboardOpen) {
        isKeyboardOpen = effectiveOpen;
        document.documentElement.classList.toggle('keyboard-open', effectiveOpen);
        if (!effectiveOpen) {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          resetToolbar(toolbar);
          return;
        }
      }

      if (effectiveOpen) {
        const toolbarHeight = toolbar.offsetHeight || 52;
        let targetTop;
        if (nativeOpen) {
          targetTop = vv.offsetTop + vv.height - toolbarHeight;
        } else {
          targetTop = window.innerHeight - effectiveHeight - toolbarHeight;
        }
        toolbar.style.position = 'fixed';
        toolbar.style.top = '0';
        toolbar.style.left = '0';
        toolbar.style.right = '0';
        toolbar.style.bottom = 'auto';
        toolbar.style.width = '100vw';
        toolbar.style.transform = `translateY(${Math.max(0, targetTop)}px)`;
        toolbar.style.zIndex = '99999';
        toolbar.style.borderRadius = '0';

        rafId = requestAnimationFrame(positionToolbar);
      }
    };

    const onResize = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      positionToolbar();
    };

    const onPickerChange = () => { onResize(); };

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    window.addEventListener('pickerKeyboardChange', onPickerChange);

    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
      window.removeEventListener('pickerKeyboardChange', onPickerChange);
      if (rafId) cancelAnimationFrame(rafId);
      const toolbar = document.querySelector('.tiptap-toolbar-mobile');
      if (toolbar) resetToolbar(toolbar);
      document.documentElement.classList.remove('keyboard-open');
    };
  }, []);
}

function scrollToCursor(editor) {
  if (!editor) return;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) return;

  requestAnimationFrame(() => {
    try {
      const { view } = editor;
      const coords = view.coordsAtPos(view.state.selection.head);
      if (!coords) return;

      const vv = window.visualViewport;
      if (!vv) return;

      const toolbarHeight = 60;
      const padding = 20;
      const visibleTop = vv.offsetTop + toolbarHeight + padding;
      const visibleBottom = vv.offsetTop + vv.height - padding;

      if (coords.top < visibleTop) {
        window.scrollBy({ top: coords.top - visibleTop - padding, behavior: 'smooth' });
      } else if (coords.bottom > visibleBottom) {
        window.scrollBy({ top: coords.bottom - visibleBottom + padding, behavior: 'smooth' });
      }
    } catch (e) { }
  });
}

function isProbablyHtml(str) {
  return /<\s*(p|ul|ol|li|table|tr|td|th|h[1-6]|img|br)[^>]*>/i.test(str);
}
function forceParagraphsHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html || '';
  const text = tempDiv.innerText;
  let withMarkers = text.replace(/\n\n+/g, '\n__DOUBLE_BREAK__\n');
  return withMarkers.split(/\r?\n/).map(line => {
    if (line === '__DOUBLE_BREAK__') {
      return '<p></p>';
    } else if (/^\s*([*-+]|\d+\.)\s/.test(line) || /^\s*#/.test(line) || line.trim() === '') {
      return line;
    } else {
      return `<p>${line.trim()}</p>`;
    }
  }).join('');
}

export default function TiptapEditor({ value, onChange, darkMode, theme, setEditorInstance, highlightColor, setHighlightColor }) {
  const [showTableHandles, setShowTableHandles] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ left: null, top: null });
  const [tablePos, setTablePos] = useState(null);
  const editorContentRef = useRef();
  const [tableCoords, setTableCoords] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, cellPos: null });
  const contextMenuRef = useRef();
  

  useMobileKeyboard();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Color,
      TextStyle,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
    ],
    content: '',
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); scrollToCursor(editor); },
    onSelectionUpdate: ({ editor }) => { scrollToCursor(editor); },
    editorProps: {
      attributes: {
        style: `background: ${darkMode ? '#181c24' : '#f8fafc'}; color: ${darkMode ? '#f3f4f6' : '#181c24'}; border-radius: 12px; min-height: 180px; font-size: 1.05rem; border: 1.5px solid ${theme?.accent1 || '#f59e42'}; padding-left: 8px; padding-top: 8px;`,
      },
      handlePaste(view, event, slice) {
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          const html = forceParagraphsHtml(text);
          editor.commands.insertContent(html);
          event.preventDefault();
          return true;
        }
        return false;
      },
      handleKeyDown(view, event) {
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const { state } = editor;
    const { selection } = state;
    let found = false;
    let tPos = null;
    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (node.type && node.type.name === 'table' && !found) { found = true; tPos = pos; }
    });
    setShowTableHandles(found);
    setTablePos(tPos);
  }, [editor && editor.state && editor.state.selection, editor]);

  useEffect(() => {
    if (!showTableHandles || tablePos == null || !editorContentRef.current || !editor) { setTableCoords(null); return; }
    const dom = editor.view.domAtPos ? editor.view.domAtPos(tablePos) : null;
    let tableEl = null;
    if (dom && dom.node) {
      if (dom.node.nodeType === 1 && dom.node.tagName === 'TABLE') {
        tableEl = dom.node;
      } else if (dom.node.nodeType === 1) {
        tableEl = dom.node.querySelector('table');
      }
    }
    if (tableEl) {
      const rect = tableEl.getBoundingClientRect();
      setTableCoords({ left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height });
    } else { setTableCoords(null); }
  }, [showTableHandles, tablePos, editor && editor.view && editor.view.state]);

  useEffect(() => {
    if (!editor) return;
    const newValue = value || '';
    const cleanHtml = isProbablyHtml(newValue) ? newValue : forceParagraphsHtml(newValue);
    try {
      const current = editor.getHTML();
      if ((current || '').trim() !== (cleanHtml || '').trim()) {
        editor.commands.setContent(cleanHtml, false);
      }
    } catch (e) {
      editor.commands.setContent(cleanHtml, false);
    }
  }, [value, editor]);

  useEffect(() => { if (editor && setEditorInstance) setEditorInstance(editor); }, [editor, setEditorInstance]);

  useEffect(() => {
    const handler = (e) => { if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) { setContextMenu({ ...contextMenu, visible: false }); } };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  useEffect(() => {
    function updateToolbarPos() {
      try {
        const el = editorContentRef.current;
        if (!el) {
          setToolbarPos({ left: null, top: null });
          return;
        }
        const rect = el.getBoundingClientRect();
        const left = Math.max(8, Math.round(rect.left - 64));
        const top = Math.max(8, Math.round(rect.top + 8));
        setToolbarPos({ left, top });
      } catch (e) { }
    }
    updateToolbarPos();
    window.addEventListener('resize', updateToolbarPos);
    window.addEventListener('scroll', updateToolbarPos, true);
    let ro = null;
    try { ro = new ResizeObserver(updateToolbarPos); if (editorContentRef.current) ro.observe(editorContentRef.current); } catch (e) { ro = null; }
    return () => { window.removeEventListener('resize', updateToolbarPos); window.removeEventListener('scroll', updateToolbarPos, true); if (ro && ro.disconnect) ro.disconnect(); };
  }, [editorContentRef.current, editor]);

  function handleContextMenu(event) {
    if (!editor) return;
    const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (!pos) return;
    let found = false;
    let cellNodePos = null;
    editor.state.doc.nodesBetween(pos.pos, pos.pos, (node, nodePos) => {
      if ((node.type.name === 'tableCell' || node.type.name === 'tableHeader') && !found) { cellNodePos = nodePos; found = true; }
      if (node.type.name === 'tableRow' && !found) { if (node.childCount > 0) { cellNodePos = nodePos + 1; found = true; } }
    });
    if (found && cellNodePos != null) { setContextMenu({ visible: true, x: event.clientX, y: event.clientY, cellPos: cellNodePos }); event.preventDefault(); }
  }

  function handleDeleteCell() { if (!editor || contextMenu.cellPos == null) return; const { state } = editor; let tr = state.tr; const node = state.doc.nodeAt(contextMenu.cellPos); if (node && (node.type.name === 'tableCell' || node.type.name === 'tableHeader')) { tr = tr.replaceWith(contextMenu.cellPos, contextMenu.cellPos + node.nodeSize, state.schema.nodes.tableCell.createAndFill()); if (tr.docChanged) editor.view.dispatch(tr); } setContextMenu({ ...contextMenu, visible: false }); }
  function handleDeleteRow() { if (!editor || contextMenu.cellPos == null) return; const { state } = editor; let rowPos = null; state.doc.nodesBetween(contextMenu.cellPos, contextMenu.cellPos, (node, pos) => { if (node.type.name === 'tableRow' && rowPos === null) { rowPos = pos; } }); if (rowPos !== null && editor.chain) { editor.chain().focus().setNodeSelection(rowPos).deleteRow().run(); } setContextMenu({ ...contextMenu, visible: false }); }
  function handleDeleteColumn() { if (!editor || contextMenu.cellPos == null) return; if (editor.chain) { editor.chain().focus().setNodeSelection(contextMenu.cellPos).deleteColumn().run(); } setContextMenu({ ...contextMenu, visible: false }); }
  function handleCellToHeader() { if (!editor || contextMenu.cellPos == null) return; const { state } = editor; const node = state.doc.nodeAt(contextMenu.cellPos); if (node && node.type.name === 'tableCell') { const tableHeaderType = state.schema.nodes.tableHeader; const newNode = tableHeaderType.create(node.attrs, node.content, node.marks); const tr = state.tr.replaceWith(contextMenu.cellPos, contextMenu.cellPos + node.nodeSize, newNode); editor.view.dispatch(tr); } setContextMenu({ ...contextMenu, visible: false }); }
  function handleColorCell(color) { if (!editor || contextMenu.cellPos == null) return; const { state } = editor; let tr = state.tr; const node = state.doc.nodeAt(contextMenu.cellPos); if (node && (node.type.name === 'tableCell' || node.type.name === 'tableHeader')) { let style = node.attrs.style || ''; style = style.replace(/background-color:[^;]+;?/gi, ''); style = `background-color:${color} !important;${style}`.trim(); style = style.replace(/;\s*$/, ''); const newAttrs = { ...node.attrs, style, ['data-ttcolor']: color }; let newNode; if (node.content.size === 0) { const paragraph = node.type.schema.nodes.paragraph.create(); newNode = node.type.create(newAttrs, paragraph, node.marks); } else { newNode = node.type.create(newAttrs, node.content, node.marks); } tr = tr.replaceWith(contextMenu.cellPos, contextMenu.cellPos + node.nodeSize, newNode); if (tr.docChanged) editor.view.dispatch(tr); } setContextMenu({ ...contextMenu, visible: false }); }
  function handleDeleteTable() {
    if (!editor || contextMenu.cellPos == null) return;
    const { state } = editor;
    // find the parent table node position by scanning doc
    let tablePos = null;
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (node.type && node.type.name === 'table') {
        if (pos <= contextMenu.cellPos && (pos + node.nodeSize) >= (contextMenu.cellPos + 1)) {
          tablePos = pos;
          return false; // stop iteration early
        }
      }
      return true;
    });
    if (tablePos !== null && editor.chain) {
      try {
        editor.chain().focus().setNodeSelection(tablePos).deleteTable().run();
      } catch (e) {
        // fallback: remove node via transaction
        const node = state.doc.nodeAt(tablePos);
        if (node) {
          const tr = state.tr.delete(tablePos, tablePos + node.nodeSize);
          if (tr.docChanged) editor.view.dispatch(tr);
        }
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  }

  return (
    <div style={{ position: 'relative' }}>
      <TiptapToolbar editor={editor} theme={theme} highlightColor={highlightColor} setHighlightColor={setHighlightColor} toolbarLeft={toolbarPos.left} toolbarTop={toolbarPos.top} />
      <div onContextMenu={handleContextMenu} style={{ minHeight: 180, position: 'relative' }} ref={editorContentRef}>
        <EditorContent editor={editor} />
        <TableHandleButtons show={showTableHandles} coords={tableCoords} onAddColumn={() => editor.chain().focus().addColumnAfter().run()} onAddRow={() => editor.chain().focus().addRowAfter().run()} theme={theme} editorContentRef={editorContentRef} />
      </div>
      <TableContextMenu visible={contextMenu.visible} x={contextMenu.x} y={contextMenu.y} onDeleteTable={handleDeleteTable} onDeleteCell={handleDeleteCell} onDeleteRow={handleDeleteRow} onDeleteColumn={handleDeleteColumn} onCellToHeader={handleCellToHeader} onColorCell={handleColorCell} theme={theme} />
    </div>
  );
}
