import React from "react";
import SpiralColorPicker from "./SpiralColorPicker";

export default function SpiralColorPickerSingleModal({ value, onChange, theme, pickerKey = "default", clearButton }) {
  return (
    <div className="spiral-single-modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
      {clearButton && <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 5 }}>{clearButton}</div>}
      <SpiralColorPicker value={value} onChange={onChange} theme={theme} />
    </div>
  );
}
