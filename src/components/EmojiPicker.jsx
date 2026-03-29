import React from 'react';
import emojiData from '../data/emoji.json';

export default function EmojiPicker({
  open,
  onClose,
  onSelect,
  theme,
  mergedEmojiCategories,
  initialCategory = 'smileys',
  columns = 5,
  width = 500,
  maxHeight = 160,
  showClose = true,
  className = '',
  searchPlaceholder = 'Rechercher'
}) {
  const [emojiCategory, setEmojiCategory] = React.useState(initialCategory);
  const [emojiSearch, setEmojiSearch] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setEmojiSearch('');
      setEmojiCategory(initialCategory);
    }
  }, [open, initialCategory]);

  const categories = React.useMemo(() => {
    if (mergedEmojiCategories && Object.keys(mergedEmojiCategories).length) return mergedEmojiCategories;
    const ext = (emojiData && emojiData.categories) ? emojiData.categories : {};
    const base = {
      smileys: { label: 'Smileys', icon: '🙂' },
      people: { label: 'People', icon: '🧑' },
      nature: { label: 'Nature', icon: '🌿' },
      food: { label: 'Food', icon: '🍔' },
      activities: { label: 'Activities', icon: '⚽' },
      travel: { label: 'Travel', icon: '✈️' },
      objects: { label: 'Objects', icon: '📦' },
      symbols: { label: 'Symbols', icon: '🔣' }
    };
    const keys = Array.from(new Set([...Object.keys(base), ...Object.keys(ext)]));
    const out = {};
    keys.forEach(k => {
      const b = base[k] || {};
      const e = ext[k] || {};
      const items = Array.from(new Set([...(b.items || []), ...(Array.isArray(e) ? e : e.items || [])]));
      out[k] = { label: b.label || e.label || k, icon: b.icon || e.icon || (items[0] || ''), items };
    });
    return out;
  }, [mergedEmojiCategories]);

  if (!open) return null;

  const catKeys = Object.keys(categories || {});

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 3200, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: '98%', background: theme?.surface || theme?.surfaceAlt || theme?.panel || '#241c3a', borderRadius: 10, padding: 8, boxShadow: theme?.shadow || '0 8px 32px rgba(0,0,0,0.6)', color: theme?.text || '#fff', display: 'flex', gap: 6 }} className={className}>
        <div style={{ width: 88, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 800, color: theme?.accent1 || '#f59e42', marginBottom: 4, whiteSpace: 'nowrap', fontSize: 13 }}>Choisir un emoji</div>
          <div style={{ width: 56, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight, marginTop: 6 }}>
            {catKeys.map(key => (
              <button key={key} onClick={() => setEmojiCategory(key)} style={{ padding: 4, borderRadius: 8, background: emojiCategory === key ? theme?.accent1 : 'transparent', border: `1px solid ${theme?.border || '#444'}`, color: emojiCategory === key ? '#fff' : theme?.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 36 }} title={(categories && categories[key] && categories[key].label) || key}>
                <div style={{ fontSize: 16 }}>{(categories && categories[key] && categories[key].icon) || ''}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input placeholder={searchPlaceholder} value={emojiSearch} onChange={e => setEmojiSearch(e.target.value)} style={{ padding: 6, borderRadius: 8, border: `1px solid ${theme?.border || '#444'}`, background: theme?.bg, color: theme?.text, width: 140 }} />
              {showClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme?.subtext || '#ccc', cursor: 'pointer' }}>✖</button>}
            </div>
          </div>
          <div style={{ maxHeight, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 4 }}>
              {((categories && categories[emojiCategory] && categories[emojiCategory].items) || []).filter(em => emojiSearch === '' || em.includes(emojiSearch)).map((em) => (
                <button key={em} onClick={() => { onSelect && onSelect(em); }} style={{ padding: 4, fontSize: 18, height: 40, borderRadius: 6, background: theme?.bg, border: `1px solid ${theme?.border || '#444'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={em}>{em}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
