import React, { useEffect, useRef } from "react";
import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
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
import "../AppTiptap.css";

// Extension fontSize personnalisée
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

// Custom TableCell/TableHeader pour masquer les cellules vides à l'affichage
const CleanTableCell = TableCell.extend({
  renderHTML({ node, HTMLAttributes }) {
    const textContent = node.textContent?.trim();
    if (!textContent) return ["td", HTMLAttributes, ""];
    return ["td", HTMLAttributes, 0];
  },
});

const CleanTableHeader = TableHeader.extend({
  renderHTML({ node, HTMLAttributes }) {
    const textContent = node.textContent?.trim();
    if (!textContent) return ["th", HTMLAttributes, ""];
    return ["th", HTMLAttributes, 0];
  },
});

function cleanTableCellsFromJSON(json, parentType = null, rowIndex = 0) {
  if (!json || typeof json !== 'object') return json;
  if (Array.isArray(json)) return json.map((item, i) => cleanTableCellsFromJSON(item, parentType, i)).filter(Boolean);
  if (json.type === 'tableRow' && Array.isArray(json.content)) {
    json.content = json.content.filter(cell => {
      if (!cell || !cell.content || !Array.isArray(cell.content)) return false;
      return cell.content.some(n => {
        if (n.type === 'text') return n.text && n.text.replace(/\u200B|\s|<br\s*\/?>(\n)?/g, '').length > 0;
        if (n.content && Array.isArray(n.content)) {
          return n.content.some(sub => sub.type === 'text' && sub.text && sub.text.replace(/\u200B|\s|<br\s*\/?>(\n)?/g, '').length > 0);
        }
        return false;
      });
    });
    json.content = json.content.map((cell, colIndex) => {
      if (!cell) return cell;
      if (colIndex === 0 || rowIndex === 0) {
        return { ...cell, type: 'tableHeader' };
      }
      return cell;
    });
    if (json.content.length === 0) return null;
  } else if (json.content) {
    json.content = json.content.map((item, i) => cleanTableCellsFromJSON(item, json.type, i)).filter(Boolean);
  }
  return json;
}

export default function TiptapViewer({ html, darkMode, theme }) {
  let content = html;
  try {
    if (typeof html === 'object' && html !== null) {
      content = cleanTableCellsFromJSON(JSON.parse(JSON.stringify(html)));
    } else if (typeof html === 'string' && html.trim().startsWith('{')) {
      const parsed = JSON.parse(html);
      content = cleanTableCellsFromJSON(parsed);
    }
  } catch (e) {}

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Bold,
      Italic,
      Underline,
      Link,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      FontSize,
      Table.configure({ resizable: true }),
      TableRow,
      CleanTableHeader,
      CleanTableCell,
      Image,
    ],
    content: content || "",
    editable: false,
    editorProps: { attributes: { style: `min-height: 180px; border: none; background: none; color: inherit; border-radius: 0;`, }, },
  });

  const editorContentRef = useRef();
  const editorHTML = editor ? editor.getHTML() : null;
  useEffect(() => {
    const container = editorContentRef.current;
    if (!container) return;
    container.querySelectorAll('table').forEach(table => {
      if (!table.parentElement.classList.contains('table-scroll-x')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-x';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }, [editorHTML]);

  // Ensure viewer updates when `html` prop changes. useEditor initializes once,
  // so we must set content when new html arrives (visitor view requires this).
  useEffect(() => {
    if (!editor) return;
    try {
      if (content === null || content === undefined) {
        editor.commands.setContent('');
        return;
      }
      if (typeof content === 'object') {
        // JSON doc
        editor.commands.setContent(content);
      } else if (typeof content === 'string') {
        const current = editor.getHTML();
        if (current !== content) {
          editor.commands.setContent(content);
        }
      }
    } catch (e) {
      // Don't break the visitor UI on update errors
      // eslint-disable-next-line no-console
      console.error('TiptapViewer: failed to update editor content', e);
    }
  }, [content, editor]);

  return <EditorContent editor={editor} ref={editorContentRef} />;
}
