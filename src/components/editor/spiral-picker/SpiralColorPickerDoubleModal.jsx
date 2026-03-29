import React from "react";
import SpiralColorPicker from "./SpiralColorPicker";

export default function SpiralColorPickerDoubleModal({ value, onChange, theme, pickerKey, isMobile }) {
  return (
    <div className="spiral-double-modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
      <SpiralColorPicker value={value} onChange={onChange} theme={theme} />
    </div>
  );
}
