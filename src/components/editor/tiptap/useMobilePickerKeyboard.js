/**
 * Hook to simulate keyboard behavior for color pickers on mobile.
 */

import { useEffect, useRef } from 'react';

let pickerOpenCount = 0;
let currentPickerHeight = 0;

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 600;
}

function setPickerKeyboardState(isOpen, height = 280) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (isOpen) {
    pickerOpenCount++;
    currentPickerHeight = height;
    html.classList.add('picker-keyboard-open');
    html.style.setProperty('--picker-keyboard-height', `${height}px`);
    window.dispatchEvent(new CustomEvent('pickerKeyboardChange', { detail: { open: true, height } }));
  } else {
    pickerOpenCount = Math.max(0, pickerOpenCount - 1);
    if (pickerOpenCount === 0) {
      html.classList.remove('picker-keyboard-open');
      html.style.removeProperty('--picker-keyboard-height');
      currentPickerHeight = 0;
      window.dispatchEvent(new CustomEvent('pickerKeyboardChange', { detail: { open: false, height: 0 } }));
    }
  }
}

export function useMobilePickerKeyboard(isOpen, height = 280) {
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (!isMobileDevice()) return;
    if (isOpen && !wasOpenRef.current) { setPickerKeyboardState(true, height); wasOpenRef.current = true; }
    else if (!isOpen && wasOpenRef.current) { setPickerKeyboardState(false); wasOpenRef.current = false; }
    return () => { if (wasOpenRef.current) { setPickerKeyboardState(false); wasOpenRef.current = false; } };
  }, [isOpen, height]);
}

export function usePickerKeyboardListener(callback) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e) => callback(e.detail);
    window.addEventListener('pickerKeyboardChange', handler);
    return () => window.removeEventListener('pickerKeyboardChange', handler);
  }, [callback]);
}

export function getPickerKeyboardState() { return { open: pickerOpenCount > 0, height: currentPickerHeight }; }

export default useMobilePickerKeyboard;
